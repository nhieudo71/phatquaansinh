// Service Worker - Quản Lý Quà An Sinh (PWA, hỗ trợ offline)
const CACHE = 'qua-an-sinh-v4';
const ASSETS = [
  'QuaAnSinh.html',
  'manifest.webmanifest',
  'icon-192.png',
  'icon-512.png',
  'apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Để Firebase / CDN tự đi mạng, chỉ xử lý file cùng nguồn
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then((r) => {
        const clone = r.clone();
        caches.open(CACHE).then((c) => c.put(req, clone)).catch(() => {});
        return r;
      })
      .catch(() => caches.match(req).then((m) => m || caches.match('QuaAnSinh.html')))
  );
});
