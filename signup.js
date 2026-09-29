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
const signupButton = document.getElementById("signupButton");


if (signupForm) {

    signupForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;


        /* =========================================
           BASIC VALIDATION
        ========================================= */

        if (!name) {
            message.textContent = "Please enter your full name.";
            return;
        }

        if (!email) {
            message.textContent = "Please enter your email address.";
            return;
        }

        if (password.length < 6) {
            message.textContent =
                "Password must be at least 6 characters.";
            return;
        }


        /* =========================================
           LOADING STATE
        ========================================= */

        signupButton.disabled = true;
        signupButton.textContent = "Creating account...";

        message.textContent = "";
        message.className = "auth-message";


        try {

            /* =========================================
               CREATE FIREBASE AUTH ACCOUNT
            ========================================= */

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user = userCredential.user;


            /* =========================================
               CREATE WAVYNUM USER DOCUMENT
            ========================================= */

            await setDoc(
                doc(db, "users", user.uid),
                {
                    name: name,
                    email: user.email,

                    usdBalance: 0,
                    ngnBalance: 0,

                    createdAt: serverTimestamp()
                }
            );


            /* =========================================
               SUCCESS
            ========================================= */

            message.textContent =
                "Account created successfully.";

            message.classList.add("success");

            signupButton.textContent =
                "Account created";


            /* =========================================
               REDIRECT TO LOGIN
            ========================================= */

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1000);


        } catch (error) {

            console.error("Signup error:", error);


            /* =========================================
               RESTORE BUTTON
            ========================================= */

            signupButton.disabled = false;
            signupButton.textContent = "Create account";


            /* =========================================
               FIREBASE ERROR MESSAGES
            ========================================= */

            let errorMessage =
                "Unable to create your account. Please try again.";


            switch (error.code) {

                case "auth/email-already-in-use":
                    errorMessage =
                        "An account with this email already exists.";
                    break;

                case "auth/invalid-email":
                    errorMessage =
                        "Please enter a valid email address.";
                    break;

                case "auth/weak-password":
                    errorMessage =
                        "Your password is too weak. Use at least 6 characters.";
                    break;

                case "auth/network-request-failed":
                    errorMessage =
                        "Network error. Check your internet connection and try again.";
                    break;

                case "auth/operation-not-allowed":
                    errorMessage =
                        "Email and password sign-up is currently unavailable.";
                    break;

                case "permission-denied":
                case "firestore/permission-denied":
                    errorMessage =
                        "Your account was created, but your profile could not be saved.";
                    break;
            }


            message.textContent = errorMessage;
            message.className = "auth-message error";
        }
    });
}