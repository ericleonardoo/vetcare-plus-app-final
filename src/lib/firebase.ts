// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "studio-8857767906-b1d09",
  appId: "1:435186047851:web:e768f398071646b9f10a2e",
  storageBucket: "studio-8857767906-b1d09.firebasestorage.app",
  apiKey: "AIzaSyDVsKdG-Cl7iHRJfD8TqmBMnrPd-minoyM",
  authDomain: "studio-8857767906-b1d09.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "435186047851",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
