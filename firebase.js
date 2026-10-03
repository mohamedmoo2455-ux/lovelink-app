import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC6HacjoT5YMaCZlYFIQ6Blsus2uEjBS8I",
  authDomain: "lovelink-app-891ea.firebaseapp.com",
  projectId: "lovelink-app-891ea",
  storageBucket: "lovelink-app-891ea.firebasestorage.app",
  messagingSenderId: "545304330955",
  appId: "1:545304330955:web:077cf2738a5199b847514e"
};

// منع تكرار تهيئة السيرفر أثناء الـ Refresh
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);