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

const serviceName =
  document.getElementById("serviceName");

const serviceLogo =
  document.getElementById("serviceLogo");

const serviceFallbackIcon =
  document.getElementById(
    "serviceFallbackIcon"
  );

const numbersList =
  document.getElementById("numbersList");

const diagnostic =
  document.getElementById("diagnostic");

const filterButtons =
  document.querySelectorAll(".filter-btn");


/* =========================================================
   STATE
========================================================= */

let allNumbers = [];

let selectedCountry = "all";

let selectedService = "";


/* =========================================================
   SERVICE LOGOS
========================================================= */

const SERVICE_LOGOS = {

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
   CANONICAL SERVICE
========================================================= */

function canonicalService(value) {

  const normalized =
    normalize(value);

  const aliases = {

    "twitter / x": "twitter",
    "twitter/x": "twitter",
    "twitter x": "twitter",
    "x/twitter": "twitter",

    "facebook messenger":
      "facebook"

  };

  return (
    aliases[normalized] ||
    normalized
  );

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

function serviceMatches(
  services,
  requestedService
) {

  if (!Array.isArray(services)) {
    return false;
  }

  const requested =
    canonicalService(
      requestedService
    );

  return services.some(
    service =>
      canonicalService(service) ===
      requested
  );

}


/* =========================================================
   READ SERVICE FROM URL
========================================================= */

const params =
  new URLSearchParams(
    window.location.search
  );

selectedService =
  params.get("service") || "Other";


/* =========================================================
   RENDER SERVICE HEADER
========================================================= */

function renderServiceHeader() {

  const key =
    canonicalService(
      selectedService
    );

  const config =
    SERVICE_CONFIG[key];


  if (serviceName) {

    serviceName.textContent =
      config?.name ||
      selectedService ||
      "Service";

  }


  if (serviceLogo) {

    const logo =
      SERVICE_LOGOS[key];

    if (logo) {

      serviceLogo.src = logo;

      serviceLogo.style.display =
        "block";

      if (serviceFallbackIcon) {

        serviceFallbackIcon.style.display =
          "none";

      }

      serviceLogo.onerror = () => {

        serviceLogo.style.display =
          "none";

        if (serviceFallbackIcon) {

          serviceFallbackIcon.style.display =
            "block";

        }

      };

    } else {

      serviceLogo.removeAttribute(
        "src"
      );

      serviceLogo.style.display =
        "none";

      if (serviceFallbackIcon) {

        serviceFallbackIcon.style.display =
          "block";

      }

    }

  }

}


/* =========================================================
   LOAD INVENTORY
========================================================= */

async function loadInventory() {

  try {

    numbersList.innerHTML = `
      <div class="state-box">

        <div class="state-icon">
          <i class="fa-solid fa-spinner fa-spin"></i>
        </div>

        <h2>Loading numbers</h2>

        <p>
          Checking available inventory.
        </p>

      </div>
    `;


    const snapshot =
      await getDocs(
        collection(
          db,
          "numbers"
        )
      );


    allNumbers = [];

    let availableCount = 0;

    let compatibleCount = 0;


    snapshot.forEach(
      documentSnapshot => {

        const data =
          documentSnapshot.data();


        const status =
          normalize(
            data.status
          );


        if (
          status !== "available"
        ) {
          return;
        }


        availableCount++;


        if (
          !serviceMatches(
            data.services,
            selectedService
          )
        ) {
          return;
        }


        compatibleCount++;


        const number =
          data.number != null
            ? String(
                data.number
              ).trim()
            : "";


        const rawPrice =
          data.price != null
            ? data.price
            : 0;


        const price =
          Number(
            String(rawPrice)
              .replace("$", "")
              .replace(/,/g, "")
              .trim()
          );


        allNumbers.push({

          id:
            documentSnapshot.id,

          number,

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

          provider:
            String(
              data.provider ?? ""
            ).trim(),

          price:
            Number.isFinite(price)
              ? price
              : 0

        });

      }
    );


    if (diagnostic) {

      diagnostic.textContent =
        `${snapshot.size} documents · ` +
        `${availableCount} available · ` +
        `${compatibleCount} compatible`;

    }


    renderNumbers();

  } catch (error) {

    console.error(
      "Wavynum inventory error:",
      error
    );


    if (diagnostic) {

      diagnostic.textContent =
        "Unable to load inventory";

    }


    numbersList.innerHTML = `
      <div class="state-box">

        <div class="state-icon">
          <i class="fa-solid fa-circle-exclamation"></i>
        </div>

        <h2>
          Inventory unavailable
        </h2>

        <p>
          We couldn't load available numbers.
          Please try again.
        </p>

      </div>
    `;

  }

}


/* =========================================================
   COUNTRY FILTER
========================================================= */

function getFilteredNumbers() {

  return allNumbers.filter(
    number => {

      if (
        selectedCountry === "all"
      ) {
        return true;
      }

      return normalize(
        number.country
      ) === normalize(
        selectedCountry
      );

    }
  );

}


/* =========================================================
   RENDER NUMBER CARDS
========================================================= */

function renderNumbers() {

  const numbers =
    getFilteredNumbers();


  if (!numbers.length) {

    numbersList.innerHTML = `
      <div class="state-box">

        <div class="state-icon">
          <i class="fa-solid fa-phone-slash"></i>
        </div>

        <h2>
          No numbers available
        </h2>

        <p>
          There are currently no available
          numbers for this selection.
        </p>

      </div>
    `;

    return;

  }


  numbersList.innerHTML =
    numbers.map(
      number => {

        const displayNumber =
          number.number ||
          "Number unavailable";


        const displayCountry =
          number.countryName ||
          number.country ||
          "Unknown";


        const displayProvider =
          number.provider ||
          "Telnyx";


        const displayPrice =
          `$${number.price.toFixed(2)}`;


        return `

          <article
            class="number-card"
            data-number-id="${escapeHtml(
              number.id
            )}"
          >

            <div class="number-card-inner">


              <!-- CARD HEADER -->

              <div class="number-card-top">

                <div class="number-country">

                  <span
                    class="number-country-label"
                  >
                    Country
                  </span>

                  <strong
                    class="number-country-name"
                  >
                    ${escapeHtml(
                      displayCountry
                    )}
                  </strong>

                  <small
                    class="number-country-code"
                  >
                    ${escapeHtml(
                      number.country
                    )}
                  </small>

                </div>


                <span
                  class="number-available"
                >
                  Available
                </span>

              </div>


              <!-- HORIZONTAL CONTENT -->

              <div class="number-card-content">


                <!-- PHONE -->

                <div class="number-phone-box">

                  <span
                    class="number-phone-label"
                  >
                    Phone number
                  </span>

                  <strong
                    class="number-phone"
                  >
                    ${escapeHtml(
                      displayNumber
                    )}
                  </strong>

                </div>


                <!-- DETAILS -->

                <div
                  class="number-card-details"
                >

                  <div
                    class="number-detail"
                  >

                    <span
                      class="number-detail-label"
                    >
                      Provider
                    </span>

                    <span
                      class="number-detail-value"
                    >
                      ${escapeHtml(
                        displayProvider
                      )}
                    </span>

                  </div>


                  <div
                    class="number-detail price"
                  >

                    <span
                      class="number-detail-label"
                    >
                      Price
                    </span>

                    <span
                      class="number-detail-value"
                    >
                      ${displayPrice}
                    </span>

                  </div>

                </div>


                <!-- CHOOSE -->

                <button
                  type="button"
                  class="number-choose-btn"
                  data-number-id="${escapeHtml(
                    number.id
                  )}"
                >

                  Choose number

                  <i
                    class="fa-solid fa-arrow-right"
                  ></i>

                </button>


              </div>

            </div>

          </article>

        `;

      }
    ).join("");


  attachChooseHandlers();

}


/* =========================================================
   CHOOSE NUMBER
========================================================= */

function attachChooseHandlers() {

  const buttons =
    document.querySelectorAll(
      ".number-choose-btn"
    );


  buttons.forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          const numberId =
            button.dataset.numberId;


          const selected =
            allNumbers.find(
              number =>
                number.id ===
                numberId
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

              id:
                selected.id,

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

    }
  );

}


/* =========================================================
   COUNTRY FILTERS
========================================================= */

filterButtons.forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        filterButtons.forEach(
          item =>
            item.classList.remove(
              "active"
            )
        );


        button.classList.add(
          "active"
        );


        selectedCountry =
          button.dataset.country ||
          "all";


        renderNumbers();

      }
    );

  }
);


/* =========================================================
   INIT
========================================================= */

renderServiceHeader();

loadInventory();
