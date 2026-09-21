import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


const logoutButton = document.getElementById("logoutButton");

const usdBalance = document.getElementById("usdBalance");
const ngnBalance = document.getElementById("ngnBalance");


onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  console.log("Logged in as:", user.email);

  try {

    const userRef = doc(db, "users", user.uid);
    const userSnapshot = await getDoc(userRef);

    if (userSnapshot.exists()) {

      const userData = userSnapshot.data();

      const usd = Number(userData.usdBalance || 0);
      const ngn = Number(userData.ngnBalance || 0);

      usdBalance.textContent =
        "$" + usd.toFixed(2);

      ngnBalance.textContent =
        "₦" + ngn.toFixed(2);

    }

  } catch (error) {

    console.error("Error loading wallet:", error);

  }

});


logoutButton?.addEventListener("click", async () => {

  try {

    logoutButton.disabled = true;

    logoutButton.querySelector("span").textContent =
      "Logging out...";

    await signOut(auth);

    window.location.href = "login.html";

  } catch (error) {

    console.error("Logout error:", error);

    logoutButton.disabled = false;

    logoutButton.querySelector("span").textContent =
      "Log out";

  }

});
