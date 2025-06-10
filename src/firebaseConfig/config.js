import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// const db = getFirestore(app);
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
