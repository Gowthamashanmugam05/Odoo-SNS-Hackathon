import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth as firebaseAuth } from '@/integrations/firebase/config';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  onAuthStateChanged as onFirebaseAuthStateChanged,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
  signOut as firebaseSignOutFn,
} from 'firebase/auth';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { setDocument, getDocument } from '@/integrations/firebase/operations';

interface AppUser {
  id: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<AppUser | null>;
  signIn: (email: string, password: string) => Promise<AppUser | null>;
  signInWithGoogle: () => Promise<AppUser | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to Firebase auth state
    let unsubscribe: (() => void) | null = null;
    if (firebaseAuth) {
      unsubscribe = onFirebaseAuthStateChanged(firebaseAuth, async (fbUser) => {
        if (!fbUser) {
          setUser(null);
          setLoading(false);
          return;
        }
        // Normalize user object
        const appUser: AppUser = {
          id: fbUser.uid,
          email: fbUser.email ?? null,
          displayName: fbUser.displayName ?? null,
          photoURL: fbUser.photoURL ?? null,
        };

        // Ensure profile document exists (use UID as doc id)
        try {
          const existing = await getDocument('profiles', fbUser.uid);
          if (!existing) {
            await setDocument('profiles', fbUser.uid, {
              name: fbUser.displayName ?? '',
              email: fbUser.email ?? '',
              created_at: new Date().toISOString(),
            });
          }
        } catch (e) {
          console.warn('Error ensuring profile document', e);
        }

        setUser(appUser);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, name?: string) => {
    if (!firebaseAuth) {
      console.warn('Firebase not configured: signUp skipped');
      return null;
    }
    try {
      const cred = await firebaseCreateUserWithEmailAndPassword(firebaseAuth, email, password);
      const fbUser = cred.user;
      // create profile document with UID
      await setDocument('profiles', fbUser.uid, {
        name: name ?? fbUser.displayName ?? '',
        email: fbUser.email ?? '',
        created_at: new Date().toISOString(),
      });
      const appUser: AppUser = { id: fbUser.uid, email: fbUser.email ?? null, displayName: name ?? fbUser.displayName ?? null };
      setUser(appUser);
      return appUser;
    } catch (err) {
      console.error('Firebase signUp error', err);
      return null;
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!firebaseAuth) {
      console.warn('Firebase not configured: signIn skipped');
      return null;
    }
    try {
      const cred = await firebaseSignInWithEmailAndPassword(firebaseAuth, email, password);
      const fbUser = cred.user;
      const appUser: AppUser = { id: fbUser.uid, email: fbUser.email ?? null, displayName: fbUser.displayName ?? null };
      setUser(appUser);
      return appUser;
    } catch (err) {
      console.error('Firebase signIn error', err);
      return null;
    }
  };

  const signInWithGoogle = async () => {
    if (!firebaseAuth) {
      console.warn('Firebase not configured: signInWithGoogle skipped');
      return null;
    }
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      const fbUser = result.user;
      // ensure profile exists
      try {
        const existing = await getDocument('profiles', fbUser.uid);
        if (!existing) {
          await setDocument('profiles', fbUser.uid, {
            name: fbUser.displayName ?? '',
            email: fbUser.email ?? '',
            created_at: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.warn('Error ensuring profile document after Google sign-in', e);
      }
      const appUser: AppUser = { id: fbUser.uid, email: fbUser.email ?? null, displayName: fbUser.displayName ?? null };
      setUser(appUser);
      return appUser;
    } catch (err) {
      console.error('Firebase Google signIn error', err);
      return null;
    }
  };

  const signOut = async () => {
    if (firebaseAuth) {
      try {
        await firebaseSignOutFn(firebaseAuth);
      } catch (err) {
        console.warn('Firebase signOut failed', err);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
