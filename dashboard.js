import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


/* =========================================
   ELEMENTS
========================================= */

const menuButton =
  document.getElementById("menuButton");

const closeMenu =
  document.getElementById("closeMenu");

const sideMenu =
  document.getElementById("sideMenu");

const menuOverlay =
  document.getElementById("menuOverlay");

const logoutButton =
  document.getElementById("logoutButton");

const usdBalance =
  document.getElementById("usdBalance");

const ngnBalance =
  document.getElementById("ngnBalance");

const activeNumber =
  document.getElementById("activeNumber");

const activeNumberCountry =
  document.getElementById("activeNumberCountry");

const activeNumberStatus =
  document.getElementById("activeNumberStatus");

const copyNumberButton =
  document.getElementById("copyNumberButton");

const smsNumberButton =
  document.getElementById("smsNumberButton");

const transactionsList =
  document.getElementById("transactionsList");

const smsPreview =
  document.getElementById("smsPreview");


let currentUser = null;
let currentNumber = null;


/* =========================================
   HAMBURGER MENU
========================================= */

function openMenu() {

  sideMenu?.classList.add("open");
  menuOverlay?.classList.add("active");

  document.body.classList.add("menu-open");

}


function closeSideMenu() {

  sideMenu?.classList.remove("open");
  menuOverlay?.classList.remove("active");

  document.body.classList.remove("menu-open");

}


menuButton?.addEventListener(
  "click",
  openMenu
);

closeMenu?.addEventListener(
  "click",
  closeSideMenu
);

menuOverlay?.addEventListener(
  "click",
  closeSideMenu
);


/* =========================================
   MENU SECTION LINKS
========================================= */

document
  .querySelectorAll(".menu-section-link")
  .forEach((link) => {

    link.addEventListener("click", () => {

      closeSideMenu();

    });

  });


/* =========================================
   AUTHENTICATION
========================================= */

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    window.location.href = "login.html";

    return;
  }


  currentUser = user;

  console.log(
    "Logged in as:",
    user.email || user.uid
  );


  await loadWallet(user.uid);

  await loadActiveNumber(user.uid);

  await loadTransactions(user.uid);

  await loadSmsPreview(user.uid);

});


/* =========================================
   LOAD WALLET
========================================= */

async function loadWallet(uid) {

  try {

    const userRef =
      doc(db, "users", uid);

    const userSnapshot =
      await getDoc(userRef);


    if (!userSnapshot.exists()) {

      usdBalance.textContent = "$0.00";
      ngnBalance.textContent = "₦0.00";

      return;
    }


    const userData =
      userSnapshot.data();


    const usd =
      Number(userData.usdBalance || 0);

    const ngn =
      Number(userData.ngnBalance || 0);


    usdBalance.textContent =
      "$" + usd.toFixed(2);

    ngnBalance.textContent =
      "₦" + ngn.toFixed(2);


  } catch (error) {

    console.error(
      "Error loading wallet:",
      error
    );

  }

}


/* =========================================
   LOAD ACTIVE NUMBER
========================================= */

async function loadActiveNumber(uid) {

  try {

    const numbersRef =
      collection(
        db,
        "users",
        uid,
        "numbers"
      );


    const snapshot =
      await getDocs(numbersRef);


    if (snapshot.empty) {

      currentNumber = null;

      activeNumber.textContent =
        "No number yet";

      activeNumberCountry.textContent =
        "Purchase a number to get started";

      activeNumberStatus.textContent =
        "Not active";


      copyNumberButton.disabled = true;
      smsNumberButton.disabled = true;


      showNoNumberSms();

      return;
    }


    /*
     * Use the first owned number as the
     * dashboard's current active number.
     */

    const firstDoc =
      snapshot.docs[0];


    currentNumber = {
      id: firstDoc.id,
      ...firstDoc.data()
    };


    activeNumber.textContent =
      currentNumber.number ||
      "Unknown number";


    activeNumberCountry.textContent =
      currentNumber.countryName ||
      currentNumber.country ||
      currentNumber.service ||
      "Virtual number";


    activeNumberStatus.textContent =
      currentNumber.status ||
      "Active";


    copyNumberButton.disabled = false;
    smsNumberButton.disabled = false;


  } catch (error) {

    console.error(
      "Error loading active number:",
      error
    );


    activeNumber.textContent =
      "Unable to load";

    activeNumberCountry.textContent =
      "Please try again";

    activeNumberStatus.textContent =
      "Unavailable";

  }

}


