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
  where,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


/* =========================================================
   CONFIGURATION
========================================================= */

const ADMIN_UID = "9msvItX8pAYdz4OLdm1QHGtXFQ33";

const TRANSACTION_LIMIT = 5;


/* =========================================================
   DOM ELEMENTS
========================================================= */

const elements = {
  menuButton: document.getElementById("menuButton"),
  closeMenu: document.getElementById("closeMenu"),
  sideMenu: document.getElementById("sideMenu"),
  menuOverlay: document.getElementById("menuOverlay"),

  logoutButton: document.getElementById("logoutButton"),

  usdBalance: document.getElementById("usdBalance"),
  ngnBalance: document.getElementById("ngnBalance"),

  activeNumberCard:
    document.getElementById("activeNumberCard"),

  activeNumber:
    document.getElementById("activeNumber"),

  activeNumberCountry:
    document.getElementById("activeNumberCountry"),

  activeNumberStatus:
    document.getElementById("activeNumberStatus"),

  copyNumberButton:
    document.getElementById("copyNumberButton"),

  smsNumberButton:
    document.getElementById("smsNumberButton"),

  transactionsList:
    document.getElementById("transactionsList"),

  smsPreview:
    document.getElementById("smsPreview"),

  adminSupportLink:
    document.getElementById("adminSupportLink")
};


/* =========================================================
   STATE
========================================================= */

let currentUser = null;
let currentNumber = null;


/* =========================================================
   NAVIGATION
========================================================= */

function openMenu() {

  elements.sideMenu?.classList.add("open");

  elements.menuOverlay?.classList.add("active");

  elements.menuButton?.setAttribute(
    "aria-expanded",
    "true"
  );

  document.body.classList.add("menu-open");
}


function closeSideMenu() {

  elements.sideMenu?.classList.remove("open");

  elements.menuOverlay?.classList.remove("active");

  elements.menuButton?.setAttribute(
    "aria-expanded",
    "false"
  );

  document.body.classList.remove("menu-open");
}


elements.menuButton?.addEventListener(
  "click",
  openMenu
);


elements.closeMenu?.addEventListener(
  "click",
  closeSideMenu
);


elements.menuOverlay?.addEventListener(
  "click",
  closeSideMenu
);


/*
 * Close the menu when an internal dashboard
 * navigation link is selected.
 */

document
  .querySelectorAll("[data-menu-link]")
  .forEach((link) => {

    link.addEventListener(
      "click",
      closeSideMenu
    );

  });


/*
 * Allow Escape to close the navigation.
 */

document.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key === "Escape" &&
      elements.sideMenu?.classList.contains("open")
    ) {

      closeSideMenu();

    }

  }
);


/* =========================================================
   AUTHENTICATION
========================================================= */

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {

      window.location.replace(
        "login.html"
      );

      return;

    }

    currentUser = user;

    updateAdminNavigation(user);

    console.log(
      "Logged in as:",
      user.email || user.uid
    );

    /*
     * Load independent dashboard sections
     * concurrently instead of waiting for each
     * request one by one.
     */

    await Promise.all([
      loadWallet(user.uid),
      loadActiveNumber(user.uid),
      loadTransactions(user.uid),
      loadSmsPreview(user.uid)
    ]);

  }
);


/* =========================================================
   ADMIN NAVIGATION
========================================================= */

function updateAdminNavigation(user) {

  if (!elements.adminSupportLink) {
    return;
  }

  const isAdmin =
    user?.uid === ADMIN_UID;

  elements.adminSupportLink.hidden =
    !isAdmin;

}


/* =========================================================
   WALLET
========================================================= */

async function loadWallet(uid) {

  try {

    const userRef =
      doc(
        db,
        "users",
        uid
      );

    const snapshot =
      await getDoc(userRef);


    if (!snapshot.exists()) {

      setWalletBalances(
        0,
        0
      );

      return;

    }


    const data =
      snapshot.data();


    const usd =
      toSafeNumber(
        data.usdBalance
      );


    const ngn =
      toSafeNumber(
        data.ngnBalance
      );


    setWalletBalances(
      usd,
      ngn
    );

  } catch (error) {

    console.error(
      "Wallet loading error:",
      error
    );

  }

}


