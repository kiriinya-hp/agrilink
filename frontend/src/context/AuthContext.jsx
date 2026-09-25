import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('agrilink_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('agrilink_token') || null);
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
            localStorage.setItem('agrilink_user', JSON.stringify(data.user));
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
    localStorage.setItem('agrilink_token', data.token);
    localStorage.setItem('agrilink_user', JSON.stringify(data.user));
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
    localStorage.setItem('agrilink_token', data.token);
    localStorage.setItem('agrilink_user', JSON.stringify(data.user));
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
    localStorage.setItem('agrilink_token', data.token);
    localStorage.setItem('agrilink_user', JSON.stringify(data.user));
    return data.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('agrilink_token');
    localStorage.removeItem('agrilink_user');
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
        localStorage.setItem('agrilink_user', JSON.stringify(data.user));
      }
    } catch (err) {
      console.error('Refresh user error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, adminLogin, register, verifyRegistration, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
