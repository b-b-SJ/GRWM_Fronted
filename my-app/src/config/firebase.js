// /src/config/firebase.js

import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getMessaging } from 'firebase/messaging';

// https://firebase.google.com/docs/web/setup#available-libraries
const firebaseConfig = {
    apiKey: "AIzaSyDDll49zj2wWocC83DNCR0mGulnlfZuTIY",
    authDomain: "grwm-541aa.firebaseapp.com",
    projectId: "grwm-541aa",
    storageBucket: "grwm-541aa.firebasestorage.app",
    messagingSenderId: "868765979107",
    appId: "1:868765979107:web:3e7771bdd4b987184c90d6",
    measurementId: "G-FH4G0FNT0R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const messaging = getMessaging(app);