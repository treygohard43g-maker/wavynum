import { db } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


/* =========================================================
   WAVYNUM — NUMBER SELECTION
   Clean isolated implementation
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const serviceNameElement =
  document.getElementById("selectedServiceName");

const serviceLogoElement =
  document.getElementById("selectedServiceLogo");

const serviceFallbackElement =
  document.getElementById("selectedServiceFallback");

const inventoryStatusElement =
  document.getElementById("inventoryStatus");

const numberListElement =
  document.getElementById("numberList");

const countryButtons =
  document.querySelectorAll(".country-button");


/* =========================================================
   URL
========================================================= */

const params =
  new URLSearchParams(window.location.search);

const selectedService =
  params.get("service") || "Other";


/* =========================================================
   STATE
========================================================= */

let inventory = [];

let selectedCountry = "all";


/* =========================================================
   SERVICE DATA
========================================================= */

const serviceNames = {
  facebook: "Facebook",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  telegram: "Telegram",
  snapchat: "Snapchat",
  "google voice": "Google Voice",
  textplus: "TextPlus",
  textnow: "TextNow",
  textfree: "TextFree",
  hushed: "Hushed",
  burner: "Burner",
  "2ndline": "2ndLine",
  freetone: "FreeTone",
  coverme: "CoverMe",
  numero: "Numero",
  mysudo: "MySudo",
  twitter: "Twitter / X"
};


const serviceLogos = {
  facebook:
    "https://cdn.brandfetch.io/facebook.com/w/256/h/256",

  whatsapp:
    "https://cdn.brandfetch.io/whatsapp.com/w/256/h/256",

  instagram:
    "https://cdn.brandfetch.io/instagram.com/w/256/h/256",

  telegram:
    "https://cdn.brandfetch.io/telegram.org/w/256/h/256",

  snapchat:
    "https://cdn.brandfetch.io/snapchat.com/w/256/h/256",

  "google voice":
    "https://cdn.brandfetch.io/voice.google.com/w/256/h/256",

  textplus:
    "https://cdn.brandfetch.io/textplus.com/w/256/h/256",

  textnow:
    "https://cdn.brandfetch.io/textnow.com/w/256/h/256",

  textfree:
    "https://cdn.brandfetch.io/textfree.us/w/256/h/256",

  hushed:
    "https://cdn.brandfetch.io/hushed.com/w/256/h/256",

  burner:
    "https://cdn.brandfetch.io/burnerapp.com/w/256/h/256",

  "2ndline":
    "https://cdn.brandfetch.io/2ndline.co/w/256/h/256",

  freetone:
    "https://cdn.brandfetch.io/freetone.com/w/256/h/256",

  coverme:
    "https://cdn.brandfetch.io/coverme.com/w/256/h/256",

  numero:
    "https://cdn.brandfetch.io/numeroesim.com/w/256/h/256",

  mysudo:
    "https://cdn.brandfetch.io/mysudo.com/w/256/h/256",

  twitter:
    "https://cdn.brandfetch.io/x.com/w/256/h/256"
};


/* =========================================================
   NORMALIZE
========================================================= */

function normalize(value) {

  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

}


/* =========================================================
   SERVICE MATCH
========================================================= */

