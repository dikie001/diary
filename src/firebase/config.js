import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAccBRB26-ah89wbJplP1fpa2I4DSTDfGw",
  authDomain: "whisper-note-ef57e.firebaseapp.com",
  projectId: "whisper-note-ef57e",
  storageBucket: "whisper-note-ef57e.firebasestorage.app",
  messagingSenderId: "596528563138",
  appId: "1:596528563138:web:b46326390d00030461cc5b",
  measurementId: "G-M1268Y4HC3",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const provider = new GoogleAuthProvider();
export const auth = getAuth(app);
export const db = getFirestore(app);
