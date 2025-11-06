// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration - replace with your actual values
const firebaseConfig = {
  apiKey: "AIzaSyBWHpuup1tZRPZ6OJDeJmVVFtoHuDzdSzM",
  authDomain: "zennest-app.firebaseapp.com",
  projectId: "zennest-app",
  storageBucket: "zennest-app.firebasestorage.app",
  messagingSenderId: "261551533873",
  appId: "1:261551533873:web:eed43247427d86118fca10",
  measurementId: "G-9LVP1VG1VC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

export default app;