import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  PlusCircle, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Sprout, 
  Tag, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Search, 
  FileText, 
  ArrowRight,
  TrendingUp,
  X,
  ChevronDown,
  Check,
  Building
} from 'lucide-react';

export default function BuyerDemandBoard({ user, token, apiBase, formatMoney, currency }) {
  const [demands, setDemands] = useState([]);
  const [metrics, setMetrics] = useState({ totalTenders: 0, totalTonnageTonnes: 0, totalBudgetUsd: 0, totalBudgetKes: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [biddingDemand, setBiddingDemand] = useState(null);
  
  // Form States
  const [createForm, setCreateForm] = useState({
    cropName: '',
    category: 'HORTICULTURE',
    requiredQty: '',
    targetPrice: '', // in USD internally or KES input
    targetPriceKes: '',
    deliveryLocation: user?.location || 'Nairobi Central Wholesale Depot',
    targetDate: '',
    qualityGrade: 'GRADE_A',
    notes: ''
  });
  
  const [bidForm, setBidForm] = useState({
    offeredQty: '',
    offeredPrice: '',
    offeredPriceKes: '',
    farmLocation: user?.location || '',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchDemands = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (selectedCategory !== 'ALL') query.append('category', selectedCategory);
      if (search) query.append('search', search);

      const res = await fetch(`${apiBase}/demands?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setDemands(data.demands || []);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Failed to load demands:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemands();
  }, [selectedCategory, search]);

  const showToast = (text, type = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 5000);
  };

  // Submit new buyer tender
  const handleCreateDemand = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Calculate USD price
      const priceUsd = createForm.targetPriceKes 
        ? parseFloat(createForm.targetPriceKes) / 130 
        : parseFloat(createForm.targetPrice || 0.75);

      const res = await fetch(`${apiBase}/demands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cropName: createForm.cropName,
          category: createForm.category,
          requiredQty: parseFloat(createForm.requiredQty),
          targetPrice: priceUsd,
          deliveryLocation: createForm.deliveryLocation,
          targetDate: createForm.targetDate,
          qualityGrade: createForm.qualityGrade,
          notes: createForm.notes
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast('Wholesale buy tender published! Farmers have been notified.');
        setShowCreateModal(false);
        setCreateForm({
          cropName: '',
          category: 'HORTICULTURE',
          requiredQty: '',
          targetPrice: '',
          targetPriceKes: '',
          deliveryLocation: user?.location || 'Nairobi Central Wholesale Depot',
          targetDate: '',
          qualityGrade: 'GRADE_A',
          notes: ''
        });
        fetchDemands();
      } else {
        showToast(data.error || 'Failed to publish tender', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Network error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit farmer supply bid
  const handleSubmitBid = async (e) => {
    e.preventDefault();
    if (!biddingDemand) return;
    setSubmitting(true);

    try {
      const priceUsd = bidForm.offeredPriceKes 
        ? parseFloat(bidForm.offeredPriceKes) / 130 
        : parseFloat(bidForm.offeredPrice || biddingDemand.targetPrice);

      const res = await fetch(`${apiBase}/demands/${biddingDemand.id}/bids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          offeredQty: parseFloat(bidForm.offeredQty),
          offeredPrice: priceUsd,
          farmLocation: bidForm.farmLocation,
          message: bidForm.message
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast('Supply bid submitted to buyer successfully!');
        setBiddingDemand(null);
        setBidForm({ offeredQty: '', offeredPrice: '', offeredPriceKes: '', farmLocation: '', message: '' });
        fetchDemands();
      } else {
        showToast(data.error || 'Failed to submit bid', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Network error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Accept farmer bid
  const handleAcceptBid = async (demandId, bidId) => {
    if (!window.confirm('Accept this farmer supply offer? This will fulfill the tender and prepare escrow checkout.')) return;

    try {
      const res = await fetch(`${apiBase}/demands/${demandId}/accept-bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bidId })
      });

      const data = await res.json();
      if (data.success) {
        showToast('Supply bid accepted! Tender marked as FULFILLED.');
        fetchDemands();
      } else {
        showToast(data.error || 'Failed to accept bid', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Network error', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Toast */}
      {feedback && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2 ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Hero Banner with Stats & Call to Action */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-teal-800/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-bold border border-teal-400/30 flex items-center gap-1">
                <FileText className="w-3 h-3" /> Wholesale Reverse Tender Hub
              </span>
              <span className="text-xs text-slate-400">• National Unmet Demand</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Buyer Demand Board & Wholesale Tenders
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Commercial supermarkets, institutions, and wholesale aggregators post bulk produce requirements. Farmers and cooperatives submit direct supply bids to fulfill orders with guaranteed escrow settlement.
            </p>
          </div>

          {(user?.role === 'BUYER' || user?.role === 'ADMIN') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Buy Request / Tender</span>
            </button>
          )}
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-teal-300 font-bold uppercase tracking-wider block">Open Tenders</span>
            <span className="text-xl font-black text-white mt-0.5 block">{metrics.totalTenders}</span>
            <span className="text-[10px] text-slate-400">Commercial Requests</span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-teal-300 font-bold uppercase tracking-wider block">Required Volume</span>
            <span className="text-xl font-black text-emerald-400 mt-0.5 block">{metrics.totalTonnageTonnes} Tonnes</span>
            <span className="text-[10px] text-slate-400">Total Bulk Demand</span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-teal-300 font-bold uppercase tracking-wider block">Combined Budget</span>
            <span className="text-xl font-black text-amber-300 mt-0.5 block">
              KES {metrics.totalBudgetKes.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400">(${metrics.totalBudgetUsd.toLocaleString()} USD)</span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-teal-300 font-bold uppercase tracking-wider block">Escrow Protected</span>
            <span className="text-xl font-black text-teal-300 mt-0.5 block">100% Guaranteed</span>
            <span className="text-[10px] text-slate-400">Via M-Pesa Clearing</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search tenders by crop, destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
          {[
            { key: 'ALL', label: 'All Tenders' },
            { key: 'HORTICULTURE', label: 'Horticulture' },
            { key: 'CEREAL', label: 'Cereals' },
            { key: 'TUBER', label: 'Tubers' }
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
          <button 
            onClick={fetchDemands} 
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200" 
            title="Refresh Tenders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tenders Cards Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
          <p className="text-xs font-medium">Fetching wholesale buyer tenders...</p>
        </div>
      ) : demands.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-3">
          <FileText className="w-10 h-10 mx-auto text-slate-300" />
          <h3 className="font-bold text-base text-slate-800">No active buy requests found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Commercial buyers haven't posted any open tenders matching your criteria yet. Post one now!
          </p>
          {(user?.role === 'BUYER' || user?.role === 'ADMIN') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              + Post First Tender
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {demands.map((demand) => {
            const isOwner = user && (user.id === demand.buyerId || user.role === 'ADMIN');
            const targetKes = Math.round(demand.targetPrice * 130);
            const totalContractKes = Math.round(demand.requiredQty * targetKes);
            const totalContractUsd = demand.requiredQty * demand.targetPrice;
            const daysLeft = Math.ceil((new Date(demand.targetDate) - new Date()) / (1000 * 60 * 60 * 24));

            return (
              <div 
                key={demand.id} 
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Row: Crop Name & Status */}
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                          {demand.category}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {demand.qualityGrade}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 mt-1.5">{demand.cropName}</h3>
                    </div>

                    <div className="text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        demand.status === 'OPEN' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {demand.status === 'OPEN' ? '🟢 OPEN TENDER' : 'COMPLETED'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 block mt-1">
                        {daysLeft > 0 ? `⏰ ${daysLeft} days remaining` : '⏰ Expiring soon'}
                      </span>
                    </div>
                  </div>

                  {/* Quantity & Target Price Highlight Box */}
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl mt-3 border border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Required Volume</span>
                      <span className="text-base font-black text-slate-900 mt-0.5 block">
                        {demand.requiredQty.toLocaleString()} kg
                      </span>
                      <span className="text-[10px] text-slate-500">({(demand.requiredQty / 1000).toFixed(1)} Tonnes)</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Price</span>
                      <span className="text-base font-black text-teal-700 mt-0.5 block">
                        KES {targetKes} <span className="text-[11px] font-normal text-slate-400">/ kg</span>
                      </span>
                      <span className="text-[10px] text-slate-500">${demand.targetPrice.toFixed(2)} USD</span>
                    </div>
                  </div>

                  {/* Contract Details */}
                  <div className="space-y-1.5 text-xs text-slate-600 mt-3">
                    <p className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span><strong>Buyer:</strong> {demand.buyer?.businessName || demand.buyer?.name}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span><strong>Destination:</strong> {demand.deliveryLocation}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span><strong>Required By:</strong> {new Date(demand.targetDate).toLocaleDateString()}</span>
                    </p>
                    {demand.notes && (
                      <p className="text-[11px] text-slate-500 bg-amber-50/60 p-2 rounded-lg border border-amber-100 mt-2">
                        <strong>Quality Specs:</strong> {demand.notes}
                      </p>
                    )}
                  </div>

                  {/* Total Value Bar */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Total Contract Value:</span>
                    <span className="font-mono font-black text-slate-900">
                      KES {totalContractKes.toLocaleString()} (${totalContractUsd.toFixed(2)})
                    </span>
                  </div>
                </div>

                {/* Bids Section & Action Buttons */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Sprout className="w-3.5 h-3.5 text-teal-600" />
                      <span>Farmer Supply Offers ({demand.bids?.length || 0})</span>
                    </span>

                    {/* Submit Bid Button for Farmers */}
                    {user?.role === 'FARMER' && demand.status === 'OPEN' && (
                      <button
                        onClick={() => {
                          setBiddingDemand(demand);
                          setBidForm({
                            offeredQty: demand.requiredQty,
                            offeredPrice: demand.targetPrice,
                            offeredPriceKes: targetKes,
                            farmLocation: user.location || '',
                            message: ''
                          });
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                      >
                        <PlusCircle className="w-3 h-3" />
                        <span>Submit Supply Offer</span>
                      </button>
                    )}
                  </div>

                  {/* Bids List (if any) */}
                  {demand.bids && demand.bids.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {demand.bids.map((b) => (
                        <div key={b.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between items-center gap-2">
                          <div>
                            <span className="font-bold text-slate-900 block">{b.farmer?.name}</span>
                            <span className="text-[10px] text-slate-500">
                              {b.offeredQty} kg @ KES {Math.round(b.offeredPrice * 130)}/kg • {b.farmLocation}
                            </span>
                            {b.message && <p className="text-[10px] text-slate-600 italic mt-0.5">"{b.message}"</p>}
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            {b.status === 'ACCEPTED' ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                ACCEPTED
                              </span>
                            ) : isOwner && demand.status === 'OPEN' ? (
                              <button
                                onClick={() => handleAcceptBid(demand.id, b.id)}
                                className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] shadow-xs"
                              >
                                Accept Offer
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400">Pending</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">No supply bids submitted yet. Be the first farmer to bid!</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: POST A BUY REQUEST / TENDER                      */}
      {/* ========================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-teal-600 uppercase font-bold">Wholesale Reverse Tender</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">Publish Commercial Buy Request</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDemand} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Crop / Commodity Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Roma Plum Tomatoes, Red Bulb Onions, Hass Avocados"
                  value={createForm.cropName}
                  onChange={(e) => setCreateForm({ ...createForm, cropName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Commodity Category</label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="HORTICULTURE">Horticulture (Fruits & Veg)</option>
                    <option value="CEREAL">Cereal & Grains</option>
                    <option value="TUBER">Tubers & Roots</option>
                    <option value="LEGUME">Legumes & Pulses</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quality Grade</label>
                  <select
                    value={createForm.qualityGrade}
                    onChange={(e) => setCreateForm({ ...createForm, qualityGrade: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="GRADE_A">Grade A (Export / Premium)</option>
                    <option value="GRADE_B">Grade B (Wholesale Standard)</option>
                    <option value="STANDARD">Standard Commercial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Required Volume (KG) *</label>
                  <input
                    type="number"
                    required
                    min="100"
                    placeholder="e.g. 5000"
                    value={createForm.requiredQty}
                    onChange={(e) => setCreateForm({ ...createForm, requiredQty: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Buying Price (KES/KG) *</label>
                  <input
                    type="number"
                    required
                    step="0.5"
                    placeholder="e.g. 95"
                    value={createForm.targetPriceKes}
                    onChange={(e) => setCreateForm({ ...createForm, targetPriceKes: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Delivery Destination / Warehouse *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fresh Grocers Central Depot, Industrial Area, Nairobi"
                  value={createForm.deliveryLocation}
                  onChange={(e) => setCreateForm({ ...createForm, deliveryLocation: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Required Delivery Deadline</label>
                <input
                  type="date"
                  value={createForm.targetDate}
                  onChange={(e) => setCreateForm({ ...createForm, targetDate: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Special Packaging & Quality Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Must be packed in 50kg gunny bags, moisture < 13.5%, minimum size 45mm..."
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Publishing...' : 'Publish Tender'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: SUBMIT SUPPLY BID (FOR FARMERS)                  */}
      {/* ========================================================= */}
      {biddingDemand && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-emerald-600 uppercase font-bold">Farmer Supply Offer</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">Bid on {biddingDemand.cropName}</h3>
              </div>
              <button onClick={() => setBiddingDemand(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Buyer Target:</span>
                <span className="font-bold text-slate-800">{biddingDemand.requiredQty.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Price:</span>
                <span className="font-bold text-teal-700">KES {Math.round(biddingDemand.targetPrice * 130)} / kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery Destination:</span>
                <span className="font-medium text-slate-800">{biddingDemand.deliveryLocation}</span>
              </div>
            </div>

            <form onSubmit={handleSubmitBid} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">You Can Supply (KG) *</label>
                  <input
                    type="number"
                    required
                    min="50"
                    value={bidForm.offeredQty}
                    onChange={(e) => setBidForm({ ...bidForm, offeredQty: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Your Price (KES/KG) *</label>
                  <input
                    type="number"
                    required
                    step="0.5"
                    value={bidForm.offeredPriceKes}
                    onChange={(e) => setBidForm({ ...bidForm, offeredPriceKes: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Farm / Shamba Origin Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kinangop, Nyandarua County"
                  value={bidForm.farmLocation}
                  onChange={(e) => setBidForm({ ...bidForm, farmLocation: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Message to Buyer (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Ready for immediate pickup. Harvested yesterday, packed in wooden crates."
                  value={bidForm.message}
                  onChange={(e) => setBidForm({ ...bidForm, message: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setBiddingDemand(null)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Send Supply Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
