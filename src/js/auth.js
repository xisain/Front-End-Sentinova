import { auth, db } from "./firebase-init";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateEmail,
  updatePassword
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

// Validasi email domain
const allowedDomains = ["gmail.com", "yahoo.com", "outlook.com"];
function isValidEmailDomain(email) {
  const parts = email.split("@");
  return parts.length === 2 && allowedDomains.includes(parts[1]);
}

// Register
export async function registerUser(username, email, password) {
  if (!username) throw new Error("Username tidak boleh kosong.");
  if (!isValidEmailDomain(email)) throw new Error("Gunakan domain @gmail.com, @yahoo.com, atau @outlook.com");
  if (password.length < 8) throw new Error("Password minimal 8 karakter.");

  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, "users", userCred.user.uid), { username, email });
  return userCred.user;
}

// Login
export async function loginUser(email, password) {
  if (!isValidEmailDomain(email)) throw new Error("Gunakan domain @gmail.com, @yahoo.com, atau @outlook.com");
  return await signInWithEmailAndPassword(auth, email, password);
}

// Logout
export async function logoutUser() {
  await signOut(auth);
}

// Cek login
export function onUserChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// Optional: update profil
export async function updateUserProfile(username, email, password) {
  const user = auth.currentUser;
  if (!user) throw new Error("Tidak ada user aktif.");

  if (!isValidEmailDomain(email)) throw new Error("Gunakan domain @gmail.com, @yahoo.com, atau @outlook.com");

  const uid = user.uid;
  await setDoc(doc(db, "users", uid), { username, email }, { merge: true });

  if (email !== user.email) {
    await updateEmail(user, email);
  }

  if (password && password.length >= 8) {
    await updatePassword(user, password);
  }

  return true;
}
