import React, { useState, useEffect } from 'react';
import { 
  CloudSun, 
  CloudRain, 
  Sun, 
  Droplets, 
  Thermometer, 
  Truck, 
  AlertTriangle, 
  CheckCircle, 
  Compass, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function KilimoWeatherAdvisory() {
  const [advisoryData, setAdvisoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRegionIndex, setSelectedRegionIndex] = useState(0);

  useEffect(() => {
    fetch('/api/weather/advisory')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAdvisoryData(data);
        }
      })
      .catch((err) => console.error('Failed to load weather advisory:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !advisoryData?.regions?.length) return null;

  const current = advisoryData.regions[selectedRegionIndex];

  return (
    <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-slate-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
            <CloudSun className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
              <span>Kilimo Agro-Weather & Logistics Advisory</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-100 text-emerald-800">
                LIVE
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Harvest windows, road conditions, and post-harvest risk alerts for {advisoryData.aiForecastDate}
            </p>
          </div>
        </div>

        {/* Regional Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {advisoryData.regions.map((reg, idx) => (
            <button
              key={reg.region}
              onClick={() => setSelectedRegionIndex(idx)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedRegionIndex === idx
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {reg.region.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Advisory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        
        {/* Weather Metrics Card */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Region Forecast</span>
            <p className="font-extrabold text-slate-900 text-sm mt-0.5">{current.region}</p>
            <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
              {current.condition.includes('Rain') || current.condition.includes('Shower') ? (
                <CloudRain className="w-4 h-4 text-blue-500" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
              <span>{current.condition}</span>
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-slate-900">{current.tempC}°C</span>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
              <span className="flex items-center gap-0.5">
                <Droplets className="w-3 h-3 text-blue-500" /> {current.humidity}
              </span>
              <span>Rain: {current.rainfallChance}</span>
            </div>
          </div>
        </div>

        {/* Harvest Condition Card */}
        <div className="bg-emerald-50/60 rounded-xl p-3.5 border border-emerald-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase text-emerald-800 font-bold">Harvesting Window</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              current.harvestSuitability === 'OPTIMAL' || current.harvestSuitability === 'EXCELLENT'
                ? 'bg-emerald-200 text-emerald-900'
                : 'bg-amber-200 text-amber-900'
            }`}>
              {current.harvestSuitability}
            </span>
          </div>
          <p className="text-xs text-emerald-950 font-medium leading-relaxed">
            {current.agronomyTip}
          </p>
        </div>

        {/* Transport & Road Logistics Card */}
        <div className="bg-blue-50/60 rounded-xl p-3.5 border border-blue-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase text-blue-800 font-bold flex items-center gap-1">
              <Truck className="w-3 h-3 text-blue-700" /> Road & Freight Status
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              current.transportStatus === 'CLEAR' || current.transportStatus === 'EXCELLENT'
                ? 'bg-emerald-200 text-emerald-900'
                : 'bg-amber-200 text-amber-900'
            }`}>
              {current.transportStatus.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-blue-950 font-medium leading-relaxed">
            {current.transportStatus === 'MUDDY_FEEDER_ROADS'
              ? 'Warning for transit trucks: Rural feeder roads slick from showers. Tarpaulin cargo coverings mandatory.'
              : 'Transport corridors completely dry and clear for high-speed delivery to Nairobi and coastal depots.'}
          </p>
        </div>

      </div>

    </div>
  );
}
