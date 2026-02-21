import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth } from "./firebase";
import { db } from "./firebase";

export async function login(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;
  console.log("logging");
  console.log(uid)


  // Fetch user profile from Firestore
  const userSnap = await getDoc(doc(db, "users", uid));

  if (!userSnap.exists()) {
    await auth.signOut();
    throw new Error("Access denied");
  }

  const userData = userSnap.data();
    console.log(userData);

  // Allow only admin
  if (userData.role !== "admin") {
    await auth.signOut();
    throw new Error("Access denied");
  }

  const user = {
    uid,
    email: cred.user.email,
    role: userData.role,
  };

  localStorage.setItem("user", JSON.stringify(user));
  return user;
}
