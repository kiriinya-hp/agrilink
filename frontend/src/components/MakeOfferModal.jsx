import React, { useState } from 'react';
import { 
  X, 
  Handshake, 
  DollarSign, 
  Scale, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Send,
  MessageSquare
} from 'lucide-react';

export default function MakeOfferModal({ isOpen, onClose, listing, user, onOfferSubmitted }) {
  if (!isOpen || !listing) return null;

  const [offeredUnitPrice, setOfferedUnitPrice] = useState(
    (listing.unitPrice * 0.9).toFixed(2) // Default 10% wholesale discount offer
  );
  const [targetQuantity, setTargetQuantity] = useState(
    Math.min(listing.availableQty, 200)
  );
  const [proposedDeliveryDate, setProposedDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const originalTotal = listing.unitPrice * targetQuantity;
  const offeredTotal = parseFloat(offeredUnitPrice || 0) * targetQuantity;
  const potentialSavings = Math.max(0, originalTotal - offeredTotal);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const price = parseFloat(offeredUnitPrice);
    const qty = parseFloat(targetQuantity);

    if (isNaN(price) || price <= 0) {
      setErrorMsg('Please enter a valid offered unit price.');
      return;
    }

    if (isNaN(qty) || qty <= 0 || qty > listing.availableQty) {
      setErrorMsg(`Target quantity must be between 1 and ${listing.availableQty} kg.`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/market/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: user.id,
          listingId: listing.id,
          offeredUnitPrice: price,
          targetQuantity: qty,
          proposedDeliveryDate,
          notes
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setSuccessMsg(data.message);
      if (onOfferSubmitted) {
        onOfferSubmitted(data);
      }

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to dispatch offer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center border border-indigo-500/20">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Request Bulk Quote / Offer</h3>
              <p className="text-xs text-slate-500">Propose custom pricing directly to {listing.farmer?.name || 'Farmer'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Produce Overview Card */}
        <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-900">{listing.cropName}</h4>
            <p className="text-xs text-slate-500">
              Location: {listing.location} · Available: {listing.availableQty} kg
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">List Price</span>
            <span className="text-sm font-black text-slate-800">${listing.unitPrice.toFixed(2)}/kg</span>
          </div>
        </div>

        {/* Feedback messages */}
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs font-semibold text-slate-700">
          
          <div className="grid grid-cols-2 gap-3">
            {/* Target Quantity */}
            <div>
              <label className="block mb-1 text-slate-700">Target Volume (kg)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Scale className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="number"
                  min="1"
                  max={listing.availableQty}
                  required
                  value={targetQuantity}
                  onChange={(e) => setTargetQuantity(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Target Price */}
            <div>
              <label className="block mb-1 text-slate-700">Offered Price ($/kg)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={offeredUnitPrice}
                  onChange={(e) => setOfferedUnitPrice(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Pricing Comparison Bar */}
          <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Proposed Total Payout:</span>
              <span className="text-base font-black text-indigo-950">${offeredTotal.toFixed(2)}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[11px]">Potential Discount:</span>
              <span className="font-bold text-emerald-700 font-mono">
                {potentialSavings > 0 ? `-$${potentialSavings.toFixed(2)} (${((potentialSavings / originalTotal) * 100).toFixed(1)}%)` : 'Standard'}
              </span>
            </div>
          </div>

          {/* Notes for Farmer */}
          <div>
            <label className="block mb-1 text-slate-700">Negotiation Note / Requirements (Optional)</label>
            <div className="relative">
              <textarea
                rows="2"
                placeholder="e.g. Requesting wholesale price for continuous weekly supply; ready for instant M-Pesa escrow lock."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-indigo-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              {loading ? (
                <span>Dispatching Offer...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Offer to Farmer</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
