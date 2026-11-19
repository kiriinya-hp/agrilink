import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Bell, X, ShieldCheck, Truck, Sparkles, Milk, Egg, Leaf, CheckCheck, AlertCircle } from 'lucide-react';
import { playNotificationChime } from '../services/pushNotificationService';

/**
 * Mobile Heads-Up Floating Notification Pill
 * ─ Ultra-high z-index (z-[99999]) to guarantee visibility above all modals & sheets
 * ─ Notch-safe positioning using env(safe-area-inset-top)
 * ─ Category-aware glowing theming (ESCROW, ORDER, ERROR, DAIRY, LIVESTOCK, POULTRY, SYSTEM)
 * ─ Animated countdown progress bar (6.5 s auto-dismiss)
 * ─ Integrated audio chime & haptic vibration
 * ─ Swipe-up gesture or tap 'X' to dismiss
 * ─ One-tap to open Notification Drawer
 */
export default function MobileNotificationPill({ notification, onOpenDrawer, onDismiss }) {
  const [visible, setVisible]   = useState(false);
  const [progress, setProgress] = useState(100); // % remaining
  const [entering, setEntering] = useState(false);
  const touchStartY = useRef(null);
  const timerRef    = useRef(null);
  const frameRef    = useRef(null);
  const startTime   = useRef(null);
  const onDismissRef = useRef(onDismiss);
  const DURATION    = 6500; // ms

  // Keep onDismiss ref synchronized without breaking effect dependencies
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(() => { 
      if (onDismissRef.current) onDismissRef.current(); 
    }, 300);
  }, []);

  useEffect(() => {
    if (!notification) { 
      setVisible(false); 
      return; 
    }

    // Reset progress & trigger entrance
    setProgress(100);
    setEntering(true);
    setVisible(true);
    startTime.current = Date.now();

    // Play subtle audio chime & physical haptics
    try {
      playNotificationChime(notification.type);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([70, 40, 70]);
      }
    } catch {}

    // Animate smooth progress bar countdown
    const tick = () => {
      const elapsed = Date.now() - startTime.current;
      const remaining = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(remaining);
      if (elapsed < DURATION) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };
    frameRef.current = requestAnimationFrame(tick);

    const enterTimer = setTimeout(() => setEntering(false), 350);
    timerRef.current = setTimeout(dismiss, DURATION);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(timerRef.current);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [notification?.id, notification?.message, dismiss]);

  if (!notification || !visible) return null;

  // ── Detect category & sentiment ───────────────────────────────────────────
  const rawType = (notification.type || '').toUpperCase();
  const text = ((notification.type || '') + ' ' + (notification.title || '') + ' ' + (notification.message || '')).toLowerCase();

  const isError     = rawType === 'ERROR' || rawType === 'ALERT' || text.includes('failed') || text.includes('error') || text.includes('invalid');
  const isEscrow    = text.includes('escrow') || text.includes('wallet') || text.includes('payout') || text.includes('kes') || text.includes('mpesa');
  const isOrder     = text.includes('order') || text.includes('delivery') || text.includes('otp') || text.includes('driver') || text.includes('cargo');
  const isDairy     = text.includes('dairy') || text.includes('milk') || text.includes('yoghurt');
  const isLivestock = text.includes('livestock') || text.includes('cattle') || text.includes('goat') || text.includes('sheep') || text.includes('pig');
  const isPoultry   = text.includes('poultry') || text.includes('chicken') || text.includes('egg') || text.includes('layer') || text.includes('broiler');

  // ── High-Contrast Visual Theme Map ─────────────────────────────────────────
  const theme = isError     ? { bg: 'bg-rose-500/25',   border: 'border-rose-500/70',   ring: 'bg-rose-500',   badge: 'bg-rose-600 text-white font-extrabold',    shadow: 'shadow-rose-950/60',   Icon: AlertCircle }
              : isEscrow    ? { bg: 'bg-amber-500/25',  border: 'border-amber-400/70',  ring: 'bg-amber-400',  badge: 'bg-amber-600 text-white font-extrabold',   shadow: 'shadow-amber-950/60',  Icon: ShieldCheck }
              : isOrder     ? { bg: 'bg-emerald-500/25',border: 'border-emerald-400/70',ring: 'bg-emerald-400',badge: 'bg-emerald-600 text-white font-extrabold', shadow: 'shadow-emerald-950/60',Icon: Truck       }
              : isDairy     ? { bg: 'bg-sky-500/25',    border: 'border-sky-400/70',    ring: 'bg-sky-400',    badge: 'bg-sky-600 text-white font-extrabold',     shadow: 'shadow-sky-950/60',    Icon: Milk        }
              : isPoultry   ? { bg: 'bg-orange-500/25', border: 'border-orange-400/70', ring: 'bg-orange-400', badge: 'bg-orange-600 text-white font-extrabold',  shadow: 'shadow-orange-950/60', Icon: Egg         }
              : isLivestock ? { bg: 'bg-lime-500/25',   border: 'border-lime-400/70',   ring: 'bg-lime-400',   badge: 'bg-lime-600 text-white font-extrabold',    shadow: 'shadow-lime-950/60',   Icon: Leaf        }
              :               { bg: 'bg-emerald-500/25',border: 'border-emerald-500/60',ring: 'bg-emerald-400',badge: 'bg-emerald-600 text-white font-extrabold', shadow: 'shadow-emerald-950/60',Icon: Bell        };

  const { bg, border, ring, badge, shadow, Icon } = theme;

  // ── Swipe-up to dismiss ───────────────────────────────────────────────────
  const handleTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchEnd   = (e) => {
    if (touchStartY.current === null) return;
    const delta = touchStartY.current - e.changedTouches[0].clientY;
    if (delta > 35) dismiss(); // swiped up ≥ 35px
    touchStartY.current = null;
  };

  return (
    <div
      className={`fixed top-[max(0.75rem,env(safe-area-inset-top,1.25rem))] left-3 right-3 sm:left-auto sm:right-6 sm:w-[420px] max-w-full z-[99999] transition-all duration-300 ease-out pointer-events-auto
        ${entering ? '-translate-y-3 opacity-0 scale-95' : 'translate-y-0 opacity-100 scale-100'}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="alert"
      aria-live="assertive"
    >
      {/* Main Pill Card */}
      <div
        onClick={() => { 
          clearTimeout(timerRef.current); 
          if (frameRef.current) cancelAnimationFrame(frameRef.current); 
          setVisible(false); 
          if (onOpenDrawer) onOpenDrawer(); 
        }}
        className={`bg-slate-950/98 text-white backdrop-blur-xl border-2 ${border} rounded-2xl shadow-2xl ${shadow} overflow-hidden cursor-pointer
          hover:scale-[1.01] active:scale-[0.99] transition-all group`}
      >
        {/* Animated Countdown progress bar at very top */}
        <div className="h-1 bg-slate-900 w-full overflow-hidden">
          <div
            className={`h-full ${ring} transition-none shadow-sm`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-3.5 sm:p-4 flex items-start gap-3.5">
          {/* Glowing Category Icon */}
          <div className={`p-2.5 rounded-xl shrink-0 ${bg} border ${border} shadow-inner flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white animate-pulse" />
          </div>

          {/* Text Details */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs ${badge}`}>
                {notification.type || 'SYSTEM'}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold font-mono">● LIVE UPDATE</span>
            </div>
            <h4 className="text-xs sm:text-sm font-extrabold text-white truncate tracking-tight">{notification.title}</h4>
            <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed mt-0.5 font-medium">
              {notification.message}
            </p>
          </div>

          {/* Action Hints */}
          <div className="flex flex-col items-center gap-1.5 shrink-0 self-center">
            {/* Dismiss button */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); dismiss(); }}
              className="p-1.5 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors shadow-xs"
              title="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="text-[9px] text-slate-400 font-bold hidden sm:block uppercase tracking-wider">Tap to open</span>
          </div>
        </div>

        {/* Swipe hint on mobile */}
        <div className="pb-1 text-center sm:hidden bg-slate-900/60 border-t border-slate-800/60">
          <span className="text-[9px] text-slate-400 font-bold tracking-wider">↑ SWIPE UP TO DISMISS · TAP TO VIEW INBOX</span>
        </div>
      </div>
    </div>
  );
}
