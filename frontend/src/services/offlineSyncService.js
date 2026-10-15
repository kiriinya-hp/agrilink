/**
 * AgriShamba Offline Storage & Sync Manager
 * Keeps listings, orders, and farmer drafts safe in localStorage / IndexedDB.
 * Provides SMS Fallback formatting for low/no internet shamba regions.
 */

const STORAGE_KEYS = {
  OFFLINE_LISTINGS_CACHE: 'agrishamba_offline_listings',
  OFFLINE_ORDERS_CACHE: 'agrishamba_offline_orders',
  PENDING_SYNC_QUEUE: 'agrishamba_pending_sync_queue',
  SMS_GATEWAY_NUMBER: '+254711082000' // AgriShamba SMS Ingestion Shortcode
};

/**
 * Cache current listings to disk for instant offline access
 */
export function cacheListingsOffline(listings) {
  try {
    if (Array.isArray(listings) && listings.length > 0) {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_LISTINGS_CACHE, JSON.stringify({
        timestamp: Date.now(),
        data: listings
      }));
    }
  } catch (err) {
    console.warn('[OfflineStore] Failed to cache listings:', err);
  }
}

/**
 * Get cached listings when offline
 */
export function getCachedListingsOffline() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFLINE_LISTINGS_CACHE);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.data || null;
  } catch {
    return null;
  }
}

/**
 * Cache current orders for offline view
 */
export function cacheOrdersOffline(orders) {
  try {
    if (Array.isArray(orders)) {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_ORDERS_CACHE, JSON.stringify({
        timestamp: Date.now(),
        data: orders
      }));
    }
  } catch (err) {
    console.warn('[OfflineStore] Failed to cache orders:', err);
  }
}

export function getCachedOrdersOffline() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFLINE_ORDERS_CACHE);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.data || null;
  } catch {
    return null;
  }
}

/**
 * Queue a listing draft when internet is down
 */
export function queueOfflineListing(listingData) {
  try {
    const queue = getPendingSyncQueue();
    const item = {
      id: `offline-${Date.now()}`,
      type: 'CREATE_LISTING',
      payload: listingData,
      createdAt: new Date().toISOString()
    };
    queue.push(item);
    localStorage.setItem(STORAGE_KEYS.PENDING_SYNC_QUEUE, JSON.stringify(queue));
    return item;
  } catch (e) {
    console.error('[OfflineStore] Could not queue offline listing:', e);
    return null;
  }
}

export function getPendingSyncQueue() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PENDING_SYNC_QUEUE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearPendingSyncItem(itemId) {
  try {
    const queue = getPendingSyncQueue().filter(i => i.id !== itemId);
    localStorage.setItem(STORAGE_KEYS.PENDING_SYNC_QUEUE, JSON.stringify(queue));
    return queue;
  } catch {
    return [];
  }
}

export function clearAllSyncQueue() {
  try {
    localStorage.removeItem(STORAGE_KEYS.PENDING_SYNC_QUEUE);
  } catch {}
}

/**
 * Generate formatted SMS Fallback body for a farmer listing
 * Example: SHAMBA LIST Tomatoes, 500KG, KES 85, GRADE_A, Kinangop
 */
export function generateListingSms(listing) {
  const crop = listing.cropName || 'Produce';
  const qty = listing.availableQty || 100;
  const price = listing.unitPrice ? Math.round(listing.unitPrice * 130) : 100;
  const loc = listing.location || 'Kenya';
  const grade = listing.grade || 'GRADE_A';

  const body = `AGRI LIST ${crop}*${qty}KG*${price}KES*${grade}*${loc}`;
  const encodedBody = encodeURIComponent(body);
  const smsUrl = `sms:${STORAGE_KEYS.SMS_GATEWAY_NUMBER}?body=${encodedBody}`;

  return {
    body,
    smsUrl,
    shortcode: STORAGE_KEYS.SMS_GATEWAY_NUMBER
  };
}

/**
 * Generate SMS for ordering / bid
 */
export function generateOrderSms(orderData) {
  const crop = orderData.cropName || 'Produce';
  const qty = orderData.qty || 100;
  const dest = orderData.destination || 'Nairobi';
  const body = `AGRI BUY ${crop}*${qty}KG*${dest}`;
  const encodedBody = encodeURIComponent(body);
  const smsUrl = `sms:${STORAGE_KEYS.SMS_GATEWAY_NUMBER}?body=${encodedBody}`;

  return {
    body,
    smsUrl,
    shortcode: STORAGE_KEYS.SMS_GATEWAY_NUMBER
  };
}
