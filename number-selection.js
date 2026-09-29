import { db } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


const params = new URLSearchParams(
  window.location.search
);

const selectedService =
  params.get("service") || "Facebook";


const numberList =
  document.getElementById("numberList");

const inventoryStatus =
  document.getElementById("inventoryStatus");

const serviceName =
  document.getElementById("selectedServiceName");

const serviceLogo =
  document.getElementById("selectedServiceLogo");

const serviceFallback =
  document.getElementById("selectedServiceFallback");


/* =========================================================
   SERVICES
========================================================= */

const services = {

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


function getPrice(value) {

  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  const cleaned =
    String(value ?? "")
      .replace(/[^0-9.]/g, "");

  const parsed =
    Number.parseFloat(cleaned);

  return Number.isFinite(parsed)
    ? parsed
    : 0;

}


function serviceMatches(
  servicesArray,
  service
) {

  if (!Array.isArray(servicesArray)) {
    return false;
  }

  const target =
    normalize(service);

  return servicesArray.some(item =>
    normalize(item) === target
  );

}


/* =========================================================
   SERVICE HEADER
========================================================= */

function renderService() {

  const key =
    normalize(selectedService);

  const config =
    services[key];

  serviceName.textContent =
    config?.name || selectedService;

  if (config?.logo) {

    serviceLogo.src =
      config.logo;

    serviceLogo.style.display =
      "block";

    serviceFallback.style.display =
      "none";

  } else {

    serviceLogo.style.display =
      "none";

    serviceFallback.style.display =
      "block";

  }

}


/* =========================================================
   EMPTY STATE
========================================================= */

function showEmpty(message) {

  numberList.innerHTML = `

    <div class="number-state">

      <div class="number-state-icon">
        <i class="fa-solid fa-phone-slash"></i>
      </div>

      <h2>
        No numbers found
      </h2>

      <p>
        ${escapeHtml(message)}
      </p>

    </div>

  `;

}


/* =========================================================
   RENDER NUMBER
========================================================= */

function renderNumber(item) {

  const phone =
    item.number || "Inventory number missing";

  const price =
    Number.isFinite(item.price)
      ? item.price.toFixed(2)
      : "0.00";


  numberList.innerHTML = `

    <article class="number-card">

      <div class="number-card-inner">

        <div class="number-card-top">

          <div class="number-country">

            <span class="number-label">
              COUNTRY
            </span>

            <strong>
              ${escapeHtml(
                item.countryName || "Unknown"
              )}
            </strong>

            <small>
              ${escapeHtml(
                item.country || ""
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
            ${escapeHtml(phone)}
          </strong>

        </div>


        <div class="number-card-bottom">

          <div class="number-provider">

            <span class="number-label">
              PROVIDER
            </span>

            <strong>
              ${escapeHtml(
                item.provider || "Unknown"
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

          Choose number

          <i class="fa-solid fa-arrow-right"></i>

        </button>

      </div>

    </article>

  `;


  const button =
    numberList.querySelector(
      ".number-choose-btn"
    );


  button.addEventListener(
    "click",
    () => {

      const selection = {

        id:
          item.id,

        service:
          selectedService,

        serviceKey:
          normalize(selectedService),

        number:
          item.number,

        country:
          item.country,

        countryName:
          item.countryName,

        price:
          item.price,

        provider:
          item.provider

      };


      localStorage.setItem(
        "wavynumSelectedNumber",
        JSON.stringify(selection)
      );


      window.location.href =
        "number-confirmation.html";

    }
  );

}


/* =========================================================
   LOAD INVENTORY
========================================================= */

async function loadInventory() {

  try {

    inventoryStatus.textContent =
      "Loading inventory...";


    const snapshot =
      await getDocs(
        collection(db, "numbers")
      );


    if (snapshot.empty) {

      inventoryStatus.textContent =
        "0 available numbers";

      showEmpty(
        "There are currently no numbers in inventory."
      );

      return;

    }


    const allNumbers = [];


    let diagnosticData = null;


    snapshot.forEach(
      documentSnapshot => {

        const data =
          documentSnapshot.data();


        /*
          Capture the RAW Firestore response
          before doing any conversion.
        */

        if (!diagnosticData) {

          diagnosticData = {

            id:
              documentSnapshot.id,

            keys:
              Object.keys(data),

            number:
              data.number,

            price:
              data.price,

            numberType:
              typeof data.number,

            priceType:
              typeof data.price

          };

        }


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


        const phoneNumber =
          String(
            data.number ?? ""
          ).trim();


        const price =
          getPrice(data.price);


        const status =
          normalize(data.status);


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


        allNumbers.push({

          id:
            documentSnapshot.id,

          number:
            phoneNumber,

          country,

          countryName,

          provider,

          price

        });

      }
    );


    /*
      IMPORTANT:
      Put the diagnostic in the inventory-status
      area so renderNumber() cannot erase it.
    */

    if (diagnosticData) {

      inventoryStatus.innerHTML = `

        <div style="
          padding:12px 14px;
          margin-bottom:12px;
          border:1px solid rgba(57,232,111,.35);
          border-radius:12px;
          background:#07100a;
          font-size:12px;
          line-height:1.7;
          color:#b5c0b7;
        ">

          <strong style="
            color:#39e86f;
          ">
            FIRESTORE DIAGNOSTIC
          </strong>

          <br>

          Document ID:
          ${escapeHtml(
            diagnosticData.id
          )}

          <br>

          Fields:
          ${escapeHtml(
            diagnosticData.keys.join(", ")
          )}

          <br>

          number:
          ${escapeHtml(
            String(
              diagnosticData.number
            )
          )}

          <br>

          price:
          ${escapeHtml(
            String(
              diagnosticData.price
            )
          )}

          <br>

          number type:
          ${escapeHtml(
            diagnosticData.numberType
          )}

          <br>

          price type:
          ${escapeHtml(
            diagnosticData.priceType
          )}

        </div>

        <div>
          ${allNumbers.length}
          available number${
            allNumbers.length === 1
              ? ""
              : "s"
          }
        </div>

      `;

    }


    if (!allNumbers.length) {

      showEmpty(
        "A number document was found, but it did not pass the availability or service filter."
      );

      return;

    }


    renderNumber(
      allNumbers[0]
    );

  }


  catch (error) {

    console.error(
      "Wavynum inventory error:",
      error
    );


    inventoryStatus.textContent =
      "Unable to load inventory";


    showEmpty(
      error?.message ||
      "Something went wrong while loading numbers."
    );

  }

}


/* =========================================================
   COUNTRY BUTTONS
========================================================= */

document
  .querySelectorAll(".country-button")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(".country-button")
          .forEach(item =>
            item.classList.remove("active")
          );

        button.classList.add("active");

      }
    );

  });


/* =========================================================
   START
========================================================= */

renderService();

loadInventory();
