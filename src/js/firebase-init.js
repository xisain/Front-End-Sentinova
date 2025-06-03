// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB0fWxtBlTmwx3L7d1LQJcTs9HZuzcn3i8",
  authDomain: "sentinova-e1eb4.firebaseapp.com",
  databaseURL: "https://sentinova-e1eb4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sentinova-e1eb4",
  storageBucket: "sentinova-e1eb4.firebasestorage.app",
  messagingSenderId: "203022381582",
  appId: "1:203022381582:web:dc345b509beffbc1e6425f",
  measurementId: "G-MZZXW8PF4J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { db, auth };