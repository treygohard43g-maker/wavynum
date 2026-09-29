import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
  db
} from "./firebase.js";


/* =========================================================
   SERVICE CONFIGURATION
========================================================= */

const SERVICE_CONFIG = {

  facebook: {
    name: "Facebook",
    logo: "https://cdn.brandfetch.io/facebook.com/w/256/h/256",
    icon: "fa-brands fa-facebook-f"
  },

  whatsapp: {
    name: "WhatsApp",
    logo: "https://cdn.brandfetch.io/whatsapp.com/w/256/h/256",
    icon: "fa-brands fa-whatsapp"
  },

  instagram: {
    name: "Instagram",
    logo: "https://cdn.brandfetch.io/instagram.com/w/256/h/256",
    icon: "fa-brands fa-instagram"
  },

  telegram: {
    name: "Telegram",
    logo: "https://cdn.brandfetch.io/telegram.org/w/256/h/256",
    icon: "fa-brands fa-telegram"
  },

  snapchat: {
    name: "Snapchat",
    logo: "https://cdn.brandfetch.io/snapchat.com/w/256/h/256",
    icon: "fa-brands fa-snapchat"
  },

  "google voice": {
    name: "Google Voice",
    logo: "https://cdn.brandfetch.io/voice.google.com/w/256/h/256",
    icon: "fa-solid fa-phone"
  },

  textplus: {
    name: "TextPlus",
    logo: "https://cdn.brandfetch.io/textplus.com/w/256/h/256",
    icon: "fa-solid fa-comment"
  },

  textnow: {
    name: "TextNow",
    logo: "https://cdn.brandfetch.io/textnow.com/w/256/h/256",
    icon: "fa-solid fa-comment-dots"
  },

  textfree: {
    name: "TextFree",
    logo: "https://cdn.brandfetch.io/textfree.us/w/256/h/256",
    icon: "fa-solid fa-message"
  },

  hushed: {
    name: "Hushed",
    logo: "https://cdn.brandfetch.io/hushed.com/w/256/h/256",
    icon: "fa-solid fa-phone"
  },

  burner: {
    name: "Burner",
    logo: "https://cdn.brandfetch.io/burnerapp.com/w/256/h/256",
    icon: "fa-solid fa-fire"
  },

  "2ndline": {
    name: "2ndLine",
    logo: "https://cdn.brandfetch.io/2ndline.co/w/256/h/256",
    icon: "fa-solid fa-phone-volume"
  },

  freetone: {
    name: "FreeTone",
    logo: "https://cdn.brandfetch.io/freetone.com/w/256/h/256",
    icon: "fa-solid fa-phone"
  },

  coverme: {
    name: "CoverMe",
    logo: "https://cdn.brandfetch.io/coverme.ws/w/256/h/256",
    icon: "fa-solid fa-shield-halved"
  },

  numero: {
    name: "Numero",
    logo: "https://cdn.brandfetch.io/numeroesim.com/w/256/h/256",
    icon: "fa-solid fa-hashtag"
  },

  mysudo: {
    name: "MySudo",
    logo: "https://cdn.brandfetch.io/mysudo.com/w/256/h/256",
    icon: "fa-solid fa-user-shield"
  },

  twitter: {
    name: "Twitter / X",
    logo: "https://cdn.brandfetch.io/x.com/w/256/h/256",
    icon: "fa-brands fa-x-twitter"
  },

  x: {
    name: "Twitter / X",
    logo: "https://cdn.brandfetch.io/x.com/w/256/h/256",
    icon: "fa-brands fa-x-twitter"
  }

};


/* =========================================================
   SERVICE ALIASES
========================================================= */

const SERVICE_ALIASES = {

  "twitter / x": "twitter",

  "twitter/x": "twitter",

  "twitter x": "twitter",

  "x/twitter": "twitter",

  "facebook messenger": "facebook"

};


/* =========================================================
   DOM ELEMENTS
========================================================= */

const numbersList =
  document.getElementById("numbersList");

const diagnostic =
  document.getElementById("diagnostic");

const serviceName =
  document.getElementById("serviceName");

const serviceLogo =
  document.getElementById("serviceLogo");

const serviceLogoContainer =
  document.querySelector(
    ".selected-service-logo"
  );

