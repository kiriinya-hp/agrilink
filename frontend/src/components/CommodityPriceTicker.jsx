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
  Scale,
  ArrowRight,
  ArrowUpRight,
  Layers
} from 'lucide-react';

const MARKET_COMPARISON_DATA = [
  {
    crop: 'Irish Potatoes (Shangi)',
    unit: '50kg Bag',
    markets: [
      { name: 'Nakuru Wholesale', price: 2800, type: 'FARM_GATE' },
      { name: 'Nairobi (Wakulima)', price: 3900, type: 'TERMINAL' },
      { name: 'Mombasa (Kongowea)', price: 4400, type: 'COAST_CONSUMER' },
      { name: 'Eldoret Main', price: 2950, type: 'REGIONAL' },
      { name: 'Kisumu (Kibuye)', price: 3800, type: 'LAKE_BASIN' }
    ],
    bestMarket: 'Mombasa (Kongowea)',
    spread: '+KES 1,600 / bag (+57%)',
    advice: 'High coast demand from hospitality and school canteens. Transport via SGR freight or 10-wheeler lorries yields peak margins.'
  },
  {
    crop: 'Red Bulb Onions',
    unit: '1 kg',
    markets: [
      { name: 'Oloitokitok / Kajiado', price: 85, type: 'FARM_GATE' },
      { name: 'Nairobi (Wakulima)', price: 125, type: 'TERMINAL' },
      { name: 'Mombasa (Kongowea)', price: 145, type: 'COAST_CONSUMER' },
      { name: 'Nakuru Wholesale', price: 110, type: 'REGIONAL' },
      { name: 'Kisumu (Kibuye)', price: 130, type: 'LAKE_BASIN' }
    ],
    bestMarket: 'Mombasa (Kongowea)',
    spread: '+KES 60 / kg (+70%)',
    advice: 'Cured red onions fetch maximum premium at coastal hotel suppliers. Field cure for 5 days before dispatch.'
  },
  {
    crop: 'Roma Tomatoes (Grade A)',
    unit: '64kg Crate',
    markets: [
      { name: 'Kirinyaga / Mwea', price: 3400, type: 'FARM_GATE' },
      { name: 'Nairobi (Wakulima)', price: 5200, type: 'TERMINAL' },
      { name: 'Mombasa (Kongowea)', price: 5800, type: 'COAST_CONSUMER' },
      { name: 'Nakuru Wholesale', price: 4200, type: 'REGIONAL' },
      { name: 'Eldoret Main', price: 4600, type: 'REGIONAL' }
    ],
    bestMarket: 'Mombasa (Kongowea)',
    spread: '+KES 2,400 / crate (+70%)',
    advice: 'Fast-moving perishable. Pack in ventilated plastic or wooden crates; dispatch overnight to arrive at trading floor by 4:00 AM.'
  },
  {
    crop: 'Cabbages (Gloria F1)',
    unit: 'Piece / Head',
    markets: [
      { name: 'Nyandarua / Kinangop', price: 25, type: 'FARM_GATE' },
      { name: 'Nairobi (Wakulima)', price: 55, type: 'TERMINAL' },
      { name: 'Mombasa (Kongowea)', price: 75, type: 'COAST_CONSUMER' },
      { name: 'Kisumu (Kibuye)', price: 60, type: 'LAKE_BASIN' },
      { name: 'Thika Madaraka', price: 45, type: 'REGIONAL' }
    ],
    bestMarket: 'Mombasa (Kongowea)',
    spread: '+KES 50 / head (+200%)',
    advice: 'Heavy tonnage required to offset freight fees. Consolidate shipments with local farmer groups for 15-tonne lorry dispatch.'
  },
  {
    crop: 'Dry Maize (White Grain)',
    unit: '90kg Bag',
    markets: [
      { name: 'Kitale / Trans-Nzoia', price: 3100, type: 'FARM_GATE' },
      { name: 'Eldoret Main', price: 3300, type: 'REGIONAL' },
      { name: 'Nairobi (NCPB / Millers)', price: 4100, type: 'TERMINAL' },
      { name: 'Mombasa Millers', price: 4350, type: 'COAST_CONSUMER' },
      { name: 'Kisumu Millers', price: 3950, type: 'LAKE_BASIN' }
    ],
    bestMarket: 'Mombasa Millers',
    spread: '+KES 1,250 / bag (+40%)',
    advice: 'Ensure grain moisture content is <= 13.5% to pass lab aflatoxin and moisture tests at commercial flour millers.'
  },
  {
    crop: 'Hass Avocados (Export Quality)',
    unit: '4kg Box',
    markets: [
      { name: 'Murang’a / Meru', price: 350, type: 'FARM_GATE' },
      { name: 'Nairobi Packhouses', price: 650, type: 'TERMINAL' },
      { name: 'Mombasa Freight Port', price: 720, type: 'COAST_CONSUMER' },
      { name: 'Naivasha EPZ', price: 680, type: 'REGIONAL' }
    ],
    bestMarket: 'Mombasa Freight Port',
    spread: '+KES 370 / box (+105%)',
    advice: 'Requires cold-chain transport (5.5°C). Ensure GlobalGAP certification for direct export packhouse intake.'
  }
];

