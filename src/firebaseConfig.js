// src/firebaseConfig.js
// Import the necessary Firebase modules
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Firestore
import { getAuth } from "firebase/auth"; // Authentication
import { getStorage } from "firebase/storage"; // Storage

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC4WE_3KwvarltOhr4WTwiZOwmyNloBq7U",
  authDomain: "chypto-a2a7b.firebaseapp.com",
  projectId: "chypto-a2a7b",
  storageBucket: "chypto-a2a7b.appspot.com",
  messagingSenderId: "437431758705",
  appId: "1:437431758705:web:153b175d32b2d28cfd50d0",
  measurementId: "G-HZM4DSTL3N",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Authentication
const auth = getAuth(app);

// Initialize Storage
const storage = getStorage(app);

// Export the initialized instances
export { app, db, auth, storage };
