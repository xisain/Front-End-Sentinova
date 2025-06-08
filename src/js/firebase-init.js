// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAoGhUmNUxG6IaI8Z2uu7Qiq5WbVhBDXG4",
  authDomain: "sentinova.firebaseapp.com",
  projectId: "sentinova",
  storageBucket: "sentinova.firebasestorage.app",
  messagingSenderId: "412208638292",
  appId: "1:412208638292:web:56a77905074fbbed9f00c1",
  measurementId: "G-TQCLH643PZ"
};

// Initialize Firebase
let app;
let auth;
let db;
let analytics;

try {
  // Initialize Firebase only if it hasn't been initialized yet
  if (!app) {
    app = initializeApp(firebaseConfig);
    console.log('Firebase app initialized successfully');
  }

  // Initialize Auth
  if (!auth) {
    auth = getAuth(app);
    console.log('Firebase Auth initialized successfully');
  }

  // Initialize Firestore
  if (!db) {
    db = getFirestore(app);
    console.log('Firestore initialized successfully');
  }

  // Initialize Analytics
  if (!analytics) {
    analytics = getAnalytics(app);
    console.log('Analytics initialized successfully');
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

export { db, auth, app };