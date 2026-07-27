importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyC-s-kIyhyHkVnNXbHekCsfskKetG-RRnTM",
  authDomain: "nic-beita.firebaseapp.com",
  projectId: "nic-beita",
  storageBucket: "nic-beita.firebasestorage.app",
  messagingSenderId: "520181014477",
  appId: "1:520181014477:web:2a8d4f2bale528b0542e84",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
