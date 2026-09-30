import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Sprout, 
  HelpCircle, 
  Check, 
  ArrowRight, 
  Sparkles,
  PieChart,
  Scale,
  Percent,
  CheckCircle2
} from 'lucide-react';
import { useCurrency, USD_TO_KES } from './CurrencyUnitContext';

export default function FarmerProfitCalculatorModal({ 
  isOpen, 
  onClose, 
  onApplyPriceToListing 
}) {
  const { formatMoney, currency } = useCurrency();

  const [benchmarks, setBenchmarks] = useState([]);
  const [selectedCropKey, setSelectedCropKey] = useState('tomatoes');
  const [acres, setAcres] = useState(1);
  const [expectedYieldKg, setExpectedYieldKg] = useState(8500);

  // Expense fields (in KES)
  const [costs, setCosts] = useState({
    seedsAndSeedlings: 14000,
    landPreparation: 8500,
    plantingFertilizer: 22000,
    topdressingFertilizer: 14000,
    fungicidesAndPesticides: 18500,
    irrigationAndFuel: 16000,
    laborWeedingHarvesting: 24000
  });

  const [currentMarketPriceKes, setCurrentMarketPriceKes] = useState(115);
  const [profitabilityTip, setProfitabilityTip] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchBenchmarks();
    }
  }, [isOpen]);

  const fetchBenchmarks = async () => {
    try {
      const res = await fetch('/api/agronomy/production-benchmarks');
      const data = await res.json();
      if (data.success && data.benchmarks) {
        setBenchmarks(data.benchmarks);
        loadCropBenchmark(data.benchmarks, selectedCropKey);
      }
    } catch (err) {
      console.warn('Failed to fetch benchmarks:', err);
    }
  };

  const loadCropBenchmark = (list, cropKey) => {
    const found = list.find(b => b.cropKey === cropKey);
    if (found) {
      setCosts(found.costsPerAcreKes);
      setExpectedYieldKg(found.avgYieldKgPerAcre);
      setCurrentMarketPriceKes(found.currentMarketKesPerKg);
      setProfitabilityTip(found.profitabilityTip);
    }
  };

  const handleCropChange = (cropKey) => {
    setSelectedCropKey(cropKey);
    loadCropBenchmark(benchmarks, cropKey);
  };

  // Calculations
  const totalCostPerAcre = Object.values(costs).reduce((sum, c) => sum + (parseFloat(c) || 0), 0);
  const totalProductionCost = totalCostPerAcre * parseFloat(acres || 1);
  const totalYield = parseFloat(expectedYieldKg || 1) * parseFloat(acres || 1);

  // Break-even cost per kg (KES)
  const breakEvenCostPerKgKes = totalYield > 0 ? parseFloat((totalProductionCost / totalYield).toFixed(2)) : 0;
  
  // Suggested selling prices with margins
  const price30PctMarginKes = parseFloat((breakEvenCostPerKgKes * 1.30).toFixed(2));
  const price50PctMarginKes = parseFloat((breakEvenCostPerKgKes * 1.50).toFixed(2));

  // Projected revenue and net profit at current wholesale benchmark
  const projectedRevenueKes = totalYield * currentMarketPriceKes;
  const projectedNetProfitKes = projectedRevenueKes - totalProductionCost;
  const roiPct = totalProductionCost > 0 ? Math.round((projectedNetProfitKes / totalProductionCost) * 100) : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white p-5 flex items-center justify-between border-b border-emerald-800/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white tracking-tight">Farmer Break-Even & Profit Margin Calculator</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
                  AGRONOMY INTELLIGENCE
                </span>
              </div>
              <p className="text-xs text-emerald-200/70 mt-0.5">Calculate your exact production cost per kilogram and prevent selling at a loss to middlemen</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Crop Selector Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Select Crop / Commodity Benchmark</label>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {[
                { key: 'tomatoes', name: '🍅 Tomatoes' },
                { key: 'onions', name: '🧅 Red Onions' },
                { key: 'potatoes', name: '🥔 Potatoes' },
                { key: 'maize', name: '🌽 White Maize' },
                { key: 'avocado', name: '🥑 Hass Avocado' },
                { key: 'cabbage', name: '🥬 Cabbages' }
              ].map((c) => {
                const isSelected = selectedCropKey === c.key;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => handleCropChange(c.key)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Acreage & Yield Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Land Size (Acres)</label>
              <input
                type="number"
                min="0.25"
                step="0.25"
                value={acres}
                onChange={(e) => setAcres(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expected Yield per Acre (kg)</label>
              <input
                type="number"
                min="100"
                step="100"
                value={expectedYieldKg}
                onChange={(e) => setExpectedYieldKg(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Total Harvest Volume: <strong>{(parseFloat(acres || 1) * parseFloat(expectedYieldKg || 0)).toLocaleString()} kg</strong>
              </span>
            </div>
          </div>

          {/* Input Costs Form */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase font-mono text-slate-400 tracking-wider">
              Input Costs Breakdown (KES per Acre)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Certified Seeds / Seedlings (KES)</label>
                <input
                  type="number"
                  value={costs.seedsAndSeedlings}
                  onChange={(e) => setCosts({ ...costs, seedsAndSeedlings: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Land Prep & Tilling (KES)</label>
                <input
                  type="number"
                  value={costs.landPreparation}
                  onChange={(e) => setCosts({ ...costs, landPreparation: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Planting Fertilizer DAP/NPK (KES)</label>
                <input
                  type="number"
                  value={costs.plantingFertilizer}
                  onChange={(e) => setCosts({ ...costs, plantingFertilizer: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Topdressing CAN/Urea (KES)</label>
                <input
                  type="number"
                  value={costs.topdressingFertilizer}
                  onChange={(e) => setCosts({ ...costs, topdressingFertilizer: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Fungicides & Pest Sprays (KES)</label>
                <input
                  type="number"
                  value={costs.fungicidesAndPesticides}
                  onChange={(e) => setCosts({ ...costs, fungicidesAndPesticides: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Weeding, Harvesting & Labor (KES)</label>
                <input
                  type="number"
                  value={costs.laborWeedingHarvesting}
                  onChange={(e) => setCosts({ ...costs, laborWeedingHarvesting: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Real-time Calculation Results Display */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-slate-50 border border-emerald-200 rounded-3xl p-5 space-y-4">
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3 rounded-2xl border border-slate-200">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">Total Production Cost</span>
                <p className="text-base font-black text-slate-900 mt-0.5">KES {totalProductionCost.toLocaleString()}</p>
                <span className="text-[10px] text-slate-500 font-mono">${(totalProductionCost / USD_TO_KES).toFixed(2)}</span>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-amber-200 shadow-2xs">
                <span className="text-[10px] uppercase font-mono text-amber-700 font-bold block">Break-Even Minimum</span>
                <p className="text-lg font-black text-amber-900 mt-0.5">KES {breakEvenCostPerKgKes} <span className="text-xs font-normal">/ kg</span></p>
                <span className="text-[10px] text-slate-500">Never sell below this!</span>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-emerald-200 shadow-2xs">
                <span className="text-[10px] uppercase font-mono text-emerald-700 font-bold block">Fair Price (+30% Margin)</span>
                <p className="text-lg font-black text-emerald-800 mt-0.5">KES {price30PctMarginKes} <span className="text-xs font-normal">/ kg</span></p>
                <span className="text-[10px] text-emerald-600 font-bold">+50% = KES {price50PctMarginKes}/kg</span>
              </div>

              <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-sm">
                <span className="text-[10px] uppercase font-mono text-emerald-300 font-bold block">Projected Net Profit</span>
                <p className="text-lg font-black text-white mt-0.5">
                  KES {projectedNetProfitKes.toLocaleString()}
                </p>
                <span className="text-[10px] text-emerald-400 font-bold">ROI: +{roiPct}%</span>
              </div>
            </div>

            {/* Advisory Tip */}
            {profitabilityTip && (
              <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 text-xs text-slate-700 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-950 font-bold">Agronomist Recommendation: </strong>
                  <span>{profitabilityTip} Current wholesale market benchmark is <strong>KES {currentMarketPriceKes}/kg</strong>.</span>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            Suggested Listing Price: <strong>KES {price30PctMarginKes}/kg</strong> (${(price30PctMarginKes / USD_TO_KES).toFixed(2)})
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              Close
            </button>

            {onApplyPriceToListing && (
              <button
                type="button"
                onClick={() => {
                  const usdPrice = parseFloat((price30PctMarginKes / USD_TO_KES).toFixed(2));
                  onApplyPriceToListing({
                    unitPrice: usdPrice,
                    cropKey: selectedCropKey,
                    breakEvenKes: breakEvenCostPerKgKes
                  });
                  onClose();
                }}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Apply Price to New Harvest (${(price30PctMarginKes / USD_TO_KES).toFixed(2)}/kg)</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
