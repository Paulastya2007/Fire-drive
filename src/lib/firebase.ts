
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Declare variables that will hold Firebase services instances
// Use '!' assertion cautiously, assuming initialization logic handles undefined cases.
// Or allow them to be potentially undefined and handle checks in consuming code.
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

// Check if essential config is provided, especially the API key
if (firebaseConfig.apiKey) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
     console.error("Firebase initialization failed:", error);
     // Depending on the app's needs, you might want to throw the error,
     // or handle it gracefully by leaving services undefined.
     // Leaving them undefined for now.
  }
} else {
  // Log an error if the API key is missing, as Firebase cannot be initialized.
  console.error(
    "Firebase API Key (NEXT_PUBLIC_FIREBASE_API_KEY) is missing or empty in environment variables. Firebase services will not be initialized."
  );
  // Ensure services remain undefined or are assigned mock/null objects if needed elsewhere.
}

// Export the potentially undefined services.
// Components/functions using these exports should handle the possibility of them being undefined,
// especially if the API key is missing or initialization fails.
export { app, auth, db, storage };

