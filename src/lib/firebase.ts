import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
// import { getFirestore, type Firestore } from 'firebase/firestore'; // Uncomment if using Firestore

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

if (!apiKey) {
  throw new Error(
    "CRITICAL CONFIGURATION ERROR: The Firebase API Key (NEXT_PUBLIC_FIREBASE_API_KEY) is missing. " +
    "This is an essential environment variable that MUST be set in your Firebase Studio project settings. " +
    "The application cannot initialize Firebase and will not run without it."
  );
}
if (!authDomain) {
  throw new Error(
    "CRITICAL CONFIGURATION ERROR: The Firebase Auth Domain (NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) is missing. " +
    "This is an essential environment variable that MUST be set in your Firebase Studio project settings. " +
    "The application cannot initialize Firebase and will not run without it."
  );
}
if (!projectId) {
  throw new Error(
    "CRITICAL CONFIGURATION ERROR: The Firebase Project ID (NEXT_PUBLIC_FIREBASE_PROJECT_ID) is missing. " +
    "This is an essential environment variable that MUST be set in your Firebase Studio project settings. " +
    "The application cannot initialize Firebase and will not run without it."
  );
}

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: authDomain,
  projectId: projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
// const db: Firestore = getFirestore(app); // Uncomment if using Firestore

export { app, auth /*, db */ }; // Export db if using Firestore