/* =========================================
   COPY NUMBER
========================================= */

copyNumberButton?.addEventListener(
  "click",
  async () => {

    if (!currentNumber?.number) {
      return;
    }


    try {

      await navigator.clipboard.writeText(
        currentNumber.number
      );


      const original =
        copyNumberButton.innerHTML;


      copyNumberButton.innerHTML =
        `<i class="fa-solid fa-check"></i> Copied`;


      setTimeout(() => {

        copyNumberButton.innerHTML =
          original;

      }, 1600);


    } catch (error) {

      console.error(
        "Copy failed:",
        error
      );

    }

  }
);


/* =========================================
   OPEN SMS FOR ACTIVE NUMBER
========================================= */

smsNumberButton?.addEventListener(
  "click",
  () => {

    if (!currentNumber) {
      return;
    }


    window.location.href =
      "sms-inbox.html";

  }
);


/* =========================================
   LOAD TRANSACTIONS
========================================= */

async function loadTransactions(uid) {

  try {

    const transactionsRef =
      collection(
        db,
        "transactions"
      );


    let snapshot;


    try {

      const transactionQuery =
        query(
          transactionsRef,
          orderBy("createdAt", "desc"),
          limit(5)
        );

      snapshot =
        await getDocs(transactionQuery);

    } catch (queryError) {

      /*
       * If createdAt is missing or an index is
       * required, fall back to a normal read.
       */

      console.warn(
        "Transaction query fallback:",
        queryError
      );

      snapshot =
        await getDocs(transactionsRef);

    }


    const transactions = [];


    snapshot.forEach((docSnap) => {

      const data =
        docSnap.data();


      /*
       * Only display this user's transactions.
       */

      if (data.userId === uid) {

        transactions.push({
          id: docSnap.id,
          ...data
        });

      }

    });


    /*
     * Newest first when the fallback query
     * was used.
     */

    transactions.sort(
      (a, b) => {

        const aTime =
          getTimestampMillis(a.createdAt);

        const bTime =
          getTimestampMillis(b.createdAt);

        return bTime - aTime;

      }
    );


    renderTransactions(
      transactions.slice(0, 5)
    );


  } catch (error) {

    console.error(
      "Error loading transactions:",
      error
    );


    transactionsList.innerHTML = `
      <div class="empty-state">

        <div class="empty-icon">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>

        <h3>
          Transactions unavailable
        </h3>

        <p>
          We couldn't load your transaction history.
        </p>

      </div>
    `;

  }

}


/* =========================================
   RENDER TRANSACTIONS
========================================= */

function renderTransactions(items) {

  if (!items.length) {

    transactionsList.innerHTML = `
      <div class="empty-state">

        <div class="empty-icon">
          <i class="fa-solid fa-receipt"></i>
        </div>

        <h3>
          No transactions yet
        </h3>

        <p>
          Your wallet activity will appear here.
        </p>

      </div>
    `;

    return;
  }


  transactionsList.innerHTML =
    items.map((item) => {

      const amount =
        getTransactionAmount(item);

      const type =
        item.type ||
        item.category ||
        "Transaction";


      const status =
        item.status ||
        "completed";


      const date =
        formatDate(item.createdAt);


      const isPurchase =
        type.toLowerCase().includes("purchase") ||
        type.toLowerCase().includes("number");


      return `
        <div
          style="
            display:flex;
            align-items:center;
            gap:12px;
            padding:15px;
            border-bottom:1px solid rgba(34,197,94,.08);
          "
        >

          <div
            style="
              width:42px;
              height:42px;
              flex:0 0 42px;
              display:flex;
              align-items:center;
              justify-content:center;
              border-radius:12px;
              background:rgba(34,197,94,.09);
              color:#39e86f;
            "
          >
            <i class="fa-solid ${
              isPurchase
                ? "fa-mobile-screen-button"
                : "fa-arrow-right-arrow-left"
            }"></i>
          </div>


          <div style="flex:1;min-width:0;">

            <strong
              style="
                display:block;
                color:#ecfdf3;
                font-size:13px;
              "
            >
              ${escapeHTML(type)}
            </strong>

            <span
              style="
                display:block;
                margin-top:4px;
                color:#78857d;
                font-size:11px;
              "
            >
              ${escapeHTML(date)}
              ·
              ${escapeHTML(status)}
            </span>

          </div>


          <strong
            style="
              color:${isPurchase ? "#f87171" : "#4ade80"};
              font-size:13px;
              white-space:nowrap;
            "
          >
            ${isPurchase ? "-" : "+"}$${amount.toFixed(2)}
          </strong>

        </div>
      `;

    }).join("");

}


