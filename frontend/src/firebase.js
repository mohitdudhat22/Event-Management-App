import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyDhk0hPcumicd-ldA2CcSVwQy4SBPH7wK0",
    authDomain: "event-management-app-301ba.firebaseapp.com",
    projectId: "event-management-app-301ba",
    storageBucket: "event-management-app-301ba.appspot.com",
    messagingSenderId: "559509618905",
    appId: "1:559509618905:web:4b1079660eb60a2ff8bec8",
    measurementId: "G-PL02RQH86M"
};

const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);