const serviceFallbackIcon =
  document.getElementById(
    "serviceFallbackIcon"
  );


/* =========================================================
   READ SERVICE FROM URL
========================================================= */

const params =
  new URLSearchParams(
    window.location.search
  );

const rawService =
  params.get("service") || "";


/* =========================================================
   NORMALIZE SERVICE
========================================================= */

function normalizeService(value) {

  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

}


/* =========================================================
   CANONICAL SERVICE
========================================================= */

function canonicalService(value) {

  const normalized =
    normalizeService(value);

  return (
    SERVICE_ALIASES[normalized] ||
    normalized
  );

}


/* =========================================================
   SELECTED SERVICE
========================================================= */

const selectedServiceKey =
  canonicalService(rawService);

const selectedConfig =
  SERVICE_CONFIG[selectedServiceKey] || null;

const selectedServiceName =
  selectedConfig?.name ||
  rawService.trim() ||
  "Unknown service";


serviceName.textContent =
  selectedServiceName;


/* =========================================================
   SERVICE LOGO
========================================================= */

function setFallbackIcon(iconClass) {

  serviceFallbackIcon.className =
    iconClass ||
    "fa-solid fa-layer-group";

}


if (selectedConfig) {

  setFallbackIcon(
    selectedConfig.icon
  );

  serviceLogo.src =
    selectedConfig.logo;

  serviceLogo.alt =
    `${selectedServiceName} logo`;

  serviceLogo.addEventListener(
    "error",
    () => {

      serviceLogoContainer
        .classList
        .add("logo-failed");

    }
  );

} else {

  serviceLogoContainer
    .classList
    .add("no-logo");

}


/* =========================================================
   VARIABLES
========================================================= */

let allNumbers = [];

let currentCountry = "all";


/* =========================================================
   SERVICE MATCHING
========================================================= */

function serviceMatches(
  services,
  requestedService
) {

  if (!Array.isArray(services)) {

    return false;

  }


  const wanted =
    canonicalService(
      requestedService
    );


  return services.some(
    (service) => {

      const available =
        canonicalService(
          service
        );

      return (
        available === wanted
      );

    }
  );

}


/* =========================================================
   LOAD INVENTORY
========================================================= */

async function loadNumbers() {

  if (!selectedServiceKey) {

    diagnostic.innerHTML =
      `
      <strong>Missing service:</strong>
      No service was selected.
      `;

    showState(
      "fa-solid fa-circle-question",
      "No service selected",
      "Return to Buy Number and choose a service first."
    );

    return;

  }


  try {

    diagnostic.textContent =
      "Loading inventory...";


    const snapshot =
      await getDocs(
        collection(
          db,
          "numbers"
        )
      );


    let totalDocuments = 0;

    let availableNumbers = 0;

    let serviceMatchesCount = 0;


    allNumbers = [];


    snapshot.forEach(
      (docSnap) => {

        totalDocuments++;


        const data =
          docSnap.data();


        /* =========================
           STATUS
        ========================= */

        const status =
          normalizeService(
            data.status
          );


        if (
          status !== "available"
        ) {

          return;

        }


        availableNumbers++;


        /* =========================
           SERVICES
        ========================= */

        const services =
          Array.isArray(
            data.services
          )
            ? data.services
            : [];


        const matches =
          serviceMatches(
            services,
            selectedServiceKey
          );


        if (!matches) {

          return;

        }


        serviceMatchesCount++;


        /* =========================
           SAVE NUMBER
        ========================= */

        allNumbers.push({

          id:
            docSnap.id,

          number:
            String(
              data.number || ""
            ).trim(),

          country:
            String(
              data.country || ""
            )
            .trim()
            .toUpperCase(),

          countryName:
            String(
              data.countryName ||
              "Unknown"
            ).trim(),

          price:
            Number(
              data.price
            ) || 0,

          provider:
            String(
              data.provider ||
              "Provider"
            ).trim(),

          services

        });

      }
    );


    /* =========================
       DIAGNOSTIC
    ========================= */

    diagnostic.innerHTML =
      `
      Inventory:
      <strong>
        ${totalDocuments}
      </strong>
      documents ·

      <strong>
        ${availableNumbers}
      </strong>
      available ·

      <strong>
        ${serviceMatchesCount}
      </strong>
      compatible
      `;


    renderNumbers();


  } catch (error) {

    console.error(
      "Wavynum inventory error:",
      error
    );


    diagnostic.innerHTML =
      `
      <strong>
        Inventory error:
      </strong>

      ${escapeHtml(
        error.message
      )}
      `;


    showState(
      "fa-solid fa-triangle-exclamation",
      "Unable to load inventory",
      error.message
    );

  }

}


