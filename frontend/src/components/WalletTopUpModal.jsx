import React, { useState, useEffect, useRef } from 'react';
import { 
  Wallet, 
  X, 
  Phone, 
  DollarSign, 
  CheckCircle2, 
  RefreshCw, 
  AlertCircle, 
  ShieldCheck, 
  Smartphone,
  ArrowRight,
  Sparkles,
  Check,
  XCircle
} from 'lucide-react';
import { USD_TO_KES } from './CurrencyUnitContext';

const PRESET_AMOUNTS = [10, 25, 50, 100, 250];

export default function WalletTopUpModal({ isOpen, onClose, user, onBalanceUpdated }) {
  const [step, setStep] = useState('form'); // 'form' | 'awaiting_pin' | 'cancelled' | 'success'
  const [amount, setAmount] = useState('50');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // STK Push tracking states
  const [stkData, setStkData] = useState(null);
  const [pollCount, setPollCount] = useState(0);
  const [confirmedReceipt, setConfirmedReceipt] = useState('');
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    if (isOpen && user) {
      setStep('form');
      setErrorMsg('');
      setSuccessMsg('');
      setStkData(null);
      setPollCount(0);
      setConfirmedReceipt('');
      // Pre-fill user's phone if valid and not a placeholder
      if (user.phone && !user.phone.startsWith('+254000') && !user.phone.startsWith('google_')) {
        setPhoneNumber(user.phone);
      } else {
        setPhoneNumber('');
      }
    }
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isOpen, user]);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const amountInKes = Math.round(numAmount * (USD_TO_KES || 130));

  // Step 1: Trigger STK Push
  const handleInitiateStkPush = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (!phoneNumber.trim()) {
        throw new Error('Please enter a valid Safaricom phone number (e.g. 0712345678 or 254712345678)');
      }
      if (numAmount < 1) {
        throw new Error('Minimum top-up amount is $1.00');
      }

      const res = await fetch('/api/wallet/topup/stk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount: numAmount,
          phone: phoneNumber.trim()
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to dispatch STK Push');

      setStkData(data);
      setStep('awaiting_pin');
      startPollingQuery(data.checkoutRequestId);
    } catch (err) {
      setErrorMsg(err.message || 'STK push failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Poll status of the STK Push
  const startPollingQuery = (checkoutRequestId) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    let attempts = 0;

    pollIntervalRef.current = setInterval(async () => {
      attempts++;
      setPollCount(attempts);

      try {
        const res = await fetch(`/api/payments/mpesa/query/${checkoutRequestId}`);
        const data = await res.json();

        if (data.success && data.status === 'SUCCESS') {
          clearInterval(pollIntervalRef.current);
          handleFinalizeTopUp(data.receipt);
          return;
        } else if (data.status === 'CANCELLED') {
          clearInterval(pollIntervalRef.current);
          setErrorMsg(data.resultDesc || 'M-Pesa payment prompt was cancelled by user.');
          setStep('cancelled');
          return;
        }

        // In Daraja Sandbox, automatically approve simulated PIN after ~7.5 seconds (3 polls)
        if (stkData?.environment === 'sandbox' || stkData?.mode?.includes('SANDBOX')) {
          if (attempts >= 3) {
            clearInterval(pollIntervalRef.current);
            handleFinalizeTopUp();
            return;
          }
        }
      } catch (e) {
        // Continue polling silently
      }

      // Stop polling after 45 seconds (18 attempts * 2.5s)
      if (attempts >= 18) {
        clearInterval(pollIntervalRef.current);
      }
    }, 2500);
  };

  // Explicitly cancel the active M-Pesa prompt
  const handleCancelPrompt = async (reason = 'Cancelled by user on AgriLink') => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    try {
      if (stkData?.checkoutRequestId) {
        await fetch('/api/payments/mpesa/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            checkoutRequestId: stkData.checkoutRequestId,
            reason
          })
        });
      }
    } catch (e) {
      console.warn('Cancel notify error:', e);
    }
    setErrorMsg('M-Pesa payment prompt was cancelled.');
    setStep('cancelled');
  };

  // Step 3: Finalize and credit account
  const handleFinalizeTopUp = async (explicitReceipt = null) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setLoading(true);
    setErrorMsg('');

    try {
      const receiptNum = explicitReceipt || `QJK${Date.now().toString().slice(-7)}`;
      const res = await fetch('/api/wallet/topup/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount: numAmount,
          checkoutRequestId: stkData?.checkoutRequestId,
          receipt: receiptNum
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setConfirmedReceipt(data.receipt || receiptNum);
      setSuccessMsg(data.message);
      setStep('success');

      if (onBalanceUpdated) {
        onBalanceUpdated(data.walletBalance);
      }

      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err) {
      setErrorMsg(err.message || 'Confirmation error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">AgriLink Escrow Wallet</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Safaricom Daraja M-Pesa Express
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance Status Banner */}
        <div className="mt-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white p-4 rounded-2xl shadow-inner flex justify-between items-center border border-emerald-800/40">
          <div>
            <span className="text-[10px] font-mono text-emerald-300 uppercase tracking-wider block">Current Balance</span>
            <p className="text-2xl font-black mt-0.5">${(user?.walletBalance || 0).toFixed(2)}</p>
          </div>
          <div className="text-right">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Active Escrow
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: INITIAL INPUT FORM */}
        {step === 'form' && (
          <form onSubmit={handleInitiateStkPush} className="mt-4 space-y-4 text-xs font-semibold text-slate-700">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-slate-700 font-bold">Select Deposit Amount ($)</label>
                <span className="text-[11px] text-emerald-700 font-bold font-mono">
                  ≈ KES {amountInKes.toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 mb-2">
                {PRESET_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt.toString())}
                    className={`py-2 rounded-xl border font-bold text-center transition-all ${
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
                  min="1"
                  step="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  placeholder="Custom USD amount"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-slate-700 font-bold">
                Safaricom M-Pesa Phone Number for PIN Prompt
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  placeholder="07XXXXXXXX or +254..."
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                An instant STK Push prompt will appear on this device requesting your M-Pesa PIN.
              </span>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/80 p-3 rounded-xl flex items-center gap-2.5 text-[11px] text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Funds are protected under AgriLink smart escrow and immediately usable for produce orders.</span>
            </div>

            <div className="flex gap-2 pt-1">
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
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sending STK...
                  </>
                ) : (
                  <>
                    <span>Deposit KES {amountInKes.toLocaleString()}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: AWAITING M-PESA PIN PROMPT */}
        {step === 'awaiting_pin' && (
          <div className="mt-5 space-y-4 text-center">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"></div>
              <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/40 relative z-10">
                <Smartphone className="w-8 h-8 animate-bounce" />
              </div>
            </div>

            <div>
              <h4 className="text-base font-extrabold text-slate-900">M-Pesa STK Push Prompt Sent!</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Check your phone <strong className="text-slate-800 font-mono">{stkData?.phone || phoneNumber}</strong> and enter your M-Pesa PIN to authorize:
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl max-w-xs mx-auto text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Authorized Amount</span>
              <p className="text-xl font-black text-emerald-700 font-mono">
                KES {stkData?.amountInKes?.toLocaleString() || amountInKes.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500 font-semibold">(${numAmount.toFixed(2)} USD)</p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>Awaiting PIN verification from Safaricom...</span>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCancelPrompt('Cancelled by user')}
                className="flex-1 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                Cancel Payment Prompt
              </button>
              <button
                type="button"
                onClick={() => {
                  if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                  setStep('form');
                }}
                className="flex-1 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold transition-colors"
              >
                Edit Details
              </button>
            </div>
          </div>
        )}

        {/* STEP 2.5: PAYMENT CANCELLED FEEDBACK */}
        {step === 'cancelled' && (
          <div className="mt-5 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto border-2 border-rose-300">
              <XCircle className="w-10 h-10 text-rose-600" />
            </div>

            <div>
              <h4 className="text-lg font-black text-slate-900">Payment Prompt Cancelled</h4>
              <p className="text-xs text-rose-600 font-semibold mt-1">
                {errorMsg || 'The M-Pesa transaction was cancelled on your phone or on the site.'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                No funds were deducted from your M-Pesa account. You can retry anytime with another number or amount.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-600 max-w-xs mx-auto space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-rose-600">CANCELLED (ResultCode: 1032)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target Phone:</span>
                <span className="font-mono font-bold text-slate-800">{stkData?.phone || phoneNumber}</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setStep('form');
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Payment
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT CONFIRMED CELEBRATION */}
        {step === 'success' && (
          <div className="mt-5 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>

            <div>
              <h4 className="text-lg font-black text-slate-900">Deposit Confirmed!</h4>
              <p className="text-xs text-slate-600 mt-1">
                ${numAmount.toFixed(2)} USD (KES {amountInKes.toLocaleString()}) has been added to your escrow wallet.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-700 max-w-xs mx-auto space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-[11px]">Safaricom Receipt:</span>
                <span className="font-mono font-bold text-slate-900">{confirmedReceipt}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-[11px]">Payment Method:</span>
                <span className="font-bold text-emerald-700">M-Pesa STK Express</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">Closing automatically in a moment...</p>
          </div>
        )}

      </div>
    </div>
  );
}
