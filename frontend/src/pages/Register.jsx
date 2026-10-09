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
  ArrowLeft,
  KeyRound,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthAnimatedBackground from '../components/AuthAnimatedBackground';
import { sendFirebasePhoneOtp, confirmFirebasePhoneOtp, signInWithGooglePopup } from '../firebase';

export default function Register({ onNavigateLogin }) {
  const { register, verifyRegistration, verifyFirebasePhone, loginWithGoogle } = useAuth();

  const [step, setStep] = useState('form'); // 'form' or 'verify'
  const [role, setRole] = useState('FARMER'); // 'FARMER', 'BUYER', 'TRANSPORTER'
  const [authMethod, setAuthMethod] = useState('STANDARD'); // 'STANDARD' or 'FIREBASE_PHONE'
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleRegister = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const googleUser = await signInWithGooglePopup();
      await loginWithGoogle(googleUser, role);
    } catch (err) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google registration failed');
      }
    } finally {
      setGoogleLoading(false);
    }
  };
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
  const [previewCode, setPreviewCode] = useState('');

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
      const data = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role,
        location: formData.location,
        businessName: formData.businessName
      });

      if (data?.previewCode) {
        setPreviewCode(data.previewCode);
      }
      setSuccessMsg(data?.message || `A 6-digit security code has been dispatched to ${formData.email}.`);
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
      if (authMethod === 'FIREBASE_PHONE') {
        const confirmResult = await confirmFirebasePhoneOtp(verificationCode.trim());
        await verifyFirebasePhone(formData.email, confirmResult.phoneNumber || formData.phone);
      } else {
        await verifyRegistration(formData.email, verificationCode.trim());
      }
      // On success, AuthContext sets token/user and automatically redirects to dashboard!
    } catch (err) {
      setError(err.message || 'Invalid or expired verification code');
    } finally {
      setLoading(false);
    }
  };

  // Send / Resend Free SMS via Google Firebase Phone Auth (10,000 Free SMS / Month)
  const handleSendFirebasePhoneOtp = async () => {
    if (!formData.phone) {
      setError('Please provide a phone number to receive SMS');
      return;
    }
    setError('');
    setLoading(true);
    try {
      let clean = formData.phone.replace(/[^0-9]/g, '');
      if (clean.startsWith('0')) clean = '254' + clean.slice(1);
      else if (clean.startsWith('7') || clean.startsWith('1')) clean = '254' + clean;
      const formatted = '+' + clean;

      await sendFirebasePhoneOtp(formatted, 'recaptcha-container');
      setAuthMethod('FIREBASE_PHONE');
      setSuccessMsg(`Google Firebase dispatched a free 6-digit SMS to ${formatted}!`);
      startCountdown();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to send SMS via Google Firebase. Check phone number format.');
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

      if (data?.previewCode) {
        setPreviewCode(data.previewCode);
      }
      setSuccessMsg(`New 6-digit code sent to ${formData.email}!`);
      startCountdown();
    } catch (err) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center relative overflow-hidden">
      <AuthAnimatedBackground />

      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <Sprout className="w-7 h-7" />
          </div>
        </div>

        <h2 className="mt-3 text-center text-2xl sm:text-3xl font-extrabold text-white">
          Join the Agri<span className="text-emerald-500">Shamba</span> Ecosystem
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

              {/* Google Sign-In for Registration */}
              <div className="relative mt-4 mb-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-slate-900 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Or register with</span>
                </div>
              </div>
              <button
                type="button"
                disabled={googleLoading || loading}
                onClick={handleGoogleRegister}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-600 rounded-xl text-xs font-bold text-slate-800 shadow-sm transition-all disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{googleLoading ? 'Connecting Google...' : 'Continue with Google'}</span>
              </button>

              <div className="mt-5 pt-4 border-t border-slate-700/60 text-center">
                <span className="text-xs text-slate-400">Already registered on AgriShamba? </span>
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
              <h3 className="text-lg font-bold text-white">Enter 6-Digit Verification Code</h3>
              <p className="text-xs text-slate-300 mt-1">
                We sent a security code to <strong className="text-emerald-400">{formData.email}</strong> and via SMS to <strong className="text-emerald-400">{formData.phone || 'your phone'}</strong>.
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

            {previewCode && (
              <div className="mb-5 p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-xl text-xs text-amber-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold flex items-center gap-1.5 text-amber-300">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    Cloud Host Port Notice
                  </span>
                  <button
                    type="button"
                    onClick={() => setVerificationCode(previewCode)}
                    className="px-2 py-0.5 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[11px] shadow-sm transition-all"
                  >
                    Auto-Fill Code
                  </button>
                </div>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  Render free tier blocks SMTP port 465/587. Your active verification code is:{' '}
                  <strong className="font-mono text-white text-sm tracking-widest bg-slate-900/80 px-2 py-0.5 rounded border border-amber-500/30">
                    {previewCode}
                  </strong>
                </p>
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

              {/* Optional: Google Firebase Free Phone SMS Trigger */}
              <div className="pt-3 border-t border-slate-700/60">
                <button
                  type="button"
                  disabled={loading || countdown > 0}
                  onClick={handleSendFirebasePhoneOtp}
                  className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    authMethod === 'FIREBASE_PHONE'
                      ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-700/50 hover:bg-slate-700 border-slate-600 text-slate-300 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>
                    {authMethod === 'FIREBASE_PHONE' 
                      ? '✓ SMS Dispatched' 
                      : 'Send 6-Digit SMS to Phone'}
                  </span>
                </button>

                {/* Sleek reCAPTCHA security indicator */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 px-1">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3zm0 4.18c2.97 0 5.43 2.16 5.9 5h-2.02c-.43-1.72-2-3-3.88-3-2.21 0-4 1.79-4 4 0 1.2.53 2.27 1.36 3H7.26c-.79-.88-1.26-2.03-1.26-3.3 0-3.15 2.55-5.7 6-5.7z" />
                    </svg>
                    Google reCAPTCHA Protected
                  </span>
                  <span className="text-emerald-400/90 font-medium">Safe SMS Delivery</span>
                </div>
              </div>

              {/* Invisible reCAPTCHA container for Google Firebase Phone Auth */}
              <div id="recaptcha-container"></div>
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
