import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration from environment variables
// Prefer environment variables, but fall back to provided static config when env vars are not set.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDdif5pxt68qITGiQskpp0SzH_VG5EjHVw',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'odoo-sns.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'odoo-sns',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'odoo-sns.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '138163294490',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:138163294490:web:f1b890912e22b7e9569ca3',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-PRZJKPWPYM',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || undefined,
};

// Only initialize Firebase if apiKey is provided (prevents runtime errors when env vars are missing)
let app = null as any;
let _auth: any = null;
let _firestore: any = null;
let _storage: any = null;
let _database: any = null;

if (firebaseConfig.apiKey) {
  try {
    app = initializeApp(firebaseConfig);
    _auth = getAuth(app);
    _firestore = getFirestore(app);
    _storage = getStorage(app);
    _database = getDatabase(app);

    // Initialize Analytics only in browser environments and if measurementId is present
    if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
      try {
        // getAnalytics will throw if running in non-browser contexts; guard it
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const analyticsInstance = getAnalytics(app);
        // export via local binding
        (exports as any).analytics = analyticsInstance;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('Firebase Analytics initialization failed:', err);
      }
    }
  } catch (err) {
    // If initialization fails, log and leave services null so callers can guard usage
    // eslint-disable-next-line no-console
    console.warn('Firebase initialization failed:', err);
  }
} else {
  // eslint-disable-next-line no-console
  console.warn('Firebase not configured: VITE_FIREBASE_API_KEY missing. Skipping initialization.');
}

export const auth = _auth;
export const firestore = _firestore;
export const storage = _storage;
export const database = _database;
// `analytics` may be attached to `exports.analytics` above when initialized; provide typed export
export const analytics = (typeof (exports as any).analytics !== 'undefined') ? (exports as any).analytics : null;

export default app;
