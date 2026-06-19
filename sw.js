// Service Worker - Quan Ly Qua An Sinh (PWA/offline shell)
const CACHE = 'qua-an-sinh-v6';
const ASSETS = [
  'index.html',
  '404.html',
  'QuaAnSinh.html',
  'manifest.webmanifest',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-512.png',
  'apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => (
          response.ok
            ? response
            : caches.match('index.html').then((cached) => cached || caches.match('QuaAnSinh.html') || response)
        ))
        .catch(() => caches.match('index.html').then((cached) => cached || caches.match('QuaAnSinh.html')))
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone();
        if (response.ok || response.type === 'opaque') {
          caches.open(CACHE).then((cache) => cache.put(request, clone)).catch(() => {});
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('index.html') || caches.match('QuaAnSinh.html')))
  );
});
