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
  Building,
  Trash2,
  Zap,
  BarChart2,
  Calendar,
  DollarSign
} from 'lucide-react';

/**
 * Kenyan Real-Time Agricultural Commodity Market Benchmarks
 * (Wholesale baseline prices used by processors, cooperatives & supermarkets)
 */
export const COMMODITY_MARKET_BENCHMARKS = [
  // 🥛 DAIRY
  { name: 'Fresh Raw Cow Milk', category: 'DAIRY', unit: 'litres', priceKes: 58, priceUsd: 0.45 },
  { name: 'Fresh Pasteurized Goat Milk', category: 'DAIRY', unit: 'litres', priceKes: 120, priceUsd: 0.92 },
  { name: 'Cultured Mala & Natural Probiotic Yoghurt', category: 'DAIRY', unit: 'litres', priceKes: 110, priceUsd: 0.85 },
  { name: 'Pure Camel Milk (Fresh Unpasteurized)', category: 'DAIRY', unit: 'litres', priceKes: 160, priceUsd: 1.23 },
  { name: 'Pure Grass-Fed Traditional Ghee (1kg Jars)', category: 'DAIRY', unit: 'kg', priceKes: 1400, priceUsd: 10.77 },

  // 🐄 LIVESTOCK
  { name: 'Pedigree Friesian Dairy Cow (In-Calf)', category: 'LIVESTOCK', unit: 'heads', priceKes: 115000, priceUsd: 884.6 },
  { name: 'Ayrshire High-Yield Heifer (In-Calf 6 Months)', category: 'LIVESTOCK', unit: 'heads', priceKes: 95000, priceUsd: 730.7 },
  { name: 'Boer Breeding Buck (Stud Quality)', category: 'LIVESTOCK', unit: 'heads', priceKes: 28000, priceUsd: 215.3 },
  { name: 'Galla Meat Goats (Mature Batch)', category: 'LIVESTOCK', unit: 'heads', priceKes: 12500, priceUsd: 96.1 },
  { name: 'Dorper Breeding Sheep (Fat-Tailed)', category: 'LIVESTOCK', unit: 'heads', priceKes: 14000, priceUsd: 107.6 },
  { name: 'Pure Boran Beef Bull (Grass-Fed Feeder)', category: 'LIVESTOCK', unit: 'heads', priceKes: 85000, priceUsd: 653.8 },
  { name: 'Large White Breeding Pig (Sow / Gilt)', category: 'LIVESTOCK', unit: 'heads', priceKes: 32000, priceUsd: 246.1 },

  // 🐔 POULTRY
  { name: 'Improved Kienyeji Chickens (Mature)', category: 'POULTRY', unit: 'birds', priceKes: 950, priceUsd: 7.3 },
  { name: 'Fresh Kienyeji Eggs (30-Egg Trays)', category: 'POULTRY', unit: 'trays', priceKes: 420, priceUsd: 3.23 },
  { name: 'Commercial Broiler Chickens (Live Farm-Gate, 1.8kg)', category: 'POULTRY', unit: 'birds', priceKes: 520, priceUsd: 4.0 },
  { name: 'High-Peak Commercial Layers (ISA Brown)', category: 'POULTRY', unit: 'birds', priceKes: 850, priceUsd: 6.53 },
  { name: 'Day-Old Improved Kienyeji Chicks (Vaccinated)', category: 'POULTRY', unit: 'birds', priceKes: 110, priceUsd: 0.85 },
  { name: 'Fertile Rainbow Rooster Hatching Eggs (30-Egg Trays)', category: 'POULTRY', unit: 'trays', priceKes: 650, priceUsd: 5.0 },

  // 🌿 FODDER & FEEDS
  { name: 'Boma Rhodes Hay Bales (18kg)', category: 'FODDER_FEEDS', unit: 'bales', priceKes: 320, priceUsd: 2.46 },
  { name: 'Lucerne / Alfalfa Hay Bales (High Protein 20%)', category: 'FODDER_FEEDS', unit: 'bales', priceKes: 580, priceUsd: 4.46 },
  { name: 'Inoculated Maize Silage (50kg Sealed Bags)', category: 'FODDER_FEEDS', unit: 'bags', priceKes: 750, priceUsd: 5.76 },
  { name: 'High-Yield Dairy Meal (16% CP, 70kg Bag)', category: 'FODDER_FEEDS', unit: 'bags', priceKes: 2850, priceUsd: 21.92 },
  { name: 'Wheat Pollard & Bran Blend (50kg Bag)', category: 'FODDER_FEEDS', unit: 'bags', priceKes: 1650, priceUsd: 12.69 },

  // 🥬 HORTICULTURE, CEREALS & TUBERS
  { name: 'Roma Plum Tomatoes', category: 'HORTICULTURE', unit: 'kg', priceKes: 95, priceUsd: 0.73 },
  { name: 'Red Bulb Onions', category: 'HORTICULTURE', unit: 'kg', priceKes: 85, priceUsd: 0.65 },
  { name: 'Hass Avocados (Export Grade)', category: 'HORTICULTURE', unit: 'kg', priceKes: 140, priceUsd: 1.08 },
  { name: 'Shangi Irish Potatoes', category: 'TUBER', unit: 'kg', priceKes: 45, priceUsd: 0.35 },
  { name: 'White Dry Maize Grains', category: 'CEREAL', unit: 'kg', priceKes: 52, priceUsd: 0.40 },
  { name: 'Yellow Maize Grain', category: 'CEREAL', unit: 'kg', priceKes: 48, priceUsd: 0.37 },
  { name: 'Rosecoco Dry Beans', category: 'LEGUME', unit: 'kg', priceKes: 130, priceUsd: 1.00 }
];

