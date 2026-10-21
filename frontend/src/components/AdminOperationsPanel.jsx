import React, { useState, useEffect, useCallback } from 'react';
import {
  Truck, CheckCircle2, XCircle, Clock, RefreshCw, Settings,
  ShieldCheck, AlertTriangle, Percent, Save, Package,
  RotateCcw, Eye, User, MapPin, Star, DollarSign,
  ChevronDown, ChevronUp, ToggleLeft, ToggleRight, Wrench
} from 'lucide-react';

// ──────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    AVAILABLE:  'bg-emerald-50 text-emerald-700 border-emerald-200',
    BUSY:       'bg-amber-50  text-amber-700  border-amber-200',
    OFFLINE:    'bg-slate-50  text-slate-500  border-slate-200',
    PENDING:    'bg-sky-50    text-sky-700    border-sky-200',
    APPROVED:   'bg-emerald-50 text-emerald-700 border-emerald-200',
    REJECTED:   'bg-rose-50   text-rose-700   border-rose-200',
    OPEN:       'bg-amber-50  text-amber-700  border-amber-200',
    RESOLVED:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${map[status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
      {status}
    </span>
  );
};

const SectionHeader = ({ icon: Icon, title, subtitle, color = 'indigo' }) => (
  <div className={`bg-gradient-to-r from-${color}-900 via-slate-900 to-${color}-950 text-white rounded-2xl p-5 shadow-lg border border-${color}-700/40`}>
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl bg-${color}-600 flex items-center justify-center shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <h3 className="font-bold text-base text-white">{title}</h3>
        <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
  </div>
);

// ──────────────────────────────────────────────────────────────────────
// Mock data generators (replace with real API calls as backend grows)
// ──────────────────────────────────────────────────────────────────────
const MOCK_DRIVERS = [
  { id: 'DRV001', name: 'James Mwangi', phone: '+254712345001', county: 'Nairobi', vehicleType: '3-Tonne Lorry', plate: 'KCA 123A', trips: 47, rating: 4.8, status: 'AVAILABLE', earnings: 184500 },
  { id: 'DRV002', name: 'Peter Kamau',  phone: '+254712345002', county: 'Nakuru',  vehicleType: 'Pick-Up',      plate: 'KBZ 456B', trips: 32, rating: 4.6, status: 'BUSY',      earnings: 128000 },
  { id: 'DRV003', name: 'Grace Wanjiru',phone: '+254712345003', county: 'Meru',    vehicleType: '5-Tonne Truck',plate: 'KDD 789C', trips: 61, rating: 4.9, status: 'AVAILABLE', earnings: 245000 },
  { id: 'DRV004', name: 'Samuel Odhiambo',phone:'+254712345004',county: 'Kisumu', vehicleType: 'Refrigerated Van',plate:'KCX 321D',trips:18,rating:4.3, status:'OFFLINE',   earnings:  72000 },
  { id: 'DRV005', name: 'Faith Njeri',  phone: '+254712345005', county: 'Nyeri',   vehicleType: 'Pick-Up',      plate: 'KBY 654E', trips: 25, rating: 4.7, status: 'AVAILABLE', earnings: 101000 },
];

const MOCK_LISTINGS_QUEUE = [
  { id: 'LST001', cropName: 'Tomatoes (Ranger F1)', farmer: 'John Kariuki', location: 'Kirinyaga', qty: 500, price: 4200, grade: 'GRADE_A', submittedAt: '2026-10-21T07:00:00Z', status: 'PENDING' },
  { id: 'LST002', cropName: 'French Beans',          farmer: 'Mary Wambui',  location: 'Meru',     qty: 200, price: 3800, grade: 'GRADE_A', submittedAt: '2026-10-21T06:30:00Z', status: 'PENDING' },
  { id: 'LST003', cropName: 'Potatoes (Shangi)',      farmer: 'Daniel Maina', location: 'Nyandarua',qty: 1200,price: 2100, grade: 'GRADE_B', submittedAt: '2026-10-20T18:00:00Z', status: 'APPROVED' },
  { id: 'LST004', cropName: 'Capsicum',               farmer: 'Agnes Waweru', location: 'Thika',    qty: 150, price: 5500, grade: 'GRADE_A', submittedAt: '2026-10-20T15:00:00Z', status: 'REJECTED' },
];

