import React, { useEffect, useState } from 'react';
import { Bell, X, ShieldCheck, Truck, Sparkles, CheckCheck, ExternalLink, ChevronRight } from 'lucide-react';

/**
 * Mobile Heads-Up Floating Notification Pill
 * Slides down from top of the screen on new alerts with sound, haptics, and one-tap action.
 */
export default function MobileNotificationPill({ notification, onOpenDrawer, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!notification) {
      setVisible(false);
      return;
    }

    setVisible(true);

    // Subtle native haptic feedback
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 60, 40]);
      } catch (e) {
        // Ignore haptics error if not permitted
      }
    }

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      if (onDismiss) setTimeout(onDismiss, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification]);

  if (!notification || !visible) return null;

  const isEscrow = notification.type?.includes('ESCROW') || notification.title?.toLowerCase().includes('escrow') || notification.title?.toLowerCase().includes('payout');
  const isOrder = notification.type?.includes('ORDER') || notification.title?.toLowerCase().includes('order') || notification.title?.toLowerCase().includes('delivery');

  return (
    <div className="fixed top-3 left-3 right-3 sm:left-auto sm:right-4 sm:w-96 z-50 transition-all duration-300 ease-out transform translate-y-0">
      <div 
        onClick={() => {
          setVisible(false);
          if (onOpenDrawer) onOpenDrawer();
        }}
        className="bg-slate-900/95 text-white backdrop-blur-md border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl flex items-start gap-3 cursor-pointer hover:border-emerald-500/50 transition-all group"
      >
        {/* Category Icon */}
        <div className={`p-2 rounded-xl shrink-0 ${
          isEscrow 
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
            : isOrder 
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
            : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
        }`}>
          {isEscrow ? (
            <ShieldCheck className="w-4 h-4" />
          ) : isOrder ? (
            <Truck className="w-4 h-4" />
          ) : (
            <Bell className="w-4 h-4 animate-bounce" />
          )}
        </div>

        {/* Text Details */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded ${
              isEscrow ? 'bg-amber-500/30 text-amber-300' : 'bg-emerald-500/30 text-emerald-300'
            }`}>
              {notification.type || 'NEW ALERT'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Just now</span>
          </div>
          <h4 className="text-xs font-bold text-white truncate">{notification.title}</h4>
          <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mt-0.5">
            {notification.message}
          </p>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setVisible(false);
            if (onDismiss) onDismiss();
          }}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
