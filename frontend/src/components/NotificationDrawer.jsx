import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Mail,
  MessageSquare,
  Phone,
  X,
  CheckCheck,
  ShieldCheck,
  Truck,
  Trash2,
  Copy,
  Check,
  Volume2,
  VolumeX,
  FileText,
  Milk,
  Egg,
  Leaf,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Info
} from 'lucide-react';

/* ─── Notification chime (Web Audio, no assets needed) ─────────────────────── */
function playSynthesizedChime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx  = new Ctx();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(783.99, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.20);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    [osc1, osc2].forEach(o => { o.connect(gain); o.start(); o.stop(ctx.currentTime + 0.4); });
    gain.connect(ctx.destination);
  } catch {}
}

/* ─── Category detection helpers ───────────────────────────────────────────── */
function classifyNotification(n) {
  const t = ([(n.type || ''), (n.title || ''), (n.message || '')].join(' ')).toLowerCase();
  if (t.includes('escrow') || t.includes('wallet') || t.includes('payout') || t.includes('fund') || t.includes('disburse')) return 'ESCROW';
  if (t.includes('order') || t.includes('delivery') || t.includes('otp') || t.includes('cargo') || t.includes('shipment')) return 'ORDERS';
  if (t.includes('dairy') || t.includes('milk') || t.includes('yoghurt')) return 'DAIRY';
  if (t.includes('livestock') || t.includes('cattle') || t.includes('goat') || t.includes('sheep') || t.includes('pig') || t.includes('heifer')) return 'LIVESTOCK';
  if (t.includes('poultry') || t.includes('chicken') || t.includes('egg') || t.includes('layer') || t.includes('broiler') || t.includes('kienyeji')) return 'POULTRY';
  if (t.includes('fodder') || t.includes('hay') || t.includes('silage') || t.includes('lucerne') || t.includes('pollard')) return 'FODDER';
  if (t.includes('system') || t.includes('weather') || t.includes('price') || t.includes('harvest') || t.includes('broadcast') || t.includes('alert')) return 'SYSTEM';
  return 'SYSTEM';
}

/* ─── Category config ───────────────────────────────────────────────────────── */
const CATEGORIES = {
  ALL:       { label: '🔔 All',       active: 'bg-emerald-600 text-white',       dot: 'bg-emerald-500' },
  ESCROW:    { label: '💰 Escrow',    active: 'bg-amber-600 text-white',          dot: 'bg-amber-500'   },
  ORDERS:    { label: '📦 Orders',    active: 'bg-emerald-700 text-white',        dot: 'bg-emerald-600' },
  DAIRY:     { label: '🥛 Dairy',     active: 'bg-sky-600 text-white',            dot: 'bg-sky-500'     },
  LIVESTOCK: { label: '🐄 Livestock', active: 'bg-lime-700 text-white',           dot: 'bg-lime-500'    },
  POULTRY:   { label: '🐔 Poultry',   active: 'bg-orange-600 text-white',         dot: 'bg-orange-500'  },
  FODDER:    { label: '🌿 Fodder',    active: 'bg-teal-700 text-white',           dot: 'bg-teal-500'    },
  SYSTEM:    { label: '🌾 System',    active: 'bg-indigo-700 text-white',         dot: 'bg-indigo-500'  },
};

/* ─── Card icon resolver ────────────────────────────────────────────────────── */
function getCategoryIcon(cat) {
  switch (cat) {
    case 'ESCROW':    return <ShieldCheck className="w-4 h-4 text-amber-500" />;
    case 'ORDERS':    return <Truck className="w-4 h-4 text-emerald-600" />;
    case 'DAIRY':     return <Milk className="w-4 h-4 text-sky-500" />;
    case 'LIVESTOCK': return <Leaf className="w-4 h-4 text-lime-600" />;
    case 'POULTRY':   return <Egg className="w-4 h-4 text-orange-500" />;
    case 'FODDER':    return <Leaf className="w-4 h-4 text-teal-500" />;
    default:          return <Bell className="w-4 h-4 text-indigo-500" />;
  }
}

/* ─── Relative time ─────────────────────────────────────────────────────────── */
function relativeTime(iso) {
  if (!iso) return 'Now';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000)  return 'Just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(iso).toLocaleDateString([], { day: 'numeric', month: 'short' });
}

/* ════════════════════════════════════════════════════════════════════════════════
   NotificationDrawer
   ═══════════════════════════════════════════════════════════════════════════════ */
