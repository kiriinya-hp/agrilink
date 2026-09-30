import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  Sprout, 
  Package, 
  Truck, 
  MapPin, 
  Calendar, 
  PlusCircle, 
  CheckCircle2, 
  ArrowRight, 
  TrendingUp, 
  ShieldCheck,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';
import { useCurrency } from './CurrencyUnitContext';

export default function ChamaAggregationModal({ 
  isOpen, 
  onClose, 
  user, 
  onSelectPoolForPurchase 
}) {
  const { formatMoney, currency } = useCurrency();

  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('browse'); // 'browse', 'contribute', 'create'
  const [selectedPool, setSelectedPool] = useState(null);

  // Contribute Form State
  const [contribQty, setContribQty] = useState('');
  const [contribPhone, setContribPhone] = useState(user?.phone || '');
  const [submittingContrib, setSubmittingContrib] = useState(false);
  const [contribSuccessMsg, setContribSuccessMsg] = useState('');

  // Create Pool Form State
  const [newPool, setNewPool] = useState({
    title: '',
    cropName: 'Roma Plum Tomatoes',
    category: 'HORTICULTURE',
    grade: 'GRADE_A',
    targetVolumeKg: 5000,
    unitPriceKes: 95,
    hubLocation: user?.location || 'Kirinyaga Regional Depot',
    destinationHub: 'Nairobi Central Wholesale Depot',
    dispatchDays: 4,
    minContributionKg: 100,
    description: ''
  });
  const [creatingPool, setCreatingPool] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPools();
      setContribSuccessMsg('');
    }
  }, [isOpen]);

  const fetchPools = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/chama/pools');
      const data = await res.json();
      if (data.success) {
        setPools(data.pools);
        if (data.pools.length > 0 && !selectedPool) {
          setSelectedPool(data.pools[0]);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch Chama pools:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    if (!selectedPool || !contribQty) return;
    setSubmittingContrib(true);
    try {
      const res = await fetch(`/api/chama/pools/${selectedPool.id}/contribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId: user?.id,
          farmerName: user?.name || 'Verified Farmer',
          quantityKg: parseFloat(contribQty),
          phone: contribPhone
        })
      });
      const data = await res.json();
      if (data.success) {
        setContribSuccessMsg(`🎉 Success! Added ${contribQty} kg to "${selectedPool.title}". Collective dispatch scheduled for ${new Date(data.pool.dispatchDate).toLocaleDateString()}.`);
        setContribQty('');
        fetchPools();
      } else {
        alert(data.error || 'Failed to submit contribution');
      }
    } catch (err) {
      alert('Error submitting harvest contribution');
    } finally {
      setSubmittingContrib(false);
    }
  };

  const handleCreatePool = async (e) => {
    e.preventDefault();
    setCreatingPool(true);
    try {
      const res = await fetch('/api/chama/pools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPool,
          organizerFarmer: user?.businessName || user?.name || 'Farmer Collective Group'
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Chama Consolidation Pool "${data.pool.title}" created successfully!`);
        setActiveTab('browse');
        fetchPools();
      } else {
        alert(data.error || 'Failed to create Chama pool');
      }
    } catch (err) {
      alert('Error creating Chama aggregation pool');
    } finally {
      setCreatingPool(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white p-5 flex items-center justify-between border-b border-emerald-800/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white tracking-tight">Produce Aggregation & Cooperative Pooling</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
                  CHAMA SELLING
                </span>
              </div>
              <p className="text-xs text-emerald-200/70 mt-0.5">Smallholders pool harvest volume into full truckloads to save 35% on transport and sell to bulk buyers</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 border-b border-slate-200 bg-slate-50 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('browse')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'browse'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Browse Active Chama Pools ({pools.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contribute')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'contribute'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span>Contribute My Harvest (Farmer)</span>
          </button>

          {user?.role === 'FARMER' && (
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'create'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-purple-600" />
              <span>Start New Chama Pool</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* TAB 1: BROWSE POOLS */}
          {activeTab === 'browse' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 leading-relaxed">
                  <strong>Why Chama Pooling Works:</strong> Individual smallholders selling 200 kg get low farm-gate prices and pay high transport. By combining into a 6,000 kg consolidated batch, farmers earn <strong>25% higher profit</strong> and buyers get guaranteed uniform quality with Safaricom Escrow protection.
                </div>
              </div>

              {loading ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
                  Loading active farmer aggregation pools...
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pools.map((p) => {
                    const progressPct = Math.min(100, Math.round((p.currentVolumeKg / p.targetVolumeKg) * 100));
                    return (
                      <div 
                        key={p.id}
                        className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                                {p.category} · {p.grade}
                              </span>
                              <h4 className="font-extrabold text-sm text-slate-900 mt-1">{p.title}</h4>
                              <p className="text-xs font-bold text-emerald-700 mt-0.5">{p.cropName}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-base font-black text-slate-900 font-mono">
                                {currency === 'KES' ? `KES ${p.unitPriceKes}/kg` : `$${p.unitPriceUsd}/kg`}
                              </span>
                              <span className="text-[10px] text-slate-400 block">Negotiated Bulk Rate</span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 mt-2.5 line-clamp-2">{p.description}</p>

                          {/* Progress Bar */}
                          <div className="mt-4 space-y-1">
                            <div className="flex justify-between text-[11px] font-bold">
                              <span className="text-slate-700">
                                <strong>{p.currentVolumeKg.toLocaleString()} kg</strong> collected
                              </span>
                              <span className="text-emerald-700 font-mono">
                                {progressPct}% of {p.targetVolumeKg.toLocaleString()} kg target
                              </span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                              <div 
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>

                          {/* Metadata */}
                          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                            <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> Origin: <strong>{p.hubLocation}</strong></p>
                            <p className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-slate-400" /> Destination: <strong>{p.destinationHub}</strong></p>
                            <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Collective Dispatch: <strong>{new Date(p.dispatchDate).toLocaleDateString()}</strong></p>
                            <p className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-slate-400" /> Organizer: {p.organizerFarmer} (<strong>{p.contributorsCount} farmers participating</strong>)</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPool(p);
                              setActiveTab('contribute');
                            }}
                            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-colors flex items-center gap-1"
                          >
                            <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Contribute My Crop</span>
                          </button>

                          {onSelectPoolForPurchase && (
                            <button
                              type="button"
                              onClick={() => {
                                onSelectPoolForPurchase(p);
                                onClose();
                              }}
                              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1"
                            >
                              <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Buy Bulk Pool</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CONTRIBUTE TO POOL (FARMER) */}
          {activeTab === 'contribute' && selectedPool && (
            <div className="max-w-xl mx-auto space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="text-[10px] uppercase font-mono text-emerald-800 font-bold block">Selected Aggregation Consignment</span>
                <h4 className="font-extrabold text-sm text-slate-900 mt-0.5">{selectedPool.title}</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Crop: <strong>{selectedPool.cropName}</strong> · Rate: <strong>KES {selectedPool.unitPriceKes}/kg</strong> ($${selectedPool.unitPriceUsd}) · Hub: {selectedPool.hubLocation}
                </p>
                <div className="mt-2 text-xs font-semibold text-slate-500">
                  Target: {selectedPool.targetVolumeKg.toLocaleString()} kg · Already pooled: {selectedPool.currentVolumeKg.toLocaleString()} kg ({Math.round((selectedPool.currentVolumeKg/selectedPool.targetVolumeKg)*100)}%)
                </div>
              </div>

              {contribSuccessMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{contribSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleContribute} className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Harvest Quantity to Contribute (kg)
                  </label>
                  <input
                    type="number"
                    min={selectedPool.minContributionKg || 50}
                    step="10"
                    required
                    placeholder={`Min. ${selectedPool.minContributionKg || 50} kg`}
                    value={contribQty}
                    onChange={(e) => setContribQty(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Estimated Farmer Payout at dispatch: <strong>KES {(parseFloat(contribQty || 0) * selectedPool.unitPriceKes).toLocaleString()}</strong> (${(parseFloat(contribQty || 0) * selectedPool.unitPriceUsd).toFixed(2)})
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Farmer Contact Phone (for M-Pesa B2C Payout)
                  </label>
                  <input
                    type="tel"
                    required
                    value={contribPhone}
                    onChange={(e) => setContribPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingContrib || !contribQty}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Sprout className="w-4 h-4" />
                  <span>{submittingContrib ? 'Locking Contribution...' : `Lock My ${contribQty || '0'} kg into Pool`}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: CREATE NEW POOL (FARMER LEADER) */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreatePool} className="max-w-xl mx-auto space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="font-extrabold text-sm text-slate-900 border-b pb-2">Start a New Cooperative Aggregation Consignment</h4>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chama Pool Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mwea Tomato Smallholders Export Batch"
                  value={newPool.title}
                  onChange={(e) => setNewPool({ ...newPool, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Crop Name</label>
                  <input
                    type="text"
                    required
                    value={newPool.cropName}
                    onChange={(e) => setNewPool({ ...newPool, cropName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Volume (kg)</label>
                  <input
                    type="number"
                    min="500"
                    step="100"
                    required
                    value={newPool.targetVolumeKg}
                    onChange={(e) => setNewPool({ ...newPool, targetVolumeKg: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Negotiated Price (KES / kg)</label>
                  <input
                    type="number"
                    min="5"
                    step="1"
                    required
                    value={newPool.unitPriceKes}
                    onChange={(e) => setNewPool({ ...newPool, unitPriceKes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dispatch in (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={newPool.dispatchDays}
                    onChange={(e) => setNewPool({ ...newPool, dispatchDays: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pickup Collection Shed</label>
                  <input
                    type="text"
                    required
                    value={newPool.hubLocation}
                    onChange={(e) => setNewPool({ ...newPool, hubLocation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Destination Wholesale Depot</label>
                  <input
                    type="text"
                    required
                    value={newPool.destinationHub}
                    onChange={(e) => setNewPool({ ...newPool, destinationHub: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description & Quality Notes</label>
                <textarea
                  rows="2"
                  placeholder="Specify grading standards, packaging (crates/bags), and logistics expectations."
                  value={newPool.description}
                  onChange={(e) => setNewPool({ ...newPool, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={creatingPool}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4 text-emerald-400" />
                <span>{creatingPool ? 'Publishing Pool...' : 'Publish Cooperative Aggregation Pool'}</span>
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
