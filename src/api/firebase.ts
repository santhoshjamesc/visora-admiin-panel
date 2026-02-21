import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAf75NMaaTaW5q7lkemeyw-uO3k8w8gstE",
  authDomain: "areducationapp-d4473.firebaseapp.com",
  projectId: "areducationapp-d4473",
  storageBucket: "areducationapp-d4473.firebasestorage.app",
  messagingSenderId: "334695726010",
  appId: "1:334695726010:web:06b46fbb3cc51d8087bb83"
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
