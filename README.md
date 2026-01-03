# Odoo---SNS-Hackathon

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDdif5pxt68qITGiQskpp0SzH_VG5EjHVw",
  authDomain: "odoo-sns.firebaseapp.com",
  projectId: "odoo-sns",
  storageBucket: "odoo-sns.firebasestorage.app",
  messagingSenderId: "138163294490",
  appId: "1:138163294490:web:f1b890912e22b7e9569ca3",
  measurementId: "G-PRZJKPWPYM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

## Server service account (safe setup)

This project uses Firebase on both client and server. For server-side admin operations (Cloud Functions, backend jobs), do NOT commit your service account JSON into the repository.

Instead, create a base64-encoded environment variable called `FIREBASE_SERVICE_ACCOUNT_BASE64` and store the service account JSON there. Example:

Linux / macOS:

```bash
export FIREBASE_SERVICE_ACCOUNT_BASE64=$(base64 -w 0 service-account.json)
```

Windows PowerShell:

```powershell
$env:FIREBASE_SERVICE_ACCOUNT_BASE64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes('service-account.json'))
```

Then in server code initialize the Admin SDK using the `server/firebase-admin.ts` helper included in the repo. Do NOT add the raw JSON file to the repository; if you have, rotate/revoke the key immediately in the Firebase Console.

## Removing Supabase (optional)

This project was migrated from Supabase to Firebase for auth and data. If you have confirmed the application works fully with Firebase, you can remove Supabase from the codebase and dependencies.

Steps to remove Supabase safely:

1. Remove or delete the Supabase integration files (already replaced with stubs in `src/integrations/supabase`).
2. Remove Supabase env vars from your `.env.local` (if present).
3. Uninstall the package (run locally):

```bash
npm uninstall @supabase/supabase-js
```

4. Run a full local build and test:

```bash
npm install
npm run build
npm run dev
```

5. If everything works, delete the stub files and update the repo.

Note: I recommend keeping a backup branch before removing dependencies.