/* =========================================================
   RENDER NUMBERS
========================================================= */

function renderNumbers() {

  const filtered =
    allNumbers.filter(
      (item) => {

        if (
          currentCountry === "all"
        ) {

          return true;

        }


        return (
          item.country ===
          currentCountry
        );

      }
    );


  if (
    filtered.length === 0
  ) {

    showState(
      "fa-solid fa-phone-slash",
      "No numbers available",
      `There are currently no available numbers for ${selectedServiceName}.`
    );

    return;

  }


  numbersList.innerHTML =
    filtered
      .map(
        createNumberCard
      )
      .join("");


  attachChooseHandlers();

}


/* =========================================================
   CREATE NUMBER CARD
========================================================= */

function createNumberCard(
  item
) {

  return `
    <article
      class="number-card"
      data-number-id="${escapeHtml(item.id)}"
    >

      <div class="number-top">

        <div class="number-primary">

          <div class="actual-phone-number">
            ${escapeHtml(
              item.number
            )}
          </div>

          <div class="country-name">
            ${escapeHtml(
              item.countryName
            )}
          </div>

        </div>


        <div class="price">
          $${item.price.toFixed(2)}
        </div>

      </div>


      <div class="number-meta">

        <span class="meta-item">

          <i class="fa-solid fa-flag"></i>

          ${escapeHtml(
            item.country ||
            "Unknown"
          )}

        </span>


        <span class="meta-item">

          <i class="fa-solid fa-server"></i>

          ${escapeHtml(
            item.provider
          )}

        </span>


        <span class="meta-item">

          <i class="fa-solid fa-circle-check"></i>

          Available

        </span>

      </div>


      <button
        type="button"
        class="choose-btn"
        data-id="${escapeHtml(
          item.id
        )}"
      >

        Choose number

        <i class="fa-solid fa-arrow-right"></i>

      </button>

    </article>
  `;

}


/* =========================================================
   CHOOSE BUTTONS
========================================================= */

function attachChooseHandlers() {

  document
    .querySelectorAll(
      ".choose-btn"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            chooseNumber(
              button.dataset.id
            );

          }
        );

      }
    );

}


/* =========================================================
   CHOOSE NUMBER
========================================================= */

function chooseNumber(
  numberId
) {

  const selected =
    allNumbers.find(
      (item) =>
        item.id === numberId
    );


  if (!selected) {

    showState(
      "fa-solid fa-triangle-exclamation",
      "Number unavailable",
      "This number could not be found in the current inventory."
    );

    return;

  }


  const selectedNumber = {

    id:
      selected.id,

    service:
      selectedServiceName,

    serviceKey:
      selectedServiceKey,

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
    JSON.stringify(
      selectedNumber
    )
  );


  window.location.href =
    "number-confirmation.html";

}


/* =========================================================
   COUNTRY FILTERS
========================================================= */

document
  .querySelectorAll(
    ".filter-btn"
  )
  .forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          document
            .querySelectorAll(
              ".filter-btn"
            )
            .forEach(
              (btn) => {

                btn.classList.remove(
                  "active"
                );

              }
            );


          button.classList.add(
            "active"
          );


          currentCountry =
            button.dataset.country ||
            "all";


          renderNumbers();

        }
      );

    }
  );


/* =========================================================
   STATE MESSAGE
========================================================= */

function showState(
  icon,
  title,
  message
) {

  numbersList.innerHTML =
    `
    <div class="state-box">

      <div class="state-icon">

        <i class="${escapeHtml(
          icon
        )}"></i>

      </div>

      <h2>
        ${escapeHtml(
          title
        )}
      </h2>

      <p>
        ${escapeHtml(
          message
        )}
      </p>

    </div>
    `;

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(
  value
) {

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


/* =========================================================
   START APPLICATION
========================================================= */

loadNumbers();
