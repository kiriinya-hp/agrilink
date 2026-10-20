import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, Search, Filter, RefreshCw, CheckCircle2, Clock, 
  Truck, ShieldAlert, ShieldCheck, DollarSign, MapPin, Phone, 
  User, Calendar, ChevronDown, ChevronUp, Package, AlertCircle, Copy, Check
} from 'lucide-react';

export default function AdminOrdersManagement({ token, apiBase, formatMoney }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const fetchOrders = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch(`${apiBase}/admin/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to fetch admin orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [apiBase, token]);

  const copyToClipboard = (text, id) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(ord => {
      // Status filter
      if (statusFilter !== 'ALL' && ord.status !== statusFilter) {
        return false;
      }
      // Search term
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const orderNum = (ord.orderNumber || '').toLowerCase();
      const buyerName = (ord.buyer?.name || '').toLowerCase();
      const buyerPhone = (ord.buyer?.phone || '').toLowerCase();
      const address = (ord.deliveryAddress || '').toLowerCase();
      const itemNames = (ord.items || []).map(i => (i.cropName || '').toLowerCase()).join(' ');

      return orderNum.includes(term) || 
             buyerName.includes(term) || 
             buyerPhone.includes(term) || 
             address.includes(term) || 
             itemNames.includes(term);
    });
  }, [orders, statusFilter, searchTerm]);

  // Aggregate stats
  const stats = useMemo(() => {
    const totalCount = orders.length;
    const totalGmv = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    const inTransit = orders.filter(o => o.status === 'IN_TRANSIT' || o.status === 'DISPATCH_READY').length;
    const completed = orders.filter(o => o.status === 'COMPLETED').length;
    const escrowHeld = orders.filter(o => o.escrowTransaction?.status === 'HELD').length;
    return { totalCount, totalGmv, inTransit, completed, escrowHeld };
  }, [orders]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> COMPLETED</span>;
      case 'IN_TRANSIT':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-sky-100 text-sky-800 border border-sky-300 flex items-center gap-1"><Truck className="w-3 h-3" /> IN TRANSIT</span>;
      case 'DISPATCH_READY':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1"><Package className="w-3 h-3" /> DISPATCH READY</span>;
      case 'ESCROW_FUNDED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> ESCROW SECURED</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> CANCELLED</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-slate-100 text-slate-700 border border-slate-300 flex items-center gap-1"><Clock className="w-3 h-3" /> {status || 'PENDING'}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Orders Audit & Fulfillment Directory</h2>
              <p className="text-xs text-slate-500">Live platform-wide transaction ledger across all Buyers, Farmers & Transporters</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Orders'}
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Orders</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Platform Lifetime</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Total Volume (GMV)</p>
          <p className="text-xl font-black text-emerald-700 mt-1">${stats.totalGmv.toFixed(2)}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">~KES {(stats.totalGmv * 130).toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-sky-600">In Transit</p>
          <p className="text-2xl font-black text-sky-700 mt-1">{stats.inTransit}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Active on road</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Completed</p>
          <p className="text-2xl font-black text-indigo-700 mt-1">{stats.completed}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Disbursed to farmers</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs col-span-2 md:col-span-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Escrow Held</p>
          <p className="text-2xl font-black text-amber-700 mt-1">{stats.escrowHeld}</p>
          <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Protected in Safaricom Vault</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order #, Buyer Name, Phone, Produce name, Delivery Location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {['ALL', 'PENDING', 'ESCROW_FUNDED', 'DISPATCH_READY', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === st ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All Orders' : st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700">Loading Order Records...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 px-4">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-800">No Orders Match Your Criteria</p>
          <p className="text-xs text-slate-500 mt-1">Try clearing filters or search query.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((ord) => {
            const isExpanded = expandedOrderId === ord.id;
            const buyer = ord.buyer || {};
            const shipment = ord.shipment || {};
            const transporter = shipment.transporter || {};
            const escrow = ord.escrowTransaction || {};
            const grandTotalKes = Math.round((ord.grandTotal || 0) * 130);

            return (
              <div
                key={ord.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Header Row */}
                <div 
                  onClick={() => setExpandedOrderId(isExpanded ? null : ord.id)}
                  className="p-4 sm:p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 shrink-0 mt-0.5 sm:mt-0">
                      <ShoppingBag className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-black text-slate-900 text-sm tracking-tight">
                          {ord.orderNumber}
                        </span>
                        {getStatusBadge(ord.status)}
                        {escrow.status === 'HELD' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-amber-500" /> M-Pesa Held
                          </span>
                        )}
                        {shipment.confirmationOtp && (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[10px] font-black border border-emerald-200">
                            OTP: {shipment.confirmationOtp}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <strong className="text-slate-700">{buyer.name || 'Commercial Buyer'}</strong>
                          {buyer.businessName && ` (${buyer.businessName})`}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> {ord.deliveryAddress || 'Kenya'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(ord.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-left md:text-right">
                      <p className="text-base font-black text-slate-900">${(ord.grandTotal || 0).toFixed(2)}</p>
                      <p className="text-xs font-bold text-emerald-600">KES {grandTotalKes.toLocaleString()}</p>
                    </div>
                    <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Order Audit Drawer */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/70 p-4 sm:p-6 space-y-5">
                    {/* Items Breakdown */}
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-indigo-600" />
                        Purchased Produce Items ({(ord.items || []).length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {(ord.items || []).map((it, idx) => (
                          <div key={it.id || idx} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-bold text-slate-800">{it.cropName}</p>
                              <p className="text-slate-500 text-[11px]">
                                Qty: <span className="font-semibold text-slate-700">{it.quantity} {it.listing?.unit || 'units'}</span> @ ${it.unitPrice.toFixed(2)}
                              </p>
                              {it.listing?.farmer?.name && (
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                  Producer: {it.listing.farmer.name} ({it.listing.location})
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-black text-slate-900">${(it.subtotal || (it.quantity * it.unitPrice)).toFixed(2)}</p>
                              <p className="text-[10px] font-bold text-emerald-600">~KES {Math.round((it.subtotal || (it.quantity * it.unitPrice)) * 130).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Financials & Escrow Ledger */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      {/* Buyer Details */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                        <p className="font-bold text-slate-700 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" /> Buyer Details
                        </p>
                        <p className="text-slate-900 font-semibold">{buyer.name || 'N/A'}</p>
                        <p className="text-slate-600 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" /> {buyer.phone || 'No phone'}
                        </p>
                        {buyer.email && <p className="text-slate-500 text-[11px]">{buyer.email}</p>}
                        <p className="text-slate-500 text-[11px] pt-1">Delivery: {ord.deliveryAddress}</p>
                        {ord.notes && <p className="text-slate-400 italic text-[11px]">"{ord.notes}"</p>}
                      </div>

                      {/* Escrow Details */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                        <p className="font-bold text-amber-700 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-500" /> M-Pesa Escrow Ledger
                        </p>
                        <p className="text-slate-600">
                          Status: <span className="font-bold text-slate-800">{escrow.status || 'UNFUNDED'}</span>
                        </p>
                        <p className="text-slate-600">
                          Amount Held: <strong className="text-slate-900">${(escrow.amountHeld || ord.grandTotal || 0).toFixed(2)}</strong> (~KES {Math.round((escrow.amountHeld || ord.grandTotal || 0) * 130).toLocaleString()})
                        </p>
                        {escrow.reference && (
                          <p className="text-slate-500 text-[10px] font-mono break-all">
                            Ref: {escrow.reference}
                          </p>
                        )}
                        {escrow.checkoutRequestId && (
                          <p className="text-slate-400 text-[10px] font-mono truncate">
                            Checkout ID: {escrow.checkoutRequestId}
                          </p>
                        )}
                      </div>

                      {/* Logistics & Transporter */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                        <p className="font-bold text-sky-700 flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-sky-500" /> Logistics & Carrier
                        </p>
                        <p className="text-slate-600">
                          Transit: <span className="font-bold text-slate-800">{shipment.transitStatus || 'PENDING_ASSIGNMENT'}</span>
                        </p>
                        {transporter.name ? (
                          <>
                            <p className="text-slate-900 font-semibold">{transporter.name}</p>
                            <p className="text-slate-600 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" /> {transporter.phone}
                            </p>
                            {shipment.vehicleReg && (
                              <p className="text-slate-500 font-mono text-[11px]">Vehicle: {shipment.vehicleReg}</p>
                            )}
                          </>
                        ) : (
                          <p className="text-slate-400 italic">No transporter claimed yet.</p>
                        )}
                        {shipment.confirmationOtp && (
                          <div className="pt-1 flex items-center gap-2">
                            <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-mono text-xs">
                              OTP: {shipment.confirmationOtp}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(shipment.confirmationOtp, `otp-${ord.id}`);
                              }}
                              className="text-slate-400 hover:text-slate-600"
                              title="Copy OTP"
                            >
                              {copiedId === `otp-${ord.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