function serviceMatches(services) {

  if (!Array.isArray(services)) {
    return false;
  }

  const requested =
    normalize(selectedService);

  return services.some(service => {

    const current =
      normalize(service);

    if (current === requested) {
      return true;
    }

    if (
      requested === "twitter / x" &&
      current === "twitter"
    ) {
      return true;
    }

    if (
      requested === "twitter" &&
      current === "twitter / x"
    ) {
      return true;
    }

    if (
      requested === "facebook messenger" &&
      current === "facebook"
    ) {
      return true;
    }

    return false;

  });

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* =========================================================
   PRICE
========================================================= */

function getPrice(value) {

  const price =
    Number(value);

  if (!Number.isFinite(price)) {
    return 0;
  }

  return price;

}


/* =========================================================
   SERVICE HEADER
========================================================= */

function renderService() {

  const key =
    normalize(selectedService);

  const displayName =
    serviceNames[key] ||
    selectedService ||
    "Service";


  serviceNameElement.textContent =
    displayName;


  const logo =
    serviceLogos[key];


  if (!logo) {

    serviceLogoElement.style.display =
      "none";

    serviceFallbackElement.style.display =
      "block";

    return;

  }


  serviceLogoElement.src =
    logo;

  serviceLogoElement.style.display =
    "block";

  serviceFallbackElement.style.display =
    "none";


  serviceLogoElement.onerror =
    () => {

      serviceLogoElement.style.display =
        "none";

      serviceFallbackElement.style.display =
        "block";

    };

}


/* =========================================================
   LOAD FIRESTORE INVENTORY
========================================================= */

async function loadInventory() {

  numberListElement.innerHTML = `
    <div class="number-state">

      <div class="number-state-icon">
        <i class="fa-solid fa-spinner fa-spin"></i>
      </div>

      <h2>Loading numbers</h2>

      <p>
        Checking available inventory.
      </p>

    </div>
  `;


  try {

    const snapshot =
      await getDocs(
        collection(db, "numbers")
      );


    inventory = [];


    let availableTotal = 0;

    let serviceTotal = 0;


    snapshot.forEach(
      documentSnapshot => {

        const data =
          documentSnapshot.data();


        /*
         * ONLY AVAILABLE INVENTORY
         */

        const status =
          normalize(data.status);


        if (status !== "available") {
          return;
        }


        availableTotal++;


        /*
         * MATCH SELECTED SERVICE
         */

        if (
          !serviceMatches(
            data.services
          )
        ) {

          return;

        }


        serviceTotal++;


        /*
         * READ FIRESTORE VALUES DIRECTLY
         */

        const phoneNumber =
          String(
            data.number ?? ""
          ).trim();


        const price =
          getPrice(
            data.price
          );


        const country =
          String(
            data.country ?? ""
          ).trim();


        const countryName =
          String(
            data.countryName ?? ""
          ).trim();


        const provider =
          String(
            data.provider ?? ""
          ).trim();


        inventory.push({

          id:
            documentSnapshot.id,

          number:
            phoneNumber,

          price:
            price,

          country:
            country,

          countryName:
            countryName,

          provider:
            provider

        });

      }
    );


    inventoryStatusElement.textContent =
      `${serviceTotal} available number${serviceTotal === 1 ? "" : "s"}`;


    renderNumbers();


  } catch (error) {

    console.error(
      "Wavynum inventory error:",
      error
    );


    inventoryStatusElement.textContent =
      "Unable to load inventory";


    numberListElement.innerHTML = `
      <div class="number-state">

        <div class="number-state-icon">
          <i class="fa-solid fa-circle-exclamation"></i>
        </div>

        <h2>
          Inventory unavailable
        </h2>

        <p>
          We couldn't load the available numbers.
          Please try again.
        </p>

      </div>
    `;

  }

}


/* =========================================================
   FILTER
========================================================= */

function getVisibleNumbers() {

  if (
    selectedCountry === "all"
  ) {

    return inventory;

  }


  return inventory.filter(
    item =>
      normalize(item.country) ===
      normalize(selectedCountry)
  );

}


/* =========================================================
   RENDER
========================================================= */

function renderNumbers() {

  const numbers =
    getVisibleNumbers();


  if (!numbers.length) {

    numberListElement.innerHTML = `
      <div class="number-state">

        <div class="number-state-icon">
          <i class="fa-solid fa-phone-slash"></i>
        </div>

        <h2>
          No numbers available
        </h2>

        <p>
          There are currently no available
          numbers for this service.
        </p>

      </div>
    `;

    return;

  }


  numberListElement.innerHTML =
    numbers.map(item => {

      const country =
        item.countryName ||
        item.country ||
        "Unknown";


      const provider =
        item.provider ||
        "Telnyx";


      const phone =
        item.number ||
        "Inventory number missing";


      const price =
        item.price.toFixed(2);


      return `

        <article class="number-card">

          <div class="number-card-inner">


            <div class="number-card-top">

              <div>

                <span class="number-country-label">
                  Country
                </span>

                <strong class="number-country-name">
                  ${escapeHtml(country)}
                </strong>

                <small class="number-country-code">
                  ${escapeHtml(item.country)}
                </small>

              </div>


              <span class="number-available">
                Available
              </span>

            </div>


            <div class="number-phone-box">

              <span class="number-phone-label">
                Phone number
              </span>

              <strong class="number-phone">
                ${escapeHtml(phone)}
              </strong>

            </div>


            <div class="number-card-details">

              <div class="number-detail">

                <span class="number-detail-label">
                  Provider
                </span>

                <span class="number-detail-value">
                  ${escapeHtml(provider)}
                </span>

              </div>


              <div class="number-detail price">

                <span class="number-detail-label">
                  Price
                </span>

                <span class="number-detail-value">
                  $${price}
                </span>

              </div>

            </div>


            <button
              type="button"
              class="number-choose-btn"
              data-number-id="${escapeHtml(item.id)}"
            >
              Choose number
              <i class="fa-solid fa-arrow-right"></i>
            </button>


          </div>

        </article>

      `;

    }).join("");


  attachChooseEvents();

}


/* =========================================================
   CHOOSE NUMBER
========================================================= */

function attachChooseEvents() {

  const buttons =
    document.querySelectorAll(
      ".number-choose-btn"
    );


  buttons.forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const id =
          button.dataset.numberId;


        const selected =
          inventory.find(
            item =>
              item.id === id
          );


        if (!selected) {

          alert(
            "This number is no longer available."
          );

          return;

        }


        if (!selected.number) {

          alert(
            "This inventory record does not contain a phone number."
          );

          return;

        }


        /*
         * SAVE EVERYTHING NEEDED
         * BY NUMBER-CONFIRMATION.HTML
         */

        const selection = {

          id:
            selected.id,

          service:
            selectedService,

          serviceKey:
            normalize(selectedService),

          number:
            selected.number,

          country:
            selected.country,

          countryName:
            selected.countryName,

          price:
            selected.price,

          provider:
            selected.provider

        };


        localStorage.setItem(
          "wavynumSelectedNumber",
          JSON.stringify(selection)
        );


        window.location.href =
          "number-confirmation.html";

      }
    );

  });

}


/* =========================================================
   COUNTRY BUTTONS
========================================================= */

countryButtons.forEach(button => {

  button.addEventListener(
    "click",
    () => {

      countryButtons.forEach(
        item =>
          item.classList.remove("active")
      );


      button.classList.add("active");


      selectedCountry =
        button.dataset.country ||
        "all";


      renderNumbers();

    }
  );

});


/* =========================================================
   START
========================================================= */

renderService();

loadInventory();
