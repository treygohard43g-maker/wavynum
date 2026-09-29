import { db } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

/* =========================================================
   WAVYNUM — NUMBER SELECTION
========================================================= */

const SERVICE_CONFIG = {
  facebook: {
    name: "Facebook"
  },

  whatsapp: {
    name: "WhatsApp"
  },

  instagram: {
    name: "Instagram"
  },

  telegram: {
    name: "Telegram"
  },

  snapchat: {
    name: "Snapchat"
  },

  "google voice": {
    name: "Google Voice"
  },

  textplus: {
    name: "TextPlus"
  },

  textnow: {
    name: "TextNow"
  },

  textfree: {
    name: "TextFree"
  },

  hushed: {
    name: "Hushed"
  },

  burner: {
    name: "Burner"
  },

  "2ndline": {
    name: "2ndLine"
  },

  freetone: {
    name: "FreeTone"
  },

  coverme: {
    name: "CoverMe"
  },

  numero: {
    name: "Numero"
  },

  mysudo: {
    name: "MySudo"
  },

  twitter: {
    name: "Twitter / X"
  }
};


/* =========================================================
   ELEMENTS
========================================================= */

const serviceNameElement =
  document.getElementById("selectedServiceName");

const serviceDescriptionElement =
  document.getElementById("selectedServiceDescription");

const numbersList =
  document.getElementById("numbersList");

const inventoryStatus =
  document.getElementById("inventoryStatus");

const countryButtons =
  document.querySelectorAll(".country-filter");


/* =========================================================
   STATE
========================================================= */

let allNumbers = [];

let selectedCountry = "all";

let selectedService = "";


/* =========================================================
   NORMALIZE TEXT
========================================================= */

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}


/* =========================================================
   CANONICAL SERVICE
========================================================= */

