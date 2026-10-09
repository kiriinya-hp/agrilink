import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = 
        localStorage.getItem('AgriShamba_user') || 
        localStorage.getItem('agrilink_user') || 
        localStorage.getItem('AgriShamba_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return (
      localStorage.getItem('AgriShamba_token') || 
      localStorage.getItem('agrilink_token') || 
      localStorage.getItem('AgriShamba_token') || 
      null
    );
  });
  const [loading, setLoading] = useState(true);

  // Validate session on app launch
  useEffect(() => {
    async function checkAuth() {
      if (token) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            setUser(data.user);
            localStorage.setItem('AgriShamba_user', JSON.stringify(data.user));
          } else {
            logout();
          }
        } catch {
          // Keep offline cached user if server is restarting
        }
      }
      setLoading(false);
    }
    checkAuth();
  }, [token]);

  const login = async (identifier, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('AgriShamba_token', data.token);
    localStorage.setItem('AgriShamba_user', JSON.stringify(data.user));
    return data.user;
  };

  const adminLogin = async (identifier, password) => {
    const res = await fetch('/api/auth/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('AgriShamba_token', data.token);
    localStorage.setItem('AgriShamba_user', JSON.stringify(data.user));
    return data.user;
  };

  const register = async (formData) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data;
  };

  const verifyRegistration = async (email, code) => {
    const res = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('AgriShamba_token', data.token);
    localStorage.setItem('AgriShamba_user', JSON.stringify(data.user));
    return data.user;
  };

  const verifyFirebasePhone = async (email, phoneNumber) => {
    const res = await fetch('/api/auth/verify-firebase-phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, phoneNumber })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('AgriShamba_token', data.token);
    localStorage.setItem('AgriShamba_user', JSON.stringify(data.user));
    return data.user;
  };

  const loginWithGoogle = async (googleUser, selectedRole = 'FARMER') => {
    const res = await fetch('/api/auth/google-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: googleUser.email,
        name: googleUser.displayName,
        phoneNumber: googleUser.phoneNumber || null,
        role: selectedRole
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('AgriShamba_token', data.token);
    localStorage.setItem('AgriShamba_user', JSON.stringify(data.user));
    return data.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('AgriShamba_token');
    localStorage.removeItem('AgriShamba_user');
    localStorage.removeItem('agrilink_token');
    localStorage.removeItem('agrilink_user');
    localStorage.removeItem('AgriShamba_token');
    localStorage.removeItem('AgriShamba_user');
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('AgriShamba_user', JSON.stringify(data.user));
      }
    } catch (err) {
      console.error('Refresh user error:', err);
    }
  };

  const updateProfile = async (profileData) => {
    if (!token) throw new Error('Not authenticated');
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    setUser(data.user);
    localStorage.setItem('AgriShamba_user', JSON.stringify(data.user));
    return data.user;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginWithGoogle, adminLogin, register, verifyRegistration, verifyFirebasePhone, logout, refreshUser, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