const MOCK_REFUNDS = [
  { id: 'REF001', buyer: 'Nairobi Fresh Traders',  crop: 'Tomatoes',      amount: 52000, reason: 'Produce arrived rotten – cold chain failure',         orderId: 'ORD-881', status: 'OPEN',     raisedAt: '2026-10-20T14:00:00Z' },
  { id: 'REF002', buyer: 'Mombasa Greens Ltd',     crop: 'French Beans',  amount: 38000, reason: 'Wrong variety delivered – ordered Climber, got Local', orderId: 'ORD-754', status: 'OPEN',     raisedAt: '2026-10-19T09:00:00Z' },
  { id: 'REF003', buyer: 'Karen Supermarket',      crop: 'Capsicum',      amount: 15500, reason: 'Under-weight delivery (ordered 100kg, got 68kg)',        orderId: 'ORD-699', status: 'RESOLVED', raisedAt: '2026-10-18T11:00:00Z' },
];

const DEFAULT_FEES = { escrowCommission: 5, freightMarkup: 3, platformVat: 16, minOrderKes: 5000 };

// ──────────────────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────────────────
export default function AdminOperationsPanel({ token, apiBase, allUsers }) {
  const [activeSection, setActiveSection] = useState('drivers');
  const [drivers, setDrivers]     = useState(MOCK_DRIVERS);
  const [queue, setQueue]         = useState(MOCK_LISTINGS_QUEUE);
  const [refunds, setRefunds]     = useState(MOCK_REFUNDS);
  const [fees, setFees]           = useState(DEFAULT_FEES);
  const [feesSaved, setFeesSaved] = useState(false);
  const [expandedDriver, setExpandedDriver] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [toast, setToast]         = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Driver status toggle ──
  const cycleDriverStatus = (id) => {
    const cycle = { AVAILABLE: 'OFFLINE', OFFLINE: 'AVAILABLE', BUSY: 'AVAILABLE' };
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, status: cycle[d.status] || 'AVAILABLE' } : d));
    showToast('Driver status updated');
  };

  // ── Listing queue actions ──
  const approveItem = (id) => {
    setQueue(prev => prev.map(l => l.id === id ? { ...l, status: 'APPROVED' } : l));
    showToast('Listing approved — now live on marketplace ✓');
  };
  const rejectItem = (id) => {
    setQueue(prev => prev.map(l => l.id === id ? { ...l, status: 'REJECTED' } : l));
    showToast('Listing rejected — farmer notified', 'warning');
  };

  // ── Refund actions ──
  const resolveRefund = (id) => {
    setRefunds(prev => prev.map(r => r.id === id ? { ...r, status: 'RESOLVED' } : r));
    showToast('Refund processed — funds released to buyer wallet ✓');
  };

  // ── Save fees ──
  const saveFees = () => {
    setFeesSaved(true);
    showToast('Platform fee settings saved ✓');
    setTimeout(() => setFeesSaved(false), 2000);
  };

  const navBtns = [
    { id: 'drivers',  label: 'Driver Fleet',        icon: Truck       },
    { id: 'queue',    label: 'Listing Approvals',   icon: Package     },
    { id: 'refunds',  label: 'Refund Management',   icon: RotateCcw   },
    { id: 'fees',     label: 'Platform Fee Config', icon: Settings    },
  ];

  return (
    <div className="space-y-5 relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-bold flex items-center gap-2 ${
          toast.type === 'warning' ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
        }`}>
          <CheckCircle2 className="w-4 h-4" /> {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xs font-mono text-indigo-400 uppercase">Admin Panel</span>
              <h2 className="text-xl font-black text-white mt-0.5">Operations Control Centre</h2>
              <p className="text-xs text-slate-400">Manage fleet, listings, refunds & platform fees</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-500/30 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {drivers.filter(d => d.status === 'AVAILABLE').length} Drivers Available
            </span>
            <span className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded-lg border border-amber-500/30 font-bold">
              <Clock className="w-3 h-3" />
              {queue.filter(l => l.status === 'PENDING').length} Listings Pending
            </span>
          </div>
        </div>

        {/* Sub-nav */}
        <div className="flex gap-2 mt-5 flex-wrap">
          {navBtns.map(b => (
            <button
              key={b.id}
              onClick={() => setActiveSection(b.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeSection === b.id
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              <b.icon className="w-3.5 h-3.5" /> {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─────────────────── DRIVER FLEET ─────────────────── */}
      {activeSection === 'drivers' && (
        <div className="space-y-4">
          <SectionHeader
            icon={Truck}
            title="Logistics Driver Fleet Management"
            subtitle={`${drivers.length} registered transporters across all corridors`}
            color="indigo"
          />

          {/* Summary Row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Available',  val: drivers.filter(d=>d.status==='AVAILABLE').length, color:'emerald' },
              { label: 'On Trip',    val: drivers.filter(d=>d.status==='BUSY').length,      color:'amber'   },
              { label: 'Offline',    val: drivers.filter(d=>d.status==='OFFLINE').length,   color:'slate'   },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
                <p className={`text-2xl font-black text-${s.color}-600`}>{s.val}</p>
                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Driver Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase border-b">
                  <tr>
                    <th className="px-4 py-3">Driver</th>
                    <th className="px-4 py-3">Vehicle</th>
                    <th className="px-4 py-3">County</th>
                    <th className="px-4 py-3">Trips</th>
                    <th className="px-4 py-3">Rating</th>
                    <th className="px-4 py-3">Earnings (KES)</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {drivers.map(d => (
                    <React.Fragment key={d.id}>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-900 block">{d.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{d.phone}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {d.vehicleType}
                          <span className="text-[10px] font-mono ml-1 text-slate-400">({d.plate})</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1 text-slate-600"><MapPin className="w-3 h-3 text-slate-400"/>{d.county}</span>
                        </td>
                        <td className="px-4 py-3 font-bold text-indigo-700">{d.trips}</td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1 font-bold text-amber-600">
                            <Star className="w-3 h-3 fill-amber-400 stroke-amber-500"/> {d.rating}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-emerald-700">
                          {d.earnings.toLocaleString()}
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setExpandedDriver(expandedDriver === d.id ? null : d.id)}
                              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors"
                              title="View details"
                            >
                              {expandedDriver === d.id ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>}
                            </button>
                            <button
                              onClick={() => cycleDriverStatus(d.id)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold transition-colors flex items-center gap-1"
                              title="Toggle status"
                            >
                              {d.status === 'AVAILABLE' ? <ToggleRight className="w-3.5 h-3.5"/> : <ToggleLeft className="w-3.5 h-3.5"/>}
                              Toggle
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedDriver === d.id && (
                        <tr>
                          <td colSpan={8} className="px-6 py-4 bg-indigo-50/60 border-b border-indigo-100">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                              <div><span className="text-slate-400 uppercase font-semibold text-[10px] block">Driver ID</span><span className="font-mono font-bold text-slate-800">{d.id}</span></div>
                              <div><span className="text-slate-400 uppercase font-semibold text-[10px] block">Vehicle Plate</span><span className="font-mono font-bold text-slate-800">{d.plate}</span></div>
                              <div><span className="text-slate-400 uppercase font-semibold text-[10px] block">Total Trips</span><span className="font-bold text-indigo-700">{d.trips} deliveries</span></div>
                              <div><span className="text-slate-400 uppercase font-semibold text-[10px] block">Total Earnings</span><span className="font-bold text-emerald-700">KES {d.earnings.toLocaleString()}</span></div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────── LISTING APPROVAL QUEUE ─────────────────── */}
      {activeSection === 'queue' && (
        <div className="space-y-4">
          <SectionHeader
            icon={Package}
            title="Listing Approval Queue"
            subtitle="Review farmer produce listings before they go live on the marketplace"
            color="emerald"
          />

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase border-b">
                  <tr>
                    <th className="px-4 py-3">Produce</th>
                    <th className="px-4 py-3">Farmer</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Qty (kg)</th>
                    <th className="px-4 py-3">Price/kg (KES)</th>
                    <th className="px-4 py-3">Grade</th>
                    <th className="px-4 py-3">Submitted</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {queue.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-900">{l.cropName}</td>
                      <td className="px-4 py-3 text-slate-600">{l.farmer}</td>
                      <td className="px-4 py-3 flex items-center gap-1 text-slate-600 mt-2.5"><MapPin className="w-3 h-3 text-slate-400"/>{l.location}</td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">{l.qty.toLocaleString()}</td>
                      <td className="px-4 py-3 font-bold text-emerald-700">{l.price.toLocaleString()}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[10px] font-bold">{l.grade.replace('_',' ')}</span></td>
                      <td className="px-4 py-3 text-slate-500">{new Date(l.submittedAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                      <td className="px-4 py-3 text-right">
                        {l.status === 'PENDING' ? (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => approveItem(l.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1 transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5"/> Approve
                            </button>
                            <button
                              onClick={() => rejectItem(l.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold flex items-center gap-1 transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5"/> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-xs text-sky-800">
            <strong>ℹ️ Approval Gate:</strong> Only approved listings appear on the B2B marketplace. Rejected listings trigger an automatic SMS + in-app notification to the farmer with reasons.
          </div>
        </div>
      )}

      {/* ─────────────────── REFUND MANAGEMENT ─────────────────── */}
      {activeSection === 'refunds' && (
        <div className="space-y-4">
          <SectionHeader
            icon={RotateCcw}
            title="Refund & Dispute Resolution"
            subtitle="Process buyer refund requests from failed or disputed deliveries"
            color="rose"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Open Refund Requests', val: refunds.filter(r=>r.status==='OPEN').length, color:'amber' },
              { label: 'Resolved This Month',  val: refunds.filter(r=>r.status==='RESOLVED').length, color:'emerald' },
              { label: 'Total KES at Stake',   val: `KES ${refunds.filter(r=>r.status==='OPEN').reduce((s,r)=>s+r.amount,0).toLocaleString()}`, color:'rose' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <p className={`text-xl font-black text-${s.color}-600`}>{s.val}</p>
                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {refunds.map(r => (
              <div key={r.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${r.status === 'OPEN' ? 'border-amber-200' : 'border-slate-200'}`}>
                <div className="flex flex-col sm:flex-row justify-between gap-3">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={r.status} />
                      <span className="text-[10px] font-mono text-slate-400">{r.orderId}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{r.buyer}</h4>
                    <p className="text-xs text-slate-600">
                      <span className="font-semibold text-slate-700">Crop:</span> {r.crop} &nbsp;·&nbsp;
                      <span className="font-semibold text-slate-700">Amount:</span>{' '}
                      <span className="text-rose-600 font-bold">KES {r.amount.toLocaleString()}</span>
                    </p>
                    <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-2 border border-slate-200 italic">
                      "{r.reason}"
                    </p>
                    <p className="text-[10px] text-slate-400">Raised: {new Date(r.raisedAt).toLocaleString()}</p>
                  </div>
                  {r.status === 'OPEN' && (
                    <div className="shrink-0 flex sm:flex-col gap-2 sm:items-end justify-end sm:justify-start">
                      <button
                        onClick={() => resolveRefund(r.id)}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5"/> Process Refund
                      </button>
                      <button className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition-colors">
                        <Eye className="w-3.5 h-3.5"/> View Order
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────── PLATFORM FEE SETTINGS ─────────────────── */}
      {activeSection === 'fees' && (
        <div className="space-y-4">
          <SectionHeader
            icon={Settings}
            title="Platform Fee Configuration"
            subtitle="Adjust commission rates and minimum order thresholds without code changes"
            color="violet"
          />

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Escrow Commission */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600"/> Escrow Commission (%)
                </label>
                <div className="relative">
                  <input
                    type="number" min="1" max="15" step="0.5"
                    value={fees.escrowCommission}
                    onChange={e => setFees(f => ({ ...f, escrowCommission: parseFloat(e.target.value) }))}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                  <Percent className="absolute right-3 top-3.5 w-4 h-4 text-slate-400"/>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">Deducted from every successful escrow release. Currently: <strong>{fees.escrowCommission}%</strong></p>
              </div>

              {/* Freight Markup */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-amber-600"/> Freight Calculator Markup (%)
                </label>
                <div className="relative">
                  <input
                    type="number" min="0" max="10" step="0.5"
                    value={fees.freightMarkup}
                    onChange={e => setFees(f => ({ ...f, freightMarkup: parseFloat(e.target.value) }))}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  />
                  <Percent className="absolute right-3 top-3.5 w-4 h-4 text-slate-400"/>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">Platform margin added on top of transporter's base freight quote</p>
              </div>

              {/* Platform VAT */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-indigo-600"/> Platform VAT / Tax Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number" min="0" max="20" step="1"
                    value={fees.platformVat}
                    onChange={e => setFees(f => ({ ...f, platformVat: parseFloat(e.target.value) }))}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                  <Percent className="absolute right-3 top-3.5 w-4 h-4 text-slate-400"/>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">KRA VAT rate applied on platform invoices (Kenya standard: 16%)</p>
              </div>

              {/* Minimum Order */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600"/> Minimum Order Value (KES)
                </label>
                <input
                  type="number" min="1000" max="50000" step="500"
                  value={fees.minOrderKes}
                  onChange={e => setFees(f => ({ ...f, minOrderKes: parseInt(e.target.value) }))}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">Orders below this threshold are blocked. Prevents uneconomical micro-orders.</p>
              </div>
            </div>

            {/* Fee Preview */}
            <div className="bg-slate-900 text-white rounded-2xl p-5">
              <p className="text-xs font-mono text-slate-400 mb-3 uppercase">Live Fee Simulation — KES 100,000 Transaction</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                {[
                  { label: 'Gross Value',    val: `KES 100,000`,  color: 'white'   },
                  { label: 'Escrow Fee',     val: `KES ${(1000 * fees.escrowCommission).toLocaleString()}`, color: 'amber'   },
                  { label: 'VAT (on fee)',   val: `KES ${Math.round(1000 * fees.escrowCommission * fees.platformVat / 100).toLocaleString()}`, color: 'indigo'  },
                  { label: 'Net to Farmer',  val: `KES ${(100000 - 1000*fees.escrowCommission - Math.round(1000*fees.escrowCommission*fees.platformVat/100)).toLocaleString()}`, color: 'emerald' },
                ].map(s => (
                  <div key={s.label}>
                    <p className={`text-lg font-black text-${s.color}-400`}>{s.val}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={saveFees}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Save className="w-4 h-4"/> {feesSaved ? 'Saved ✓' : 'Save Fee Configuration'}
            </button>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
            <strong>⚠️ Important:</strong> Changes take effect immediately for all new orders. Existing escrow holds are not retroactively affected.
          </div>
        </div>
      )}
    </div>
  );
}
