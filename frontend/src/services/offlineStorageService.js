/**
 * AgriShamba IndexedDB Offline Storage & Auto-Synchronization Service
 * Provides local caching of produce listings and drafts for farmers in low-connectivity rural zones.
 */

const DB_NAME = 'AgriShambaOfflineDB';
const DB_VERSION = 1;
const STORE_LISTINGS = 'offline_listings';
const STORE_DRAFTS = 'offline_drafts';

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      console.warn('[OfflineDB] IndexedDB is not supported on this device/browser');
      return resolve(null);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_LISTINGS)) {
        db.createObjectStore(STORE_LISTINGS, { keyPath: 'localId', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(STORE_DRAFTS)) {
        db.createObjectStore(STORE_DRAFTS, { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => {
      console.error('[OfflineDB] Failed to open IndexedDB:', event.target.error);
      resolve(null);
    };
  });
}

/**
 * Save a produce listing created while offline
 */
export async function saveOfflineListing(listingData) {
  const db = await openDatabase();
  if (!db) {
    // LocalStorage fallback if IndexedDB is disabled
    const existing = JSON.parse(localStorage.getItem('agrishamba_offline_listings') || '[]');
    const record = { ...listingData, localId: 'local_' + Date.now(), queuedAt: new Date().toISOString() };
    existing.push(record);
    localStorage.setItem('agrishamba_offline_listings', JSON.stringify(existing));
    return record;
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_LISTINGS, 'readwrite');
    const store = tx.objectStore(STORE_LISTINGS);
    const record = {
      ...listingData,
      localId: 'local_' + Date.now(),
      queuedAt: new Date().toISOString()
    };
    const req = store.add(record);
    req.onsuccess = () => resolve(record);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Get all pending offline listings
 */
export async function getOfflineListings() {
  const db = await openDatabase();
  if (!db) {
    return JSON.parse(localStorage.getItem('agrishamba_offline_listings') || '[]');
  }

  return new Promise((resolve) => {
    const tx = db.transaction(STORE_LISTINGS, 'readonly');
    const store = tx.objectStore(STORE_LISTINGS);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => resolve([]);
  });
}

/**
 * Delete a successfully synchronized listing
 */
export async function deleteOfflineListing(localId) {
  const db = await openDatabase();
  if (!db) {
    const existing = JSON.parse(localStorage.getItem('agrishamba_offline_listings') || '[]');
    const filtered = existing.filter(item => item.localId !== localId);
    localStorage.setItem('agrishamba_offline_listings', JSON.stringify(filtered));
    return true;
  }

  return new Promise((resolve) => {
    const tx = db.transaction(STORE_LISTINGS, 'readwrite');
    const store = tx.objectStore(STORE_LISTINGS);
    const req = store.delete(localId);
    req.onsuccess = () => resolve(true);
    req.onerror = () => resolve(false);
  });
}

/**
 * Clear all pending offline items
 */
export async function clearAllOfflineListings() {
  const db = await openDatabase();
  if (!db) {
    localStorage.removeItem('agrishamba_offline_listings');
    return true;
  }

  return new Promise((resolve) => {
    const tx = db.transaction(STORE_LISTINGS, 'readwrite');
    const store = tx.objectStore(STORE_LISTINGS);
    const req = store.clear();
    req.onsuccess = () => resolve(true);
    req.onerror = () => resolve(false);
  });
}

/**
 * Save draft state (e.g. unfinished produce form)
 */
export async function saveOfflineDraft(key, data) {
  try {
    localStorage.setItem(`agrishamba_draft_${key}`, JSON.stringify(data));
  } catch (e) {
    console.warn('[OfflineDB] Could not save draft:', e);
  }
}

/**
 * Retrieve draft state
 */
export function getOfflineDraft(key) {
  try {
    const raw = localStorage.getItem(`agrishamba_draft_${key}`);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}
