import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  DollarSign, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  User, 
  Truck, 
  AlertTriangle,
  ArrowRight,
  Filter,
  Check,
  Search
} from 'lucide-react';

export default function AdminEscrowDisputes({ token, apiBase, formatMoney }) {
  const [escrows, setEscrows] = useState([]);
  const [summary, setSummary] = useState({ totalHeld: 0, totalReleased: 0, totalRefunded: 0, totalCancelled: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [arbitratingEscrow, setArbitratingEscrow] = useState(null);
  const [arbitrationAction, setArbitrationAction] = useState('FORCE_RELEASE'); // 'FORCE_RELEASE' or 'FORCE_REFUND'
  const [arbitrationReason, setArbitrationReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchEscrows = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`${apiBase}/admin/escrows`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setEscrows(data.escrows || []);
        if (data.summary) setSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to fetch escrows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscrows();
  }, [token, apiBase]);

  const handleArbitrate = async (e) => {
    e.preventDefault();
    if (!arbitratingEscrow) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/admin/escrow/arbitrate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          escrowId: arbitratingEscrow.id,
          action: arbitrationAction,
          reason: arbitrationReason || (arbitrationAction === 'FORCE_RELEASE' ? 'Delivery verified by platform arbitrator' : 'Buyer dispute upheld by administrator')
        })
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', text: data.message });
        setArbitratingEscrow(null);
        setArbitrationReason('');
        fetchEscrows();
      } else {
        setFeedback({ type: 'error', text: data.error || 'Failed to complete arbitration' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Network error during arbitration' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEscrows = escrows.filter(item => {
    const matchesFilter = filterStatus === 'ALL' || item.status === filterStatus;
    const term = search.toLowerCase();
    const matchesSearch = !search || 
      item.reference?.toLowerCase().includes(term) ||
      item.order?.orderNumber?.toLowerCase().includes(term) ||
      item.order?.buyer?.name?.toLowerCase().includes(term) ||
      item.order?.items?.[0]?.cropName?.toLowerCase().includes(term);
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'HELD':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1"><Clock className="w-3 h-3" /> HELD IN VAULT</span>;
      case 'RELEASED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> RELEASED TO FARMER</span>;
      case 'REFUNDED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1"><ArrowRight className="w-3 h-3" /> REFUNDED TO BUYER</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1"><XCircle className="w-3 h-3" /> CANCELLED</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono text-emerald-400 uppercase font-bold">Escrow Settlement Clearinghouse</span>
          </div>
          <h2 className="text-2xl font-black mt-1">Financial Ledger & Dispute Arbitration</h2>
          <p className="text-xs text-slate-300 mt-1">
            Monitor protected M-Pesa Daraja vaults, track pending disbursements, and resolve farmer-buyer trade disputes.
          </p>
        </div>

        <button 
          onClick={fetchEscrows} 
          disabled={loading}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-2 shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Ledger
        </button>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2 ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
          {feedback.type === 'success' ? <Check className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Vault Holdings</span>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {formatMoney ? formatMoney(summary.totalHeld) : `$${summary.totalHeld.toFixed(2)}`}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Held safely awaiting delivery</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Released to Farmers</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {formatMoney ? formatMoney(summary.totalReleased) : `$${summary.totalReleased.toFixed(2)}`}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Delivered & settled payouts</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Refunded to Buyers</span>
          <p className="text-2xl font-black text-blue-600 mt-1">
            {formatMoney ? formatMoney(summary.totalRefunded) : `$${summary.totalRefunded.toFixed(2)}`}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Disputes or order cancellations</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Transactions</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{summary.count}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Across entire platform</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          {['ALL', 'HELD', 'RELEASED', 'REFUNDED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterStatus === st 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order, buyer, crop..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      {/* Escrow Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Escrow Transaction Ledger</h3>
            <p className="text-xs text-slate-500">Full audit trail of locked payments and administrative overrides.</p>
          </div>
          <span className="text-xs font-mono text-slate-400">{filteredEscrows.length} records</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
            <span className="text-xs">Loading escrow records...</span>
          </div>
        ) : filteredEscrows.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-xs">No escrow records found matching criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 uppercase text-[10px] text-slate-400 border-b">
                <tr>
                  <th className="py-3 px-4">Escrow Ref / Date</th>
                  <th className="py-3 px-4">Order / Cargo</th>
                  <th className="py-3 px-4">Buyer & Producer</th>
                  <th className="py-3 px-4">Vault Amount</th>
                  <th className="py-3 px-4">Escrow Status</th>
                  <th className="py-3 px-4 text-right">Dispute Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEscrows.map((esc) => {
                  const order = esc.order;
                  const item = order?.items?.[0];
                  const farmer = item?.listing?.farmer;
                  const buyer = order?.buyer;

                  return (
                    <tr key={esc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 block">{esc.reference}</span>
                        <span className="text-[10px] text-slate-400">{new Date(esc.fundedAt).toLocaleDateString()}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono text-indigo-600 font-bold block">{order?.orderNumber || 'N/A'}</span>
                        <span className="text-slate-600 font-medium">
                          {item ? `${item.cropName} (${item.quantity} kg)` : 'Produce Order'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-[11px]">
                          <span className="text-slate-700 block"><strong>Buyer:</strong> {buyer?.name || 'Unknown'}</span>
                          <span className="text-slate-500 block"><strong>Farmer:</strong> {farmer?.name || 'Producer'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {formatMoney ? formatMoney(esc.amountHeld) : `$${esc.amountHeld.toFixed(2)}`}
                      </td>

                      <td className="py-3.5 px-4">
                        {getStatusBadge(esc.status)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {esc.status === 'HELD' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setArbitratingEscrow(esc);
                                setArbitrationAction('FORCE_RELEASE');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 shadow-xs transition-colors"
                              title="Release funds to farmer"
                            >
                              <ShieldCheck className="w-3 h-3" /> Release
                            </button>
                            <button
                              onClick={() => {
                                setArbitratingEscrow(esc);
                                setArbitrationAction('FORCE_REFUND');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] flex items-center gap-1 border border-rose-200 transition-colors"
                              title="Refund funds to buyer"
                            >
                              <ArrowRight className="w-3 h-3" /> Refund
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Settled</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Arbitration Modal */}
      {arbitratingEscrow && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-indigo-600 uppercase font-bold">Admin Arbitration Portal</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {arbitrationAction === 'FORCE_RELEASE' ? 'Force Release Escrow to Farmer' : 'Force Refund Escrow to Buyer'}
                </h3>
              </div>
              <button 
                onClick={() => setArbitratingEscrow(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Ref:</span>
                <span className="font-mono font-bold text-slate-800">{arbitratingEscrow.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Order Number:</span>
                <span className="font-mono font-bold text-indigo-600">{arbitratingEscrow.order?.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vault Amount:</span>
                <span className="font-bold text-slate-900">
                  {formatMoney ? formatMoney(arbitratingEscrow.amountHeld) : `$${arbitratingEscrow.amountHeld.toFixed(2)}`}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Arbitration Resolution Reason / Notes:</label>
              <textarea
                rows={3}
                value={arbitrationReason}
                onChange={(e) => setArbitrationReason(e.target.value)}
                placeholder={arbitrationAction === 'FORCE_RELEASE' ? "e.g. Delivery confirmed at warehouse via Waybill signature." : "e.g. Produce damaged in transit, transporter did not meet cold-chain terms."}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setArbitratingEscrow(null)}
                className="w-1/2 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleArbitrate}
                disabled={submitting}
                className={`w-1/2 py-2 rounded-xl text-xs font-bold text-white shadow-md disabled:opacity-50 ${
                  arbitrationAction === 'FORCE_RELEASE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {submitting ? 'Processing...' : arbitrationAction === 'FORCE_RELEASE' ? 'Confirm Release' : 'Confirm Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
