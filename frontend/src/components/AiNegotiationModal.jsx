import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  X, 
  ArrowRight, 
  CheckCircle2, 
  TrendingDown, 
  ShieldCheck, 
  Truck, 
  Scale, 
  RefreshCw, 
  Users, 
  AlertCircle 
} from 'lucide-react';
import { USD_TO_KES } from './CurrencyUnitContext';

export default function AiNegotiationModal({ isOpen, onClose, onAcceptDeal }) {
  const [cropName, setCropName] = useState('Tomatoes');
  const [targetVolumeKg, setTargetVolumeKg] = useState(1000);
  const [maxBudgetKesPerKg, setMaxBudgetKesPerKg] = useState(75);
  const [deliveryDestination, setDeliveryDestination] = useState('Nairobi Central Wholesale Depot');
  const [urgencyDays, setUrgencyDays] = useState(3);
  
  const [loading, setLoading] = useState(false);
  const [dealProposal, setDealProposal] = useState(null);
  const [languageMode, setLanguageMode] = useState('en'); // 'en' | 'sw'

  if (!isOpen) return null;

  const handleRunNegotiation = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setDealProposal(null);
    try {
      const res = await fetch('/api/ai/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropName,
          targetVolumeKg: Number(targetVolumeKg),
          maxBudgetKesPerKg: Number(maxBudgetKesPerKg),
          deliveryDestination,
          urgencyDays: Number(urgencyDays)
        })
      });
      const data = await res.json();
      if (data.success) {
        setDealProposal(data.dealProposal);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 flex flex-col max-h-[95vh] overflow-y-auto relative">
        
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900">Kilimo AI Deal Negotiator</h3>
                <span className="text-[10px] font-black bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Autonomous SCM
                </span>
              </div>
              <p className="text-xs text-slate-500">Real-time fair price discovery, supplier aggregation & multi-party deal settlement</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Parameters Form */}
        <form onSubmit={handleRunNegotiation} className="my-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Commodity</label>
              <select
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-purple-500"
              >
                <option value="Tomatoes">Tomatoes (Roma / Anna F1)</option>
                <option value="Red Bulb Onions">Red Bulb Onions</option>
                <option value="Shangi Potatoes">Shangi Potatoes</option>
                <option value="Dry White Maize">Dry White Maize</option>
                <option value="Cabbages">Cabbages (Gloria F1)</option>
                <option value="Watermelons">Watermelons (Sukari F1)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Volume (KG)</label>
              <input
                type="number"
                min="50"
                step="50"
                value={targetVolumeKg}
                onChange={(e) => setTargetVolumeKg(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 font-mono"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Max Budget Target (KES / KG)</label>
              <div className="relative">
                <input
                  type="number"
                  min="10"
                  value={maxBudgetKesPerKg}
                  onChange={(e) => setMaxBudgetKesPerKg(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 font-mono"
                  required
                />
                <span className="absolute right-3 top-2 text-[11px] text-slate-400 font-mono">
                  ~${(maxBudgetKesPerKg / USD_TO_KES).toFixed(2)}
                </span>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Delivery Destination</label>
              <input
                type="text"
                value={deliveryDestination}
                onChange={(e) => setDeliveryDestination(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800"
                required
              />
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center">
            <span className="text-[11px] text-slate-500">
              Analyzes real Wakulima market rates, active shamba pools & transit distance
            </span>
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-colors"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Negotiating Deal...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Find Optimal Deal</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* AI Deal Proposal Result */}
        {dealProposal && (
          <div className="space-y-4 border-t border-slate-100 pt-3 animate-fade-in text-xs">
            
            {/* Feasibility & Price Arbitrage Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">AI Recommended Rate</span>
                <span className="text-xl font-black text-emerald-950 font-mono">
                  KES {dealProposal.aiRecommendedRateKes}
                  <span className="text-xs font-normal text-emerald-700"> / kg</span>
                </span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">
                  (${dealProposal.aiRecommendedRateUsd}/kg)
                </span>
              </div>

              <div className="bg-purple-50 border border-purple-200 p-3 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-purple-700 block">Match Feasibility</span>
                <span className="text-xl font-black text-purple-950 font-mono">
                  {dealProposal.feasibilityScore}%
                </span>
                <span className="text-[10px] text-purple-600 block mt-0.5">
                  High Probability of Farmer Acceptance
                </span>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-3 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-blue-700 block">Projected Savings</span>
                <span className="text-xl font-black text-blue-950 font-mono">
                  KES {dealProposal.buyerSavingsKes.toLocaleString()}
                </span>
                <span className="text-[10px] text-blue-600 block mt-0.5">
                  vs open market broker prices
                </span>
              </div>
            </div>

            {/* Kilimo AI Rationale Card with Language Toggle */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2 relative overflow-hidden">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <div className="flex items-center gap-1.5 text-purple-400 font-bold text-[11px]">
                  <Bot className="w-4 h-4" />
                  <span>Kilimo AI Algorithmic Rationale</span>
                </div>
                <div className="flex gap-1 bg-slate-800 p-0.5 rounded-lg text-[9px] font-bold">
                  <button
                    type="button"
                    onClick={() => setLanguageMode('en')}
                    className={`px-1.5 py-0.5 rounded ${languageMode === 'en' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguageMode('sw')}
                    className={`px-1.5 py-0.5 rounded ${languageMode === 'sw' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
                  >
                    SWA
                  </button>
                </div>
              </div>
              <p className="text-slate-200 leading-relaxed text-xs">
                {languageMode === 'en' ? dealProposal.rationaleEn : dealProposal.rationaleSw}
              </p>
            </div>

            {/* Matched Aggregated Suppliers Table */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                Matched Smallholders & Chama Aggregators ({dealProposal.matchedSuppliers.length})
              </span>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {dealProposal.matchedSuppliers.map((s, idx) => (
                  <div key={idx} className="p-2.5 bg-white flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-800 block">{s.farmerName}</span>
                      <span className="text-[10px] text-slate-500">
                        {s.location} • Grade: {s.grade}
                      </span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-slate-800">{s.volumeKg.toLocaleString()} kg</span>
                      <span className="text-[10px] text-emerald-700 block">KES {s.askingRateKes}/kg</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Financial Summary Box */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1 font-mono text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Produce Cost ({dealProposal.targetVolumeKg} kg @ KES {dealProposal.aiRecommendedRateKes}):</span>
                <span>KES {dealProposal.financials.produceCostKes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Logistics & Freight Transit:</span>
                <span>KES {dealProposal.financials.estimatedFreightKes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Mazao Hub Escrow Fee (5%):</span>
                <span>KES {dealProposal.financials.escrowFeeKes.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                <span>Total Escrow Commitment:</span>
                <span className="text-emerald-700 font-extrabold">
                  KES {dealProposal.financials.totalDealKes.toLocaleString()} (${dealProposal.financials.totalDealUsd})
                </span>
              </div>
            </div>

            {/* Lock Deal in Escrow Button */}
            <div className="pt-1 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onAcceptDeal) onAcceptDeal(dealProposal);
                  onClose();
                }}
                className="flex-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Accept & Lock Deal in Escrow</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
