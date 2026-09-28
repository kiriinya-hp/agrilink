import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Navigation, 
  MapPin, 
  Truck, 
  Compass, 
  Radio, 
  Maximize2, 
  Layers, 
  AlertCircle, 
  CheckCircle2, 
  Gauge, 
  Clock, 
  ThermometerSnowflake,
  Play,
  Pause,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';

// Pre-mapped Kenyan agricultural hubs and wholesale depots
const KENYA_COORDINATES = {
  nairobi: [-1.286389, 36.817223],
  meru: [0.0463, 37.6559],
  nyandarua: [-0.2700, 36.3800],
  nakuru: [-0.3031, 36.0800],
  eldoret: [0.5143, 35.2698],
  mombasa: [-4.0435, 39.6682],
  kisumu: [-0.0917, 34.7680],
  kiambu: [-1.1714, 36.8356],
  machakos: [-1.5177, 37.2634],
  thika: [-1.0333, 37.0694],
  naivasha: [-0.7167, 36.4333]
};

function resolveCoordinate(locationName, fallbackCoord) {
  if (!locationName) return fallbackCoord;
  const lower = locationName.toLowerCase();
  for (const [key, coord] of Object.entries(KENYA_COORDINATES)) {
    if (lower.includes(key)) return coord;
  }
  return fallbackCoord;
}

