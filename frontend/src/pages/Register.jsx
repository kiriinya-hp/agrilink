import React, { useState } from 'react';
import { 
  Sprout, 
  ShoppingBag, 
  Truck, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  MapPin, 
  Building, 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck, 
  CheckCircle2, 
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register({ onNavigateLogin }) {
  const { register, verifyRegistration } = useAuth();

  const [step, setStep] = useState('form'); // 'form' or 'verify'
  const [role, setRole] = useState('FARMER'); // 'FARMER', 'BUYER', 'TRANSPORTER'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    location: '',
    businessName: ''
  });

  const [verificationCode, setVerificationCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const startCountdown = () => {
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: Submit Form & Send Google App Mailer Verification Code
  const handleInitiateRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role,
        location: formData.location,
        businessName: formData.businessName
      });

      setSuccessMsg(`A 6-digit security code has been dispatched to ${formData.email} via Google App Mailer.`);
      setStep('verify');
      startCountdown();
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Code and Activate Account
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');

    if (!verificationCode || verificationCode.trim().length < 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    try {
      await verifyRegistration(formData.email, verificationCode.trim());
      // On success, AuthContext sets token/user and automatically redirects to dashboard!
    } catch (err) {
      setError(err.message || 'Invalid or expired verification code');
    } finally {
      setLoading(false);
    }
  };

  // Resend code via Google Mailer
  const handleResendCode = async () => {
    if (countdown > 0 || loading) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setSuccessMsg(`New 6-digit code sent to ${formData.email}!`);
      startCountdown();
    } catch (err) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <Sprout className="w-7 h-7" />
          </div>
        </div>

        <h2 className="mt-3 text-center text-2xl sm:text-3xl font-extrabold text-white">
          Join the Agri<span className="text-emerald-500">Link</span> Ecosystem
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          {step === 'form' 
            ? 'Create an account to start trading, sourcing, or providing logistics.'
            : `Verifying email address for ${formData.email}`}
        </p>

        {/* STEP 1: REGISTRATION FORM */}
        {step === 'form' && (
          <>
            {/* Role Selector Cards */}
            <div className="mt-6 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('FARMER')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  role === 'FARMER'
                    ? 'bg-emerald-600/20 border-emerald-500 text-white'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sprout className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                <span className="block text-xs font-bold">Farmer</span>
                <span className="text-[10px] opacity-75">Sell Produce</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('BUYER')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  role === 'BUYER'
                    ? 'bg-emerald-600/20 border-emerald-500 text-white'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShoppingBag className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                <span className="block text-xs font-bold">Buyer</span>
                <span className="text-[10px] opacity-75">Wholesale Buy</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('TRANSPORTER')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  role === 'TRANSPORTER'
                    ? 'bg-emerald-600/20 border-emerald-500 text-white'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Truck className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                <span className="block text-xs font-bold">Transporter</span>
                <span className="text-[10px] opacity-75">Freight Cargo</span>
              </button>
            </div>

            <div className="mt-6 bg-slate-800/70 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl">
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleInitiateRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Kelvin Kiriinya"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Email Address (Google Verified)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="you@domain.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Phone Number (M-Pesa)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="tel"
                        name="phone"
                        required
                        placeholder="+2547XXXXXXXX"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      County / Location
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        name="location"
                        required
                        placeholder="e.g. Kiambu County"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Business / Farm / Fleet Name
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        name="businessName"
                        placeholder="Optional"
                        value={formData.businessName}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="password"
                        name="password"
                        required
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="password"
                        name="confirmPassword"
                        required
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Sending Verification Code...
                    </>
                  ) : (
                    <>
                      <span>Continue & Send Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 pt-4 border-t border-slate-700/60 text-center">
                <span className="text-xs text-slate-400">Already registered on AgriLink? </span>
                <button
                  onClick={onNavigateLogin}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300"
                >
                  Sign In
                </button>
              </div>
            </div>
          </>
        )}

        {/* STEP 2: EMAIL VERIFICATION CODE SCREEN */}
        {step === 'verify' && (
          <div className="mt-6 bg-slate-800/70 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Enter 6-Digit Email Code</h3>
              <p className="text-xs text-slate-300 mt-1">
                We sent a security code to <strong className="text-emerald-400">{formData.email}</strong> via Google App Mailer.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleVerifyCode} className="space-y-5">
              <div>
                <label className="block text-center text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  maxLength="6"
                  autoFocus
                  required
                  placeholder="••••••"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-4 py-3.5 bg-slate-900 border-2 border-emerald-500/60 rounded-xl font-mono text-center text-3xl font-extrabold tracking-widest text-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
                />
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Didn't receive the email?</span>
                <button
                  type="button"
                  disabled={countdown > 0 || loading}
                  onClick={handleResendCode}
                  className="font-bold text-emerald-400 hover:text-emerald-300 disabled:text-slate-600 flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || verificationCode.length < 6}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Validating Security Code...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm & Complete Registration
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-700/60 flex justify-between items-center text-xs">
              <button
                onClick={() => setStep('form')}
                className="text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Edit Details
              </button>
              <button
                onClick={onNavigateLogin}
                className="text-emerald-400 hover:text-emerald-300 font-bold"
              >
                Sign In Instead
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
