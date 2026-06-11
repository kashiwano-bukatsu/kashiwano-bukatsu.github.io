const VERSION = 'v1.0.0';
const CACHE_NAME = 'kashiwa-bukatsu-' + VERSION;

const CACHE_FILES = [
  '/app.html',
  '/logo.png',
  '/icon.png',
  '/manifest.json',
  '/sw.js',
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CACHE_FILES))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.url.includes('script.google.com')) return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// バージョン情報をページに伝える
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'getVersion') {
    event.ports[0].postMessage({ version: VERSION });
  }
});
