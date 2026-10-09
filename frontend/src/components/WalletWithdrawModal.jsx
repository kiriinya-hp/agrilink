import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  X, 
  Phone, 
  Building2, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Clock, 
  Receipt,
  Smartphone,
  Wallet
} from 'lucide-react';

const KENYAN_BANKS = [
  'Equity Bank Kenya',
  'KCB Bank Kenya',
  'Co-operative Bank of Kenya',
  'NCBA Bank',
  'Absa Bank Kenya',
  'Stanbic Bank Kenya',
  'Family Bank',
  'Standard Chartered Kenya'
];

export default function WalletWithdrawModal({ isOpen, onClose, user, onBalanceUpdated }) {
  const [method, setMethod] = useState('MPESA'); // 'MPESA', 'BANK', 'AIRTEL'
  const [amount, setAmount] = useState('');
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || '254711223344');
  const [bankName, setBankName] = useState(KENYAN_BANKS[0]);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [withdrawalReceipt, setWithdrawalReceipt] = useState(null);

  if (!isOpen) return null;

  const currentBalance = user?.walletBalance || 0;

  const handlePercentageSelect = (pct) => {
    const calculated = (currentBalance * (pct / 100)).toFixed(2);
    setAmount(calculated);
    setErrorMsg('');
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const withdrawAmt = parseFloat(amount);

    if (isNaN(withdrawAmt) || withdrawAmt <= 0) {
      setErrorMsg('Please enter a valid withdrawal amount.');
      return;
    }

    if (withdrawAmt < 5) {
      setErrorMsg('Minimum withdrawal amount is $5.00 (approx. KES 650).');
      return;
    }

    if (withdrawAmt > currentBalance) {
      setErrorMsg(`Insufficient funds. Your maximum withdrawable balance is $${currentBalance.toFixed(2)}.`);
      return;
    }

    if (method === 'BANK' && (!accountNumber.trim() || !accountName.trim())) {
      setErrorMsg('Please provide both your bank account number and official account name.');
      return;
    }

    if ((method === 'MPESA' || method === 'AIRTEL') && !recipientPhone.trim()) {
      setErrorMsg('Please enter a valid mobile money phone number.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount: withdrawAmt,
          method,
          recipientPhone,
          bankName,
          accountNumber,
          accountName
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setWithdrawalReceipt(data.withdrawal);
      if (onBalanceUpdated) {
        onBalanceUpdated(data.walletBalance);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Withdrawal failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setWithdrawalReceipt(null);
    setErrorMsg('');
    setAmount('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Withdraw Funds</h3>
              <p className="text-xs text-slate-500">Instant payout to M-Pesa or Kenyan Bank</p>
            </div>
          </div>
          <button onClick={resetAndClose} className="text-slate-400 hover:text-slate-600 font-bold p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Available Balance Banner */}
        <div className="mt-4 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-4 rounded-2xl shadow-inner flex justify-between items-center">
          <div>
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">Withdrawable Balance</span>
            <p className="text-2xl font-black mt-0.5">${currentBalance.toFixed(2)}</p>
            <span className="text-[11px] text-slate-300 font-medium">Approx. KES {(currentBalance * 130).toLocaleString()}</span>
          </div>
          <div className="text-right">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Instant Payout
            </span>
          </div>
        </div>

        {/* Withdrawal Success Receipt Screen */}
        {withdrawalReceipt ? (
          <div className="mt-5 space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-md shadow-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">Payout Disbursed Successfully!</h4>
              <p className="text-xs text-emerald-800 mt-1">
                ${withdrawalReceipt.amount.toFixed(2)} has been sent to your {withdrawalReceipt.destination}.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between text-slate-500">
                <span>Transaction Ref:</span>
                <span className="font-mono font-bold text-slate-800">{withdrawalReceipt.reference}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Payout Channel:</span>
                <span className="font-bold text-slate-800">{withdrawalReceipt.method}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Estimated Arrival:</span>
                <span className="font-bold text-emerald-700">Instant (Within 60s)</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Transaction Fee:</span>
                <span className="font-bold text-emerald-700">$0.00 (Mazao Hub Promo)</span>
              </div>
            </div>

            <button
              onClick={resetAndClose}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition-colors"
            >
              Done & Return to Dashboard
            </button>
          </div>
        ) : (
          /* Withdrawal Form */
          <form onSubmit={handleWithdraw} className="mt-4 space-y-4 text-xs font-semibold text-slate-700">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Payout Channel Selector */}
            <div>
              <label className="block mb-1.5 text-slate-700">Select Payout Destination</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('MPESA')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    method === 'MPESA'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span className="text-[11px]">M-Pesa B2C</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('BANK')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    method === 'BANK'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span className="text-[11px]">Bank Transfer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('AIRTEL')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    method === 'AIRTEL'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Phone className="w-4 h-4 text-rose-600" />
                  <span className="text-[11px]">Airtel Money</span>
                </button>
              </div>
            </div>

            {/* Amount Input & Percentage Buttons */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-700">Withdrawal Amount ($ USD)</label>
                <span className="text-[11px] text-slate-400">Min: $5.00</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="5"
                  max={currentBalance}
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Quick Percentage Chips */}
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handlePercentageSelect(pct)}
                    className="py-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition-colors"
                  >
                    {pct === 100 ? 'All 100%' : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Destination Specific Fields */}
            {method === 'BANK' ? (
              <div className="space-y-2.5 pt-1 border-t border-slate-100">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Select Bank</label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {KENYAN_BANKS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Account Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 011092837465"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Account Holder Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kelvin Kiriinya"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="pt-1 border-t border-slate-100">
                <label className="block text-[11px] text-slate-600 mb-1">
                  Recipient {method === 'MPESA' ? 'Safaricom M-Pesa' : 'Airtel Money'} Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="254712345678"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Enter number in Kenyan international format (254...)</p>
              </div>
            )}

            {/* Fee summary notice */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Disbursement Speed
              </span>
              <span className="font-bold text-slate-800">Instant (Within 1 min)</span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={resetAndClose}
                className="w-1/3 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || currentBalance < 5}
                className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-emerald-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                {loading ? (
                  <span>Processing Payout...</span>
                ) : (
                  <>
                    <span>Confirm Withdrawal</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
