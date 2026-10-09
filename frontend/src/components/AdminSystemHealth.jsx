import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Server, 
  Activity, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  Cpu, 
  HardDrive, 
  Layers, 
  Radio, 
  ExternalLink,
  Clock,
  AlertTriangle
} from 'lucide-react';

export default function AdminSystemHealth({ token, apiBase }) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchHealth = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/admin/system-health`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setHealth(data);
      } else {
        setError(data.error || 'Failed to fetch system telemetry');
      }
    } catch (err) {
      setError(err.message || 'Network error reaching telemetry gateway');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(() => fetchHealth(), 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, [token, apiBase]);

  const formatUptime = (secs) => {
    if (!secs) return '0s';
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${s}s`;
    if (mins > 0) return `${mins}m ${s}s`;
    return `${s}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-900/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">Live Infrastructure Telemetry</span>
          </div>
          <h2 className="text-2xl font-black mt-1">MongoDB Atlas & Daraja System Monitor</h2>
          <p className="text-xs text-slate-300 mt-1">
            Real-time health heartbeat, database connection latency, collection volumes, and payment gateways.
          </p>
        </div>

        <button
          onClick={() => fetchHealth(true)}
          disabled={refreshing}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Pinging Cloud...' : 'Ping Diagnostics Now'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && !health ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
          <p className="text-xs font-medium">Querying MongoDB Atlas Cluster0 replica set...</p>
        </div>
      ) : health ? (
        <>
          {/* Main 3 Pillar Cards: Database, Daraja M-Pesa, Node.js Runtime */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. MongoDB Atlas Pillar */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Database Engine</h3>
                    <span className="text-[11px] font-mono text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {health.database.engine}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                  {health.database.pingLatencyMs}ms Ping
                </span>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                <div className="flex justify-between text-slate-600">
                  <span>Cluster Host:</span>
                  <span className="font-mono font-semibold text-slate-800">{health.database.cluster}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Target Database:</span>
                  <span className="font-mono font-bold text-indigo-600">{health.database.databaseName}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Connection State:</span>
                  <span className="font-bold text-emerald-600">Active ReplicaSet</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Documents:</span>
                  <span className="font-mono font-black text-slate-900">{health.database.totalDocuments} records</span>
                </div>
              </div>
            </div>

            {/* 2. Safaricom Daraja M-Pesa Pillar */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">M-Pesa Daraja Gateway</h3>
                    <span className="text-[11px] font-mono text-green-700 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> {health.paymentGateway.status}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  health.paymentGateway.environment === 'production' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {health.paymentGateway.environment.toUpperCase()}
                </span>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                <div className="flex justify-between text-slate-600">
                  <span>Paybill / Shortcode:</span>
                  <span className="font-mono font-bold text-slate-800">{health.paymentGateway.shortcode}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>STK Push Keys:</span>
                  <span className="font-bold text-emerald-600">{health.paymentGateway.credentialsPresent ? 'Configured (OAuth OK)' : 'Missing'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Webhook Callback:</span>
                  <span className="font-mono text-[10px] text-slate-700 truncate max-w-[160px]" title={health.paymentGateway.callbackUrl}>
                    {health.paymentGateway.callbackConfigured ? 'Active Listener' : 'Pending URL'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>STK Cancellation Catch:</span>
                  <span className="font-bold text-indigo-600">Enabled (Code 1032)</span>
                </div>
              </div>
            </div>

            {/* 3. Node.js Backend Server Pillar */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Application Server</h3>
                    <span className="text-[11px] font-mono text-indigo-600 font-bold">
                      Node {health.server.nodeVersion}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                  Online
                </span>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                <div className="flex justify-between text-slate-600">
                  <span>Process Uptime:</span>
                  <span className="font-mono font-bold text-slate-800 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> {formatUptime(health.server.uptimeSeconds)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Resident RAM (RSS):</span>
                  <span className="font-mono font-semibold text-slate-800">{health.server.memoryRssMb} MB</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Heap Memory Allocated:</span>
                  <span className="font-mono font-semibold text-slate-800">{health.server.heapUsedMb} MB</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Environment Host:</span>
                  <span className="font-mono text-emerald-700 font-bold">Render Web Service</span>
                </div>
              </div>
            </div>
          </div>

          {/* MongoDB Atlas Collections Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  MongoDB Atlas Live Collections Breakdown
                </h3>
                <p className="text-xs text-slate-500">Document density across all synchronized Prisma MongoDB collections.</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">Database: Mazao Hub</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Users</span>
                <p className="text-2xl font-black text-slate-800 mt-1">{health.database.collections.users}</p>
                <span className="text-[10px] text-slate-400">Stakeholders</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Listings</span>
                <p className="text-2xl font-black text-emerald-600 mt-1">{health.database.collections.produceListings}</p>
                <span className="text-[10px] text-slate-400">Active Crops</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Orders</span>
                <p className="text-2xl font-black text-blue-600 mt-1">{health.database.collections.orders}</p>
                <span className="text-[10px] text-slate-400">Transactions</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Escrows</span>
                <p className="text-2xl font-black text-amber-600 mt-1">{health.database.collections.escrowTransactions}</p>
                <span className="text-[10px] text-slate-400">Vault Holdings</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Shipments</span>
                <p className="text-2xl font-black text-indigo-600 mt-1">{health.database.collections.shipments}</p>
                <span className="text-[10px] text-slate-400">Freight Cargo</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Notifications</span>
                <p className="text-2xl font-black text-purple-600 mt-1">{health.database.collections.notifications}</p>
                <span className="text-[10px] text-slate-400">Live Alerts</span>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
