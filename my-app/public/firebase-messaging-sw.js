// /public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyDDll49zj2wWocC83DNCR0mGulnlfZuTIY",
    authDomain: "grwm-541aa.firebaseapp.com",
    projectId: "grwm-541aa",
    storageBucket: "grwm-541aa.firebasestorage.app",
    messagingSenderId: "868765979107",
    appId: "1:868765979107:web:3e7771bdd4b987184c90d6",
    measurementId: "G-FH4G0FNT0R"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    self.registration.showNotification(
        payload.notification.title,
        { body: payload.notification.body }
    );
});