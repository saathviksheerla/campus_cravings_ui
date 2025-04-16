// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB1eenTFDJNcDVFg5QiJxKrzTClg6UrrsI",
  authDomain: "campus-cravings-dd75f.firebaseapp.com",
  projectId: "campus-cravings-dd75f",
  storageBucket: "campus-cravings-dd75f.firebasestorage.app",
  messagingSenderId: "231130845805",
  appId: "1:231130845805:web:e1c511436dcb84a5d2a564"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png', // Add your logo in public folder
    badge: '/badge-icon.png', // Add a badge icon in public folder
    data: payload.data,
    actions: [
      {
        action: 'view_order',
        title: 'View Order'
      }
    ]
  };
  
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;
  const data = notification.data;
  
  console.log('Notification clicked:', notification);
  console.log('Action:', action);
  
  if (action === 'view_order' && data.orderId) {
    // Open orders page
    const ordersUrl = '/orders';
    event.waitUntil(
      clients.openWindow(ordersUrl)
    );
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(windowClients => {
        // Check if there is already a window open
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
  
  notification.close();
});