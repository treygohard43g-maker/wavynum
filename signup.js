import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const signupForm = document.getElementById("signupForm");
const message = document.getElementById("signupMessage");

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!name || !email || !password) {
    message.textContent = "Please fill in all fields.";
    return;
  }

  if (password.length < 6) {
    message.textContent = "Password must be at least 6 characters.";
    return;
  }

  try {
    message.textContent = "Creating your account...";

    await createUserWithEmailAndPassword(auth, email, password);

    message.textContent = "Account created successfully!";

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);

  } catch (error) {
    console.error(error);

    if (error.code === "auth/email-already-in-use") {
      message.textContent = "An account with this email already exists.";
    } else if (error.code === "auth/invalid-email") {
      message.textContent = "Please enter a valid email address.";
    } else {
      message.textContent = "Unable to create account. Please try again.";
    }
  }
});
