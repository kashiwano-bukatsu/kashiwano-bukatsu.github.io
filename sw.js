const CACHE_NAME = 'kashiwa-bukatsu-cache';

const CACHE_FILES = [
  '/app.html',
  '/logo.png',
  '/icon.png',
  '/manifest.json',
];

// インストール時にキャッシュ
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CACHE_FILES))
  );
});

// 古いキャッシュ削除
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ネットワーク優先・失敗時のみキャッシュ使用
self.addEventListener('fetch', event => {
  // GAS通信はSWをスルー
  if (event.request.url.includes('script.google.com')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 成功したらキャッシュも更新しておく
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request)) // オフライン時のみキャッシュ
  );
});
