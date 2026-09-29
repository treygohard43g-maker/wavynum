import { db } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


/* =========================================================
   WAVYNUM — NUMBER SELECTION
========================================================= */

const params = new URLSearchParams(
  window.location.search
);

const selectedService =
  params.get("service") || "";


const elements = {
  numberList:
    document.getElementById("numberList"),

  inventoryStatus:
    document.getElementById("inventoryStatus"),

  inventoryCount:
    document.getElementById("inventoryCount"),

  serviceName:
    document.getElementById("selectedServiceName"),

  serviceLogo:
    document.getElementById("selectedServiceLogo"),

  serviceFallback:
    document.getElementById("selectedServiceFallback")
};


let inventory = [];

let activeCountry = "all";


/* =========================================================
   SERVICE CONFIGURATION
========================================================= */

const serviceConfig = {

  facebook: {
    name: "Facebook",
    logo: "https://cdn.simpleicons.org/facebook/1877F2"
  },

  whatsapp: {
    name: "WhatsApp",
    logo: "https://cdn.simpleicons.org/whatsapp/25D366"
  },

  instagram: {
    name: "Instagram",
    logo: "https://cdn.simpleicons.org/instagram/E4405F"
  },

  telegram: {
    name: "Telegram",
    logo: "https://cdn.simpleicons.org/telegram/26A5E4"
  },

  snapchat: {
    name: "Snapchat",
    logo: "https://cdn.simpleicons.org/snapchat/FFFC00"
  },

  googlevoice: {
    name: "Google Voice",
    logo: "https://cdn.simpleicons.org/googlevoice/4285F4"
  },

  textplus: {
    name: "TextPlus",
    logo: "https://cdn.simpleicons.org/textplus/39E86F"
  },

  textnow: {
    name: "TextNow",
    logo: "https://cdn.simpleicons.org/textnow/39E86F"
  },

  twitter: {
    name: "Twitter",
    logo: "https://cdn.simpleicons.org/x/FFFFFF"
  }

};


/* =========================================================
   HELPERS
========================================================= */

function normalize(value) {

  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

}


function escapeHtml(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


function parsePrice(value) {

  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }


  const parsed =
    Number.parseFloat(
      String(value ?? "")
        .replace(/[^0-9.]/g, "")
    );


  return Number.isFinite(parsed)
    ? parsed
    : 0;

}


function serviceMatches(
  services,
  targetService
) {

  if (!Array.isArray(services)) {
    return false;
  }


  const target =
    normalize(targetService);


  return services.some(
    service =>
      normalize(service) === target
  );

}


/* =========================================================
   SERVICE HEADER
========================================================= */

function renderService() {

  const config =
    serviceConfig[
      normalize(selectedService)
    ];


  elements.serviceName.textContent =
    config?.name ||
    selectedService ||
    "Service";


  if (config?.logo) {

    elements.serviceLogo.src =
      config.logo;

    elements.serviceLogo.style.display =
      "block";

    elements.serviceFallback.style.display =
      "none";

  } else {

    elements.serviceLogo.style.display =
      "none";

    elements.serviceFallback.style.display =
      "block";

  }

}


/* =========================================================
   LOADING STATE
========================================================= */

function showLoading() {

  elements.numberList.innerHTML = `

    <div class="number-state">

      <div class="state-icon">
        <i class="fa-solid fa-spinner fa-spin"></i>
      </div>

      <h2>
        Loading numbers
      </h2>

      <p>
        Checking available inventory.
      </p>

    </div>

  `;

}


/* =========================================================
   EMPTY STATE
========================================================= */

function showEmpty(message) {

  elements.numberList.innerHTML = `

    <div class="number-state">

      <div class="state-icon">
        <i class="fa-solid fa-phone-slash"></i>
      </div>

      <h2>
        No numbers available
      </h2>

      <p>
        ${escapeHtml(message)}
      </p>

    </div>

  `;

}


/* =========================================================
   ERROR STATE
========================================================= */

function showError() {

  elements.numberList.innerHTML = `

    <div class="number-state">

      <div class="state-icon">
        <i class="fa-solid fa-triangle-exclamation"></i>
      </div>

      <h2>
        Inventory unavailable
      </h2>

      <p>
        We couldn't load the available numbers.
        Please refresh and try again.
      </p>

    </div>

  `;

}


/* =========================================================
   RENDER INVENTORY
========================================================= */

