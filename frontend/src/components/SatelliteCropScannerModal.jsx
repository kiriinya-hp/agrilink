import React, { useState } from 'react';
import { 
  Radio, 
  Sparkles, 
  X, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Droplets, 
  Activity, 
  Layers, 
  RefreshCw, 
  ShieldCheck, 
  Scan,
  BadgeCheck
} from 'lucide-react';

export default function SatelliteCropScannerModal({ isOpen, onClose, initialCrop = 'Tomatoes', initialLocation = 'Kinangop, Nyandarua County' }) {
  const [cropName, setCropName] = useState(initialCrop);
  const [location, setLocation] = useState(initialLocation);
  const [acres, setAcres] = useState(3.0);
  const [loading, setLoading] = useState(false);
  const [satelliteData, setSatelliteData] = useState(null);

  if (!isOpen) return null;

  const handleScanField = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSatelliteData(null);
    try {
      const res = await fetch('/api/satellite/crop-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropName,
          location,
          acres: Number(acres)
        })
      });
      const data = await res.json();
      if (data.success) {
        setSatelliteData(data.analysis);
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
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-200">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900">Sentinel-2 Satellite Crop Health Scanner</h3>
                <span className="text-[10px] font-black bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  ESA Remote Sensing
                </span>
              </div>
              <p className="text-xs text-slate-500">10m Multispectral NDVI Vigor, Soil Moisture & Pre-Harvest Yield Estimation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shamba Scan Form */}
        <form onSubmit={handleScanField} className="my-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Crop to Scan</label>
              <select
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Tomatoes">Tomatoes (Roma/Anna)</option>
                <option value="Shangi Potatoes">Shangi Potatoes</option>
                <option value="Dry White Maize">Dry White Maize</option>
                <option value="Red Bulb Onions">Red Bulb Onions</option>
                <option value="Cabbages">Cabbages</option>
                <option value="French Beans">French Beans</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Shamba Location / County</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800"
              >
                <option value="Kinangop, Nyandarua County">Kinangop, Nyandarua County</option>
                <option value="Mwea, Kirinyaga County">Mwea, Kirinyaga County</option>
                <option value="Moiben, Uasin Gishu County">Moiben, Uasin Gishu County</option>
                <option value="Meru Central, Meru County">Meru Central, Meru County</option>
                <option value="Bahati, Nakuru County">Bahati, Nakuru County</option>
                <option value="Yatta, Machakos County">Yatta, Machakos County</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Field Size (Acres)</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={acres}
                onChange={(e) => setAcres(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 font-mono"
                required
              />
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
              Direct orbital radar query to Copernicus Sentinel-2 constellation
            </span>
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-colors"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Scanning Field Radar...</span>
                </>
              ) : (
                <>
                  <Scan className="w-3.5 h-3.5" />
                  <span>Acquire Satellite Data</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Scan Results Panel */}
        {satelliteData && (
          <div className="space-y-4 border-t border-slate-100 pt-3 animate-fade-in text-xs">
            
            {/* Satellite Metadata Stamp */}
            <div className="bg-slate-900 text-white p-3.5 rounded-2xl flex justify-between items-center">
              <div>
                <span className="text-[9px] font-mono text-teal-400 uppercase tracking-widest block">
                  ESA Copernicus Constellation Sync
                </span>
                <span className="font-mono text-xs font-bold">{satelliteData.verificationId}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono">
                  {satelliteData.resolutionMeters}
                </span>
              </div>
            </div>

            {/* Core Remote Sensing Vigor Indices */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* NDVI Card */}
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">NDVI Vigor Score</span>
                  <Activity className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="mt-1">
                  <span className="text-2xl font-black text-emerald-950 font-mono">
                    {satelliteData.spectralIndices.ndvi.value}
                  </span>
                  <span className="text-xs text-emerald-700 block font-semibold mt-0.5">
                    {satelliteData.spectralIndices.ndvi.label}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-emerald-200 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div 
                    className="bg-emerald-600 h-1.5 rounded-full transition-all duration-1000"
                    style={{ width: `${satelliteData.spectralIndices.ndvi.healthRatingScore}%` }}
                  />
                </div>
              </div>

              {/* Water & Hydration Card */}
              <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-2xl">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Soil Moisture (NDWI)</span>
                  <Droplets className="w-4 h-4 text-blue-600" />
                </div>
                <div className="mt-1">
                  <span className="text-2xl font-black text-blue-950 font-mono">
                    {satelliteData.spectralIndices.ndwiWaterIndex.soilMoisturePercentage}%
                  </span>
                  <span className="text-xs text-blue-700 block font-semibold mt-0.5">
                    {satelliteData.spectralIndices.ndwiWaterIndex.status}
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-1000"
                    style={{ width: `${satelliteData.spectralIndices.ndwiWaterIndex.soilMoisturePercentage}%` }}
                  />
                </div>
              </div>

              {/* Harvest Forecast Card */}
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Harvest Readiness</span>
                  <Calendar className="w-4 h-4 text-amber-600" />
                </div>
                <div className="mt-1">
                  <span className="text-2xl font-black text-amber-950 font-mono">
                    {satelliteData.harvestForecast.estimatedDaysToPeakHarvest} Days
                  </span>
                  <span className="text-xs text-amber-800 block font-semibold mt-0.5">
                    Est: {satelliteData.harvestForecast.estimatedHarvestDate}
                  </span>
                </div>
                <p className="text-[10px] text-amber-700 mt-1">
                  Yield: <strong>{satelliteData.harvestForecast.totalFieldProjectedYieldTonnes} Tonnes</strong>
                </p>
              </div>

            </div>

            {/* False-Color Spatial Heatmap Grid */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-2">
                Field Quadrant Multispectral Canopy Distribution (False-Color Infrared)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {satelliteData.spectralHeatmap.map((zone, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: zone.color }} />
                      <span className="font-bold text-[11px] text-slate-800">{zone.zone}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">NDVI: <strong>{zone.ndvi}</strong></span>
                    <span className="text-[10px] font-semibold text-emerald-700 block">{zone.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Space Verification Trust Badge */}
            <div className="bg-emerald-50 border-2 border-dashed border-emerald-300 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <BadgeCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-emerald-950">AgriLink Space Verified Producer</p>
                  <p className="text-[11px] text-emerald-800">
                    Buyers can safely lock escrow pre-orders knowing the harvest exists and is in optimal health.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Close Satellite Scanner
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
