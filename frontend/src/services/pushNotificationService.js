import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

/**
 * AgriShamba – Native Push / Local Notification Service
 * -------------------------------------------------------
 * • Android: uses Capacitor LocalNotifications with multiple priority channels
 *   - agrishamba_escrow   (Importance 5 – heads-up, max priority)
 *   - agrishamba_orders   (Importance 4 – high)
 *   - agrishamba_livestock (Importance 4 – high, for dairy/livestock/poultry/apiculture/fodder)
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
    importance: 4,
    visibility: 1,
    vibration: true,
    sound: 'default',
    lightColor: '#10B981',
  },
  {
    id: 'agrishamba_livestock',
    name: 'AgriShamba Livestock & Animal Farming',
    description: 'Dairy, livestock, poultry, apiculture, and fodder alerts',
    importance: 4,
    visibility: 1,
    vibration: true,
    sound: 'default',
    lightColor: '#84CC16',
  },
  {
    id: 'agrishamba_system',
    name: 'AgriShamba System & Market Alerts',
    description: 'Weather advisories, price changes, and broadcast messages',
    importance: 3,
    visibility: 1,
    vibration: false,
    sound: 'default',
    lightColor: '#6366F1',
  },
];

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
    t.includes('poultry') || t.includes('chicken') || t.includes('egg') || t.includes('layer') || t.includes('broiler') ||
    t.includes('honey') || t.includes('beeswax') || t.includes('apiculture') ||
    t.includes('fodder') || t.includes('hay') || t.includes('silage') || t.includes('lucerne')
  ) {
    return 'agrishamba_livestock';
  }
  return 'agrishamba_system';
}

/* ─── Initialise permissions and channels ────────────────────────────────── */
export async function initPushNotifications() {
  if (isInitialized) return true;

  try {
    if (Capacitor.isNativePlatform()) {
      const perm = await LocalNotifications.requestPermissions();
      if (perm.display === 'granted') {
        // Register all 4 channels in parallel
        await Promise.all(CHANNELS.map(ch => LocalNotifications.createChannel(ch).catch(() => {})));
        isInitialized = true;
        return true;
      }
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

  try {
    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.schedule({
        notifications: [{
          title:    safeTitle,
          body:     safeBody,
          id:       Number(id),
          channelId,
          schedule: { at: new Date(Date.now() + 250) },
          smallIcon: 'ic_stat_agrishamba',   // set in Android res/
          extra,
        }],
      });
      return true;
    }

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(safeTitle, {
        body:   safeBody,
        icon:   '/favicon.ico',
        badge:  '/favicon.ico',
        tag:    channelId,
        renotify: true,
      });
      return true;
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
