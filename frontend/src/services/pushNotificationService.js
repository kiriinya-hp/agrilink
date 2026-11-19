import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

/**
 * AgriShamba – Native Push / Local Notification Service
 * -------------------------------------------------------
 * • Android: uses Capacitor LocalNotifications with multiple priority channels
 *   - agrishamba_escrow   (Importance 5 – heads-up, max priority)
 *   - agrishamba_orders   (Importance 4 – high)
 *   - agrishamba_livestock (Importance 4 – high, for dairy/livestock/poultry)
 *   - agrishamba_system   (Importance 3 – default)
 * • Web fallback: browser Notification API
 */

let isInitialized = false;

const CHANNELS = [
  {
    id: 'agrishamba_escrow',
    name: 'AgriShamba Escrow & Payments',
    description: 'M-Pesa STK Push confirmations, wallet payouts, and escrow lock/release events',
    importance: 5,
    visibility: 1,
    vibration: true,
    sound: 'default',
    lightColor: '#F59E0B',
  },
  {
    id: 'agrishamba_orders',
    name: 'AgriShamba Orders & Delivery',
    description: 'Delivery OTP codes, shipment status updates, and cargo pickups',
    importance: 5,
    visibility: 1,
    vibration: true,
    sound: 'default',
    lightColor: '#10B981',
  },
  {
    id: 'agrishamba_livestock',
    name: 'AgriShamba Livestock & Animal Farming',
    description: 'Dairy, livestock, and poultry alerts',
    importance: 5,
    visibility: 1,
    vibration: true,
    sound: 'default',
    lightColor: '#84CC16',
  },
  {
    id: 'agrishamba_system',
    name: 'AgriShamba System & Market Alerts',
    description: 'Weather advisories, price changes, and broadcast messages',
    importance: 4,
    visibility: 1,
    vibration: true,
    sound: 'default',
    lightColor: '#6366F1',
  },
];

/**
 * Play a high-tech synthesized notification chime using Web Audio API
 * Works 100% offline with zero external audio assets
 */
export function playNotificationChime(type = 'success') {
  try {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    if (type === 'error' || type === 'ALERT') {
      // Alert/Warning tone (330Hz -> 261Hz)
      osc.frequency.setValueAtTime(349.23, now); // F4
      osc.frequency.setValueAtTime(261.63, now + 0.12); // C4
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      // Cheerful trade & escrow chime (A5 880Hz -> C#6 1108Hz)
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1108.73, now + 0.08);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    }
  } catch (e) {
    // Audio context might be restricted before user gesture
  }
}

/* ─── Detect which channel a notification belongs to ─────────────────────── */
function resolveChannel(title = '', body = '') {
  const t = (title + ' ' + body).toLowerCase();
  if (t.includes('escrow') || t.includes('payout') || t.includes('wallet') || t.includes('kes') || t.includes('m-pesa') || t.includes('mpesa')) {
    return 'agrishamba_escrow';
  }
  if (t.includes('order') || t.includes('otp') || t.includes('delivery') || t.includes('shipment') || t.includes('cargo')) {
    return 'agrishamba_orders';
  }
  if (
    t.includes('dairy') || t.includes('milk') || t.includes('yoghurt') ||
    t.includes('livestock') || t.includes('cattle') || t.includes('goat') || t.includes('sheep') || t.includes('pig') || t.includes('heifer') ||
    t.includes('poultry') || t.includes('chicken') || t.includes('egg') || t.includes('layer') || t.includes('broiler')
  ) {
    return 'agrishamba_livestock';
  }
  return 'agrishamba_system';
}

/* ─── Initialise permissions and channels ────────────────────────────────── */
export async function initPushNotifications() {
  try {
    if (Capacitor.isNativePlatform()) {
      const check = await LocalNotifications.checkPermissions();
      if (check.display !== 'granted') {
        const req = await LocalNotifications.requestPermissions();
        if (req.display !== 'granted') return false;
      }
      // Register all 4 channels with max heads-up priority
      await Promise.all(CHANNELS.map(ch => LocalNotifications.createChannel(ch).catch(() => {})));
      isInitialized = true;
      return true;
    } else if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const perm = await Notification.requestPermission();
        isInitialized = perm === 'granted';
        return isInitialized;
      }
      isInitialized = Notification.permission === 'granted';
      return isInitialized;
    }
  } catch (err) {
    console.warn('[Notifications] Could not initialise push notifications:', err.message);
  }
  return false;
}

/* ─── Schedule a native tray notification ────────────────────────────────── */
export async function scheduleNativeNotification({ title, body, id = Date.now() % 100000, extra = {} }) {
  const safeTitle = title || 'AgriShamba Update';
  const safeBody  = body  || 'You have a new trade update on AgriShamba.';
  const channelId = resolveChannel(safeTitle, safeBody);

  // Play audio chime and haptic vibration
  playNotificationChime(extra?.type || (safeTitle.toLowerCase().includes('alert') ? 'error' : 'success'));
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([80, 40, 80]);
    }
  } catch {}

  try {
    if (Capacitor.isNativePlatform()) {
      // Ensure permission before scheduling
      try {
        const status = await LocalNotifications.checkPermissions();
        if (status.display !== 'granted') {
          await LocalNotifications.requestPermissions();
        }
      } catch {}

      await LocalNotifications.schedule({
        notifications: [{
          title:    safeTitle,
          body:     safeBody,
          id:       Number(id),
          channelId,
          schedule: { at: new Date(Date.now() + 100) },
          smallIcon: 'ic_launcher',
          iconColor: '#10B981',
          sound: 'default',
          extra,
        }],
      });
      return true;
    }

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
      if (Notification.permission === 'granted') {
        new Notification(safeTitle, {
          body: safeBody,
          icon: '/AgriShamba-logo.png',
          badge: '/AgriShamba-logo.png',
          tag: channelId,
          renotify: true,
        });
        return true;
      }
    }
  } catch (err) {
    console.warn('[Notifications] Failed to schedule notification:', err.message);
  }
  return false;
}

/* ─── Convenience helpers ───────────────────────────────────────────────── */

/** Fire a livestock/animal alert into the native tray */
export async function scheduleLivestockNotification({ title, body, extra = {} }) {
  return scheduleNativeNotification({ title, body, extra });
}

/** Fire an escrow/payment alert (max priority) */
export async function scheduleEscrowNotification({ title, body, extra = {} }) {
  return scheduleNativeNotification({ title, body, extra });
}

/** Fire a delivery OTP notification (high priority) */
export async function scheduleOrderNotification({ title, body, extra = {} }) {
  return scheduleNativeNotification({ title, body, extra });
}
