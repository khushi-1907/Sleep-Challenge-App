import { getApp, getApps, initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, getFirestore, limit, orderBy, query, setDoc, Timestamp } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBA7L2FFaCfhRQUzYyqUkyvaOqnll5PR1M",
  authDomain: "sleepchallenge-bcda0.firebaseapp.com",
  projectId: "sleepchallenge-bcda0",
  storageBucket: "sleepchallenge-bcda0.firebasestorage.app",
  messagingSenderId: "775754636878",
  appId: "1:775754636878:web:6137d250ad2d5957562d1f"
};

// 🔹 Initialize Firebase safely (Expo + Web)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 🔹 Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// 🔹 Authentication functions
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const signupUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// 🔹 Firestore sleep data functions
export interface SleepData {
  date: Timestamp;
  sleepTime: Timestamp;
  wakeTime: Timestamp;
  durationHours: number;
  deviationMinutes: number;
}

export const saveSleepData = async (userId: string, dateKey: string, sleepData: Omit<SleepData, 'date'>) => {
  try {
    const docRef = doc(db, 'users', userId, 'sleepData', dateKey);
    await setDoc(docRef, {
      ...sleepData,
      date: Timestamp.fromDate(new Date(dateKey))
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getSleepData = async (userId: string, dateKey: string) => {
  try {
    const docRef = doc(db, 'users', userId, 'sleepData', dateKey);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() as SleepData };
    }
    return { success: false, error: 'No data found' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getAllSleepData = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'users', userId, 'sleepData'),
      orderBy('date', 'desc'),
      limit(60)
    );
    const querySnapshot = await getDocs(q);
    const sleepData: { [key: string]: SleepData } = {};
    
    querySnapshot.forEach((doc) => {
      sleepData[doc.id] = doc.data() as SleepData;
    });
    
    return { success: true, data: sleepData };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};