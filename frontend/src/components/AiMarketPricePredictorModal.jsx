import React, { useState } from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  DollarSign, 
  BarChart3, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  X, 
  ArrowRight,
  ShieldCheck,
  Building,
  Sprout
} from 'lucide-react';

const KENYA_COUNTIES = [
  'Kiambu', 'Nyandarua', 'Meru', 'Nakuru', 'Uasin Gishu', 
  'Machakos', 'Kirinyaga', 'Nyeri', 'Makueni', 'Kajiado', 'Trans Nzoia'
];

const CROPS = [
  { name: 'Tomatoes', category: 'Horticulture', icon: '🍅' },
  { name: 'Red Bulb Onions', category: 'Horticulture', icon: '🧅' },
  { name: 'Shangi Potatoes', category: 'Tuber', icon: '🥔' },
  { name: 'Dry White Maize', category: 'Cereal', icon: '🌽' },
  { name: 'Cabbages', category: 'Horticulture', icon: '🥬' },
  { name: 'Watermelons', category: 'Fruit', icon: '🍉' }
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function AiMarketPricePredictorModal({ isOpen, onClose, onPreListHarvest }) {
  const [selectedCrop, setSelectedCrop] = useState('Tomatoes');
  const [selectedCounty, setSelectedCounty] = useState('Kiambu');
  const [acreage, setAcreage] = useState('1.5');
  const [targetMonth, setTargetMonth] = useState('November');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePredict = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/ai/price-predictor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropName: selectedCrop,
          county: selectedCounty,
          acreage: parseFloat(acreage) || 1,
          targetHarvestMonth: targetMonth
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to generate prediction');
      setPrediction(data);
    } catch (err) {
      setError(err.message || 'Prediction analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 my-8 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900">AI Market Price & Harvest Predictor</h3>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Gemini & Wakulima Data
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Forecast wholesale farmgate returns, high-demand windows & optimal planting cycles
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Parameters Form */}
        <form onSubmit={handlePredict} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-700">
          <div>
            <label className="block mb-1 text-slate-700 font-bold">Crop Commodity</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {CROPS.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.icon} {c.name} ({c.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-slate-700 font-bold">Farm County / Region</label>
            <select
              value={selectedCounty}
              onChange={(e) => setSelectedCounty(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {KENYA_COUNTIES.map((county) => (
                <option key={county} value={county}>{county} County</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-slate-700 font-bold">Cultivation Acreage</label>
            <input
              type="number"
              step="0.5"
              min="0.25"
              max="50"
              required
              value={acreage}
              onChange={(e) => setAcreage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="e.g. 1.5"
            />
          </div>

          <div>
            <label className="block mb-1 text-slate-700 font-bold">Target Harvest Month</label>
            <select
              value={targetMonth}
              onChange={(e) => setTargetMonth(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>{m} 2026</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating AI Market Model...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Run AI Forecast for {selectedCrop}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Prediction Output Results */}
        {prediction && (
          <div className="mt-5 space-y-4 animate-in fade-in-50">
            
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="bg-gradient-to-br from-emerald-950 to-slate-900 text-white p-3.5 rounded-2xl border border-emerald-800/40">
                <span className="text-[10px] font-mono text-emerald-300 uppercase block">Projected Rate</span>
                <p className="text-xl font-black mt-0.5 font-mono text-emerald-400">
                  KES {prediction.projectedPriceKes} <span className="text-xs text-slate-300 font-normal">/ kg</span>
                </p>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Range: KES {prediction.predictedRange.lowKes} - {prediction.predictedRange.highKes}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Est. Yield ({prediction.acreage} ac)</span>
                <p className="text-xl font-black mt-0.5 text-slate-900 font-mono">
                  {prediction.economics.estimatedYieldKg.toLocaleString()} <span className="text-xs text-slate-500 font-normal">kg</span>
                </p>
                <span className="text-[10px] text-slate-500 block mt-1">
                  ≈ {(prediction.economics.estimatedYieldKg / 1000).toFixed(1)} Metric Tonnes
                </span>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Projected Net Profit</span>
                <p className="text-xl font-black mt-0.5 text-emerald-700 font-mono">
                  KES {prediction.economics.projectedNetProfitKes.toLocaleString()}
                </p>
                <span className="text-[10px] font-bold text-emerald-800 block mt-1">
                  +{prediction.economics.roiPercentage}% Projected ROI
                </span>
              </div>
            </div>

            {/* Strategic Recommendation */}
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-300/80 rounded-2xl text-xs space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-emerald-950 uppercase tracking-wide text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> AI Market Advisory
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-200 text-emerald-900">
                  {prediction.confidenceScore}% Model Confidence
                </span>
              </div>
              <p className="text-emerald-900 font-medium">
                {prediction.marketRecommendation}
              </p>
            </div>

            {/* Wholesale Terminals & Agronomic Factors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-indigo-500" /> Recommended Wholesale Hubs
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {prediction.wholesaleTerminalHubs.map((hub) => (
                    <span key={hub} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-semibold text-slate-700">
                      {hub}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block flex items-center gap-1">
                  <Sprout className="w-3.5 h-3.5 text-emerald-600" /> Agronomic Volatility Drivers
                </span>
                <p className="text-[11px] text-slate-600 leading-snug">
                  {prediction.agronomicGuidance}
                </p>
              </div>
            </div>

            {/* Direct Action */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 border border-slate-200 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              {onPreListHarvest && (
                <button
                  type="button"
                  onClick={() => {
                    onPreListHarvest({
                      cropName: prediction.cropName,
                      unitPrice: Number((prediction.projectedPriceKes / 130).toFixed(2)),
                      location: `${prediction.county} County`
                    });
                    onClose();
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Pre-List Harvest at KES {prediction.projectedPriceKes}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