/**
 * Real-Time Ticking Countdown Component
 * Ticks every 1000ms. If elapsed, fires onExpire() and deletes/purges the tender.
 */
function TenderLiveCountdown({ targetDate, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDate));

  function calculateTimeLeft(target) {
    const diff = new Date(target).getTime() - Date.now();
    if (diff <= 0) {
      return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { total: diff, days, hours, minutes, seconds, expired: false };
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = calculateTimeLeft(targetDate);
      setTimeLeft(remaining);
      if (remaining.expired) {
        clearInterval(interval);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onExpire]);

  if (timeLeft.expired) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold text-[10px] animate-pulse">
        <Clock className="w-3 h-3 text-rose-600" />
        <span>EXPIRED · Purging...</span>
      </div>
    );
  }

  // Visual urgency styling
  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 24;
  const isWarning = timeLeft.days <= 2;

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border transition-colors ${
      isUrgent 
        ? 'bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-500/20 animate-pulse'
        : isWarning
        ? 'bg-amber-50 text-amber-800 border-amber-300'
        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
    }`}>
      <Clock className={`w-3 h-3 ${isUrgent ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'}`} />
      <span>
        {timeLeft.days > 0 && <span className="font-extrabold">{timeLeft.days}d </span>}
        <span>{pad(timeLeft.hours)}h:{pad(timeLeft.minutes)}m:{pad(timeLeft.seconds)}s</span>
      </span>
      <span className="text-[9px] uppercase font-sans tracking-wider opacity-75">remaining</span>
    </div>
  );
}

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
    unit: 'kg',
    requiredQty: '',
    targetPrice: '', // in USD internally
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

  // Find market benchmark for current input
  const activeBenchmark = COMMODITY_MARKET_BENCHMARKS.find(b => 
    b.name.toLowerCase() === createForm.cropName.trim().toLowerCase()
  ) || COMMODITY_MARKET_BENCHMARKS.find(b => 
    createForm.cropName && b.name.toLowerCase().includes(createForm.cropName.trim().toLowerCase())
  );

  const fetchDemands = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (selectedCategory !== 'ALL') query.append('category', selectedCategory);
      if (search) query.append('search', search);

      const res = await fetch(`${apiBase}/demands?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        // Filter out any locally expired tenders just in case
        const now = Date.now();
        const validDemands = (data.demands || []).filter(d => new Date(d.targetDate).getTime() > now);
        setDemands(validDemands);
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
      if (!createForm.targetDate) {
        throw new Error('Please select an expiration deadline for your tender');
      }
      if (new Date(createForm.targetDate).getTime() <= Date.now()) {
        throw new Error('Expiration deadline must be set to a future date');
      }

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
          unit: createForm.unit || 'kg',
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
        showToast('Wholesale buy tender published! Farmers & cooperatives notified.');
        setShowCreateModal(false);
        setCreateForm({
          cropName: '',
          category: 'HORTICULTURE',
          unit: 'kg',
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

  // Delete tender
  const handleDeleteTender = async (demandId) => {
    if (!window.confirm('Are you sure you want to delete and cancel this tender? All pending farmer bids will also be removed.')) return;

    try {
      const res = await fetch(`${apiBase}/demands/${demandId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Tender deleted successfully.');
        setDemands(prev => prev.filter(d => d.id !== demandId));
      } else {
        showToast(data.error || 'Failed to delete tender', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Network error', 'error');
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

  // Helper to get benchmark comparison info
  const getBenchmarkComparison = (cropName, targetKes) => {
    const match = COMMODITY_MARKET_BENCHMARKS.find(b => 
      b.name.toLowerCase() === (cropName || '').trim().toLowerCase()
    );
    if (!match || !targetKes) return null;
    const ratio = targetKes / match.priceKes;
    const diffPct = Math.round((ratio - 1) * 100);
    return {
      benchmarkKes: match.priceKes,
      diffPct,
      isPremium: diffPct > 0,
      isDiscount: diffPct < 0,
      isExact: diffPct === 0
    };
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
                <FileText className="w-3 h-3" /> Real-Time Reverse Tender Hub
              </span>
              <span className="text-xs text-slate-400">• National Unmet Demand</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Buyer Demand Board & Wholesale Tenders
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Supermarkets, institutions, and agro-processors publish commercial tenders priced against real market benchmarks. Tenders expire and auto-delete when their deadline elapses.
            </p>
          </div>

          {(user?.role === 'BUYER' || user?.role === 'ADMIN') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Real Buy Tender</span>
            </button>
          )}
        </div>

        {/* 4 Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-teal-300 font-bold uppercase tracking-wider block">Live Open Tenders</span>
            <span className="text-xl font-black text-white mt-0.5 block">{demands.length}</span>
            <span className="text-[10px] text-slate-400">Auto-pruning expired</span>
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

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { key: 'ALL', label: 'All Tenders' },
            { key: 'DAIRY', label: '🥛 Dairy' },
            { key: 'LIVESTOCK', label: '🐄 Livestock' },
            { key: 'POULTRY', label: '🐔 Poultry & Eggs' },
            { key: 'FODDER_FEEDS', label: '🌿 Feeds & Fodder' },
            { key: 'HORTICULTURE', label: '🥬 Horticulture' },
            { key: 'CEREAL', label: '🌾 Cereals' },
            { key: 'TUBER', label: '🥔 Tubers' }
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat.key ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
          <button 
            onClick={fetchDemands} 
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer" 
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
          <p className="text-xs font-medium">Synchronizing live wholesale buyer tenders...</p>
        </div>
      ) : demands.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-3">
          <FileText className="w-10 h-10 mx-auto text-slate-300" />
          <h3 className="font-bold text-base text-slate-800">No active buy tenders in this category</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            All expired tenders have been cleanly pruned. Post a new commercial buy request now!
          </p>
          {(user?.role === 'BUYER' || user?.role === 'ADMIN') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
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
            const comparison = getBenchmarkComparison(demand.cropName, targetKes);

            return (
              <div 
                key={demand.id} 
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Row: Category, Quality Grade & Live Ticking Countdown */}
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                          {demand.category}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {demand.qualityGrade}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          demand.status === 'OPEN' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {demand.status === 'OPEN' ? '🟢 OPEN TENDER' : 'COMPLETED'}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 mt-2">{demand.cropName}</h3>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      {/* Real Ticking Countdown */}
                      <TenderLiveCountdown 
                        targetDate={demand.targetDate} 
                        onExpire={() => {
                          // When expired, remove locally and trigger backend purge
                          setDemands(prev => prev.filter(d => d.id !== demand.id));
                          fetchDemands();
                        }} 
                      />

                      {/* Owner Delete Button */}
                      {isOwner && (
                        <button
                          type="button"
                          onClick={() => handleDeleteTender(demand.id)}
                          className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 px-2 py-1 rounded transition-colors"
                          title="Delete this tender"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete Tender</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quantity & Target Price Highlight Box with Live Market Comparison */}
                  <div className="p-3 bg-slate-50 rounded-xl mt-3 border border-slate-100 space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Required Volume</span>
                        <span className="text-base font-black text-slate-900 mt-0.5 block">
                          {demand.requiredQty.toLocaleString()} {demand.unit || 'kg'}
                        </span>
                        {(!demand.unit || demand.unit.toLowerCase() === 'kg') && (
                          <span className="text-[10px] text-slate-500">({(demand.requiredQty / 1000).toFixed(1)} Tonnes)</span>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Buyer Target Price</span>
                        <span className="text-base font-black text-teal-700 mt-0.5 block">
                          KES {targetKes.toLocaleString()} <span className="text-[11px] font-normal text-slate-400">/ {demand.unit || 'kg'}</span>
                        </span>
                        <span className="text-[10px] text-slate-500">${demand.targetPrice.toFixed(2)} USD</span>
                      </div>
                    </div>

                    {/* Market Benchmark Valuation Pill */}
                    {comparison && (
                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 flex items-center gap-1">
                          <BarChart2 className="w-3 h-3 text-slate-400" />
                          <span>Live Market Benchmark: <b>KES {comparison.benchmarkKes.toLocaleString()}/{demand.unit || 'kg'}</b></span>
                        </span>
                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          comparison.isPremium
                            ? 'bg-emerald-100 text-emerald-800'
                            : comparison.isDiscount
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {comparison.diffPct > 0 ? `+${comparison.diffPct}% above market` : comparison.diffPct < 0 ? `${comparison.diffPct}% below market` : 'At market benchmark'}
                        </span>
                      </div>
                    )}
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
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span><strong>Delivery Deadline:</strong> {new Date(demand.targetDate).toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
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
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
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
                              {b.offeredQty} {demand.unit || 'kg'} @ KES {Math.round(b.offeredPrice * 130)}/{demand.unit || 'kg'} • {b.farmLocation}
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
                                className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] shadow-xs cursor-pointer"
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
      {/* MODAL 1: POST A REAL BUY REQUEST / TENDER                  */}
      {/* ========================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-teal-600 uppercase font-bold">Wholesale Reverse Tender</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">Publish Commercial Buy Tender</h3>
                <p className="text-[11px] text-slate-500">Priced against real market benchmarks · Auto-expires upon deadline</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDemand} className="space-y-3.5 text-xs">
              {/* Quick Preset Selector for Popular Commodities */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
                  <span>Select Commodity or Type Below</span>
                  <span className="text-[10px] font-normal text-teal-600">Quick benchmark autofill</span>
                </label>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                  {COMMODITY_MARKET_BENCHMARKS.slice(0, 10).map((b) => (
                    <button
                      key={b.name}
                      type="button"
                      onClick={() => {
                        setCreateForm({
                          ...createForm,
                          cropName: b.name,
                          category: b.category,
                          unit: b.unit,
                          targetPriceKes: b.priceKes.toString(),
                          targetPrice: b.priceUsd.toString()
                        });
                      }}
                      className={`px-2.5 py-1 rounded-lg border whitespace-nowrap text-[10px] font-medium transition-colors ${
                        createForm.cropName === b.name
                          ? 'bg-teal-50 border-teal-500 text-teal-800 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {b.name} (KES {b.priceKes})
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Crop / Commodity Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fresh Raw Cow Milk, Pedigree Friesian Cow, Boma Rhodes Hay"
                  value={createForm.cropName}
                  onChange={(e) => setCreateForm({ ...createForm, cropName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Commodity Category</label>
                  <select
                    value={createForm.category}
                    onChange={(e) => {
                      const cat = e.target.value;
                      let defUnit = createForm.unit;
                      if (cat === 'DAIRY') defUnit = 'litres';
                      else if (cat === 'LIVESTOCK') defUnit = 'heads';
                      else if (cat === 'POULTRY') defUnit = 'birds';
                      else if (cat === 'FODDER_FEEDS') defUnit = 'bales';
                      else if (cat === 'CEREAL') defUnit = 'bags';
                      else defUnit = 'kg';
                      setCreateForm({ ...createForm, category: cat, unit: defUnit });
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="DAIRY">🥛 Dairy Products (Fresh Milk, Cream, Ghee)</option>
                    <option value="LIVESTOCK">🐄 Live Livestock (Cattle, Goats, Sheep, Pigs)</option>
                    <option value="POULTRY">🐔 Poultry & Eggs (Kienyeji, Broilers, Trays)</option>
                    <option value="FODDER_FEEDS">🌿 Feeds & Fodder (Hay, Lucerne, Silage)</option>
                    <option value="HORTICULTURE">🥬 Horticulture (Fruits & Veg)</option>
                    <option value="CEREAL">🌾 Cereal & Grains</option>
                    <option value="TUBER">🥔 Tubers & Roots</option>
                    <option value="LEGUME">🫘 Legumes & Pulses</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Trading Unit</label>
                  <select
                    value={createForm.unit || 'kg'}
                    onChange={(e) => setCreateForm({ ...createForm, unit: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                  >
                    <option value="litres">Litres (L)</option>
                    <option value="heads">Heads / Animals</option>
                    <option value="trays">Trays (30 pcs)</option>
                    <option value="birds">Birds / Chickens</option>
                    <option value="bales">Bales (Hay/Fodder)</option>
                    <option value="bags">Bags (50kg / 90kg)</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="tons">Tons</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Quality Grade</label>
                <select
                  value={createForm.qualityGrade}
                  onChange={(e) => setCreateForm({ ...createForm, qualityGrade: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="GRADE_A">Grade A (Export / Premium / Pedigree)</option>
                  <option value="GRADE_B">Grade B (Wholesale Standard / Commercial)</option>
                  <option value="STANDARD">Standard Commercial</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Required Volume ({createForm.unit || 'kg'}) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 500"
                    value={createForm.requiredQty}
                    onChange={(e) => setCreateForm({ ...createForm, requiredQty: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Price (KES/{createForm.unit || 'kg'}) *</label>
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

              {/* Dynamic Live Market Benchmark Advisory */}
              {activeBenchmark && (
                <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-teal-900 flex items-center gap-1">
                      <BarChart2 className="w-3.5 h-3.5 text-teal-600" />
                      <span>Live Market Value: KES {activeBenchmark.priceKes.toLocaleString()} / {activeBenchmark.unit}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setCreateForm({ ...createForm, targetPriceKes: activeBenchmark.priceKes.toString(), unit: activeBenchmark.unit })}
                      className="px-2 py-0.5 rounded bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] transition-colors cursor-pointer"
                    >
                      Use Market Value
                    </button>
                  </div>
                  {createForm.targetPriceKes && (
                    <p className="text-[11px] text-teal-800">
                      {parseFloat(createForm.targetPriceKes) >= activeBenchmark.priceKes ? (
                        <span className="text-emerald-700 font-semibold">
                          ✓ Competitive offer ({Math.round((parseFloat(createForm.targetPriceKes) / activeBenchmark.priceKes - 1) * 100)}% vs market) — will attract prompt farmer bids.
                        </span>
                      ) : (
                        <span className="text-amber-800 font-semibold">
                          ⚠️ Below market benchmark ({Math.round((1 - parseFloat(createForm.targetPriceKes) / activeBenchmark.priceKes) * 100)}% discount) — may take longer to fulfill.
                        </span>
                      )}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Delivery Destination / Warehouse *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Highlands Dairy Processor Depot, Limuru Hub"
                  value={createForm.deliveryLocation}
                  onChange={(e) => setCreateForm({ ...createForm, deliveryLocation: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
                  <span>Tender Expiration Deadline *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Tender auto-deletes when expired</span>
                </label>
                <input
                  type="date"
                  required
                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // at least tomorrow
                  value={createForm.targetDate}
                  onChange={(e) => setCreateForm({ ...createForm, targetDate: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Special Packaging & Quality Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Delivered in sterilized milk churns, fat content > 3.5%, free from antibiotics..."
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Publishing Tender...' : 'Publish Buy Tender'}
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
              <button onClick={() => setBiddingDemand(null)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Buyer Target:</span>
                <span className="font-bold text-slate-800">{biddingDemand.requiredQty.toLocaleString()} {biddingDemand.unit || 'kg'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Price:</span>
                <span className="font-bold text-teal-700">KES {Math.round(biddingDemand.targetPrice * 130).toLocaleString()} / {biddingDemand.unit || 'kg'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery Destination:</span>
                <span className="font-medium text-slate-800">{biddingDemand.deliveryLocation}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                <span className="text-slate-500">Time to Expiration:</span>
                <TenderLiveCountdown targetDate={biddingDemand.targetDate} />
              </div>
            </div>

            <form onSubmit={handleSubmitBid} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">You Can Supply ({biddingDemand.unit || 'kg'}) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={bidForm.offeredQty}
                    onChange={(e) => setBidForm({ ...bidForm, offeredQty: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Your Price (KES/{biddingDemand.unit || 'kg'}) *</label>
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
                  placeholder="e.g. Ready for pickup. Chilled in aluminum cans, tested zero aflatoxin."
                  value={bidForm.message}
                  onChange={(e) => setBidForm({ ...bidForm, message: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setBiddingDemand(null)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md disabled:opacity-50 cursor-pointer"
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