function renderInventory() {

  const filtered =
    inventory.filter(item => {

      if (
        activeCountry === "all"
      ) {
        return true;
      }

      return normalize(
        item.country
      ) === normalize(
        activeCountry
      );

    });


  elements.inventoryCount.textContent =
    `${filtered.length} available`;


  elements.inventoryStatus.textContent =
    filtered.length === 1
      ? "1 number available"
      : `${filtered.length} numbers available`;


  if (!filtered.length) {

    showEmpty(
      activeCountry === "all"
        ? "There are currently no numbers available for this service."
        : "There are no available numbers in this country."
    );

    return;

  }


  elements.numberList.innerHTML =
    filtered.map(
      renderNumberCard
    ).join("");


  bindChooseButtons();

}


/* =========================================================
   NUMBER CARD
========================================================= */

function renderNumberCard(item) {

  const price =
    item.price.toFixed(2);


  return `

    <article
      class="number-card"
      data-number-id="${escapeHtml(item.id)}"
    >

      <div class="number-card-inner">


        <div class="number-card-top">

          <div class="number-country">

            <span class="number-label">
              COUNTRY
            </span>

            <strong>
              ${escapeHtml(
                item.countryName ||
                "Unknown country"
              )}
            </strong>

            <small>
              ${escapeHtml(
                item.country
              )}
            </small>

          </div>


          <span class="number-status">
            Available
          </span>

        </div>



        <div class="number-phone-section">

          <span class="number-label">
            PHONE NUMBER
          </span>

          <strong class="number-phone">
            ${escapeHtml(
              item.number
            )}
          </strong>

        </div>



        <div class="number-card-bottom">

          <div class="number-provider">

            <span class="number-label">
              PROVIDER
            </span>

            <strong>
              ${escapeHtml(
                item.provider ||
                "Unknown"
              )}
            </strong>

          </div>


          <div class="number-price">

            <span class="number-label">
              PRICE
            </span>

            <strong>
              $${price}
            </strong>

          </div>

        </div>



        <button
          type="button"
          class="number-choose-btn"
          data-number-id="${escapeHtml(item.id)}"
        >

          <span>
            Choose number
          </span>

          <i
            class="fa-solid fa-arrow-right"
            aria-hidden="true"
          ></i>

        </button>


      </div>

    </article>

  `;

}


/* =========================================================
   CHOOSE NUMBER
========================================================= */

function bindChooseButtons() {

  document
    .querySelectorAll(
      ".number-choose-btn"
    )
    .forEach(button => {

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
            return;
          }


          const selection = {

            id:
              selected.id,

            service:
              selectedService,

            serviceKey:
              normalize(
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

          };


          localStorage.setItem(
            "wavynumSelectedNumber",
            JSON.stringify(selection)
          );


          button.disabled = true;


          button.innerHTML = `
            <span>
              Continuing...
            </span>

            <i
              class="fa-solid fa-spinner fa-spin"
              aria-hidden="true"
            ></i>
          `;


          window.location.href =
            "number-confirmation.html";

        }
      );

    });

}


/* =========================================================
   LOAD FIRESTORE INVENTORY
========================================================= */

async function loadInventory() {

  showLoading();


  try {

    const snapshot =
      await getDocs(
        collection(
          db,
          "numbers"
        )
      );


    inventory = [];


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


        if (
          !serviceMatches(
            data.services,
            selectedService
          )
        ) {
          return;
        }


        const number =
          String(
            data.number ?? ""
          ).trim();


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


        const price =
          parsePrice(
            data.price
          );


        /*
          Ignore malformed inventory records.
          This keeps broken documents from appearing
          as $0.00 or "number missing".
        */

        if (!number) {
          return;
        }


        if (price <= 0) {
          return;
        }


        inventory.push({

          id:
            documentSnapshot.id,

          number,

          country,

          countryName,

          provider,

          price

        });

      }
    );


    renderInventory();

  }


  catch (error) {

    console.error(
      "Wavynum inventory error:",
      error
    );


    elements.inventoryCount.textContent =
      "Unavailable";


    elements.inventoryStatus.textContent =
      "Unable to load inventory";


    showError();

  }

}


/* =========================================================
   COUNTRY FILTERS
========================================================= */

document
  .querySelectorAll(
    ".country-filter-button"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(
            ".country-filter-button"
          )
          .forEach(item => {

            item.classList.remove(
              "active"
            );

            item.setAttribute(
              "aria-pressed",
              "false"
            );

          });


        button.classList.add(
          "active"
        );


        button.setAttribute(
          "aria-pressed",
          "true"
        );


        activeCountry =
          button.dataset.country ||
          "all";


        renderInventory();

      }
    );

  });


/* =========================================================
   INITIALIZE
========================================================= */

renderService();

loadInventory();
