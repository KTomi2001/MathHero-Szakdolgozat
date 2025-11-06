import { initializeApp } from "firebase/app";
import { getAuth, sendEmailVerification } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getPerformance } from "firebase/performance";

const firebaseConfig = {
  apiKey: "AIzaSyByxSE-p-gIor-Jr7-Uaa6qQGSXMRcv3v4",
  authDomain: "mathhero-69c73.firebaseapp.com",
  projectId: "mathhero-69c73",
  storageBucket: "mathhero-69c73.appspot.com",
  messagingSenderId: "616445909489",
  appId: "1:616445909489:web:ed4e70bb229b11443c4c50",
  measurementId: "G-7R8JB967WZ",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const perf = getPerformance(app);

export { app, auth, db, analytics, perf, sendEmailVerification };