function setWalletBalances(
  usd,
  ngn
) {

  if (elements.usdBalance) {

    elements.usdBalance.textContent =
      formatUSD(usd);

  }


  if (elements.ngnBalance) {

    elements.ngnBalance.textContent =
      formatNGN(ngn);

  }

}


/* =========================================================
   ACTIVE NUMBER
========================================================= */

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

      setNoActiveNumber();

      return;

    }


    /*
     * Prefer an explicitly active number.
     * Otherwise use the first owned number
     * as a compatibility fallback.
     */

    const numberDocuments =
      snapshot.docs.map(
        (numberDoc) => ({
          id: numberDoc.id,
          ...numberDoc.data()
        })
      );


    const active =
      numberDocuments.find(
        (number) =>
          String(number.status || "")
            .toLowerCase() === "active"
      );


    currentNumber =
      active ||
      numberDocuments[0];


    renderActiveNumber();

  } catch (error) {

    console.error(
      "Active number loading error:",
      error
    );


    setActiveNumberError();

  }

}


function renderActiveNumber() {

  if (!currentNumber) {

    setNoActiveNumber();

    return;

  }


  if (elements.activeNumber) {

    elements.activeNumber.textContent =
      currentNumber.number ||
      "Unknown number";

  }


  if (elements.activeNumberCountry) {

    elements.activeNumberCountry.textContent =
      currentNumber.countryName ||
      currentNumber.country ||
      currentNumber.service ||
      "Virtual number";

  }


  if (elements.activeNumberStatus) {

    elements.activeNumberStatus.textContent =
      currentNumber.status ||
      "Active";

  }


  elements.copyNumberButton?.removeAttribute(
    "disabled"
  );

  elements.smsNumberButton?.removeAttribute(
    "disabled"
  );

}


function setNoActiveNumber() {

  currentNumber = null;


  if (elements.activeNumber) {

    elements.activeNumber.textContent =
      "No number yet";

  }


  if (elements.activeNumberCountry) {

    elements.activeNumberCountry.textContent =
      "Purchase a number to get started";

  }


  if (elements.activeNumberStatus) {

    elements.activeNumberStatus.textContent =
      "Not active";

  }


  elements.copyNumberButton?.setAttribute(
    "disabled",
    ""
  );

  elements.smsNumberButton?.setAttribute(
    "disabled",
    ""
  );


  showNoNumberSms();

}


function setActiveNumberError() {

  currentNumber = null;


  if (elements.activeNumber) {

    elements.activeNumber.textContent =
      "Unable to load";

  }


  if (elements.activeNumberCountry) {

    elements.activeNumberCountry.textContent =
      "Please try again";

  }


  if (elements.activeNumberStatus) {

    elements.activeNumberStatus.textContent =
      "Unavailable";

  }


  elements.copyNumberButton?.setAttribute(
    "disabled",
    ""
  );

  elements.smsNumberButton?.setAttribute(
    "disabled",
    ""
  );

}


/* =========================================================
   COPY NUMBER
========================================================= */

elements.copyNumberButton?.addEventListener(
  "click",
  async () => {

    if (!currentNumber?.number) {
      return;
    }


    try {

      await navigator.clipboard.writeText(
        currentNumber.number
      );


      const originalHTML =
        elements.copyNumberButton.innerHTML;


      elements.copyNumberButton.innerHTML =
        `
          <i
            class="fa-solid fa-check"
            aria-hidden="true"
          ></i>

          <span>Copied</span>
        `;


      setTimeout(
        () => {

          elements.copyNumberButton.innerHTML =
            originalHTML;

        },
        1600
      );


    } catch (error) {

      console.error(
        "Copy failed:",
        error
      );

    }

  }
);


/* =========================================================
   OPEN SMS INBOX
========================================================= */