function canonicalService(value) {

  const normalized = normalize(value);

  const aliases = {
    "twitter / x": "twitter",
    "twitter/x": "twitter",
    "twitter x": "twitter",
    "x/twitter": "twitter",
    "facebook messenger": "facebook"
  };

  return aliases[normalized] || normalized;
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
   SERVICE MATCH
========================================================= */

function serviceMatches(services, requestedService) {

  if (!Array.isArray(services)) {
    return false;
  }

  const requested = canonicalService(requestedService);

  return services.some(service => {

    return canonicalService(service) === requested;

  });
}


/* =========================================================
   GET SERVICE FROM URL
========================================================= */

const params = new URLSearchParams(
  window.location.search
);

selectedService =
  params.get("service") || "Other";


/* =========================================================
   SERVICE HEADER
========================================================= */

function renderServiceHeader() {

  const key =
    canonicalService(selectedService);

  const config =
    SERVICE_CONFIG[key];

  if (serviceNameElement) {

    serviceNameElement.textContent =
      config?.name ||
      selectedService ||
      "Service";
  }

  if (serviceDescriptionElement) {

    serviceDescriptionElement.textContent =
      `Choose an available number for ${
        config?.name || selectedService
      }.`;
  }
}


/* =========================================================
   LOAD INVENTORY
========================================================= */

async function loadInventory() {

  try {

    numbersList.innerHTML = `
      <div class="numbers-state">
        <i class="fa-solid fa-spinner fa-spin"></i>
        <span>Loading inventory...</span>
      </div>
    `;

    const snapshot =
      await getDocs(
        collection(db, "numbers")
      );

    allNumbers = [];

    let availableCount = 0;

    let compatibleCount = 0;


    snapshot.forEach(documentSnapshot => {

      const data =
        documentSnapshot.data();


      /* -----------------------------------------
         STATUS
      ----------------------------------------- */

      const status =
        normalize(data.status);


      if (status !== "available") {
        return;
      }

      availableCount++;


      /* -----------------------------------------
         SERVICE
      ----------------------------------------- */

      if (
        !serviceMatches(
          data.services,
          selectedService
        )
      ) {
        return;
      }

      compatibleCount++;


      /* -----------------------------------------
         NUMBER
      ----------------------------------------- */

      const phoneNumber =
        data.number !== undefined &&
        data.number !== null
          ? String(data.number).trim()
          : "";


      /* -----------------------------------------
         PRICE
      ----------------------------------------- */

      const rawPrice =
        data.price !== undefined &&
        data.price !== null
          ? data.price
          : 0;

      const numericPrice =
        Number(
          String(rawPrice)
            .replace("$", "")
            .replace(/,/g, "")
            .trim()
        );


      /* -----------------------------------------
         STORE NORMALIZED RECORD
      ----------------------------------------- */

      allNumbers.push({

        id: documentSnapshot.id,

        number: phoneNumber,

        country:
          String(
            data.country ?? ""
          ).trim(),

        countryName:
          String(
            data.countryName ??
            data.country_name ??
            ""
          ).trim(),

        price:
          Number.isFinite(numericPrice)
            ? numericPrice
            : 0,

        provider:
          String(
            data.provider ?? ""
          ).trim(),

        services:
          Array.isArray(data.services)
            ? data.services
            : [],

        status
      });

    });


    inventoryStatus.textContent =
      `${snapshot.size} documents · ` +
      `${availableCount} available · ` +
      `${compatibleCount} compatible`;


    renderNumbers();

  } catch (error) {

    console.error(
      "Failed to load inventory:",
      error
    );

    inventoryStatus.textContent =
      "Unable to load inventory";

    numbersList.innerHTML = `
      <div class="numbers-state error-state">

        <i class="fa-solid fa-circle-exclamation"></i>

        <span>
          Unable to load available numbers.
        </span>

      </div>
    `;

  }

}


/* =========================================================
   FILTER NUMBERS
========================================================= */

function getFilteredNumbers() {

  return allNumbers.filter(item => {

    if (
      selectedCountry === "all"
    ) {
      return true;
    }

    return normalize(item.country) ===
      normalize(selectedCountry);

  });

}


/* =========================================================
   RENDER NUMBERS
========================================================= */

function renderNumbers() {

  const numbers =
    getFilteredNumbers();


  if (!numbers.length) {

    numbersList.innerHTML = `
      <div class="numbers-state">

        <i class="fa-solid fa-phone-slash"></i>

        <strong>
          No numbers available
        </strong>

        <span>
          There are currently no available
          numbers for this selection.
        </span>

      </div>
    `;

    return;
  }


  numbersList.innerHTML =
    numbers.map(item => {

      const displayNumber =
        item.number || "Number unavailable";


      const displayCountry =
        item.countryName ||
        item.country ||
        "Unknown country";


      const displayCountryCode =
        item.country || "";


      const displayProvider =
        item.provider ||
        "Provider unavailable";


      const displayPrice =
        `$${item.price.toFixed(2)}`;


      return `

        <article
          class="number-card"
          data-number-id="${escapeHtml(item.id)}"
        >

          <div class="number-card-main">

            <div class="number-card-country">

              <span>
                ${escapeHtml(displayCountry)}
              </span>

              <small>
                ${escapeHtml(displayCountryCode)}
              </small>

            </div>


            <div class="number-card-phone">

              <span class="phone-label">
                Phone number
              </span>

              <strong>
                ${escapeHtml(displayNumber)}
              </strong>

            </div>


            <div class="number-card-provider">

              <span>
                Provider
              </span>

              <strong>
                ${escapeHtml(displayProvider)}
              </strong>

            </div>


            <div class="number-card-price">

              <span>
                Price
              </span>

              <strong>
                ${displayPrice}
              </strong>

            </div>


            <span class="number-card-status">
              Available
            </span>


            <button
              type="button"
              class="number-card-button"
              data-number-id="${escapeHtml(item.id)}"
            >
              Choose number
              <i class="fa-solid fa-arrow-right"></i>
            </button>

          </div>

        </article>

      `;

    }).join("");


  attachChooseHandlers();

}


/* =========================================================
   CHOOSE NUMBER
========================================================= */

function attachChooseHandlers() {

  const buttons =
    document.querySelectorAll(
      ".number-card-button"
    );


  buttons.forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const numberId =
          button.dataset.numberId;


        const selected =
          allNumbers.find(
            item => item.id === numberId
          );


        if (!selected) {

          alert(
            "This number is no longer available."
          );

          return;
        }


        if (!selected.number) {

          alert(
            "The phone number field is empty in this inventory record."
          );

          return;
        }


        localStorage.setItem(
          "wavynumSelectedNumber",
          JSON.stringify({

            id: selected.id,

            service:
              selectedService,

            serviceKey:
              canonicalService(
                selectedService
              ),

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

          })
        );


        window.location.href =
          "number-confirmation.html";

      }
    );

  });

}


/* =========================================================
   COUNTRY FILTERS
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
   INIT
========================================================= */

renderServiceHeader();

loadInventory();
