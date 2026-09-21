import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


const signupForm = document.getElementById("signupForm");
const message = document.getElementById("signupMessage");


signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  message.textContent = "Creating your account...";

  try {

    // Create Firebase account
    const userCredential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    const user = userCredential.user;

    // Create the user's Wavynum account document
    await setDoc(doc(db, "users", user.uid), {

      name: name,

      email: user.email,

      usdBalance: 0,

      ngnBalance: 0,

      createdAt: serverTimestamp()

    });

    message.textContent =
      "Account created successfully!";

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1000);

  } catch (error) {

    console.error("Signup error:", error);

    message.textContent =
      "Signup error: " + error.code;
  }
});
