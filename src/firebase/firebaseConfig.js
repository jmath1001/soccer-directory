// firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBNjGX_R75h2zRmHgVH2I30dbpltIWAUXA",
  authDomain: "soccer-discovery.firebaseapp.com",
  projectId: "soccer-discovery",
  storageBucket: "soccer-discovery.appspot.com", // ✅ Corrected
  messagingSenderId: "662326640349",
  appId: "1:662326640349:web:c4e9aa92fbef36ff68e534",
  measurementId: "G-C4C9DQGH0V"
};

// Prevent re-initialization
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(app);
const db = getFirestore(app);

// Only run client-side logic
if (typeof window !== 'undefined') {
  // Force session-only login (no localStorage persistence)
  setPersistence(auth, browserSessionPersistence).catch((err) =>
    console.warn("Auth persistence error", err)
  );

  // Analytics (optional)
  import("firebase/analytics").then(({ getAnalytics }) => {
    getAnalytics(app);
  });
}

export { auth, db };
