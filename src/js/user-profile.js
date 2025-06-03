import { auth, db } from './firebase-init.js';
import {
  doc, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import {
  onAuthStateChanged,
  updateEmail,
  updatePassword
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// Load user profile & tampilkan di form
export async function loadUserProfile() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return window.location.href = "login.html";

    const uid = user.uid;
    const userDoc = await getDoc(doc(db, "users", uid));
    const usernameInput = document.getElementById("profile-username");
    const emailInput = document.getElementById("profile-email");

    if (userDoc.exists()) {
      const data = userDoc.data();
      usernameInput.value = data.username || "";
    }

    // Ambil email dari Firebase Auth langsung
    emailInput.value = user.email || "";

    // Optional: update greeting
    const greeting = document.getElementById("greeting");
    if (greeting) greeting.textContent = `Halo, @${usernameInput.value || "User"}`;
  });
}

// Update user profile di Firestore & Firebase Auth
export async function updateUserProfile() {
  const user = auth.currentUser;
  if (!user) return;

  const uid = user.uid;
  const username = document.getElementById("profile-username").value.trim();
  const email = document.getElementById("profile-email").value.trim();
  const password = document.getElementById("profile-password").value;

  try {
    // Update Firestore
    await setDoc(doc(db, "users", uid), {
      username,
      email
    }, { merge: true });

    // Update Auth (jika berbeda)
    if (email !== user.email) {
      await updateEmail(user, email);
    }

    if (password && password.length >= 8) {
      await updatePassword(user, password);
    }

    alert("Profil berhasil diperbarui!");
    window.location.reload();

  } catch (error) {
    console.error(error);
    alert("Gagal memperbarui profil: " + error.message);
  }
}

editBtn.addEventListener("click", (e) => {
  e.preventDefault();
  modal.classList.remove("hidden");
});
