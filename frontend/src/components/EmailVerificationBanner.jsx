import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, RefreshCw, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function EmailVerificationBanner() {
  const { user, refreshUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [countdown, setCountdown] = useState(0);

  if (!user || user.isEmailVerified) return null;

  const handleSendCode = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setMessage({ type: 'success', text: `6-digit verification code sent to ${user.email}!` });
      setShowModal(true);
      setCountdown(60);

      // Start countdown
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!code || code.length < 6) {
      setMessage({ type: 'error', text: 'Please enter the complete 6-digit code' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, code: code.trim() })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setMessage({ type: 'success', text: 'Email verified successfully! Verified badge activated.' });
      setTimeout(async () => {
        setShowModal(false);
        if (refreshUser) await refreshUser();
      }, 1200);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Top Warning Banner */}
      <div className="bg-amber-500 text-white text-xs px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2 font-medium">
          <Mail className="w-4 h-4 shrink-0" />
          <span>
            Your email (<strong>{user.email}</strong>) is unverified. Verify now to unlock priority B2B trade matching.
          </span>
        </div>
        <button
          onClick={() => {
            setShowModal(true);
            handleSendCode();
          }}
          disabled={loading}
          className="bg-white text-amber-900 font-bold px-3 py-1 rounded-md text-[11px] hover:bg-amber-50 transition-colors shadow-sm shrink-0"
        >
          {loading ? 'Sending Code...' : 'Verify Email Now'}
        </button>
      </div>

      {/* Verification Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Email Verification</h3>
                  <p className="text-xs text-slate-500">Enter the 6-digit code sent to your email</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVerifyCode} className="mt-4 space-y-4">
              {message && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                    message.type === 'error'
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}
                >
                  {message.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  <span>{message.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength="6"
                  placeholder="e.g. 849201"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-center text-2xl font-bold tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Didn't get the code?</span>
                <button
                  type="button"
                  disabled={countdown > 0 || loading}
                  onClick={handleSendCode}
                  className="font-bold text-emerald-600 hover:text-emerald-700 disabled:text-slate-400"
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                </button>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || code.length < 6}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1.5"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Confirm & Verify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
