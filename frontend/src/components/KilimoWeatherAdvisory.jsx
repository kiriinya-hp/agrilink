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
  ChevronDown,
  ChevronUp,
  Sparkles,
  Wind,
  Navigation,
  RefreshCw,
  Radio,
  MapPin
} from 'lucide-react';

export default function KilimoWeatherAdvisory() {
  const [advisoryData, setAdvisoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRegionIndex, setSelectedRegionIndex] = useState(0);
  const [locatingUser, setLocatingUser] = useState(false);
  const [userLocationWeather, setUserLocationWeather] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsCollapsed(true);
    }
  }, []);

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/weather/advisory');
      const data = await res.json();
      if (data.success) {
        setAdvisoryData(data);
      }
    } catch (err) {
      console.warn('Weather advisory fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUseLiveGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`/api/weather/advisory?lat=${latitude}&lng=${longitude}&name=My Current Environment`);
          const data = await res.json();
          if (data.success && data.userCustomLocation) {
            setUserLocationWeather(data.userCustomLocation);
          }
        } catch (err) {
          console.warn('Failed to fetch user live weather:', err);
        } finally {
          setLocatingUser(false);
        }
      },
      (err) => {
        console.warn('GPS location access denied:', err.message);
        setLocatingUser(false);
      },
      { timeout: 8000 }
    );
  };

  if (loading && !advisoryData) {
    return (
      <div className="bg-white rounded-2xl p-5 mb-6 shadow-xs border border-slate-200/80 animate-pulse flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-44 bg-slate-200 rounded" />
            <div className="h-2.5 w-60 bg-slate-100 rounded" />
          </div>
        </div>
        <div className="h-7 w-28 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  if (!advisoryData?.regions?.length && !userLocationWeather) return null;

  const current = userLocationWeather || advisoryData.regions[selectedRegionIndex] || advisoryData.regions[0];

  return (
    <div className="glass-panel-climate rounded-3xl p-5 sm:p-6 mb-6 transition-all relative overflow-hidden">
      {/* Ambient Glassmorphic Background Illumination Orbs */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-amber-400/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-sky-400/15 rounded-full blur-3xl pointer-events-none -z-10" />
      
      {/* Top Header & Live Environment Radar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/70 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 border border-white/50">
              <CloudSun className="w-5 h-5" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white"></span>
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 tracking-tight truncate">
                Agro-Climate Radar
              </h3>
              <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 border border-emerald-500/30 font-extrabold flex items-center gap-1 shadow-2xs backdrop-blur-md">
                <Radio className="w-2.5 h-2.5 text-emerald-600 animate-pulse" />
                LIVE SATELLITE
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-600 truncate font-medium">
              {current.region.split('&')[0].trim()} • {current.tempC}°C • {current.condition}
            </p>
          </div>
        </div>

        {/* Expand / Collapse Button */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="px-3 py-1.5 rounded-xl bg-white/70 hover:bg-white/95 text-slate-700 transition-all flex items-center gap-1 text-xs font-bold shrink-0 border border-white/80 shadow-xs hover:shadow-sm backdrop-blur-md"
          title={isCollapsed ? 'Expand Weather Radar' : 'Collapse Weather Radar'}
        >
          <span className="text-[11px]">{isCollapsed ? 'Radar' : 'Hide'}</span>
          {isCollapsed ? <ChevronDown className="w-3.5 h-3.5 text-emerald-600" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-500" />}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Region Selector Pills & Live GPS Action */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-3 border-b border-white/70 scrollbar-none">
          <button
            type="button"
            onClick={handleUseLiveGPS}
            disabled={locatingUser}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 border backdrop-blur-md shadow-xs ${
              userLocationWeather
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/30'
                : 'bg-emerald-500/15 text-emerald-800 border-emerald-400/40 hover:bg-emerald-500/25'
            }`}
            title="Detect live environmental weather for your device GPS coordinates"
          >
            <Navigation className={`w-3 h-3 ${locatingUser ? 'animate-spin' : ''}`} />
            <span>{locatingUser ? 'Detecting...' : userLocationWeather ? '📍 My Current Environment' : '📍 Use My GPS Location'}</span>
          </button>

          {advisoryData?.regions?.map((reg, idx) => {
            const isSelected = !userLocationWeather && selectedRegionIndex === idx;
            return (
              <button
                key={reg.region}
                onClick={() => {
                  setUserLocationWeather(null);
                  setSelectedRegionIndex(idx);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border backdrop-blur-md shadow-2xs ${
                  isSelected
                    ? 'bg-slate-900/90 text-white border-slate-700 shadow-md'
                    : 'bg-white/60 text-slate-700 border-white/80 hover:bg-white/90'
                }`}
              >
                {reg.region.split('&')[0].trim()}
              </button>
            );
          })}

          <button
            onClick={loadWeatherData}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white/80 border border-transparent hover:border-white/80 transition-all backdrop-blur-xs"
            title="Refresh Live Satellite Feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Main Real-Time Meteorological Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        
        {/* Weather Metrics Card */}
        <div className="glass-subcard-weather rounded-2xl p-4 flex flex-col justify-between shadow-xs transition-all hover:border-slate-300">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {userLocationWeather ? 'GPS Location' : 'Regional Station'}
              </span>
              <p className="font-extrabold text-slate-900 text-sm mt-0.5">{current.region}</p>
              
              <div className="flex items-center gap-1.5 mt-2">
                {current.condition.includes('Rain') || current.condition.includes('Shower') ? (
                  <CloudRain className="w-5 h-5 text-blue-500" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-500" />
                )}
                <span className="text-xs font-bold text-slate-800">{current.condition}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                {current.tempC}°C
              </span>
              <span className="text-[10px] text-slate-500 block font-mono">Live Ground Temp</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-200/70 text-[11px] text-slate-700 font-medium">
            <div className="flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
              <span>{current.humidity} Hum.</span>
            </div>
            <div className="flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-teal-600" />
              <span>{current.windSpeedKmh || 12} km/h</span>
            </div>
            <div className="text-right font-bold text-slate-800">
              Rain: {current.rainfallChance}
            </div>
          </div>
        </div>

        {/* Harvest Window Intelligence Card */}
        <div className="glass-subcard-harvest rounded-2xl p-4 flex flex-col justify-between shadow-xs transition-all hover:border-emerald-300">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase text-emerald-900 font-extrabold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Agro-Harvesting Window
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase font-mono tracking-wider shadow-2xs ${
                current.harvestSuitability === 'OPTIMAL' || current.harvestSuitability === 'EXCELLENT'
                  ? 'bg-emerald-600 text-white'
                  : current.harvestSuitability === 'POSTPONE'
                  ? 'bg-rose-600 text-white'
                  : 'bg-amber-500 text-white'
              }`}>
                {current.harvestSuitability}
              </span>
            </div>

            <p className="text-xs text-emerald-950 font-semibold leading-relaxed mt-1">
              {current.agronomyTip}
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-emerald-300/60 text-[11px] text-emerald-900/90 font-medium flex items-center justify-between">
            <span>Rot & Spoilage Risk: <strong>{current.rainfallChance === '85%' ? 'HIGH' : current.rainfallChance === '55%' ? 'MODERATE' : 'MINIMAL'}</strong></span>
            <span className="font-mono text-[10px] text-emerald-800">Crops: Tomatoes, Onions, Potatoes</span>
          </div>
        </div>

        {/* Transport & Road Logistics Card */}
        <div className="glass-subcard-freight rounded-2xl p-4 flex flex-col justify-between shadow-xs transition-all hover:border-blue-300">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase text-blue-900 font-extrabold flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-blue-600" />
                Freight Corridor Status
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase font-mono tracking-wider shadow-2xs ${
                current.transportStatus === 'CLEAR' || current.transportStatus === 'EXCELLENT'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-600 text-white'
              }`}>
                {current.transportStatus.replace(/_/g, ' ')}
              </span>
            </div>

            <p className="text-xs text-blue-950 font-semibold leading-relaxed mt-1">
              {current.transportStatus === 'MUDDY_FEEDER_ROADS'
                ? 'Heavy soil saturation. Rural feeder roads to collection sheds are slick. Tarpaulins and 4WD trucks recommended.'
                : current.transportStatus === 'CAUTION_SLICK_ROADS'
                ? 'Light precipitation reported. Drive with caution along escarpment curves. Cargo tarpaulins required for open Canters.'
                : 'Arterial highways (A2, A104, Mombasa Highway) are completely dry and optimal for rapid freight dispatch.'}
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-blue-300/60 text-[11px] text-blue-900/90 font-medium flex items-center justify-between">
            <span>Cold-chain Need: <strong>{current.tempC > 26 ? 'HIGH (+22%)' : 'NORMAL'}</strong></span>
            <span className="font-mono text-[10px] text-blue-800">Speed Limit: 80 km/h</span>
          </div>
        </div>

      </div>
    </>
  )}
</div>
  );
}
