import { collection, getDoc, getDocs, query, where, doc, addDoc, serverTimestamp, updateDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { signOut } from "firebase/auth";
// User type
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  userImg?: string;
}

// Content type
export interface Content {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  modelUrl: string;
  quizzes: any[];
  AuthorId: string;
  createdAt: any;
  status: string;
}
export interface ReportWithDetails {
  id: string;
  contentId: string;
  contentTitle: string | null;
  reportedId: string;
  reportedName: string | null;
  reportedById: string;
  reportedByName: string | null;
  createdAt: any;
  Ignore: boolean;
  content: Content | null;
}

// Export fetch functions
export async function fetchUsers(): Promise<User[]> {
  const snap = await getDocs(collection(db, "users"));
  const users = snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as User));
  console.log("Users fetched:", users);
  return users;
}

export async function fetchContent(): Promise<Content[]> {
  const snap = await getDocs(collection(db, "content"));
  const content = snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Content));
  console.log("Content fetched:", content);
  return content;
}

export async function fetchMyContent(): Promise<Content[]> {
  // Get user from localStorage
  const userStr = localStorage.getItem("user");
  if (!userStr) return [];

  const user = JSON.parse(userStr);
  const uid = user.uid;

  // Firestore query: only my content
  const q = query(
    collection(db, "content"),
    where("AuthorId", "==", uid)
  );
  console.log("Querying for content with authorId:", uid);

  const snap = await getDocs(q);

  const myContent = snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Content));

  console.log("My content fetched:", myContent);
  return myContent;
}
export const fetchUserNameByUid = async (uid: string) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data().name : null;
}
export async function fetchReportsWithDetails(): Promise<ReportWithDetails[]> {
  const q = query(collection(db, "reports"));
  const snap = await getDocs(q);

  return Promise.all(
    snap.docs.map(async (docSnap) => {
      const data = docSnap.data() as any;

      // content
      const contentSnap = await getDoc(doc(db, "content", data.content));
      const content = contentSnap.exists()
        ? ({ id: contentSnap.id, ...contentSnap.data() } as Content)
        : null;

      // reported user
      const reportedSnap = await getDoc(doc(db, "users", data.reported));
      const reportedName = reportedSnap.exists() ? reportedSnap.data().name : null;

      // reported by
      const reportedBySnap = await getDoc(doc(db, "users", data.reportedby));
      const reportedByName = reportedBySnap.exists() ? reportedBySnap.data().name : null;

      return {
        id: docSnap.id,
        contentId: data.content,
        contentTitle: content?.title ?? null,
        content,
        reportedId: data.reported,
        reportedName,
        reportedById: data.reportedby,
        reportedByName,
        createdAt: data.createdAt,
        Ignore: data.Ignore,
      };
    })
  );
}
export async function deleteReport(reportId: string): Promise<void> {
  await deleteDoc(doc(db, "reports", reportId));
}
export async function deleteContent(contentId: string): Promise<void> {
  await deleteDoc(doc(db, "content", contentId));
}

/* ================= ADD CONTENT ================= */
export async function addContent(
  content: Omit<Content, "id" | "createdAt" | "status">
): Promise<string> {
  const docRef = await addDoc(collection(db, "content"), {
    ...content,
    Status: "active", // ✅ default status
    createdAt: serverTimestamp(),
  });

  console.log("Content added:", docRef.id);
  return docRef.id;
}

/* ================= UPDATE CONTENT ================= */
export async function updateContent(
  contentId: string,
  updatedData: Partial<Content>
): Promise<void> {
  const contentRef = doc(db, "content", contentId);

  await updateDoc(contentRef, {
    ...updatedData,
  });

  console.log("Content updated:", contentId);
}
export async function updateStatus(
  type: "user" | "content",
  contentId: string,
  Status: string
): Promise<void> {
  console.log("Updating status for type:", type, "ID:", contentId, "Status:", Status);
  await updateDoc(doc(db, type === "user" ? "users" : "content", contentId), {
    Status,
  });
}

export async function logout(): Promise<void> {
  await signOut(auth);
  localStorage.removeItem("user");
}