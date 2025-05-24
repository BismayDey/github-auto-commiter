import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAdI2OCc24EcTW-kmSeJLqZx0Gzav1YhoQ",
  authDomain: "linked-4afa2.firebaseapp.com",
  projectId: "linked-4afa2",
  storageBucket: "linked-4afa2.firebasestorage.app",
  messagingSenderId: "962680318028",
  appId: "1:962680318028:web:51f51ec807d70240626ce9",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
