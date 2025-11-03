// src/firebase/config.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCNiVII2otpKcZE6xYgm0Yf-U6Ncj2_oAs",
  authDomain: "instprint2021-cb6a3.firebaseapp.com",
  projectId: "instprint2021-cb6a3",
  storageBucket: "instprint2021-cb6a3.firebasestorage.app",
  messagingSenderId: "356471636863",
  appId: "1:356471636863:web:473536549a6936cdec104a",
  measurementId: "G-HHVCW105NL"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth };