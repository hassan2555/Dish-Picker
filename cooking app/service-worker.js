const CACHE_NAME = 'dish-picker-cache-v1';
const urlsToCache = [
  '/',                // root
  '/index.html',      // main HTML
  '/app.js?v=2',      // your versioned JS
  '/manifest.json',   // PWA manifest
  '/icon-192.png',    // icon must exist at exactly this path
  '/icon-512.png'     // icon must exist at exactly this path
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        urlsToCache.map(url =>
          cache.add(url).catch(err => {
            console.warn('Failed to cache', url, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});
