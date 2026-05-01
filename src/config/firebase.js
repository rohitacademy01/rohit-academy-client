import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBw1LyyJrNdem3SrhmImnxvWfoM1UZpagI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "rohit-academy2026.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "rohit-academy2026",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "rohit-academy2026.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "498241904742",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:498241904742:web:81ba247bdf9090eb494da7",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