/* =========================================
   LOAD SMS PREVIEW
========================================= */

async function loadSmsPreview(uid) {

  try {

    const numbersRef =
      collection(
        db,
        "users",
        uid,
        "numbers"
      );


    const snapshot =
      await getDocs(numbersRef);


    if (snapshot.empty) {

      showNoNumberSms();

      return;
    }


    const firstDoc =
      snapshot.docs[0];


    const numberData =
      firstDoc.data();


    const service =
      numberData.service ||
      "Service";


    smsPreview.innerHTML = `
      <div
        style="
          padding:16px;
          display:flex;
          gap:12px;
        "
      >

        <div
          style="
            width:42px;
            height:42px;
            flex:0 0 42px;
            display:flex;
            align-items:center;
            justify-content:center;
            border-radius:12px;
            background:rgba(34,197,94,.09);
            color:#39e86f;
          "
        >
          <i class="fa-regular fa-message"></i>
        </div>


        <div style="flex:1;">

          <div
            style="
              display:flex;
              justify-content:space-between;
              gap:10px;
            "
          >

            <strong
              style="
                color:#ecfdf3;
                font-size:13px;
              "
            >
              ${escapeHTML(service)}
            </strong>

            <span
              style="
                color:#78857d;
                font-size:11px;
              "
            >
              Demo
            </span>

          </div>


          <p
            style="
              margin:7px 0 0;
              color:#8d9a91;
              font-size:12px;
              line-height:1.5;
            "
          >
            This is a simulated SMS message for
            development and testing.
          </p>


          <span
            style="
              display:inline-block;
              margin-top:8px;
              padding:5px 8px;
              border-radius:7px;
              background:rgba(34,197,94,.09);
              color:#4ade80;
              font-size:11px;
              font-weight:800;
              letter-spacing:1px;
            "
          >
            DEMO 482731
          </span>

        </div>

      </div>
    `;


  } catch (error) {

    console.error(
      "Error loading SMS preview:",
      error
    );


    smsPreview.innerHTML = `
      <div class="empty-state">

        <div class="empty-icon">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>

        <h3>
          SMS inbox unavailable
        </h3>

        <p>
          Please try again later.
        </p>

      </div>
    `;

  }

}


/* =========================================
   NO NUMBER SMS STATE
========================================= */

function showNoNumberSms() {

  smsPreview.innerHTML = `
    <div class="empty-state">

      <div class="empty-icon">
        <i class="fa-regular fa-message"></i>
      </div>

      <h3>
        No messages
      </h3>

      <p>
        Purchase a number to start using your SMS inbox.
      </p>

    </div>
  `;

}


/* =========================================
   LOGOUT
========================================= */

logoutButton?.addEventListener(
  "click",
  async () => {

    try {

      logoutButton.disabled = true;

      const label =
        logoutButton.querySelector("span");

      if (label) {
        label.textContent =
          "Logging out...";
      }


      await signOut(auth);


      window.location.href =
        "login.html";


    } catch (error) {

      console.error(
        "Logout error:",
        error
      );


      logoutButton.disabled = false;

      const label =
        logoutButton.querySelector("span");

      if (label) {
        label.textContent =
          "Log out";
      }

    }

  }
);


/* =========================================
   HELPERS
========================================= */

function getTimestampMillis(timestamp) {

  if (!timestamp) {
    return 0;
  }


  if (
    typeof timestamp.toMillis === "function"
  ) {

    return timestamp.toMillis();

  }


  if (
    timestamp.seconds !== undefined
  ) {

    return timestamp.seconds * 1000;

  }


  if (
    timestamp instanceof Date
  ) {

    return timestamp.getTime();

  }


  return 0;

}


function formatDate(timestamp) {

  const millis =
    getTimestampMillis(timestamp);


  if (!millis) {
    return "Recent";
  }


  return new Date(millis)
    .toLocaleDateString(
      undefined,
      {
        month: "short",
        day: "numeric"
      }
    );

}


function getTransactionAmount(item) {

  const possibleValues = [
    item.amount,
    item.price,
    item.total,
    item.usdAmount
  ];


  for (const value of possibleValues) {

    const number =
      Number(value);


    if (
      Number.isFinite(number)
    ) {

      return Math.abs(number);

    }

  }


  return 0;

}


function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}
