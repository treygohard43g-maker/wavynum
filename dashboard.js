import { auth } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const logoutButton = document.getElementById("logoutButton");

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  console.log("Logged in as:", user.email);
});

logoutButton?.addEventListener("click", async () => {
  try {
    logoutButton.disabled = true;
    logoutButton.querySelector("span").textContent = "Logging out...";

    await signOut(auth);

    window.location.href = "login.html";

  } catch (error) {
    console.error("Logout error:", error);

    logoutButton.disabled = false;
    logoutButton.querySelector("span").textContent = "Log out";
  }
});
