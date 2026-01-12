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
    setDoc,
    getDoc,
    connectFirestoreEmulator,
    DocumentData,
    QueryDocumentSnapshot
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';

// Define the structure of a Wish object
export interface Wish {
  id: string;
  name: string;
  places: number;
  [key: string]: any; // Allow for custom labels
}

// Define the structure of a Student object
export interface Student {
    id: string;
    name: string;
    rank: number;
}

// Define the structure of an Assignment object
export interface Assignment {
    id: string;
    studentId: string;
    studentName: string;
    studentRank: number;
    wishId: string;
    wishName: string;
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
const functions = getFunctions(app);

// Connect to Emulators in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    try {
        connectFirestoreEmulator(db, 'localhost', 8080);
        connectFunctionsEmulator(functions, 'localhost', 5001);
        console.log("Connected to Firestore and Functions Emulators");
    } catch (e) {
        if (e.code !== 'failed-precondition') {
            console.error("Error connecting to Emulators:", e);
        }
    }
}

// --- Wishes CRUD ---

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

// --- Students CRUD ---

/**
 * Fetches all students from the 'students' collection.
 * @returns {Promise<Student[]>} A promise that resolves to an array of students.
 */
export const getStudents = async (): Promise<Student[]> => {
    const studentsCollection = collection(db, 'students');
    const studentSnapshot = await getDocs(studentsCollection);
    const studentList = studentSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...doc.data(),
    } as Student));
    return studentList.sort((a, b) => a.rank - b.rank); // Sort by rank
};

/**
 * Adds a new student to the 'students' collection.
 * @param {Omit<Student, 'id'>} studentData - The data for the new student.
 * @returns {Promise<Student>} A promise that resolves to the newly created student with their ID.
 */
export const addStudent = async (studentData: Omit<Student, 'id'>): Promise<Student> => {
    const studentsCollection = collection(db, 'students');
    const docRef = await addDoc(studentsCollection, studentData);
    return {
        id: docRef.id,
        ...studentData,
    };
};

/**
 * Updates a student in the 'students' collection.
 * @param {string} studentId - The ID of the student to update.
 * @param {Partial<Omit<Student, 'id'>>} studentData - The data to update.
 * @returns {Promise<void>} A promise that resolves when the student is updated.
 */
export const updateStudent = async (studentId: string, studentData: Partial<Omit<Student, 'id'>>): Promise<void> => {
    const studentDoc = doc(db, 'students', studentId);
    await updateDoc(studentDoc, studentData);
};

/**
 * Deletes a student from the 'students' collection.
 * @param {string} studentId - The ID of the student to delete.
 * @returns {Promise<void>} A promise that resolves when the student is deleted.
 */
export const deleteStudent = async (studentId: string): Promise<void> => {
    const studentDoc = doc(db, 'students', studentId);
    await deleteDoc(studentDoc);
};

// --- Student Wish Selection ---

/**
 * Saves a student's wish selection.
 * @param {string} studentId - The ID of the student.
 * @param {string[]} wishIds - An ordered array of wish IDs.
 * @returns {Promise<void>}
 */
export const saveStudentWishes = async (studentId: string, wishIds: string[]): Promise<void> => {
    const studentWishesDoc = doc(db, 'studentWishes', studentId);
    await setDoc(studentWishesDoc, { wishes: wishIds });
};

/**
 * Gets a student's wish selection.
 * @param {string} studentId - The ID of the student.
 * @returns {Promise<string[] | null>} A promise that resolves to an array of wish IDs or null if not found.
 */
export const getStudentWishes = async (studentId: string): Promise<string[] | null> => {
    const studentWishesDoc = doc(db, 'studentWishes', studentId);
    const docSnap = await getDoc(studentWishesDoc);
    if (docSnap.exists()) {
        return docSnap.data().wishes as string[];
    }
    return null;
};

// --- Assignment ---

/**
 * Triggers the runAssignment Cloud Function.
 * @returns {Promise<any>} The result from the Cloud Function.
 */
export const runAssignment = async (): Promise<any> => {
    const runAssignmentFunction = httpsCallable(functions, 'runAssignment');
    const result = await runAssignmentFunction();
    return result.data;
};

/**
 * Fetches all assignments from the 'assignments' collection.
 * @returns {Promise<Assignment[]>} A promise that resolves to an array of assignments.
 */
export const getAssignments = async (): Promise<Assignment[]> => {
    const assignmentsCollection = collection(db, 'assignments');
    const assignmentSnapshot = await getDocs(assignmentsCollection);
    const assignmentList = assignmentSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...doc.data(),
    } as Assignment));
    return assignmentList.sort((a, b) => a.studentRank - b.studentRank);
};

export { app, db, auth };
