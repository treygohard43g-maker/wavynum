import { auth } from "./firebase.js";

import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  loginMessage.textContent = "Signing in...";

  try {
    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    loginMessage.textContent = "Login successful.";

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 500);

  } catch (error) {
    console.error("Firebase login error:", error);

    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/wrong-password" ||
      error.code === "auth/user-not-found"
    ) {
      loginMessage.textContent =
        "Incorrect email or password.";
    } else {
      loginMessage.textContent =
        "Login error: " + error.code;
    }
  }
});
