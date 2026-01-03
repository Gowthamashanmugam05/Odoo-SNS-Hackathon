import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  QueryConstraint,
} from 'firebase/firestore';
import { firestore } from './config';

// Generic functions for Firestore operations
export const addDocument = async (collectionName: string, data: Record<string, any>) => {
  try {
    const docRef = await addDoc(collection(firestore, collectionName), {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
};

export const getDocuments = async (
  collectionName: string,
  constraints?: QueryConstraint[]
) => {
  try {
    const q = constraints
      ? query(collection(firestore, collectionName), ...constraints)
      : collection(firestore, collectionName);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting documents:', error);
    throw error;
  }
};

export const getDocument = async (collectionName: string, docId: string) => {
  try {
    const docRef = doc(firestore, collectionName, docId);
    const docSnapshot = await getDoc(docRef);
    if (docSnapshot.exists()) {
      return {
        id: docSnapshot.id,
        ...docSnapshot.data(),
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
};

export const updateDocument = async (
  collectionName: string,
  docId: string,
  data: Record<string, any>
) => {
  try {
    const docRef = doc(firestore, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
};

export const setDocument = async (
  collectionName: string,
  docId: string,
  data: Record<string, any>
) => {
  try {
    const docRef = doc(firestore, collectionName, docId);
    const now = new Date();
    await setDoc(docRef, {
      ...data,
      createdAt: data.createdAt ?? now,
      updatedAt: now,
    });
  } catch (error) {
    console.error('Error setting document:', error);
    throw error;
  }
};

export const deleteDocument = async (collectionName: string, docId: string) => {
  try {
    const docRef = doc(firestore, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

// Query helper
export const queryDocuments = async (
  collectionName: string,
  field: string,
  operator: any,
  value: any
) => {
  try {
    const q = query(
      collection(firestore, collectionName),
      where(field, operator, value)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error querying documents:', error);
    throw error;
  }
};
