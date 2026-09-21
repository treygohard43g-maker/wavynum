import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


const fundsForm = document.getElementById("fundsForm");
const currency = document.getElementById("currency");
const amount = document.getElementById("amount");
const amountPreview = document.getElementById("amountPreview");
const fundsMessage = document.getElementById("fundsMessage");

let currentUser = null;


// Check authentication
onAuthStateChanged(auth, (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  currentUser = user;

});


// Update preview
function updatePreview() {

  const value = Number(amount.value || 0);

  if (currency.value === "USD") {

    amountPreview.textContent =
      "$" + value.toFixed(2);

  } else {

    amountPreview.textContent =
      "₦" + value.toFixed(2);

  }

}


amount.addEventListener("input", updatePreview);

currency.addEventListener("change", updatePreview);


// Submit deposit
fundsForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  if (!currentUser) {
    fundsMessage.textContent =
      "Please log in again.";

    return;
  }


  const selectedCurrency = currency.value;
  const depositAmount = Number(amount.value);


  if (!depositAmount || depositAmount <= 0) {

    fundsMessage.textContent =
      "Enter a valid amount.";

    return;

  }


  try {

    fundsMessage.textContent =
      "Processing deposit...";


    const userRef =
      doc(db, "users", currentUser.uid);

    const userSnapshot =
      await getDoc(userRef);


    if (!userSnapshot.exists()) {

      fundsMessage.textContent =
        "Account record not found.";

      return;

    }


    const userData =
      userSnapshot.data();


    const field =
      selectedCurrency === "USD"
        ? "usdBalance"
        : "ngnBalance";


    const currentBalance =
      Number(userData[field] || 0);


    const newBalance =
      currentBalance + depositAmount;


    // Update wallet
    await updateDoc(userRef, {

      [field]: newBalance

    });


    // Record transaction
    await addDoc(
      collection(db, "transactions"),
      {

        userId: currentUser.uid,

        type: "deposit",

        currency: selectedCurrency,

        amount: depositAmount,

        status: "completed",

        createdAt: serverTimestamp()

      }
    );


    fundsMessage.textContent =
      "Funds added successfully.";


    amount.value = "";

    updatePreview();


  } catch (error) {

    console.error("Deposit error:", error);

    fundsMessage.textContent =
      "Deposit error: " + error.code;

  }

});