elements.smsNumberButton?.addEventListener(
  "click",
  () => {

    if (!currentNumber) {
      return;
    }

    window.location.href =
      "sms-inbox.html";

  }
);


/* =========================================================
   TRANSACTIONS
========================================================= */

async function loadTransactions(uid) {

  try {

    const transactionsRef =
      collection(
        db,
        "transactions"
      );


    /*
     * Query only this user's records.
     *
     * This is preferable to downloading the
     * entire transactions collection and filtering
     * it in the browser.
     */

    let snapshot;


    try {

      const transactionQuery =
        query(
          transactionsRef,
          where(
            "userId",
            "==",
            uid
          ),
          orderBy(
            "createdAt",
            "desc"
          ),
          limit(
            TRANSACTION_LIMIT
          )
        );


      snapshot =
        await getDocs(
          transactionQuery
        );

    } catch (queryError) {

      /*
       * If the composite index is not available,
       * retry with the user filter only.
       */

      console.warn(
        "Ordered transaction query failed. Using filtered fallback.",
        queryError
      );


      const fallbackQuery =
        query(
          transactionsRef,
          where(
            "userId",
            "==",
            uid
          ),
          limit(
            TRANSACTION_LIMIT
          )
        );


      snapshot =
        await getDocs(
          fallbackQuery
        );

    }


    const transactions =
      snapshot.docs.map(
        (transactionDoc) => ({
          id: transactionDoc.id,
          ...transactionDoc.data()
        })
      );


    transactions.sort(
      (a, b) =>
        getTimestampMillis(
          b.createdAt
        ) -
        getTimestampMillis(
          a.createdAt
        )
    );


    renderTransactions(
      transactions.slice(
        0,
        TRANSACTION_LIMIT
      )
    );


  } catch (error) {

    console.error(
      "Transaction loading error:",
      error
    );


    renderTransactionsError();

  }

}


/* =========================================================
   TRANSACTION RENDERING
========================================================= */

function renderTransactions(items) {

  if (!items.length) {

    elements.transactionsList.innerHTML =
      createEmptyState(
        "fa-receipt",
        "No transactions yet",
        "Your wallet activity will appear here."
      );

    return;

  }


  elements.transactionsList.innerHTML =
    items
      .map(
        createTransactionHTML
      )
      .join("");

}


function createTransactionHTML(item) {

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
    formatDate(
      item.createdAt
    );


  const normalizedType =
    String(type).toLowerCase();


  const isPurchase =
    normalizedType.includes("purchase") ||
    normalizedType.includes("number");


  const icon =
    isPurchase
      ? "fa-mobile-screen-button"
      : "fa-arrow-right-arrow-left";


  const amountClass =
    isPurchase
      ? "transaction-amount debit"
      : "transaction-amount credit";


  const amountPrefix =
    isPurchase
      ? "-"
      : "+";


  return `
    <article class="transaction-item">

      <div class="transaction-icon">
        <i
          class="fa-solid ${icon}"
          aria-hidden="true"
        ></i>
      </div>


      <div class="transaction-details">

        <strong>
          ${escapeHTML(type)}
        </strong>

        <span>
          ${escapeHTML(date)}
          <span class="transaction-separator">
            ·
          </span>
          ${escapeHTML(status)}
        </span>

      </div>


      <strong class="${amountClass}">
        ${amountPrefix}${formatUSD(amount)}
      </strong>

    </article>
  `;

}


/* =========================================================
   TRANSACTION ERROR
========================================================= */

function renderTransactionsError() {

  elements.transactionsList.innerHTML =
    createEmptyState(
      "fa-triangle-exclamation",
      "Transactions unavailable",
      "We couldn't load your transaction history."
    );

}


