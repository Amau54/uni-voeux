// packages/frontend/src/lib/firestore.ts

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    connectFirestoreEmulator,
    DocumentData,
    QueryDocumentSnapshot
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Define the structure of a Wish object
export interface Wish {
  id: string;
  name: string;
  places: number;
  [key: string]: any; // Allow for custom labels
}

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

// Connect to Firestore Emulator in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    try {
        connectFirestoreEmulator(db, 'localhost', 8080);
        console.log("Connected to Firestore Emulator");
    } catch (e) {
        if (e.code !== 'failed-precondition') {
            console.error("Error connecting to Firestore Emulator:", e);
        }
    }
}

/**
 * Fetches all wishes from the 'wishes' collection.
 * @returns {Promise<Wish[]>} A promise that resolves to an array of wishes.
 */
export const getWishes = async (): Promise<Wish[]> => {
  const wishesCollection = collection(db, 'wishes');
  const wishSnapshot = await getDocs(wishesCollection);
  const wishList = wishSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
    id: doc.id,
    ...doc.data(),
  } as Wish));
  return wishList;
};

/**
 * Adds a new wish to the 'wishes' collection.
 * @param {Omit<Wish, 'id'>} wishData - The data for the new wish.
 * @returns {Promise<Wish>} A promise that resolves to the newly created wish with its ID.
 */
export const addWish = async (wishData: Omit<Wish, 'id'>): Promise<Wish> => {
    const wishesCollection = collection(db, 'wishes');
    const docRef = await addDoc(wishesCollection, wishData);
    return {
        id: docRef.id,
        ...wishData,
    };
};

/**
 * Deletes a wish from the 'wishes' collection.
 * @param {string} wishId - The ID of the wish to delete.
 * @returns {Promise<void>} A promise that resolves when the wish is deleted.
 */
export const deleteWish = async (wishId: string): Promise<void> => {
    const wishDoc = doc(db, 'wishes', wishId);
    await deleteDoc(wishDoc);
};

/**
 * Updates a wish in the 'wishes' collection.
 * @param {string} wishId - The ID of the wish to update.
 * @param {Partial<Omit<Wish, 'id'>>} wishData - The data to update.
 * @returns {Promise<void>} A promise that resolves when the wish is updated.
 */
export const updateWish = async (wishId: string, wishData: Partial<Omit<Wish, 'id'>>): Promise<void> => {
    const wishDoc = doc(db, 'wishes', wishId);
    await updateDoc(wishDoc, wishData);
};

export { app, db, auth };