export default function CommodityPriceTicker() {
  const [commodities, setCommodities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFullModal, setShowFullModal] = useState(false);
  const [modalTab, setModalTab] = useState('ticker'); // 'ticker' | 'comparison'
  const [selectedCropIndex, setSelectedCropIndex] = useState(0);

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

            {/* Tab Switcher: Ticker vs County Comparison */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl my-3 text-xs font-bold self-start">
              <button
                type="button"
                onClick={() => setModalTab('ticker')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  modalTab === 'ticker' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Scale className="w-3.5 h-3.5" /> Price Index
              </button>
              <button
                type="button"
                onClick={() => setModalTab('comparison')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  modalTab === 'comparison' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> County Price Comparison
              </button>
            </div>

            {/* Information Callout */}
            <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-xs text-emerald-900 flex items-center gap-2.5">
              <Info className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {modalTab === 'ticker' ? (
                  <><strong>Fair Pricing Transparency:</strong> Use these verified wholesale rates to evaluate fair producer prices, negotiate bulk orders, or price your harvests without middlemen price slashing.</>
                ) : (
                  <><strong>Market Arbitrage Intelligence:</strong> Compare farm-gate, wholesale, and consumer prices across Kenyan counties to find the <strong>best market to sell</strong> your produce for maximum profit.</>
                )}
              </span>
            </div>

            {/* TICKER TAB: Table of Commodities */}
            {modalTab === 'ticker' && (
            <div className="flex-1 overflow-y-auto pr-1">
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Commodity / Variety</th>
                      <th className="py-3 px-4">Wholesale Hub</th>
                      <th className="py-3 px-4">Benchmark Price</th>
                      <th className="py-3 px-4">24h Movement</th>
                      <th className="py-3 px-4">7-Day Trend Sparkline</th>
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
                          {c.sevenDayHistory && (
                            <div className="flex items-end gap-1 h-5 w-24">
                              {c.sevenDayHistory.map((val, idx) => {
                                const min = Math.min(...c.sevenDayHistory);
                                const max = Math.max(...c.sevenDayHistory);
                                const heightPct = max === min ? 50 : Math.max(15, Math.round(((val - min) / (max - min)) * 100));
                                return (
                                  <div 
                                    key={idx} 
                                    className={`w-2.5 rounded-t transition-all ${c.trend === 'UP' ? 'bg-emerald-500' : c.trend === 'DOWN' ? 'bg-rose-400' : 'bg-slate-400'}`}
                                    style={{ height: `${heightPct}%` }}
                                    title={`Day ${idx + 1}: KES ${val.toLocaleString()}`}
                                  />
                                );
                              })}
                            </div>
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
            )}

            {/* COMPARISON TAB: County Price Comparison & Arbitrage */}
            {modalTab === 'comparison' && (
            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              {/* Crop Selector Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {MARKET_COMPARISON_DATA.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedCropIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                      selectedCropIndex === idx
                        ? 'bg-slate-900 text-white border-slate-700 shadow-sm'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {item.crop.split('(')[0].trim()}
                  </button>
                ))}
              </div>

              {/* Selected Crop Comparison Card */}
              {(() => {
                const sel = MARKET_COMPARISON_DATA[selectedCropIndex];
                const sortedMarkets = [...sel.markets].sort((a, b) => b.price - a.price);
                const maxPrice = sortedMarkets[0].price;
                const minPrice = sortedMarkets[sortedMarkets.length - 1].price;
                return (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <h4 className="font-black text-base text-slate-900">{sel.crop}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Unit: <strong>{sel.unit}</strong></p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Best Market</span>
                        <span className="text-sm font-black text-emerald-700 flex items-center gap-1">
                          <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                          {sel.bestMarket}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-600">{sel.spread}</span>
                      </div>
                    </div>

                    {/* Horizontal Bar Chart: Markets by price */}
                    <div className="space-y-2.5">
                      {sortedMarkets.map((m, idx) => {
                        const widthPct = Math.max(25, Math.round((m.price / maxPrice) * 100));
                        const isBest = idx === 0;
                        const isLowest = idx === sortedMarkets.length - 1;
                        return (
                          <div key={m.name} className="flex items-center gap-3">
                            <div className="w-36 sm:w-44 text-right shrink-0">
                              <span className={`text-[11px] font-bold ${isBest ? 'text-emerald-800' : 'text-slate-700'} flex items-center justify-end gap-1`}>
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {m.name}
                              </span>
                              <span className="text-[9px] text-slate-400 uppercase font-semibold">
                                {m.type.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <div className="flex-1 flex items-center gap-2">
                              <div className="flex-1 h-6 bg-slate-200/60 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all flex items-center justify-end pr-2 ${
                                    isBest
                                      ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-sm'
                                      : isLowest
                                      ? 'bg-gradient-to-r from-amber-300 to-amber-500'
                                      : 'bg-gradient-to-r from-slate-300 to-slate-400'
                                  }`}
                                  style={{ width: `${widthPct}%` }}
                                >
                                  <span className="text-[10px] font-mono font-black text-white whitespace-nowrap">
                                    KES {m.price.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                              {isBest && (
                                <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded-md shrink-0">
                                  BEST
                                </span>
                              )}
                              {isLowest && (
                                <span className="text-[9px] font-black text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded-md shrink-0">
                                  GATE
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Arbitrage Insight */}
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Arbitrage Advisory:</strong> {sel.advice}
                        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold">
                          <ArrowRight className="w-3 h-3" />
                          <span>Margin spread: KES {minPrice.toLocaleString()} → KES {maxPrice.toLocaleString()} (+{Math.round(((maxPrice - minPrice) / minPrice) * 100)}%)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
            )}

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
