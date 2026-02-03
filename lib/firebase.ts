import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
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

// 🔹 Export auth instance
export const auth = getAuth(app);