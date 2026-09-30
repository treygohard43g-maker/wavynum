import { auth } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


const fundsForm = document.getElementById("fundsForm");
const fundsMessage = document.getElementById("fundsMessage");

let currentUser = null;


/* =========================================================
   AUTHENTICATION
========================================================= */

onAuthStateChanged(auth, (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  currentUser = user;

});


/* =========================================================
   GENERATE PAYMENT ACCOUNT
========================================================= */

fundsForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  if (!currentUser) {

    fundsMessage.textContent =
      "Please log in again.";

    fundsMessage.className =
      "funds-message error";

    return;

  }


  fundsMessage.textContent =
    "Opening secure funding setup...";

  fundsMessage.className =
    "funds-message";


  /*
    We don't modify the wallet here.

    The next page will handle:
      1. Checking whether the user already has a payment account
      2. Requesting one from the backend if necessary
      3. Displaying the bank details
  */

  window.location.href =
    "payment-account.html";

});