/* =========================================================
   SMS PREVIEW
========================================================= */

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
      await getDocs(
        numbersRef
      );


    if (snapshot.empty) {

      showNoNumberSms();

      return;

    }


    const firstNumber =
      snapshot.docs[0].data();


    const service =
      firstNumber.service ||
      "Service";


    renderSmsPreview(
      service
    );


  } catch (error) {

    console.error(
      "SMS preview loading error:",
      error
    );


    elements.smsPreview.innerHTML =
      createEmptyState(
        "fa-triangle-exclamation",
        "SMS inbox unavailable",
        "Please try again later."
      );

  }

}


/* =========================================================
   SMS PREVIEW RENDERING
========================================================= */

function renderSmsPreview(service) {

  elements.smsPreview.innerHTML = `
    <article class="sms-preview">

      <div class="sms-preview-icon">
        <i
          class="fa-regular fa-message"
          aria-hidden="true"
        ></i>
      </div>


      <div class="sms-preview-content">

        <div class="sms-preview-header">

          <strong>
            ${escapeHTML(service)}
          </strong>

          <span>
            Preview
          </span>

        </div>


        <p>
          Your SMS messages will appear here
          when your number receives a message.
        </p>


        <span class="sms-preview-code">
          SMS PREVIEW
        </span>

      </div>

    </article>
  `;

}


function showNoNumberSms() {

  elements.smsPreview.innerHTML =
    createEmptyState(
      "fa-message",
      "No messages",
      "Purchase a number to start using your SMS inbox."
    );

}


/* =========================================================
   LOGOUT
========================================================= */

elements.logoutButton?.addEventListener(
  "click",
  async () => {

    try {

      elements.logoutButton.disabled =
        true;


      const label =
        elements.logoutButton.querySelector(
          "span"
        );


      if (label) {

        label.textContent =
          "Logging out...";

      }


      await signOut(auth);


      window.location.replace(
        "login.html"
      );


    } catch (error) {

      console.error(
        "Logout error:",
        error
      );


      elements.logoutButton.disabled =
        false;


      const label =
        elements.logoutButton.querySelector(
          "span"
        );


      if (label) {

        label.textContent =
          "Log out";

      }

    }

  }
);


/* =========================================================
   EMPTY STATE FACTORY
========================================================= */

function createEmptyState(
  icon,
  title,
  message
) {

  return `
    <div class="empty-state">

      <div class="empty-icon">
        <i
          class="fa-solid ${icon}"
          aria-hidden="true"
        ></i>
      </div>

      <h3>
        ${escapeHTML(title)}
      </h3>

      <p>
        ${escapeHTML(message)}
      </p>

    </div>
  `;

}


/* =========================================================
   FORMATTING HELPERS
========================================================= */

function toSafeNumber(value) {

  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : 0;

}


function formatUSD(value) {

  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  ).format(
    toSafeNumber(value)
  );

}


function formatNGN(value) {

  return new Intl.NumberFormat(
    "en-NG",
    {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  ).format(
    toSafeNumber(value)
  );

}


function getTimestampMillis(timestamp) {

  if (!timestamp) {
    return 0;
  }


  if (
    typeof timestamp.toMillis ===
    "function"
  ) {

    return timestamp.toMillis();

  }


  if (
    timestamp.seconds !== undefined
  ) {

    return (
      Number(timestamp.seconds) *
      1000
    );

  }


  if (
    timestamp instanceof Date
  ) {

    return timestamp.getTime();

  }


  if (
    typeof timestamp === "string" ||
    typeof timestamp === "number"
  ) {

    const date =
      new Date(timestamp);

    return Number.isNaN(
      date.getTime()
    )
      ? 0
      : date.getTime();

  }


  return 0;

}


function formatDate(timestamp) {

  const millis =
    getTimestampMillis(
      timestamp
    );


  if (!millis) {
    return "Recent";
  }


  return new Intl.DateTimeFormat(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric"
    }
  ).format(
    new Date(millis)
  );

}


function getTransactionAmount(item) {

  const possibleValues = [
    item.amount,
    item.price,
    item.total,
    item.usdAmount
  ];


  for (
    const value of possibleValues
  ) {

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


/* =========================================================
   SECURITY / HTML ESCAPING
========================================================= */

function escapeHTML(value) {

  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}
