const CACHE_NAME = 'bcc-pwa-v1';
const STATIC_ASSETS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() =>
      caches.match('/index.html')
    ))
  );
});

self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: 'BCC Dashboard', body: 'Tienes recordatorios pendientes' };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-96.png',
      tag: data.tag || 'bcc-reminder',
      data: data.url || '/',
      actions: [{ action: 'open', title: 'Ver' }, { action: 'dismiss', title: 'Cerrar' }]
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action !== 'dismiss') {
    e.waitUntil(clients.openWindow(e.notification.data || '/'));
  }
});
