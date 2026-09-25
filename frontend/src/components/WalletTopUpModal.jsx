import React, { useState } from 'react';
import { Wallet, X, Phone, DollarSign, CheckCircle2, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';

const PRESET_AMOUNTS = [50, 100, 250, 500, 1000];

export default function WalletTopUpModal({ isOpen, onClose, user, onBalanceUpdated }) {
  const [amount, setAmount] = useState('250');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '254711223344');
  const [paymentMethod, setPaymentMethod] = useState('MPESA');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleTopUp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount: parseFloat(amount),
          paymentMethod
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setSuccessMsg(data.message);
      if (onBalanceUpdated) {
        onBalanceUpdated(data.walletBalance);
      }

      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err) {
      setErrorMsg(err.message || 'Top-up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95">
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">AgriLink Escrow Wallet</h3>
              <p className="text-xs text-slate-500">Instant deposit via Safaricom M-Pesa</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance Banner */}
        <div className="mt-4 bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-4 rounded-2xl shadow-inner flex justify-between items-center">
          <div>
            <span className="text-[10px] font-mono text-emerald-300 uppercase tracking-wider block">Available Balance</span>
            <p className="text-2xl font-black mt-0.5">${(user?.walletBalance || 0).toFixed(2)}</p>
          </div>
          <div className="text-right">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Active Wallet
            </span>
          </div>
        </div>

        {successMsg && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleTopUp} className="mt-4 space-y-4 text-xs font-semibold text-slate-700">
          <div>
            <label className="block mb-1.5 text-slate-700">Select Deposit Amount ($)</label>
            <div className="grid grid-cols-5 gap-1.5 mb-2">
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt.toString())}
                  className={`py-1.5 rounded-lg border font-bold text-center transition-all ${
                    amount === amt.toString()
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="number"
                min="5"
                step="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                placeholder="Or enter custom amount"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1.5 text-slate-700">M-Pesa Mobile Number for Prompt</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                placeholder="07XXXXXXXX or 254..."
              />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center gap-2 text-[11px] text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Funds are immediately usable for crop orders and locked in escrow when purchasing.</span>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5 transition-colors"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Processing STK...
                </>
              ) : (
                `Top Up $${parseFloat(amount || 0).toFixed(2)}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
