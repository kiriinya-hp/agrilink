// AgriLink Offline-First Service Worker
const CACHE_NAME = 'agrilink-v2-cache';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // ✅ CRITICAL FIX: Ignore non-http/https requests
  // (chrome-extension://, moz-extension://, etc. are NOT cacheable)
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return;
  }

  // Pass through API requests directly — network-first, offline fallback
  if (url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({ offline: true, message: 'Huwezi kuunganika mtandaoni sasa. Jaribu tena baadaye.' }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // Network-first with cache fallback for HTML / static assets
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache valid same-origin http responses
        if (
          response &&
          response.status === 200 &&
          response.type === 'basic' &&
          url.startsWith('http')
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