export default function DriverLiveMap({ activeShipment, availableShipments = [], user }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const truckMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const animFrameRef = useRef(null);

  const [isSimulating, setIsSimulating] = useState(true);
  const [progress, setProgress] = useState(0.45); // 45% along route
  const [speed, setSpeed] = useState(64);
  const [cargoTemp, setCargoTemp] = useState(4.2);
  const [etaMins, setEtaMins] = useState(42);
  const [distanceKm, setDistanceKm] = useState(48.5);
  const [mapStyle, setMapStyle] = useState('standard'); // 'standard' or 'topo'

  // Determine current active delivery or default corridor
  const shipment = activeShipment || (availableShipments.length > 0 ? availableShipments[0] : null);

  const pickupCoord = resolveCoordinate(shipment?.pickupLocation, KENYA_COORDINATES.meru);
  const dropoffCoord = resolveCoordinate(shipment?.dropoffLocation, KENYA_COORDINATES.nairobi);

  // Initialize Leaflet OpenStreetMap (100% Free - No API keys or billing needed)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Center map midway between pickup and dropoff
    const midLat = (pickupCoord[0] + dropoffCoord[0]) / 2;
    const midLng = (pickupCoord[1] + dropoffCoord[1]) / 2;

    const map = L.map(mapContainerRef.current, {
      center: [midLat, midLng],
      zoom: 9,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Free OpenStreetMap tile server
    const tileUrl = mapStyle === 'topo'
      ? 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Custom HTML Icons
    const farmIcon = L.divIcon({
      className: 'custom-farm-marker',
      html: `
        <div style="background-color: #10b981; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(16,185,129,0.5); border: 2px solid white; font-weight: bold; font-size: 14px;">
          🌾
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    const buyerIcon = L.divIcon({
      className: 'custom-buyer-marker',
      html: `
        <div style="background-color: #2563eb; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(37,99,235,0.5); border: 2px solid white; font-weight: bold; font-size: 14px;">
          🏢
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    const truckIcon = L.divIcon({
      className: 'custom-truck-marker',
      html: `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; inset: 0; background-color: rgba(245, 158, 11, 0.35); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="background-color: #f59e0b; color: white; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 14px rgba(245,158,11,0.6); border: 2.5px solid white; font-size: 18px;">
            🚚
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    // Add Markers
    L.marker(pickupCoord, { icon: farmIcon })
      .addTo(map)
      .bindPopup(`<b>Farm Pickup Point</b><br>${shipment?.pickupLocation || 'Central Farm Hub'}<br>Produce: ${shipment?.order?.items?.[0]?.cropName || 'Fresh Crops'}`);

    L.marker(dropoffCoord, { icon: buyerIcon })
      .addTo(map)
      .bindPopup(`<b>Buyer Depot Dropoff</b><br>${shipment?.dropoffLocation || 'Nairobi Central Depot'}`);

    // Create polyline route connecting pickup, midpoint, and dropoff
    const intermediateCoord = [
      pickupCoord[0] + (dropoffCoord[0] - pickupCoord[0]) * 0.5 + 0.05,
      pickupCoord[1] + (dropoffCoord[1] - pickupCoord[1]) * 0.5 - 0.03
    ];

    const routePoints = [pickupCoord, intermediateCoord, dropoffCoord];

    const polyline = L.polyline(routePoints, {
      color: '#10b981',
      weight: 5,
      opacity: 0.85,
      dashArray: '10, 10'
    }).addTo(map);

    routePolylineRef.current = polyline;

    // Place truck marker at progress point
    const curLat = pickupCoord[0] + (dropoffCoord[0] - pickupCoord[0]) * progress;
    const curLng = pickupCoord[1] + (dropoffCoord[1] - pickupCoord[1]) * progress;

    const truckMarker = L.marker([curLat, curLng], { icon: truckIcon })
      .addTo(map)
      .bindPopup(`<b>Driver Vehicle En Route</b><br>Speed: ${speed} km/h<br>Vehicle: ${user?.businessName || 'KBZ 500M'}`);

    truckMarkerRef.current = truckMarker;
    mapInstanceRef.current = map;

    // Fit bounds to fit route nicely
    map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapStyle, shipment?.pickupLocation, shipment?.dropoffLocation]);

  // Live GPS simulation loop
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev >= 0.95 ? 0.1 : prev + 0.015;
        
        // Update truck position on map
        if (truckMarkerRef.current) {
          const lat = pickupCoord[0] + (dropoffCoord[0] - pickupCoord[0]) * next;
          const lng = pickupCoord[1] + (dropoffCoord[1] - pickupCoord[1]) * next;
          truckMarkerRef.current.setLatLng([lat, lng]);
        }

        // Dynamically adjust telemetry
        const remainingDist = Math.max(2, (1 - next) * 115).toFixed(1);
        setDistanceKm(parseFloat(remainingDist));
        setEtaMins(Math.max(3, Math.round(remainingDist * 0.9)));
        setSpeed(Math.floor(58 + Math.random() * 12));
        setCargoTemp((3.8 + Math.random() * 0.8).toFixed(1));

        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulating, pickupCoord, dropoffCoord]);

  const recenterMap = () => {
    if (mapInstanceRef.current && routePolylineRef.current) {
      mapInstanceRef.current.fitBounds(routePolylineRef.current.getBounds(), { padding: [40, 40] });
    }
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-200 mb-6">
      
      {/* Top Map Control Bar */}
      <div className="p-4 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-white">Live Geographic GPS & Freight Corridor</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                100% FREE OSM RADAR
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Active Corridor: <strong className="text-slate-200">{shipment?.pickupLocation || 'Meru'}</strong> $\rightarrow$ <strong className="text-slate-200">{shipment?.dropoffLocation || 'Nairobi'}</strong>
            </p>
          </div>
        </div>

        {/* Telemetry Chips & Action Controls */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              isSimulating
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimulating ? 'Simulating GPS' : 'Resume GPS'}</span>
          </button>

          <button
            onClick={recenterMap}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all"
            title="Recenter Map View"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Recenter</span>
          </button>

          <button
            onClick={() => setMapStyle(mapStyle === 'standard' ? 'topo' : 'standard')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all"
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">{mapStyle === 'standard' ? 'Topo Map' : 'Street Map'}</span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative">
        <div 
          ref={mapContainerRef} 
          className="w-full h-80 sm:h-96 bg-slate-100 z-10"
        />

        {/* Floating Telemetry HUD Overlay */}
        <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-2 pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl shadow-lg border border-slate-700/80 flex items-center gap-2 text-xs">
            <Gauge className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Vehicle Speed</span>
              <span className="font-extrabold font-mono text-emerald-400">{speed} km/h</span>
            </div>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl shadow-lg border border-slate-700/80 flex items-center gap-2 text-xs">
            <Clock className="w-4 h-4 text-blue-400" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">ETA Dropoff</span>
              <span className="font-extrabold font-mono text-blue-300">{etaMins} mins</span>
            </div>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl shadow-lg border border-slate-700/80 flex items-center gap-2 text-xs">
            <ThermometerSnowflake className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Cold-Chain Cargo</span>
              <span className="font-extrabold font-mono text-cyan-300">{cargoTemp}°C</span>
            </div>
          </div>
        </div>

        {/* Live OTP Reminder Floating Pill */}
        {shipment?.confirmationOtp && (
          <div className="absolute bottom-3 left-3 z-20 bg-emerald-950/90 backdrop-blur-md text-emerald-100 px-3.5 py-2 rounded-2xl shadow-xl border border-emerald-500/40 flex items-center gap-2 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-mono text-emerald-300 block">Buyer Delivery OTP</span>
              <span className="font-mono font-black text-sm text-white tracking-widest">{shipment.confirmationOtp}</span>
            </div>
          </div>
        )}

      </div>

      {/* Map Footer Bar: Route Milestones */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-semibold text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Pickup: {shipment?.pickupLocation || 'Farm Hub'}
          </span>
          <span className="text-slate-300">$\rightarrow$</span>
          <span className="flex items-center gap-1 font-semibold text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Dropoff: {shipment?.dropoffLocation || 'Nairobi Central'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-500 text-[11px]">
          <span>Remaining Distance: <strong>{distanceKm} km</strong></span>
          <span>·</span>
          <span>Corridor: <strong>A2 Highway / Thika Superhighway</strong></span>
        </div>
      </div>

    </div>
  );
}