export default function NotificationDrawer({
  isOpen,
  onClose,
  notifications = [],
  onMarkAllRead,
  onDeleteNotification,
  onOpenOrderInvoice,
  onRefresh,           // optional: async fn to re-fetch from server
}) {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [soundEnabled,   setSoundEnabled]   = useState(true);
  const [copiedOtpId,    setCopiedOtpId]    = useState(null);
  const [readLocally,    setReadLocally]    = useState(new Set()); // ids marked read optimistically
  const [refreshing,     setRefreshing]     = useState(false);
  const listRef = useRef(null);

  /* Reset scroll & category when opened */
  useEffect(() => {
    if (isOpen) {
      setActiveCategory('ALL');
      setTimeout(() => listRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  /* ─── Handlers ─────────────────────────────────────────────────── */
  const handleCopyOtp = (text, id) => {
    const m = text.match(/\b\d{4,6}\b/);
    if (!m) return;
    navigator.clipboard?.writeText(m[0]);
    setCopiedOtpId(id);
    try { if (navigator?.vibrate) navigator.vibrate(30); } catch {}
    setTimeout(() => setCopiedOtpId(null), 2000);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) playSynthesizedChime();
  };

  const handleMarkSingleRead = (id) => {
    setReadLocally(prev => new Set([...prev, id]));
  };

  const handleRefresh = async () => {
    if (!onRefresh || refreshing) return;
    setRefreshing(true);
    await onRefresh().catch(() => {});
    setRefreshing(false);
    if (soundEnabled) playSynthesizedChime();
  };

  /* ─── Filtering ─────────────────────────────────────────────────── */
  const withCategory = notifications.map(n => ({ ...n, _cat: classifyNotification(n) }));

  const filtered = withCategory.filter(n =>
    activeCategory === 'ALL' ? true : n._cat === activeCategory
  );

  /* ─── Badge counts ──────────────────────────────────────────────── */
  const counts = {};
  Object.keys(CATEGORIES).forEach(k => {
    counts[k] = k === 'ALL'
      ? notifications.length
      : withCategory.filter(n => n._cat === k).length;
  });

  /* ─── Unread count (local read state layered on top) ────────────── */
  const unreadCount = notifications.filter(n => !n.read && !readLocally.has(n.id)).length;

  /* ═══ RENDER ══════════════════════════════════════════════════════ */
  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex flex-col justify-end sm:justify-start">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Container: Bottom-sheet on mobile, right sidebar on ≥sm */}
      <div className="relative w-full sm:w-auto sm:fixed sm:inset-y-0 sm:right-0 sm:max-w-md flex flex-col z-10">
        <div className="w-full sm:w-[420px] bg-white sm:h-full max-h-[92vh] sm:max-h-none rounded-t-3xl sm:rounded-none shadow-2xl flex flex-col overflow-hidden border-t sm:border-t-0 sm:border-l border-slate-200">

          {/* Mobile drag indicator */}
          <div className="w-full pt-2 pb-1 flex justify-center sm:hidden">
            <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
          </div>

          {/* ── Header ──────────────────────────────────────────────── */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-emerald-50/40">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  Notification Center
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black">
                      {unreadCount} new
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-500">Escrow · Orders · Livestock · System Alerts</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Refresh */}
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                title="Refresh notifications"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-500' : ''}`} />
              </button>
              {/* Sound toggle */}
              <button
                type="button"
                onClick={handleToggleSound}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title={soundEnabled ? 'Mute chime' : 'Enable chime'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
              </button>
              {/* Close */}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ── Category Filter Scrollable Pills ────────────────────── */}
          <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {Object.entries(CATEGORIES).map(([key, cfg]) => {
              const count = counts[key];
              if (count === 0 && key !== 'ALL') return null; // hide empty animal tabs
              return (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`px-2.5 py-1 rounded-full font-bold whitespace-nowrap transition-all text-[11px] flex items-center gap-1 flex-shrink-0 ${
                    activeCategory === key
                      ? cfg.active + ' shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <span>{cfg.label}</span>
                  {count > 0 && (
                    <span className={`text-[9px] font-black px-1 rounded-full ${
                      activeCategory === key ? 'bg-black/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Subheader Toolbar ───────────────────────────────────── */}
          <div className="px-5 py-2 bg-white border-b border-slate-100 flex justify-between items-center">
            <span className="text-[11px] font-medium text-slate-500">
              Showing <b className="text-slate-700">{filtered.length}</b> of {notifications.length}
            </span>
            {notifications.length > 0 && onMarkAllRead && (
              <button
                onClick={() => { onMarkAllRead(); setReadLocally(new Set(notifications.map(n => n.id))); }}
                className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Clear All Unread
              </button>
            )}
          </div>

          {/* ── Notification Cards List ─────────────────────────────── */}
          <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {filtered.length === 0 ? (
              <EmptyState category={activeCategory} />
            ) : (
              filtered.map((n) => {
                let meta = null;
                try { meta = n.metadata ? (typeof n.metadata === 'string' ? JSON.parse(n.metadata) : n.metadata) : null; } catch {}

                const otpMatch    = n.message?.match(/\b\d{4,6}\b/);
                const hasOtp      = Boolean(otpMatch);
                const extractedOtp = otpMatch?.[0];
                const isRead      = n.read || readLocally.has(n.id);

                return (
                  <div
                    key={n.id}
                    onClick={() => !isRead && handleMarkSingleRead(n.id)}
                    className={`relative p-3.5 rounded-2xl border transition-all text-xs space-y-2 cursor-pointer ${
                      isRead
                        ? 'bg-slate-50/70 border-slate-200'
                        : 'bg-white border-emerald-300 shadow-sm ring-1 ring-emerald-500/10 hover:shadow-md'
                    }`}
                  >
                    {/* Unread dot */}
                    {!isRead && (
                      <span className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white animate-pulse" />
                    )}

                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-xl bg-slate-100/80">
                          {getCategoryIcon(n._cat)}
                        </div>
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {n.type || n._cat || 'SYSTEM'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-mono">{relativeTime(n.createdAt)}</span>
                        {onDeleteNotification && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onDeleteNotification(n.id); }}
                            className="p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors"
                            title="Dismiss"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Body */}
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{n.title}</h4>
                      <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">{n.message}</p>
                    </div>

                    {/* Action Badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
                      {/* Copy OTP */}
                      {hasOtp && extractedOtp && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleCopyOtp(extractedOtp, n.id); }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-[10px] font-bold transition-colors"
                        >
                          {copiedOtpId === n.id ? (
                            <><Check className="w-3 h-3 text-emerald-600" /><span>OTP Copied!</span></>
                          ) : (
                            <><Copy className="w-3 h-3 text-amber-600" /><span>Copy OTP: {extractedOtp}</span></>
                          )}
                        </button>
                      )}

                      {/* WhatsApp link */}
                      {(meta?.directLink || meta?.whatsappLink) && (
                        <a
                          href={meta?.directLink || meta?.whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[10px] font-bold transition-colors"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>Open in WhatsApp</span>
                        </a>
                      )}

                      {/* Tax Invoice */}
                      {meta?.orderId && onOpenOrderInvoice && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onOpenOrderInvoice({ id: meta.orderId }); }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-bold transition-colors hover:bg-slate-700"
                        >
                          <FileText className="w-3 h-3 text-emerald-400" />
                          <span>View Tax Invoice</span>
                        </button>
                      )}

                      {/* Mark read hint */}
                      {!isRead && (
                        <span className="ml-auto text-[9px] text-slate-400 font-medium">tap to mark read</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">🔔 Real-time alerts · Escrow · Livestock · Orders</span>
            <span className="text-[10px] text-emerald-600 font-bold">AgriShamba</span>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ─── Category-specific empty state ─────────────────────────────────────────── */
function EmptyState({ category }) {
  const map = {
    ESCROW:    { emoji: '💰', title: 'No escrow alerts',     sub: 'M-Pesa lock-ins, wallet payouts and disbursements will appear here.' },
    ORDERS:    { emoji: '📦', title: 'No order updates',     sub: 'Delivery OTP codes, shipment status and cargo updates will appear here.' },
    DAIRY:     { emoji: '🥛', title: 'No dairy alerts',      sub: 'Fresh milk price alerts, dairy tender bids and collection reminders will appear here.' },
    LIVESTOCK: { emoji: '🐄', title: 'No livestock alerts',  sub: 'Cattle sale requests, heifer availability and veterinary alerts will appear here.' },
    POULTRY:   { emoji: '🐔', title: 'No poultry alerts',    sub: 'Egg price updates, broiler availability and buyer bids will appear here.' },
    FODDER:    { emoji: '🌿', title: 'No fodder alerts',     sub: 'Hay bale availability, silage pricing and bulk feed requests will appear here.' },
    SYSTEM:    { emoji: '🌾', title: 'No system alerts',     sub: 'Weather advisories, commodity price changes and broadcast messages will appear here.' },
    ALL:       { emoji: '🔔', title: 'All quiet right now',  sub: 'Payment receipts, delivery OTPs, and agricultural alerts will appear here in real time.' },
  };
  const { emoji, title, sub } = map[category] || map.ALL;

  return (
    <div className="text-center py-16 text-slate-400 space-y-3 px-4">
      <div className="text-5xl">{emoji}</div>
      <p className="text-sm font-bold text-slate-600">{title}</p>
      <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">{sub}</p>
    </div>
  );
}
