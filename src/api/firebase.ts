import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "", // replace with your
  authDomain: "", // replace with your
  projectId: "", // replace with your
  storageBucket: "", // replace with your
  messagingSenderId: "", // replace with your
  appId: "" // replace with your
};


let app;
try {
  app = initializeApp(firebaseConfig);
  console.log("✅ Firebase app initialized");
} catch (err) {
  console.error("❌ Firebase init failed", err);
}

export const db = getFirestore(app);
console.log("✅ Firestore ready");

export const auth = getAuth(app);
console.log("✅ Firebase Auth ready");
