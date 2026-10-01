import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDEH-B-Q-JN11QmeHnD9bI9cPmc9y2ixps",
  authDomain: "garmentsinevntory.firebaseapp.com",
  projectId: "garmentsinevntory",
  storageBucket: "garmentsinevntory.firebasestorage.app",
  messagingSenderId: "306507727550",
  appId: "1:306507727550:web:7c11d69b63856921a1d4ef",
  measurementId: "G-D2MZC650H1",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);

// ── firebaseConfig export (needed for secondary app when admin creates users) ──
export { firebaseConfig };
export default app;
