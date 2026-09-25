import React, { useState } from 'react';
import { Sprout, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthAnimatedBackground from '../components/AuthAnimatedBackground';

export default function Login({ onNavigateRegister, onNavigateAdmin, onNavigateForgotPassword }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(identifier, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill for testing
  const quickFill = (id, pass) => {
    setIdentifier(id);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Agribusiness & Escrow Network Background */}
      <AuthAnimatedBackground />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
            <Sprout className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight text-white">
          Agri<span className="text-emerald-500">Link</span> SCM Portal
        </h2>
        <p className="mt-2 text-center text-xs text-slate-400 font-medium">
          Integrated B2B Agribusiness Supply Chain & Escrow System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100/80">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Email Address or Phone Number
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. buyer@freshgrocers.co.ke or 0722334455"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Password
                </label>
                {onNavigateForgotPassword && (
                  <button
                    type="button"
                    onClick={onNavigateForgotPassword}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your security password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-md text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Pre-fills for Testing/Evaluation */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 block mb-2 uppercase tracking-wide">
              Quick Test Credentials:
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
              <button
                type="button"
                onClick={() => quickFill('farmer@agrilink.co.ke', 'Password123!')}
                className="p-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 rounded border border-slate-200 font-semibold text-center transition-colors"
              >
                👨‍🌾 Farmer
              </button>
              <button
                type="button"
                onClick={() => quickFill('buyer@freshgrocers.co.ke', 'Password123!')}
                className="p-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 rounded border border-slate-200 font-semibold text-center transition-colors"
              >
                🛒 Buyer
              </button>
              <button
                type="button"
                onClick={() => quickFill('driver@agrihaul.co.ke', 'Password123!')}
                className="p-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 rounded border border-slate-200 font-semibold text-center transition-colors"
              >
                🚚 Driver
              </button>
            </div>
          </div>

          {/* Links */}
          <div className="mt-6 flex items-center justify-between text-xs text-slate-600">
            <span>Don't have an account?</span>
            <button
              onClick={onNavigateRegister}
              className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              Register Now
            </button>
          </div>
        </div>

        {/* Separate Admin Portal Link */}
        <div className="mt-6 text-center">
          <button
            onClick={onNavigateAdmin}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors py-1 px-3 rounded-full hover:bg-slate-800/60"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Are you an Administrator? <strong>Access Admin Portal</strong></span>
          </button>
        </div>
      </div>
    </div>
  );
}
