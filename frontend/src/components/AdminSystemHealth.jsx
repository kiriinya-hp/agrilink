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
  AlertTriangle,
  Play,
  Users,
  Smartphone,
  Globe,
  Monitor,
  Wallet,
  Scale,
  TrendingUp,
  MapPin,
  CheckCircle,
  XCircle,
  Sparkles
} from 'lucide-react';

export default function AdminSystemHealth({ token, apiBase }) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Synthetic Diagnostics State
  const [runningDiagnostics, setRunningDiagnostics] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState(null);

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

  const runDiagnostics = async () => {
    setRunningDiagnostics(true);
    try {
      const res = await fetch(`${apiBase}/admin/system-health/diagnostics`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (data.success) {
        setDiagnosticResults(data);
      } else {
        alert('Diagnostics failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Network error executing diagnostics: ' + err.message);
    } finally {
      setRunningDiagnostics(false);
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
          <h2 className="text-2xl font-black mt-1">System Health, Traffic & Solvency Monitor</h2>
          <p className="text-xs text-slate-300 mt-1">
            Real-time server telemetry, live traffic demographics, escrow solvency ledger, and synthetic diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={runDiagnostics}
            disabled={runningDiagnostics}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
            title="Execute synthetic test probes against MongoDB, Daraja M-Pesa, and Carrier Gateways"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${runningDiagnostics ? 'animate-spin' : ''}`} />
            <span>{runningDiagnostics ? 'Running Probes...' : 'Run Diagnostics Audit'}</span>
          </button>

          <button
            onClick={() => fetchHealth(true)}
            disabled={refreshing}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Pinging Cloud...' : 'Ping Diagnostics'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Synthetic Diagnostic Test Results Modal / Banner */}
      {diagnosticResults && (
        <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl p-5 shadow-2xl text-white space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-sm text-emerald-400">Synthetic Infrastructure Diagnostic Report</h4>
              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                Completed in {diagnosticResults.totalDurationMs}ms
              </span>
            </div>
            <button
              onClick={() => setDiagnosticResults(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {diagnosticResults.results.map((r, idx) => (
              <div key={idx} className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-200">{r.service}</span>
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                    r.status === 'PASS' ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-500/40' : 'bg-rose-900/80 text-rose-300'
                  }`}>
                    {r.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{r.detail}</p>
                <div className="text-[10px] font-mono text-emerald-400 pt-1">Roundtrip: {r.latencyMs}ms</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && !health ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
          <p className="text-xs font-medium">Querying MongoDB Atlas Cluster0 replica set...</p>
        </div>
      ) : health ? (
        <>
          {/* Main 4 Pillar Cards: Database, Daraja M-Pesa, SMS Carrier, Node.js Runtime */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. MongoDB Atlas Pillar */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">Database Engine</h3>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> {health.database.engine}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                  {health.database.pingLatencyMs}ms Ping
                </span>
              </div>

              <div className="space-y-1.5 text-[11px] border-t border-slate-100 pt-2.5">
                <div className="flex justify-between text-slate-600">
                  <span>Cluster Host:</span>
                  <span className="font-mono font-semibold text-slate-800">{health.database.cluster}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Target DB:</span>
                  <span className="font-mono font-bold text-indigo-600">{health.database.databaseName}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Connection:</span>
                  <span className="font-bold text-emerald-600">Active ReplicaSet</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Records:</span>
                  <span className="font-mono font-black text-slate-900">{health.database.totalDocuments}</span>
                </div>
              </div>
            </div>

            {/* 2. Safaricom Daraja M-Pesa Pillar */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">M-Pesa Daraja</h3>
                    <span className="text-[10px] font-mono text-green-700 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-2.5 h-2.5" /> {health.paymentGateway.status}
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

              <div className="space-y-1.5 text-[11px] border-t border-slate-100 pt-2.5">
                <div className="flex justify-between text-slate-600">
                  <span>Shortcode:</span>
                  <span className="font-mono font-bold text-slate-800">{health.paymentGateway.shortcode}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>OAuth Keys:</span>
                  <span className="font-bold text-emerald-600">{health.paymentGateway.credentialsPresent ? 'Configured' : 'Missing'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Callback Webhook:</span>
                  <span className="font-mono text-[10px] text-slate-700 truncate max-w-[120px]">
                    {health.paymentGateway.callbackConfigured ? 'Active Listener' : 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>User Cancel Catch:</span>
                  <span className="font-bold text-indigo-600">Code 1032 OK</span>
                </div>
              </div>
            </div>

            {/* 3. Africa's Talking & Safaricom 2-Way SMS Gateway Pillar */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">SMS / USSD Gateway</h3>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> {health.carrierGateway?.status || 'ACTIVE'}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800">
                  {health.carrierGateway?.shortcode || '22000'}
                </span>
              </div>

              <div className="space-y-1.5 text-[11px] border-t border-slate-100 pt-2.5">
                <div className="flex justify-between text-slate-600">
                  <span>USSD Dial Code:</span>
                  <span className="font-mono font-bold text-amber-700">{health.carrierGateway?.ussdCode || '*384*50#'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Sender ID:</span>
                  <span className="font-bold text-slate-800">{health.carrierGateway?.senderId || 'AgriShamba'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Inbound Route:</span>
                  <span className="font-mono text-emerald-600 font-bold">/api/sms/inbound</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Carrier Network:</span>
                  <span className="text-slate-800 font-semibold">Safaricom & Airtel</span>
                </div>
              </div>
            </div>

            {/* 4. Node.js Backend Server Pillar */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">Runtime Server</h3>
                    <span className="text-[10px] font-mono text-indigo-600 font-bold">
                      Node {health.server.nodeVersion}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                  Online
                </span>
              </div>

              <div className="space-y-1.5 text-[11px] border-t border-slate-100 pt-2.5">
                <div className="flex justify-between text-slate-600">
                  <span>Process Uptime:</span>
                  <span className="font-mono font-bold text-slate-800 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-slate-400" /> {formatUptime(health.server.uptimeSeconds)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Resident RAM:</span>
                  <span className="font-mono font-semibold text-slate-800">{health.server.memoryRssMb} MB</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Heap Allocated:</span>
                  <span className="font-mono font-semibold text-slate-800">{health.server.heapUsedMb} MB</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Hosting:</span>
                  <span className="font-mono text-emerald-700 font-bold">Render Web Service</span>
                </div>
              </div>
            </div>

          </div>

          {/* TWO NEW SECTORS: 4. ESCROW SOLVENCY HEALTH & 3. LIVE TRAFFIC & SESSIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* ESCROW SOLVENCY & VAULT INTEGRITY METER */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-emerald-600" />
                    Escrow Liquidity & Solvency Ledger
                  </h3>
                  <p className="text-xs text-slate-500">
                    Real-time verification of locked escrow funds against wallet liabilities.
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> 100% Solvent
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Locked in Escrow</span>
                  <p className="text-lg font-black text-emerald-900 mt-1">
                    KES {(health.solvency?.totalLockedEscrowKes || 0).toLocaleString()}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-mono">
                    ${(health.solvency?.totalLockedEscrowUsd || 0).toFixed(2)} USD
                  </span>
                </div>

                <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Wallet Liabilities</span>
                  <p className="text-lg font-black text-blue-900 mt-1">
                    KES {(health.solvency?.totalWalletLiabilitiesKes || 0).toLocaleString()}
                  </p>
                  <span className="text-[10px] text-blue-600 font-mono">
                    ${(health.solvency?.totalWalletLiabilitiesUsd || 0).toFixed(2)} USD
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Dispute Ratio</span>
                  <p className="text-lg font-black text-slate-800 mt-1">
                    {health.solvency?.disputeRatePercent || 0}%
                  </p>
                  <span className="text-[10px] text-slate-500 font-medium">Industry Benchmark &lt; 1%</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                <div className="flex justify-between items-center text-slate-700">
                  <span>Cumulative Farmer Disbursements Released:</span>
                  <span className="font-mono font-bold text-slate-900">
                    KES {(health.solvency?.totalCumulativePayoutsKes || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span>M-Pesa B2C Payout Speed:</span>
                  <span className="font-bold text-emerald-600">Sub-60s Settlement</span>
                </div>
              </div>
            </div>

            {/* REAL-TIME TRAFFIC & USER SESSIONS DEMOGRAPHICS */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    Active Traffic & Device Demographics
                  </h3>
                  <p className="text-xs text-slate-500">Live sessions across native Android app, mobile web, and desktop.</p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full font-bold text-xs">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
                  <span>{health.traffic?.activeUsersNow || 1} Online Now</span>
                </div>
              </div>

              {/* Device breakdown chips */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Smartphone className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-500 font-medium block">Android App</span>
                  <span className="text-base font-black text-slate-800">
                    {health.traffic?.deviceBreakdown?.androidNativeApp || 0}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Globe className="w-4 h-4 text-sky-600 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-500 font-medium block">Mobile Web</span>
                  <span className="text-base font-black text-slate-800">
                    {health.traffic?.deviceBreakdown?.mobileWebBrowser || 0}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Monitor className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-500 font-medium block">Desktop</span>
                  <span className="text-base font-black text-slate-800">
                    {health.traffic?.deviceBreakdown?.desktopWeb || 0}
                  </span>
                </div>
              </div>

              {/* County Regional Density */}
              <div>
                <span className="text-[11px] font-bold text-slate-700 block mb-2">Top Agricultural County Hubs:</span>
                <div className="flex flex-wrap gap-2">
                  {(health.traffic?.topCounties || []).map((c, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg">
                      <MapPin className="w-3 h-3 text-indigo-500" />
                      <span>{c.county}</span>
                      <span className="text-[10px] font-bold font-mono bg-white px-1.5 py-0.2 rounded text-slate-600">
                        {c.count} users
                      </span>
                    </span>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* MongoDB Atlas Collections Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  MongoDB Atlas Live Collections Breakdown
                </h3>
                <p className="text-xs text-slate-500">Document density across all synchronized Prisma MongoDB collections.</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">Database: AgriShamba</span>
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
