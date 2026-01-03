import admin from 'firebase-admin';

let app: admin.app.App | null = null;
let _auth: admin.auth.Auth | null = null;
let _firestore: admin.firestore.Firestore | null = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
  try {
    const saJson = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
    const serviceAccount = JSON.parse(saJson);
    app = admin.initializeApp({ credential: admin.credential.cert(serviceAccount as any) });
    _auth = admin.auth(app);
    _firestore = admin.firestore(app);
    console.log('Firebase Admin initialized');
  } catch (err) {
    console.warn('Failed to initialize Firebase Admin SDK:', err);
  }
} else {
  console.warn('FIREBASE_SERVICE_ACCOUNT_BASE64 not set; Firebase Admin not initialized');
}

export const firebaseAdminApp = app;
export const adminAuth = _auth;
export const adminFirestore = _firestore;
export default firebaseAdminApp;
