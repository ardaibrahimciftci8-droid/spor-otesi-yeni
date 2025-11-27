// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase config
firebase.initializeApp({
  apiKey: "AIzaSyBzqEYs6V5oM2RLi1vOorMwgKDoOvqMmnI",
  authDomain: "sporotesi-a4ee9.firebaseapp.com",
  projectId: "sporotesi-a4ee9",
  storageBucket: "sporotesi-a4ee9.firebasestorage.app",
  messagingSenderId: "715719411524",
  appId: "1:715719411524:web:ead6e98b58bf6c27bff911"
});

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);
  
  const notificationTitle = payload.notification.title || 'Spor Ötesi';
  const notificationOptions = {
    body: payload.notification.body || 'Yeni bildiriminiz var',
    icon: '/logo.png',
    badge: '/logo.png',
    tag: payload.data?.tag || 'default',
    data: payload.data
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  // Navigate to specific page based on notification data
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
