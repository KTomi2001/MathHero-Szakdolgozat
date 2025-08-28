import { initializeApp } from "firebase/app";
import { getAuth, sendEmailVerification } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyByxSE-p-gIor-Jr7-Uaa6qQGSXMRcv3v4",
  authDomain: "mathhero-69c73.firebaseapp.com",
  projectId: "mathhero-69c73",
  storageBucket: "mathhero-69c73.firebasestorage.app",
  messagingSenderId: "Y616445909489",
  appId: "Y1:616445909489:web:ed4e70bb229b11443c4c50",
  measurementId: "G-7R8JB967WZ",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, sendEmailVerification };
