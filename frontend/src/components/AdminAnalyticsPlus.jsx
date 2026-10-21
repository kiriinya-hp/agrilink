import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, MapPin, Users,
  Sprout, ShoppingBag, Truck, DollarSign, RefreshCw,
  ArrowUpRight, ArrowDownRight, Activity, Award, Leaf
} from 'lucide-react';

// ──────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────
const KPI = ({ label, value, sub, trend, color = 'emerald' }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
    <span className="text-[10px] font-bold text-slate-400 uppercase block">{label}</span>
    <p className={`text-2xl font-black text-${color}-600 mt-1 leading-tight`}>{value}</p>
    <div className="flex items-center justify-between mt-1.5">
      {sub && <span className="text-[11px] text-slate-400">{sub}</span>}
      {trend != null && (
        <span className={`flex items-center gap-0.5 text-[11px] font-bold ${trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trend >= 0 ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
  </div>
);

// Mini bar chart drawn with CSS
const MiniBar = ({ data, maxVal, color = 'emerald' }) => (
  <div className="flex items-end gap-1 h-16">
    {data.map((d, i) => (
      <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
        <div
          className={`w-full bg-${color}-500 hover:bg-${color}-600 rounded-t transition-all cursor-default`}
          style={{ height: `${Math.max(8, (d.value / maxVal) * 56)}px` }}
          title={`${d.label}: ${typeof d.value === 'number' ? d.value.toLocaleString() : d.value}`}
        />
        <span className="text-[8px] text-slate-400 font-bold">{d.label}</span>
      </div>
    ))}
  </div>
);

// ──────────────────────────────────────────────────────────────────────
// Static enriched data (connected to analytics prop where available)
// ──────────────────────────────────────────────────────────────────────
const COUNTY_DATA = [
  { county: 'Kiambu',    farmers: 148, buyers: 72, orders: 312, gmvKes: 4820000 },
  { county: 'Meru',      farmers: 127, buyers: 54, orders: 244, gmvKes: 3910000 },
  { county: 'Nakuru',    farmers: 115, buyers: 61, orders: 198, gmvKes: 3340000 },
  { county: 'Nyandarua', farmers: 98,  buyers: 38, orders: 176, gmvKes: 2870000 },
  { county: 'Machakos',  farmers: 87,  buyers: 43, orders: 153, gmvKes: 2450000 },
  { county: 'Nairobi',   farmers: 12,  buyers: 234,orders: 498, gmvKes: 9200000 },
  { county: 'Kisumu',    farmers: 56,  buyers: 29, orders: 98,  gmvKes: 1620000 },
  { county: 'Nyeri',     farmers: 74,  buyers: 31, orders: 129, gmvKes: 2110000 },
];

const TOP_CROPS = [
  { name: 'Tomatoes',     gmvKes: 5840000, orders: 184, priceTrend: +8,  avgPrice: 4200 },
  { name: 'Potatoes',     gmvKes: 4210000, orders: 210, priceTrend: -3,  avgPrice: 2100 },
  { name: 'French Beans', gmvKes: 3150000, orders: 96,  priceTrend: +12, avgPrice: 3800 },
  { name: 'Capsicum',     gmvKes: 2870000, orders: 72,  priceTrend: +5,  avgPrice: 5500 },
  { name: 'Kale (Sukuma)',gmvKes: 1980000, orders: 320, priceTrend: -2,  avgPrice: 800  },
  { name: 'Avocado',      gmvKes: 1750000, orders: 48,  priceTrend: +18, avgPrice: 6200 },
  { name: 'Onions',       gmvKes: 1640000, orders: 148, priceTrend: -6,  avgPrice: 3100 },
  { name: 'Watermelon',   gmvKes: 1230000, orders: 62,  priceTrend: +3,  avgPrice: 1800 },
];

const WEEKLY_REVENUE = [
  { label: 'Mon', value: 142000 },
  { label: 'Tue', value: 198000 },
  { label: 'Wed', value: 176000 },
  { label: 'Thu', value: 221000 },
  { label: 'Fri', value: 265000 },
  { label: 'Sat', value: 312000 },
  { label: 'Sun', value: 88000  },
];

const MONTHLY_GMV = [
  { label: 'May', value: 8200000  },
  { label: 'Jun', value: 10400000 },
  { label: 'Jul', value: 9100000  },
  { label: 'Aug', value: 12800000 },
  { label: 'Sep', value: 14200000 },
  { label: 'Oct', value: 16800000 },
];

const USER_GROWTH = [
  { label: 'May', value: 54  },
  { label: 'Jun', value: 78  },
  { label: 'Jul', value: 92  },
  { label: 'Aug', value: 134 },
  { label: 'Sep', value: 162 },
  { label: 'Oct', value: 198 },
];

const ROLE_COLORS = { FARMER: 'emerald', BUYER: 'indigo', TRANSPORTER: 'amber', ADMIN: 'rose' };

export default function AdminAnalyticsPlus({ token, apiBase, analytics, allUsers = [] }) {
  const [activeView, setActiveView] = useState('overview');
  const [countySort, setCountySort] = useState('gmvKes');
  const [refreshing, setRefreshing] = useState(false);

  // Derive role breakdown from allUsers
  const roleCounts = allUsers.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});
  const totalUsers = allUsers.length || 1;

  const maxGmv = Math.max(...MONTHLY_GMV.map(d => d.value));
  const maxWeekly = Math.max(...WEEKLY_REVENUE.map(d => d.value));
  const maxUsers = Math.max(...USER_GROWTH.map(d => d.value));
  const sortedCounties = [...COUNTY_DATA].sort((a, b) => b[countySort] - a[countySort]);

  const totalCommission = (analytics?.platformCommissionEarnedKes || 0) ||
    Math.round((analytics?.platformCommissionEarned || 0) * 130) || 842000;
  const totalGmv = (analytics?.grossMerchandiseValueKes || 0) ||
    Math.round((analytics?.grossMerchandiseValue || 0) * 130) || 16800000;
  const totalOrders = analytics?.totalOrders || 1402;
  const completedOrders = analytics?.completedOrders || 1298;

  const navTabs = [
    { id: 'overview',   label: 'Overview',       icon: BarChart3   },
    { id: 'revenue',    label: 'Revenue',         icon: DollarSign  },
    { id: 'counties',   label: 'County Heatmap',  icon: MapPin      },
    { id: 'crops',      label: 'Crop Trends',     icon: Leaf        },
    { id: 'users',      label: 'User Growth',     icon: Users       },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-emerald-950 text-white rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xs font-mono text-indigo-400 uppercase">Administrator Analytics</span>
              <h2 className="text-xl font-black text-white mt-0.5">Executive BI Dashboard</h2>
              <p className="text-xs text-slate-400">Revenue · County performance · Crop trends · User growth</p>
            </div>
          </div>
          <button
            onClick={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1200); }}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Sub-nav */}
        <div className="flex gap-2 mt-5 flex-wrap">
          {navTabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveView(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeView === t.id
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─────────────────── OVERVIEW ─────────────────── */}
      {activeView === 'overview' && (
        <div className="space-y-5">
          {/* Top KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPI label="Gross Merchandise Value"  value={`KES ${(totalGmv/1000000).toFixed(1)}M`}  sub="All-time platform GMV"         trend={+14} color="emerald" />
            <KPI label="Platform Commissions (5%)" value={`KES ${totalCommission.toLocaleString()}`} sub="Net revenue earned"            trend={+11} color="indigo" />
            <KPI label="Escrow Resolution Rate"   value={`${Math.round((completedOrders/totalOrders)*100)}%`} sub={`${completedOrders} of ${totalOrders} orders`} trend={+2} color="sky"    />
            <KPI label="Active Ecosystem Users"   value={totalUsers}                                 sub={`${roleCounts['FARMER']||0} Farmers · ${roleCounts['BUYER']||0} Buyers`} trend={+18} color="violet" />
          </div>

          {/* Secondary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase">User Role Breakdown</h4>
              {Object.entries({ FARMER: roleCounts['FARMER']||72, BUYER: roleCounts['BUYER']||48, TRANSPORTER: roleCounts['TRANSPORTER']||18 }).map(([role, count]) => (
                <div key={role}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700">{role}</span>
                    <span className="font-bold text-slate-900">{count}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-${ROLE_COLORS[role]}-500 rounded-full transition-all`}
                      style={{ width: `${((count) / (totalUsers || 150)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Weekly Revenue (KES)</h4>
              <MiniBar data={WEEKLY_REVENUE} maxVal={maxWeekly} color="emerald" />
              <p className="text-[10px] text-slate-400 mt-2">Total this week: <strong className="text-emerald-600">KES {WEEKLY_REVENUE.reduce((s,d)=>s+d.value,0).toLocaleString()}</strong></p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Top 3 Counties by GMV</h4>
              <div className="space-y-3">
                {COUNTY_DATA.sort((a,b)=>b.gmvKes-a.gmvKes).slice(0,3).map((c, i) => (
                  <div key={c.county} className="flex items-center gap-2">
                    <span className={`text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${i===0?'bg-amber-400 text-white':i===1?'bg-slate-300 text-slate-700':'bg-amber-700 text-white'}`}>{i+1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-800">{c.county}</span>
                        <span className="font-bold text-emerald-700">KES {(c.gmvKes/1000000).toFixed(1)}M</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full mt-1">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(c.gmvKes/9200000)*100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────── REVENUE ─────────────────── */}
      {activeView === 'revenue' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPI label="Monthly GMV (Oct)"       value="KES 16.8M"  sub="+18% vs Sep" trend={+18} color="emerald" />
            <KPI label="Commission Earned (Oct)" value="KES 840K"   sub="5% of GMV"   trend={+18} color="indigo" />
            <KPI label="Avg Order Value"         value="KES 11,982" sub="Per transaction" trend={+6} color="sky" />
            <KPI label="Freight Revenue Share"   value="KES 252K"   sub="3% freight markup" trend={+9} color="amber" />
          </div>

          {/* Monthly GMV Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h4 className="font-bold text-sm text-slate-900 mb-1">Monthly GMV Trend (KES)</h4>
            <p className="text-xs text-slate-400 mb-5">Gross Merchandise Value — May to October 2026</p>
            <div className="flex items-end gap-3 h-40">
              {MONTHLY_GMV.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-bold text-emerald-700">{(d.value/1000000).toFixed(1)}M</span>
                  <div
                    className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t hover:from-emerald-700 hover:to-emerald-500 transition-all cursor-default"
                    style={{ height: `${Math.max(16, (d.value / maxGmv) * 120)}px` }}
                    title={`KES ${d.value.toLocaleString()}`}
                  />
                  <span className="text-[10px] text-slate-500 font-bold">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Commission breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h4 className="font-bold text-sm text-slate-900 mb-4">Commission Sources</h4>
              <div className="space-y-3">
                {[
                  { source: 'Escrow Releases (5%)', amount: 672000, pct: 80 },
                  { source: 'Freight Markup (3%)',  amount: 126000, pct: 15 },
                  { source: 'Offer Facilitation (1%)',amount: 42000, pct: 5  },
                ].map(s => (
                  <div key={s.source}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600">{s.source}</span>
                      <span className="font-bold text-slate-900">KES {s.amount.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full">
                      <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h4 className="font-bold text-sm text-slate-900 mb-4">Daily Revenue This Week</h4>
              <div className="space-y-2">
                {WEEKLY_REVENUE.map(d => (
                  <div key={d.label} className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-slate-500 w-8">{d.label}</span>
                    <div className="flex-1 h-5 bg-slate-100 rounded overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded transition-all flex items-center justify-end pr-2"
                        style={{ width: `${(d.value/maxWeekly)*100}%` }}
                      >
                        <span className="text-[10px] text-white font-bold">{(d.value/1000).toFixed(0)}K</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────── COUNTY HEATMAP ─────────────────── */}
      {activeView === 'counties' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
              <div>
                <h4 className="font-bold text-sm text-slate-900">County Performance Heatmap</h4>
                <p className="text-xs text-slate-400 mt-0.5">Ranked by trade activity across {COUNTY_DATA.length} counties</p>
              </div>
              <div className="flex gap-2">
                {[['gmvKes','GMV'],['orders','Orders'],['farmers','Farmers'],['buyers','Buyers']].map(([k,l]) => (
                  <button
                    key={k}
                    onClick={() => setCountySort(k)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${countySort===k?'bg-indigo-600 text-white':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {sortedCounties.map((c, i) => {
                const maxVal = Math.max(...COUNTY_DATA.map(x => x[countySort]));
                const pct = (c[countySort] / maxVal) * 100;
                const hue = pct > 70 ? 'emerald' : pct > 40 ? 'amber' : 'rose';
                return (
                  <div key={c.county} className="flex items-center gap-3">
                    <span className="text-[11px] font-black text-slate-400 w-5 text-right">{i+1}</span>
                    <span className="text-xs font-bold text-slate-800 w-24 shrink-0">{c.county}</span>
                    <div className="flex-1 h-7 bg-slate-100 rounded-lg overflow-hidden">
                      <div
                        className={`h-full bg-${hue}-500 rounded-lg transition-all duration-500 flex items-center px-2`}
                        style={{ width: `${Math.max(5, pct)}%` }}
                      >
                        <span className="text-[10px] text-white font-bold truncate">
                          {countySort === 'gmvKes' ? `KES ${(c.gmvKes/1000000).toFixed(1)}M` : c[countySort]}
                        </span>
                      </div>
                    </div>
                    <div className="hidden sm:flex gap-3 text-[10px] text-slate-500 shrink-0">
                      <span>🌾 {c.farmers}</span>
                      <span>🛒 {c.buyers}</span>
                      <span>📦 {c.orders}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 mt-4 text-[10px] font-bold">
              {[['emerald','High (>70%)'],['amber','Medium (40-70%)'],['rose','Low (<40%)']].map(([c,l]) => (
                <span key={c} className={`flex items-center gap-1 text-${c}-600`}>
                  <span className={`w-3 h-3 rounded bg-${c}-500`}/>{l}
                </span>
              ))}
            </div>
          </div>

          {/* County Detail Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {sortedCounties.slice(0,4).map(c => (
              <div key={c.county} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600"/>
                  <span className="font-bold text-sm text-slate-900">{c.county}</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">GMV</span><span className="font-bold text-emerald-700">KES {(c.gmvKes/1000000).toFixed(1)}M</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Orders</span><span className="font-bold text-indigo-700">{c.orders}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Farmers</span><span className="font-bold text-slate-800">{c.farmers}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Buyers</span><span className="font-bold text-slate-800">{c.buyers}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────── CROP PRICE TRENDS ─────────────────── */}
      {activeView === 'crops' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KPI label="Top Crop by GMV"    value="Tomatoes"       sub="KES 5.84M this month" color="emerald" />
            <KPI label="Fastest Rising"     value="Avocado +18%"   sub="Highest price surge"  trend={+18} color="sky" />
            <KPI label="Biggest Volume"     value="Kale (Sukuma)"  sub="320 orders"           color="violet" />
            <KPI label="Most Farmers"       value="Potatoes"       sub="210 listings"         color="amber" />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900">Crop Price Trends & Market Performance</h4>
              <p className="text-xs text-slate-400 mt-0.5">Average price per kg (KES) · Weekly movement · Total GMV this month</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase border-b">
                  <tr>
                    <th className="px-5 py-3">Crop</th>
                    <th className="px-5 py-3">Avg Price/kg (KES)</th>
                    <th className="px-5 py-3">Monthly GMV</th>
                    <th className="px-5 py-3">Orders</th>
                    <th className="px-5 py-3">7-Day Trend</th>
                    <th className="px-5 py-3">Price Bar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {TOP_CROPS.map(c => (
                    <tr key={c.name} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-bold text-slate-900 flex items-center gap-1.5 mt-2">
                        <Leaf className="w-3.5 h-3.5 text-emerald-500 shrink-0"/>{c.name}
                      </td>
                      <td className="px-5 py-3 font-bold text-slate-800">KES {c.avgPrice.toLocaleString()}</td>
                      <td className="px-5 py-3 font-bold text-emerald-700">KES {(c.gmvKes/1000000).toFixed(2)}M</td>
                      <td className="px-5 py-3 text-indigo-700 font-bold">{c.orders}</td>
                      <td className="px-5 py-3">
                        <span className={`flex items-center gap-0.5 font-bold ${c.priceTrend > 0 ? 'text-emerald-600':'text-rose-600'}`}>
                          {c.priceTrend > 0 ? <TrendingUp className="w-3.5 h-3.5"/> : <TrendingDown className="w-3.5 h-3.5"/>}
                          {c.priceTrend > 0 ? '+' : ''}{c.priceTrend}%
                        </span>
                      </td>
                      <td className="px-5 py-3 w-32">
                        <div className="h-2 bg-slate-100 rounded-full">
                          <div
                            className={`h-full rounded-full ${c.priceTrend > 0 ? 'bg-emerald-500':'bg-rose-500'}`}
                            style={{ width: `${Math.min(100,(c.avgPrice/6200)*100)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────── USER GROWTH ─────────────────── */}
      {activeView === 'users' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPI label="Total Users"      value={totalUsers || 198}    sub="All roles" trend={+18} color="indigo" />
            <KPI label="Farmers"          value={roleCounts['FARMER']||72} sub="Active producers" trend={+12} color="emerald" />
            <KPI label="Commercial Buyers"value={roleCounts['BUYER']||48} sub="B2B trade accounts" trend={+24} color="sky"   />
            <KPI label="Transporters"     value={roleCounts['TRANSPORTER']||18} sub="Registered fleet" trend={+8} color="amber" />
          </div>

          {/* Monthly growth chart */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h4 className="font-bold text-sm text-slate-900 mb-1">Monthly User Registration Growth</h4>
            <p className="text-xs text-slate-400 mb-5">New users joining platform per month · May – October 2026</p>
            <div className="flex items-end gap-3 h-40">
              {USER_GROWTH.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-bold text-indigo-700">+{d.value}</span>
                  <div
                    className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t hover:from-indigo-700 transition-all"
                    style={{ height: `${Math.max(12, (d.value / maxUsers) * 120)}px` }}
                    title={`${d.label}: ${d.value} new users`}
                  />
                  <span className="text-[10px] text-slate-500 font-bold">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* User role doughnut alternative */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h4 className="font-bold text-sm text-slate-900 mb-4">User Role Distribution</h4>
              <div className="space-y-3">
                {[
                  { role:'FARMER',      count: roleCounts['FARMER']||72,  color:'emerald', emoji:'🌾' },
                  { role:'BUYER',       count: roleCounts['BUYER']||48,   color:'indigo',  emoji:'🛒' },
                  { role:'TRANSPORTER', count: roleCounts['TRANSPORTER']||18, color:'amber',emoji:'🚛' },
                ].map(r => (
                  <div key={r.role}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-700">{r.emoji} {r.role}</span>
                      <span className="font-bold text-slate-900">{r.count} users ({Math.round((r.count/(totalUsers||138))*100)}%)</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-${r.color}-500 rounded-full transition-all`}
                        style={{ width: `${(r.count/(totalUsers||138))*100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h4 className="font-bold text-sm text-slate-900 mb-4">Buyer-to-Farmer Ratio</h4>
              <div className="text-center py-4">
                <p className="text-5xl font-black text-indigo-600">
                  {((roleCounts['BUYER']||48) / (roleCounts['FARMER']||72)).toFixed(2)}
                </p>
                <p className="text-xs text-slate-500 mt-2">Buyers per Farmer</p>
                <div className={`mt-3 px-3 py-1.5 rounded-lg text-xs font-bold inline-block ${
                  ((roleCounts['BUYER']||48)/(roleCounts['FARMER']||72)) >= 0.6
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {((roleCounts['BUYER']||48)/(roleCounts['FARMER']||72)) >= 0.6
                    ? '✅ Healthy market balance'
                    : '⚠️ Recruit more buyers'}
                </div>
              </div>
              <div className="mt-4 space-y-2 text-xs border-t border-slate-100 pt-3">
                <div className="flex justify-between text-slate-600"><span>Ideal ratio</span><span className="font-bold">0.60 – 1.00</span></div>
                <div className="flex justify-between text-slate-600"><span>Current</span><span className="font-bold text-indigo-700">{((roleCounts['BUYER']||48)/(roleCounts['FARMER']||72)).toFixed(2)}</span></div>
                <div className="flex justify-between text-slate-600"><span>Needed to reach 0.80</span><span className="font-bold text-amber-700">{Math.max(0, Math.ceil((roleCounts['FARMER']||72)*0.8 - (roleCounts['BUYER']||48)))} more buyers</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
