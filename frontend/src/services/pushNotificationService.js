import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

/**
 * Service to manage native Android system push/tray notifications
 * and web browser Notification API fallbacks for orders and escrows.
 */

let isInitialized = false;

export async function initPushNotifications() {
  if (isInitialized) return true;

  try {
    if (Capacitor.isNativePlatform()) {
      // 1. Request permission for native Android notifications
      const perm = await LocalNotifications.requestPermissions();
      if (perm.display === 'granted') {
        // Create an official notification channel for AgriShamba Android
        await LocalNotifications.createChannel({
          id: 'agrishamba_alerts',
          name: 'AgriShamba SCM Alerts',
          description: 'Notifications for new orders, escrow releases, and delivery OTPs',
          importance: 5,
          visibility: 1,
          vibration: true,
          sound: 'default'
        });
        isInitialized = true;
        return true;
      }
    } else if (typeof window !== 'undefined' && 'Notification' in window) {
      // 2. Web Browser Notification fallback
      if (Notification.permission === 'default') {
        const perm = await Notification.requestPermission();
        isInitialized = perm === 'granted';
        return isInitialized;
      }
      isInitialized = Notification.permission === 'granted';
      return isInitialized;
    }
  } catch (err) {
    console.warn('[Notifications] Could not initialize push notifications:', err.message);
  }
  return false;
}

/**
 * Trigger an instant native Android notification in the system notification shade
 */
export async function scheduleNativeNotification({ title, body, id = Date.now() % 100000, extra = {} }) {
  try {
    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: title || 'AgriShamba Update',
            body: body || 'You have a new trade update on AgriShamba.',
            id: Number(id),
            channelId: 'agrishamba_alerts',
            schedule: { at: new Date(Date.now() + 250) },
            extra
          }
        ]
      });
      return true;
    } else if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
      return true;
    }
  } catch (err) {
    console.warn('[Notifications] Failed to schedule notification:', err.message);
  }
  return false;
}
