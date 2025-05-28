import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBNjGX_R75h2zRmHgVH2I30dbpltIWAUXA",
  authDomain: "soccer-discovery.firebaseapp.com",
  projectId: "soccer-discovery",
  storageBucket: "soccer-discovery.firebasestorage.app",
  messagingSenderId: "662326640349",
  appId: "1:662326640349:web:c4e9aa92fbef36ff68e534",
  measurementId: "G-C4C9DQGH0V"
};

// Initialize Firebase app only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Only initialize analytics on client
let analytics;
if (typeof window !== 'undefined') {
  // dynamically import so it runs only in browser
  import('firebase/analytics').then(({ getAnalytics }) => {
    analytics = getAnalytics(app);
  });
}

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
