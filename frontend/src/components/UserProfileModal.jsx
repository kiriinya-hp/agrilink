import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  ShieldCheck, 
  Wallet, 
  Calendar, 
  Check, 
  AlertCircle,
  AlertTriangle,
  RefreshCw, 
  X, 
  FileText,
  Sparkles,
  Trash2,
  Gift,
  Copy,
  Share2,
  Award,
  Users,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from './CurrencyUnitContext';
import { useLanguage } from './LanguageContext';

export default function UserProfileModal({ isOpen, onClose, onProfileUpdated }) {
  const { user, updateProfile } = useAuth();
  const { formatMoney } = useCurrency();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    businessName: '',
    idNumber: '',
    driverLicenseNo: '',
    vehicleRegNo: '',
    ntsaInspectionExpiry: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [referralStats, setReferralStats] = useState(null);
  const [loadingReferrals, setLoadingReferrals] = useState(false);

  const fetchReferralStats = async () => {
    try {
      setLoadingReferrals(true);
      const token = localStorage.getItem('AgriShamba_token') || localStorage.getItem('agrishamba_token') || localStorage.getItem('agrilink_token');
      if (!token) return;
      const res = await fetch('/api/referrals/my-stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setReferralStats(data);
      }
    } catch (e) {
      console.warn('Failed to fetch referral stats:', e);
    } finally {
      setLoadingReferrals(false);
    }
  };

  const handleCopyReferral = () => {
    const code = referralStats?.referralCode || user.referralCode || '';
    if (code) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    const code = referralStats?.referralCode || user.referralCode || '';
    const shareUrl = `${window.location.origin}/register?ref=${code}`;
    const text = encodeURIComponent(
      `Join me on AgriShamba to buy & sell fresh produce directly with zero middlemen! Use my referral code ${code} or sign up here: ${shareUrl} to get +25 bonus AgriPoints!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('agrishamba_token');
      const res = await fetch('/api/auth/account', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Deletion failed');
      // Clear all local storage and log out
      ['agrishamba_token','agrishamba_user','agrilink_token','agrilink_user'].forEach(k => localStorage.removeItem(k));
      window.location.reload();
    } catch (err) {
      setError(err.message);
      setDeleteLoading(false);
      setDeleteConfirm(false);
    }
  };

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || '',
        phone: user.phone && !user.phone.startsWith('+254000') && !user.phone.startsWith('google_') ? user.phone : (user.phone || ''),
        location: user.location || '',
        businessName: user.businessName || '',
        idNumber: user.idNumber || '',
        driverLicenseNo: user.driverLicenseNo || '',
        vehicleRegNo: user.vehicleRegNo || '',
        ntsaInspectionExpiry: user.ntsaInspectionExpiry || ''
      });
      setError('');
      setSuccessMsg('');
      fetchReferralStats();
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const isGooglePlaceholderPhone = user.phone && (user.phone.startsWith('+254000') || user.phone.startsWith('google_'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (!formData.name.trim()) throw new Error('Full Name is required');
      if (!formData.phone.trim()) throw new Error('Phone Number is required for M-Pesa orders and payouts');
      if (!formData.location.trim()) throw new Error('Location is required for logistics routing');

      await updateProfile(formData);
      setSuccessMsg('Your profile has been updated and saved to the database successfully!');
      if (onProfileUpdated) onProfileUpdated();
      setTimeout(() => {
        setSuccessMsg('');
      }, 4000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const roleBadgeColors = {
    FARMER: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    BUYER: 'bg-blue-100 text-blue-800 border-blue-300',
    TRANSPORTER: 'bg-amber-100 text-amber-800 border-amber-300',
    ADMIN: 'bg-purple-100 text-purple-800 border-purple-300'
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header Profile Hero */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-emerald-500/20 border-2 border-emerald-400/40">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-white">{user.name}</h2>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${roleBadgeColors[user.role]}`}>
                  {user.role}
                </span>
                {user.isEmailVerified && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <Check className="w-3 h-3" /> Verified Account
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                {user.email}
              </p>
              <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-300 flex-wrap">
                <span className="flex items-center gap-1">
                  <Wallet className="w-3 h-3 text-emerald-400" />
                  Wallet: <strong className="text-emerald-300 font-mono">{formatMoney(user.walletBalance || 0)}</strong>
                </span>
                <span className="text-slate-500">•</span>
                <span className="flex items-center gap-1">
                  <Gift className="w-3 h-3 text-amber-400" />
                  AgriPoints: <strong className="text-amber-300 font-mono">{referralStats?.referralPoints ?? user.referralPoints ?? 0}</strong>
                </span>
                <span className="text-slate-500">•</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  KYC: <strong className="text-white">{user.kycStatus || 'VERIFIED'}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notice for Google placeholder phone */}
        {isGooglePlaceholderPhone && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Action Needed:</strong> Your account was registered via Google. Please add your real <strong>Safaricom M-Pesa Phone Number</strong> and <strong>County Location</strong> below to receive order SMS alerts and direct mobile money payouts.
            </p>
          </div>
        )}

        {/* Alerts */}
        <div className="px-6 pt-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 mb-3 font-semibold">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Farmer Trust & Verification Badge (Feature 11: No cash bonus) */}
        {user.role === 'FARMER' && (
          <div className="mx-6 mb-3 p-3.5 rounded-xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border border-emerald-500/40 text-white flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-white">Trust &amp; Verification Standing</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Verified Farmer ✓
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 mt-0.5 leading-relaxed">
                  Badged publicly on all your market produce listings to boost buyer trust and escrow priority. (Strictly reputation badge — no monetary bonus).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Referral Hub: Invite & Earn AgriPoints (Feature 8) */}
        <div className="mx-6 mb-4 p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-slate-900/5 border border-amber-500/30 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-600">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  Refer &amp; Earn AgriPoints
                </h4>
                <p className="text-[10px] text-slate-500 font-medium">
                  Earn +50 points per active invite. New farmers get +25 welcome points!
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-amber-600 font-mono block">
                {referralStats?.referralPoints ?? user.referralPoints ?? 0}
              </span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">AgriPoints</span>
            </div>
          </div>

          {/* Referral Code Display & Copy & WhatsApp Share */}
          <div className="bg-white rounded-xl p-2.5 border border-amber-200/80 flex items-center justify-between gap-2 mt-2">
            <div className="min-w-0">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Your Referral Code</span>
              <span className="text-xs font-black font-mono tracking-wider text-slate-900 truncate">
                {referralStats?.referralCode || user.referralCode || 'AGRI-SHAMBA'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleCopyReferral}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1 transition-all"
              >
                {copiedCode ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Referral Stats Summary */}
          <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-amber-200/40 text-center">
            <div className="bg-white/80 rounded-lg p-1.5 border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Invited</span>
              <span className="text-xs font-black text-slate-800">
                {referralStats?.totalReferred ?? 0}
              </span>
            </div>
            <div className="bg-white/80 rounded-lg p-1.5 border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Per Invite</span>
              <span className="text-xs font-black text-emerald-600">+50 pts</span>
            </div>
            <div className="bg-white/80 rounded-lg p-1.5 border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Reward Tier</span>
              <span className="text-[10px] font-black text-amber-700">
                {(referralStats?.referralPoints ?? user.referralPoints ?? 0) >= 300 
                  ? '🥇 Gold' 
                  : (referralStats?.referralPoints ?? user.referralPoints ?? 0) >= 100 
                    ? '🥈 Silver' 
                    : '🥉 Bronze'}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5 font-bold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" /> Full Legal Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Samuel Mutua"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block mb-1.5 font-bold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone (M-Pesa Registered) *
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +254712345678 or 0712345678"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Used for automated M-Pesa STK push and SMS OTPs</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5 font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> County & Physical Location *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Limuru, Kiambu County"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Transporters use this for freight pickups and deliveries</span>
            </div>

            <div>
              <label className="block mb-1.5 font-bold text-slate-700 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" /> Farm / Business / Fleet Name
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="e.g. Green Valley Farm Cooperative"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Displayed on produce listings & purchase orders</span>
            </div>
          </div>

          <div>
            <label className="block mb-1.5 font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> National ID / Passport / Business Reg Number
            </label>
            <input
              type="text"
              value={formData.idNumber}
              onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
              placeholder="e.g. 29384756 or CPR/2026/12345"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Required for legal escrow and cargo insurance claims</span>
          </div>

          {/* Transporter / Driver KYC & Fleet Credentials */}
          {user.role === 'TRANSPORTER' && (
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-900">
                  NTSA Transporter & Fleet Compliance
                </h4>
              </div>
              <p className="text-[11px] text-amber-800">
                Verified freight carriers qualify for priority cargo matching and expedited escrow transit payouts.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block mb-1 text-[11px] font-bold text-amber-900">Driver License (DL) *</label>
                  <input
                    type="text"
                    value={formData.driverLicenseNo}
                    onChange={(e) => setFormData({ ...formData, driverLicenseNo: e.target.value })}
                    placeholder="e.g. DL-9821430"
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[11px] font-bold text-amber-900">Vehicle Registration *</label>
                  <input
                    type="text"
                    value={formData.vehicleRegNo}
                    onChange={(e) => setFormData({ ...formData, vehicleRegNo: e.target.value })}
                    placeholder="e.g. KDA 492L (5T Isuzu)"
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[11px] font-bold text-amber-900">NTSA Inspection Expiry</label>
                  <input
                    type="date"
                    value={formData.ntsaInspectionExpiry}
                    onChange={(e) => setFormData({ ...formData, ntsaInspectionExpiry: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Read-Only Account Security Metadata */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2 text-[11px] text-slate-600">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Registered Email:</span>
              <span className="font-mono font-bold text-slate-800">{user.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Account System Role:</span>
              <span className="font-bold text-slate-800">{user.role}</span>
            </div>
            {user.createdAt && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Member Since:</span>
                <span className="text-slate-700">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving to Database...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Profile Changes
                </>
              )}
            </button>
          </div>

          {/* ─── Danger Zone: Account Deletion (Google Play Store Compliance) ─── */}
          <div className="mt-4 border border-rose-200 rounded-xl overflow-hidden">
            <div className="bg-rose-50 px-4 py-3 flex items-center gap-2 border-b border-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="text-xs font-black text-rose-700 uppercase tracking-wide">Danger Zone — Permanent Account Deletion</span>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Permanently deletes your account and <strong>all associated personal data</strong> from AgriShamba — including your profile, produce listings, order history, demand bids, and notifications. This action is <strong className="text-rose-600">irreversible</strong>.
              </p>

              {!deleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(true)}
                  className="w-full py-2.5 px-4 rounded-xl border-2 border-rose-300 text-rose-700 font-bold text-xs hover:bg-rose-50 flex items-center justify-center gap-2 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete My Account &amp; All Personal Data
                </button>
              ) : (
                <div className="bg-rose-50 border border-rose-300 rounded-xl p-3.5 space-y-3">
                  <p className="text-xs font-black text-rose-800 text-center">
                    ⚠️ Are you absolutely sure? This cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(false)}
                      disabled={deleteLoading}
                      className="flex-1 py-2 px-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      Cancel — Keep Account
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={deleteLoading}
                      className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-60"
                    >
                      {deleteLoading ? (
                        <><RefreshCw className="w-3 h-3 animate-spin" /> Deleting...</>
                      ) : (
                        <><Trash2 className="w-3 h-3" /> Yes, Delete Everything</>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <p className="text-[10px] text-slate-400 text-center">
                View our{' '}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline font-semibold"
                >
                  Privacy Policy
                </a>
                {' '}to learn how your data is protected.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
