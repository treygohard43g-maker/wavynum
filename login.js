import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const loginButton = document.getElementById("loginButton");


if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        /* =========================================
           GET FORM VALUES
        ========================================= */

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;


        /* =========================================
           BASIC VALIDATION
        ========================================= */

        if (!email) {
            loginMessage.textContent =
                "Please enter your email address.";
            return;
        }

        if (!password) {
            loginMessage.textContent =
                "Please enter your password.";
            return;
        }


        /* =========================================
           LOADING STATE
        ========================================= */

        loginButton.disabled = true;
        loginButton.textContent = "Signing in...";

        loginMessage.textContent = "";
        loginMessage.className = "auth-message";


        try {

            /* =========================================
               FIREBASE AUTHENTICATION
            ========================================= */

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


            /* =========================================
               SUCCESS
            ========================================= */

            loginMessage.textContent =
                "Login successful.";

            loginMessage.classList.add("success");

            loginButton.textContent =
                "Signed in";


            /* =========================================
               REDIRECT
            ========================================= */

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 500);


        } catch (error) {

            console.error(
                "Firebase login error:",
                error
            );


            /* =========================================
               RESTORE BUTTON
            ========================================= */

            loginButton.disabled = false;
            loginButton.textContent = "Log in";


            /* =========================================
               USER-FRIENDLY ERRORS
            ========================================= */

            let errorMessage =
                "Unable to sign in. Please try again.";


            switch (error.code) {

                case "auth/invalid-credential":
                case "auth/wrong-password":
                case "auth/user-not-found":

                    errorMessage =
                        "Incorrect email or password.";

                    break;


                case "auth/invalid-email":

                    errorMessage =
                        "Please enter a valid email address.";

                    break;


                case "auth/too-many-requests":

                    errorMessage =
                        "Too many login attempts. Please try again later.";

                    break;


                case "auth/network-request-failed":

                    errorMessage =
                        "Network error. Check your internet connection and try again.";

                    break;
            }


            loginMessage.textContent =
                errorMessage;

            loginMessage.className =
                "auth-message error";
        }
    });
}