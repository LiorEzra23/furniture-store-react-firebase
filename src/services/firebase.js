import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAU8k2o3tZHySc9V8Fc4vGgwiEf05berOI",
  authDomain: "lior-furniture-store.firebaseapp.com",
  projectId: "lior-furniture-store",
  storageBucket: "lior-furniture-store.firebasestorage.app",
  messagingSenderId: "884779583234",
  appId: "1:884779583234:web:5376c651cdb0b0efb1641b",
  measurementId: "G-RF437ZSYTS"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);