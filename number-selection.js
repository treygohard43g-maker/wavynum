import { db } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


/* =========================================================
   SERVICE CONFIG
========================================================= */

const SERVICE_CONFIG = {
  facebook: {
    name: "Facebook",
    logo: "https://cdn.brandfetch.io/facebook.com/w/256/h/256",
    fallbackIcon: "fa-brands fa-facebook-f"
  },

  whatsapp: {
    name: "WhatsApp",
    logo: "https://cdn.brandfetch.io/whatsapp.com/w/256/h/256",
    fallbackIcon: "fa-brands fa-whatsapp"
  },

  instagram: {
    name: "Instagram",
    logo: "https://cdn.brandfetch.io/instagram.com/w/256/h/256",
    fallbackIcon: "fa-brands fa-instagram"
  },

  telegram: {
    name: "Telegram",
    logo: "https://cdn.brandfetch.io/telegram.org/w/256/h/256",
    fallbackIcon: "fa-brands fa-telegram"
  },

  snapchat: {
    name: "Snapchat",
    logo: "https://cdn.brandfetch.io/snapchat.com/w/256/h/256",
    fallbackIcon: "fa-brands fa-snapchat"
  },

  "google voice": {
    name: "Google Voice",
    logo: "https://cdn.brandfetch.io/voice.google.com/w/256/h/256",
    fallbackIcon: "fa-solid fa-phone"
  },

  textplus: {
    name: "TextPlus",
    logo: "https://cdn.brandfetch.io/textplus.com/w/256/h/256",
    fallbackIcon: "fa-solid fa-comment"
  },

  textnow: {
    name: "TextNow",
    logo: "https://cdn.brandfetch.io/textnow.com/w/256/h/256",
    fallbackIcon: "fa-solid fa-comment-dots"
  },

  textfree: {
    name: "TextFree",
    logo: "https://cdn.brandfetch.io/textfree.us/w/256/h/256",
    fallbackIcon: "fa-solid fa-message"
  },

  hushed: {
    name: "Hushed",
    logo: "https://cdn.brandfetch.io/hushed.com/w/256/h/256",
    fallbackIcon: "fa-solid fa-phone"
  },

  burner: {
    name: "Burner",
    logo: "https://cdn.brandfetch.io/burnerapp.com/w/256/h/256",
    fallbackIcon: "fa-solid fa-fire"
  },

  "2ndline": {
    name: "2ndLine",
    logo: "https://cdn.brandfetch.io/2ndline.co/w/256/h/256",
    fallbackIcon: "fa-solid fa-phone-volume"
  },

  freetone: {
    name: "FreeTone",
    logo: "https://cdn.brandfetch.io/freetone.com/w/256/h/256",
    fallbackIcon: "fa-solid fa-phone"
  },

  coverme: {
    name: "CoverMe",
    logo: "https://cdn.brandfetch.io/coverme.com/w/256/h/256",
    fallbackIcon: "fa-solid fa-shield-halved"
  },

  numero: {
    name: "Numero",
    logo: "https://cdn.brandfetch.io/numeroesim.com/w/256/h/256",
    fallbackIcon: "fa-solid fa-hashtag"
  },

  mysudo: {
    name: "MySudo",
    logo: "https://cdn.brandfetch.io/mysudo.com/w/256/h/256",
    fallbackIcon: "fa-solid fa-user-shield"
  },

  twitter: {
    name: "Twitter",
    logo: "https://cdn.brandfetch.io/x.com/w/256/h/256",
    fallbackIcon: "fa-brands fa-x-twitter"
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
   DOM
========================================================= */

const serviceNameElement =
  document.querySelector("#selectedServiceName");

const serviceLogoElement =
  document.querySelector("#selectedServiceLogo");

const serviceFallbackElement =
  document.querySelector("#selectedServiceFallback");

const numbersList =
  document.querySelector("#numbersList");

const inventoryStatus =
  document.querySelector("#inventoryStatus");

const countryButtons =
  document.querySelectorAll(".country-filter");


/* =========================================================
   STATE
========================================================= */

let allNumbers = [];
let selectedCountry = "ALL";

const params = new URLSearchParams(window.location.search);

const requestedService =
  params.get("service") || "Other";


/* =========================================================
   HELPERS
========================================================= */

function normalizeService(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}


function canonicalService(value) {
  const normalized = normalizeService(value);

  return SERVICE_ALIASES[normalized] || normalized;
}


function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function serviceMatches(services, requested) {
  if (!Array.isArray(services)) {
    return false;
  }

  const wanted =
    canonicalService(requested);

  return services.some((service) => {
    return canonicalService(service) === wanted;
  });
}


/* =========================================================
   SERVICE HEADER
========================================================= */

function renderServiceHeader() {

  const serviceKey =
    canonicalService(requestedService);

  const config =
    SERVICE_CONFIG[serviceKey] || {
      name: requestedService,
      logo: null,
      fallbackIcon: "fa-solid fa-layer-group"
    };

  if (serviceNameElement) {
    serviceNameElement.textContent =
      config.name;
  }

  if (serviceLogoElement) {

    if (config.logo) {

      serviceLogoElement.src =
        config.logo;

      serviceLogoElement.alt =
        `${config.name} logo`;

      serviceLogoElement.hidden =
        false;

      serviceLogoElement.onerror = () => {

        serviceLogoElement.hidden =
          true;

        if (serviceFallbackElement) {
          serviceFallbackElement.hidden =
            false;

          serviceFallbackElement.innerHTML =
            `<i class="${config.fallbackIcon}"></i>`;
        }
      };

    } else {

      serviceLogoElement.hidden =
        true;

      if (serviceFallbackElement) {
        serviceFallbackElement.hidden =
          false;

        serviceFallbackElement.innerHTML =
          `<i class="${config.fallbackIcon}"></i>`;
      }
    }
  }
}


/* =========================================================
   LOAD INVENTORY
========================================================= */

async function loadInventory() {

  try {

    if (numbersList) {
      numbersList.innerHTML = "";
    }

    const snapshot =
      await getDocs(
        collection(db, "numbers")
      );

    allNumbers = [];

    let availableCount = 0;
    let compatibleCount = 0;

    snapshot.forEach((documentSnapshot) => {

      const data =
        documentSnapshot.data();

      const status =
        normalizeService(data.status);

      if (status !== "available") {
        return;
      }

      availableCount++;

      const services =
        Array.isArray(data.services)
          ? data.services
          : [];

      const compatible =
        serviceMatches(
          services,
          requestedService
        );

      if (!compatible) {
        return;
      }

      compatibleCount++;

      allNumbers.push({
        id: documentSnapshot.id,

        number:
          String(data.number ?? "").trim(),

        country:
          String(data.country ?? "").trim(),

        countryName:
          String(data.countryName ?? "").trim(),

        price:
          data.price ?? "",

        provider:
          String(data.provider ?? "").trim(),

        status:
          String(data.status ?? "").trim(),

        services
      });

    });


    if (inventoryStatus) {

      inventoryStatus.textContent =
        `${snapshot.size} documents · ` +
        `${availableCount} available · ` +
        `${compatibleCount} compatible`;

    }


    renderNumbers();

  } catch (error) {

    console.error(
      "Inventory loading error:",
      error
    );

    if (inventoryStatus) {
      inventoryStatus.textContent =
        "Unable to load inventory.";
    }

    if (numbersList) {
      numbersList.innerHTML = `
        <div class="numbers-state numbers-state-error">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <h3>Unable to load numbers</h3>
          <p>Please refresh the page and try again.</p>
        </div>
      `;
    }

  }
}


/* =========================================================
   RENDER NUMBERS
========================================================= */

function renderNumbers() {

  if (!numbersList) {
    return;
  }

  const filteredNumbers =
    selectedCountry === "ALL"
      ? allNumbers
      : allNumbers.filter((item) =>
          item.country.toUpperCase() ===
          selectedCountry
        );


  if (!filteredNumbers.length) {

    numbersList.innerHTML = `
      <div class="numbers-state">
        <i class="fa-solid fa-phone-slash"></i>
        <h3>No numbers available</h3>
        <p>There are currently no numbers matching this selection.</p>
      </div>
    `;

    return;
  }


  numbersList.innerHTML =
    filteredNumbers
      .map((item) => {

        const number =
          item.number || "Number unavailable";

        const country =
          item.countryName || item.country || "Unknown country";

        const provider =
          item.provider || "Provider unavailable";


        const numericPrice =
          Number(item.price);


        const price =
          Number.isFinite(numericPrice)
            ? `$${numericPrice.toFixed(2)}`
            : `$${escapeHtml(item.price || "0.00")}`;


        return `
          <article class="number-card">

            <div class="number-card-main">

              <div class="number-card-country">
                <span class="number-country-icon">
                  <i class="fa-solid fa-earth-americas"></i>
                </span>

                <div>
                  <strong>
                    ${escapeHtml(country)}
                  </strong>

                  <span>
                    ${escapeHtml(item.country || "")}
                  </span>
                </div>
              </div>


              <div class="number-card-phone">
                <span class="number-card-label">
                  Phone number
                </span>

                <strong>
                  ${escapeHtml(number)}
                </strong>
              </div>


              <div class="number-card-provider">
                <span class="number-card-label">
                  Provider
                </span>

                <strong>
                  ${escapeHtml(provider)}
                </strong>
              </div>


              <div class="number-card-price">
                <span class="number-card-label">
                  Price
                </span>

                <strong>
                  ${price}
                </strong>
              </div>

            </div>


            <button
              type="button"
              class="number-card-button"
              data-number-id="${escapeHtml(item.id)}"
            >
              Choose number
              <i class="fa-solid fa-arrow-right"></i>
            </button>

          </article>
        `;

      })
      .join("");


  numbersList
    .querySelectorAll(".number-card-button")
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          const numberId =
            button.dataset.numberId;

          chooseNumber(numberId);

        }
      );

    });
}


/* =========================================================
   CHOOSE NUMBER
========================================================= */

function chooseNumber(numberId) {

  const selected =
    allNumbers.find(
      (item) => item.id === numberId
    );

  if (!selected) {
    return;
  }


  const selectedNumber = {

    id:
      selected.id,

    service:
      SERVICE_CONFIG[
        canonicalService(requestedService)
      ]?.name || requestedService,

    serviceKey:
      canonicalService(requestedService),

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
    JSON.stringify(selectedNumber)
  );


  window.location.href =
    "number-confirmation.html";
}


/* =========================================================
   COUNTRY FILTERS
========================================================= */

countryButtons.forEach((button) => {

  button.addEventListener(
    "click",
    () => {

      countryButtons.forEach(
        (item) => {
          item.classList.remove("active");
        }
      );

      button.classList.add("active");

      selectedCountry =
        String(
          button.dataset.country || "ALL"
        ).toUpperCase();

      renderNumbers();

    }
  );

});


/* =========================================================
   INIT
========================================================= */

renderServiceHeader();

loadInventory();
