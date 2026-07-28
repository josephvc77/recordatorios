const CACHE_NAME = 'recordatorios-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/favicon.ico',
  '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// EVENTO DE NOTIFICACIÓN DE RECORDATORIO DIARIO 9:00 AM
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_DAILY_9AM') {
    console.log('⏰ Service Worker: Programación de notificaciones de las 9:00 AM activada.');
  }
  if (event.data && event.data.type === 'TRIGGER_NOTIFICATION') {
    const { title, body, count } = event.data;
    self.registration.showNotification(title || '🚨 Recordatorios Importantes', {
      body: body || `Tienes ${count || 0} solicitudes próximas a vencer o en revisión prioritaria.`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'daily-reminder-9am',
      renotify: true,
      vibrate: [200, 100, 200],
      data: { url: '/dashboard' }
    });
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/dashboard');
      }
    })
  );
});
