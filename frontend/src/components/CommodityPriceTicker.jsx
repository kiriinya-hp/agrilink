import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  MapPin, 
  BarChart2, 
  X, 
  RefreshCw, 
  Sparkles, 
  Info,
  Scale
} from 'lucide-react';

export default function CommodityPriceTicker() {
  const [commodities, setCommodities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFullModal, setShowFullModal] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState('ALL');

  const fetchPrices = async () => {
    try {
      const res = await fetch('/api/market/commodity-prices');
      const data = await res.json();
      if (data.success) {
        setCommodities(data.commodities);
      }
    } catch (e) {
      console.error('Failed to fetch commodity index:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000); // 1 minute auto refresh
    return () => clearInterval(interval);
  }, []);

  if (loading && commodities.length === 0) return null;

  return (
    <>
      {/* Sleek Live Price Ticker Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl px-3.5 py-2 sm:px-4 sm:py-2.5 mb-3 sm:mb-6 shadow-md border border-slate-700/60 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          
          {/* Ticker Title Badge */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-emerald-300">
                Kenya Wholesale Price Index
              </span>
            </div>
            <button
              onClick={() => setShowFullModal(true)}
              className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 font-semibold transition-colors flex items-center gap-1"
            >
              <span>View All</span>
              <BarChart2 className="w-3 h-3" />
            </button>
          </div>

          {/* Scrolling Horizontal Feed */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-0.5 text-xs">
            {commodities.slice(0, 5).map((item) => (
              <div 
                key={item.id} 
                onClick={() => setShowFullModal(true)}
                className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-750 px-3 py-1 rounded-xl border border-slate-700/60 shrink-0 cursor-pointer transition-all hover:scale-[1.02]"
              >
                <span className="font-bold text-slate-200">{item.crop}</span>
                <span className="font-mono text-emerald-400 font-extrabold">KES {item.wholesalePriceKes}/{item.unit}</span>
                <span className="text-[10px] text-slate-400">({item.market.split(' ')[0]})</span>
                
                {item.trend === 'UP' && (
                  <span className="flex items-center text-[10px] text-emerald-400 font-bold">
                    <TrendingUp className="w-3 h-3 mr-0.5" /> +{item.changePct}%
                  </span>
                )}
                {item.trend === 'DOWN' && (
                  <span className="flex items-center text-[10px] text-rose-400 font-bold">
                    <TrendingDown className="w-3 h-3 mr-0.5" /> {item.changePct}%
                  </span>
                )}
                {item.trend === 'STABLE' && (
                  <span className="flex items-center text-[10px] text-slate-400 font-bold">
                    <Minus className="w-3 h-3 mr-0.5" /> 0%
                  </span>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Comprehensive Modal: Kenya Commodity Price Intelligence */}
      {showFullModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">National Wholesale Produce Benchmark</h3>
                  <p className="text-xs text-slate-500">
                    Real-time market price index compiled across major agricultural trading floors in Kenya
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowFullModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Information Callout */}
            <div className="my-4 p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-xs text-emerald-900 flex items-center gap-2.5">
              <Info className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Fair Pricing Transparency:</strong> Use these verified wholesale rates to evaluate fair producer prices, negotiate bulk orders, or price your harvests without middlemen price slashing.
              </span>
            </div>

            {/* Table of Commodities */}
            <div className="flex-1 overflow-y-auto pr-1">
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Commodity / Variety</th>
                      <th className="py-3 px-4">Wholesale Hub</th>
                      <th className="py-3 px-4">Benchmark Price</th>
                      <th className="py-3 px-4">24h Movement</th>
                      <th className="py-3 px-4">Market Demand</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {commodities.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors font-medium">
                        <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          {c.crop}
                        </td>
                        <td className="py-3 px-4 text-slate-600 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {c.market}
                        </td>
                        <td className="py-3 px-4 font-mono font-extrabold text-emerald-700 text-sm">
                          KES {c.wholesalePriceKes.toLocaleString()}{' '}
                          <span className="text-[11px] font-normal text-slate-400">/{c.unit}</span>
                        </td>
                        <td className="py-3 px-4">
                          {c.trend === 'UP' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                              <TrendingUp className="w-3 h-3" /> +{c.changePct}%
                            </span>
                          )}
                          {c.trend === 'DOWN' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px]">
                              <TrendingDown className="w-3 h-3" /> {c.changePct}%
                            </span>
                          )}
                          {c.trend === 'STABLE' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                              <Minus className="w-3 h-3" /> Stable
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.demandLevel === 'VERY_HIGH' 
                              ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                              : c.demandLevel === 'HIGH'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}>
                            {c.demandLevel.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Source: AgriShamba SCM Data Engine & Regional Markets</span>
              <button
                onClick={() => setShowFullModal(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors"
              >
                Close Price Index
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
