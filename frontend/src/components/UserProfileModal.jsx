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
  RefreshCw, 
  X, 
  FileText,
  Sparkles
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
    idNumber: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || '',
        phone: user.phone && !user.phone.startsWith('+254000') && !user.phone.startsWith('google_') ? user.phone : (user.phone || ''),
        location: user.location || '',
        businessName: user.businessName || '',
        idNumber: user.idNumber || ''
      });
      setError('');
      setSuccessMsg('');
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
              <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-300">
                <span className="flex items-center gap-1">
                  <Wallet className="w-3 h-3 text-emerald-400" />
                  Wallet: <strong className="text-emerald-300 font-mono">{formatMoney(user.walletBalance || 0)}</strong>
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
        </form>
      </div>
    </div>
  );
}
