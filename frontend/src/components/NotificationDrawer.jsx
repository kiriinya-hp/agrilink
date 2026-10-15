import React, { useState } from 'react';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Phone, 
  X, 
  CheckCheck, 
  ExternalLink, 
  ShieldCheck, 
  Truck, 
  Trash2, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Filter, 
  FileText,
  DollarSign,
  AlertCircle
} from 'lucide-react';

/**
 * Play gentle synthesised notification chime via Web Audio API
 * Requires zero external audio assets, works completely offline.
 */
function playSynthesizedChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc1.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(783.99, ctx.currentTime); // G5
    osc2.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.2); // C6

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.4);
    osc2.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // Audio context not allowed before user gesture
  }
}

export default function NotificationDrawer({ 
  isOpen, 
  onClose, 
  notifications = [], 
  onMarkAllRead,
  onDeleteNotification,
  onOpenOrderInvoice
}) {
  const [activeCategory, setActiveCategory] = useState('ALL'); // 'ALL' | 'ESCROW' | 'ORDERS' | 'SYSTEM'
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [copiedOtpId, setCopiedOtpId] = useState(null);

  if (!isOpen) return null;

  const handleCopyOtp = (text, id) => {
    // Extract 4-digit or 6-digit OTP
    const match = text.match(/\b\d{4,6}\b/);
    const code = match ? match[0] : text;
    navigator.clipboard?.writeText(code);
    setCopiedOtpId(id);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(30);
    }
    setTimeout(() => setCopiedOtpId(null), 2000);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) playSynthesizedChime();
  };

  const getTypeIcon = (type, title = '') => {
    const lower = (type + ' ' + title).toLowerCase();
    if (lower.includes('escrow') || lower.includes('wallet') || lower.includes('payout') || lower.includes('kes')) {
      return <ShieldCheck className="w-4 h-4 text-amber-500" />;
    }
    if (lower.includes('order') || lower.includes('delivery') || lower.includes('shipment') || lower.includes('driver')) {
      return <Truck className="w-4 h-4 text-emerald-500" />;
    }
    if (type === 'EMAIL') {
      return <Mail className="w-4 h-4 text-blue-500" />;
    }
    if (type === 'SMS') {
      return <MessageSquare className="w-4 h-4 text-emerald-500" />;
    }
    if (type === 'WHATSAPP') {
      return <Phone className="w-4 h-4 text-green-500" />;
    }
    return <Bell className="w-4 h-4 text-indigo-500" />;
  };

  // Filter logic
  const filteredNotifications = notifications.filter(n => {
    if (activeCategory === 'ALL') return true;
    const text = ((n.type || '') + ' ' + (n.title || '') + ' ' + (n.message || '')).toLowerCase();
    if (activeCategory === 'ESCROW') {
      return text.includes('escrow') || text.includes('wallet') || text.includes('payout') || text.includes('fund') || text.includes('disburse');
    }
    if (activeCategory === 'ORDERS') {
      return text.includes('order') || text.includes('delivery') || text.includes('shipment') || text.includes('otp') || text.includes('cargo');
    }
    if (activeCategory === 'SYSTEM') {
      return text.includes('system') || text.includes('weather') || text.includes('price') || text.includes('harvest') || text.includes('broadcast');
    }
    return true;
  });

  const escrowCount = notifications.filter(n => {
    const text = ((n.type || '') + ' ' + (n.title || '')).toLowerCase();
    return text.includes('escrow') || text.includes('wallet') || text.includes('payout');
  }).length;

  const ordersCount = notifications.filter(n => {
    const text = ((n.type || '') + ' ' + (n.title || '')).toLowerCase();
    return text.includes('order') || text.includes('delivery') || text.includes('otp');
  }).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex flex-col justify-end sm:justify-start">
      {/* Backdrop with Blur */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Container: Bottom Sheet on Mobile (<sm), Right Sidebar on Desktop (>=sm) */}
      <div className="relative w-full sm:w-auto sm:fixed sm:inset-y-0 sm:right-0 sm:max-w-md flex flex-col z-10">
        <div className="w-full sm:w-[420px] bg-white sm:h-full max-h-[90vh] sm:max-h-none rounded-t-3xl sm:rounded-none shadow-2xl flex flex-col overflow-hidden border-t sm:border-t-0 sm:border-l border-slate-200">
          
          {/* Mobile Drag Indicator Bar */}
          <div className="w-full pt-2 pb-1 flex justify-center sm:hidden">
            <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Notification Center</h3>
                <p className="text-[11px] text-slate-500">Live Escrow, Delivery & System Alerts</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleToggleSound}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title={soundEnabled ? 'Mute notification sound' : 'Enable notification sound'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button 
                onClick={onClose} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
            <button
              onClick={() => setActiveCategory('ALL')}
              className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeCategory === 'ALL' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <span>All</span>
              <span className={`px-1 rounded-full text-[9px] ${activeCategory === 'ALL' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {notifications.length}
              </span>
            </button>

            <button
              onClick={() => setActiveCategory('ESCROW')}
              className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeCategory === 'ESCROW' 
                  ? 'bg-amber-600 text-white shadow-xs' 
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <span>💰 Escrow</span>
              {escrowCount > 0 && (
                <span className={`px-1 rounded-full text-[9px] ${activeCategory === 'ESCROW' ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {escrowCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveCategory('ORDERS')}
              className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeCategory === 'ORDERS' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <span>📦 Orders</span>
              {ordersCount > 0 && (
                <span className={`px-1 rounded-full text-[9px] ${activeCategory === 'ORDERS' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {ordersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveCategory('SYSTEM')}
              className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeCategory === 'SYSTEM' 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <span>🌾 System</span>
            </button>
          </div>

          {/* Subheader Toolbar: Counter & Clear All */}
          <div className="px-5 py-2 bg-white border-b border-slate-100 flex justify-between items-center text-xs">
            <span className="text-[11px] font-medium text-slate-500">
              Showing {filteredNotifications.length} of {notifications.length}
            </span>
            {notifications.length > 0 && onMarkAllRead && (
              <button
                onClick={onMarkAllRead}
                className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Clear All Unread
              </button>
            )}
          </div>

          {/* Notification Cards List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-16 text-slate-400 space-y-2">
                <Bell className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
                <p className="text-xs font-bold text-slate-600">No notifications in this category</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  M-Pesa payment receipts, delivery OTP codes, and agricultural alerts will appear here in real time.
                </p>
              </div>
            ) : (
              filteredNotifications.map((n) => {
                let meta = null;
                try {
                  meta = n.metadata ? (typeof n.metadata === 'string' ? JSON.parse(n.metadata) : n.metadata) : null;
                } catch {
                  meta = null;
                }

                // Check for 4 or 6 digit OTP in message
                const otpMatch = n.message?.match(/\b\d{4,6}\b/);
                const hasOtp = Boolean(otpMatch);
                const extractedOtp = otpMatch ? otpMatch[0] : null;

                return (
                  <div
                    key={n.id}
                    className={`relative p-3.5 rounded-2xl border transition-all text-xs space-y-2 ${
                      n.read 
                        ? 'bg-slate-50/70 border-slate-200' 
                        : 'bg-white border-emerald-300 shadow-sm ring-1 ring-emerald-500/10'
                    }`}
                  >
                    {/* Unread Glowing Dot */}
                    {!n.read && (
                      <span className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                    )}

                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-xl bg-slate-100/80">
                          {getTypeIcon(n.type, n.title)}
                        </div>
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            {n.type || 'SYSTEM'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                        </span>
                        {onDeleteNotification && (
                          <button
                            type="button"
                            onClick={() => onDeleteNotification(n.id)}
                            className="p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors"
                            title="Dismiss notification"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Message Body */}
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{n.title}</h4>
                      <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">{n.message}</p>
                    </div>

                    {/* Interactive Action Badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
                      {/* 1. Copy OTP Action */}
                      {hasOtp && extractedOtp && (
                        <button
                          type="button"
                          onClick={() => handleCopyOtp(extractedOtp, n.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-[10px] font-bold transition-colors"
                        >
                          {copiedOtpId === n.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>OTP Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-amber-600" />
                              <span>Copy OTP: {extractedOtp}</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* 2. Direct WhatsApp Link */}
                      {(meta?.directLink || meta?.whatsappLink) && (
                        <a
                          href={meta?.directLink || meta?.whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[10px] font-bold transition-colors"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>Open in WhatsApp</span>
                        </a>
                      )}

                      {/* 3. View Tax Invoice if Order referenced */}
                      {meta?.orderId && onOpenOrderInvoice && (
                        <button
                          type="button"
                          onClick={() => onOpenOrderInvoice({ id: meta.orderId })}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-bold transition-colors"
                        >
                          <FileText className="w-3 h-3 text-emerald-400" />
                          <span>View Tax Invoice</span>
                        </button>
                      )}
                    </div>

                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Footer Tip */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-400">
            🔔 Push notifications are active. Real-time updates delivered instantly.
          </div>

        </div>
      </div>
    </div>
  );
}
