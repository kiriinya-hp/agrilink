import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  ShieldAlert, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Scale
} from 'lucide-react';

const ISSUE_CATEGORIES = [
  'Transit Damage / Bruised Produce',
  'Substandard Quality / Grade Mismatch',
  'Weight or Quantity Shortage',
  'Late Delivery Resulting in Spoilage',
  'Incorrect Variety Delivered'
];

export default function DisputeModal({ isOpen, onClose, order, user, onDisputeFiled }) {
  if (!isOpen || !order) return null;

  const [issueCategory, setIssueCategory] = useState(ISSUE_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [requestedAdjustment, setRequestedAdjustment] = useState('PARTIAL_REFUND');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg('Please describe the inspection findings and produce issue.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/orders/${order.id}/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          issueCategory,
          description,
          requestedAdjustment
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setSuccessMsg(data.message);
      if (onDisputeFiled) {
        onDisputeFiled(data);
      }

      setTimeout(() => {
        onClose();
      }, 2200);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to file inspection claim.');
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
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center border border-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Escrow Quality Dispute Claim</h3>
              <p className="text-xs text-slate-500">Report quality issue for Order #{order.orderNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Notice */}
        <div className="mt-4 p-3 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Escrow Protection Activated:</strong> Filing this claim pauses instant escrow payout to the farmer and transporter while our inspection desk reviews the delivery notes.
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs font-semibold text-slate-700">
          
          <div>
            <label className="block mb-1 text-slate-700">Issue Classification</label>
            <select
              value={issueCategory}
              onChange={(e) => setIssueCategory(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            >
              {ISSUE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-slate-700">Requested Resolution Action</label>
            <select
              value={requestedAdjustment}
              onChange={(e) => setRequestedAdjustment(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            >
              <option value="PARTIAL_REFUND">Partial Escrow Refund (Compensate for Damaged %)</option>
              <option value="FULL_REFUND">Full Escrow Reversal & Return to Depot</option>
              <option value="REPLACEMENT_BATCH">Farmer Dispatches Replacement Batch</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-slate-700">Detailed Description & Inspection Notes</label>
            <textarea
              rows="3"
              required
              placeholder="e.g. 25% of the Shangi potatoes arrived with rot and deep transit bruising. Driver arrived 8 hours late in open truck."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

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
              className="w-2/3 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-rose-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              {loading ? (
                <span>Submitting Dispute...</span>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Submit Inspection Claim</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
