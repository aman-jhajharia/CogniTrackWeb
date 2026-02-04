import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { auth } from "./firebase";

export const db = getFirestore();

export async function saveWeekData(weekKey, weekData) {
  const user = auth.currentUser;
  if (!user) return;

  const ref = doc(db, "users", user.uid, "weeks", weekKey);
  await setDoc(ref, { data: weekData }, { merge: true });
}

export async function loadWeekData(weekKey) {
  const user = auth.currentUser;
  if (!user) return {};

  const ref = doc(db, "users", user.uid, "weeks", weekKey);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return snap.data().data || {};
  }
  return {};
}