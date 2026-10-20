import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Bell, X, ShieldCheck, Truck, Sparkles, Milk, Egg, Leaf, CheckCheck } from 'lucide-react';

/**
 * Mobile Heads-Up Floating Notification Pill
 * ─ Slides down from top on new alerts
 * ─ Category-aware icon & colour theming (ESCROW, ORDER, DAIRY, LIVESTOCK, POULTRY, SYSTEM)
 * ─ Animated countdown progress bar (5 s auto-dismiss)
 * ─ Swipe-up gesture to dismiss early
 * ─ One-tap to open Notification Drawer
 * ─ Gentle haptic feedback on appear
 */
export default function MobileNotificationPill({ notification, onOpenDrawer, onDismiss }) {
  const [visible, setVisible]   = useState(false);
  const [progress, setProgress] = useState(100); // % remaining
  const [entering, setEntering] = useState(false);
  const touchStartY = useRef(null);
  const timerRef    = useRef(null);
  const frameRef    = useRef(null);
  const startTime   = useRef(null);
  const DURATION    = 5000; // ms

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(() => { if (onDismiss) onDismiss(); }, 300);
  }, [onDismiss]);

  useEffect(() => {
    if (!notification) { setVisible(false); return; }

    // Reset & show
    setProgress(100);
    setEntering(true);
    setVisible(true);
    startTime.current = Date.now();

    // Haptics
    try { if (navigator?.vibrate) navigator.vibrate([40, 60, 40]); } catch {}

    // Animate progress bar
    const tick = () => {
      const elapsed = Date.now() - startTime.current;
      const remaining = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(remaining);
      if (elapsed < DURATION) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };
    frameRef.current = requestAnimationFrame(tick);

    // After animation settle
    setTimeout(() => setEntering(false), 400);

    // Auto-dismiss
    timerRef.current = setTimeout(dismiss, DURATION);

    return () => {
      clearTimeout(timerRef.current);
      cancelAnimationFrame(frameRef.current);
    };
  }, [notification, dismiss]);

  if (!notification || !visible) return null;

  // ── Detect category ──────────────────────────────────────────────────────────
  const text = ((notification.type || '') + ' ' + (notification.title || '') + ' ' + (notification.message || '')).toLowerCase();

  const isEscrow     = text.includes('escrow') || text.includes('wallet') || text.includes('payout') || text.includes('kes');
  const isOrder      = text.includes('order') || text.includes('delivery') || text.includes('otp') || text.includes('driver');
  const isDairy      = text.includes('dairy') || text.includes('milk') || text.includes('yoghurt');
  const isLivestock  = text.includes('livestock') || text.includes('cattle') || text.includes('goat') || text.includes('sheep') || text.includes('pig');
  const isPoultry    = text.includes('poultry') || text.includes('chicken') || text.includes('egg') || text.includes('layer') || text.includes('broiler');
  const isFodder     = text.includes('fodder') || text.includes('hay') || text.includes('silage') || text.includes('lucerne');

  // ── Theme map ────────────────────────────────────────────────────────────────
  const theme = isEscrow     ? { bg: 'bg-amber-500/20',   border: 'border-amber-500/40',   ring: 'bg-amber-500',  badge: 'bg-amber-600/40 text-amber-200',  Icon: ShieldCheck  }
              : isOrder      ? { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', ring: 'bg-emerald-500',badge: 'bg-emerald-600/40 text-emerald-200',Icon: Truck       }
              : isDairy      ? { bg: 'bg-sky-500/20',     border: 'border-sky-500/40',     ring: 'bg-sky-400',    badge: 'bg-sky-600/40 text-sky-200',      Icon: Milk        }
              : isPoultry    ? { bg: 'bg-orange-500/20',  border: 'border-orange-500/40',  ring: 'bg-orange-400', badge: 'bg-orange-600/40 text-orange-200', Icon: Egg         }
              : isLivestock  ? { bg: 'bg-lime-500/20',    border: 'border-lime-500/40',    ring: 'bg-lime-400',   badge: 'bg-lime-600/40 text-lime-200',    Icon: Leaf        }
              : isFodder     ? { bg: 'bg-teal-500/20',    border: 'border-teal-500/40',    ring: 'bg-teal-400',   badge: 'bg-teal-600/40 text-teal-200',    Icon: Leaf        }
              :                { bg: 'bg-indigo-500/20',  border: 'border-indigo-500/40',  ring: 'bg-indigo-400', badge: 'bg-indigo-600/40 text-indigo-200', Icon: Bell        };

  const { bg, border, ring, badge, Icon } = theme;

  // ── Swipe-up to dismiss ───────────────────────────────────────────────────
  const handleTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchEnd   = (e) => {
    if (touchStartY.current === null) return;
    const delta = touchStartY.current - e.changedTouches[0].clientY;
    if (delta > 40) dismiss(); // swiped up ≥ 40px
    touchStartY.current = null;
  };

  return (
    <div
      className={`fixed top-3 left-3 right-3 sm:left-auto sm:right-4 sm:w-96 z-[60] transition-all duration-300 ease-out
        ${entering ? '-translate-y-1 opacity-80' : 'translate-y-0 opacity-100'}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main Pill Card */}
      <div
        onClick={() => { clearTimeout(timerRef.current); cancelAnimationFrame(frameRef.current); setVisible(false); if (onOpenDrawer) onOpenDrawer(); }}
        className={`bg-slate-900/96 text-white backdrop-blur-md border ${border} rounded-2xl shadow-2xl overflow-hidden cursor-pointer
          hover:border-white/20 transition-all group`}
      >
        {/* Countdown progress bar at very top */}
        <div className="h-0.5 bg-slate-800 w-full">
          <div
            className={`h-full ${ring} transition-none`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-3.5 flex items-start gap-3">
          {/* Category Icon */}
          <div className={`p-2 rounded-xl shrink-0 ${bg} border ${border}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>

          {/* Text Details */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${badge}`}>
                {notification.type || 'ALERT'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Just now</span>
            </div>
            <h4 className="text-xs font-bold text-white truncate">{notification.title}</h4>
            <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mt-0.5">
              {notification.message}
            </p>
          </div>

          {/* Action Hints */}
          <div className="flex flex-col gap-1 shrink-0">
            {/* Tap hint */}
            <span className="text-[9px] text-slate-500 font-medium hidden sm:block">tap to view</span>
            {/* Dismiss */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); dismiss(); }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Swipe hint on mobile */}
        <div className="pb-1 text-center sm:hidden">
          <span className="text-[9px] text-slate-600 font-medium tracking-wide">↑ swipe up to dismiss · tap to view all</span>
        </div>
      </div>
    </div>
  );
}
