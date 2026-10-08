/* ==========================================================================
   AAKRUTHEE - Service Worker & iPhone Web Push Notification Handler
   ========================================================================== */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// LISTEN FOR PUSH NOTIFICATIONS FROM SERVER
self.addEventListener('push', (event) => {
  let data = { title: 'Aakruthee', body: 'Reminder to log today\'s site expenses and advances.' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const targetUrl = data.url || (data.taskId ? `/?task_id=${data.taskId}` : '/');

  const options = {
    body: data.body || 'Reminder to log today\'s site expenses and advances.',
    icon: '/Logo.jpeg',
    badge: '/Logo.jpeg',
    vibrate: [100, 50, 100],
    data: { 
      dateOfArrival: Date.now(), 
      primaryKey: '1',
      taskId: data.taskId || null,
      url: targetUrl
    },
    actions: [
      { action: 'open', title: 'Open Task' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Aakruthee', options)
  );
});

// OPEN & DEEP-LINK APP ON NOTIFICATION CLICK
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const notifData = event.notification.data || {};
  const targetUrl = notifData.url || (notifData.taskId ? `/?task_id=${notifData.taskId}` : '/');

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if ('focus' in client) {
          if (notifData.taskId && 'postMessage' in client) {
            client.postMessage({ type: 'OPEN_TASK', taskId: notifData.taskId });
          }
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
