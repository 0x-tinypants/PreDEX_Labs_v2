import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// 🔐 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD2-EAaamhXpWkGKrxFDKkX8sHnuAWh-w0",
  authDomain: "predex-22ce1.firebaseapp.com",
  databaseURL: "https://predex-22ce1-default-rtdb.firebaseio.com",
  projectId: "predex-22ce1",
  storageBucket: "predex-22ce1.firebasestorage.app",
  messagingSenderId: "800069126085",
  appId: "1:800069126085:web:3a422f7615c948bf93adac",
};

// 🚀 Initialize app
const app = initializeApp(firebaseConfig);

// 🔥 Realtime DB instance (THIS is what we use everywhere)
export const db = getDatabase(app);