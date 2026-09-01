/* ==========================================================================
   AAKRUTHEE - Service Worker & iPhone Web Push Notification Handler
   ========================================================================== */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// LISTEN FOR PUSH NOTIFICATIONS FROM SERVER (9:00 AM & 9:00 PM IST)
self.addEventListener('push', (event) => {
  let data = { title: 'Aakruthee', body: 'Reminder to log today\'s site expenses and advances.' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || 'Reminder to log today\'s site expenses and advances.',
    icon: '/Logo.jpeg',
    badge: '/Logo.jpeg',
    vibrate: [100, 50, 100],
    data: { dateOfArrival: Date.now(), primaryKey: '1' },
    actions: [
      { action: 'open', title: 'Open Aakruthee' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Aakruthee', options)
  );
});

// OPEN APP ON NOTIFICATION CLICK
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            return clientList[i];
          }
        }
        return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});
