import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC6l2yVIJp6YQexsGvgyd3Lnu4gvJEHRaQ",
  authDomain: "xenocognition-f5a6d.firebaseapp.com",
  projectId: "xenocognition-f5a6d",
  storageBucket: "xenocognition-f5a6d.firebasestorage.app",
  messagingSenderId: "641262467116",
  appId: "1:641262467116:web:2b86bf3a4c8fd0d9937989",
  measurementId: "G-H6RM6RGQZ9"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
