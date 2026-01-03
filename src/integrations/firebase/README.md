# Firebase integration

This folder contains a minimal Firebase integration for the project.

Files:
- `config.ts` - initializes Firebase and exports `auth`, `firestore`, `storage`, `database`.
- `operations.ts` - helper functions for common Firestore operations (`addDocument`, `getDocuments`, etc.).

Quick setup
1. Install the SDK (already done in this workspace):

```bash
npm install firebase
# or
bun install firebase
```

2. Copy `.env.example` to `.env.local` and fill in values from the Firebase console.

3. Restart your dev server (`npm run dev`) so Vite picks up new env vars.

Example usage

Import the helper and call `addDocument` from any component or hook:

```ts
import { addDocument, getDocuments } from '@/integrations/firebase/operations';

// Add a new trip document
const createTrip = async () => {
  const data = {
    title: 'My Trip to Paris',
    startDate: new Date().toISOString(),
    ownerId: 'user_abc',
  };

  try {
    const id = await addDocument('trips', data);
    console.log('Created trip with id', id);
  } catch (err) {
    console.error(err);
  }
};
```

Example React component
See `src/components/TripExampleFirebase.tsx` for a minimal example that uses `addDocument`.
