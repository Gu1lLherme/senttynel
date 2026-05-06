/* SENTINEL Service Worker — Web Push */
self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = { title: 'SENTINEL', body: event.data?.text() || '' }; }

  const title = data.title || 'SENTINEL';
  const options = {
    body: data.body || '',
    icon: data.icon || '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200, 100, 400],
    tag: data.tag || 'sentinel-alert',
    requireInteraction: data.severity === 'critico' || data.severity === 'alto',
    data: { url: data.url || '/app', ...data },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/app';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const c of clients) {
        if (c.url.includes(url) && 'focus' in c) return c.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});

// Mensagem recebida do app principal — útil para "Encontrar dispositivo" tocar alarme
self.addEventListener('message', (event) => {
  if (event.data?.type === 'RING_DEVICE') {
    self.registration.showNotification('🔔 SENTINEL — Encontrar dispositivo', {
      body: event.data.message || 'Seu dispositivo está sendo localizado por um familiar.',
      icon: '/icon-192.png',
      vibrate: [500, 200, 500, 200, 500, 200, 500],
      requireInteraction: true,
      tag: 'find-device',
    });
  }
});
