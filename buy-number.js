/* =========================================================
   WAVYNUM — BUY NUMBER
   Service marketplace
========================================================= */

const SERVICE_DEFINITIONS = [
    {
        name: "Facebook",
        key: "Facebook",
        description: "Numbers compatible with Facebook",
        logo: "https://cdn.brandfetch.io/facebook.com/w/256/h/256",
        fallbackIcon: "fa-brands fa-facebook-f"
    },

    {
        name: "WhatsApp",
        key: "WhatsApp",
        description: "Numbers compatible with WhatsApp",
        logo: "https://cdn.brandfetch.io/whatsapp.com/w/256/h/256",
        fallbackIcon: "fa-brands fa-whatsapp"
    },

    {
        name: "Instagram",
        key: "Instagram",
        description: "Numbers compatible with Instagram",
        logo: "https://cdn.brandfetch.io/instagram.com/w/256/h/256",
        fallbackIcon: "fa-brands fa-instagram"
    },

    {
        name: "Telegram",
        key: "Telegram",
        description: "Numbers compatible with Telegram",
        logo: "https://cdn.brandfetch.io/telegram.org/w/256/h/256",
        fallbackIcon: "fa-brands fa-telegram"
    },

    {
        name: "Snapchat",
        key: "Snapchat",
        description: "Numbers compatible with Snapchat",
        logo: "https://cdn.brandfetch.io/snapchat.com/w/256/h/256",
        fallbackIcon: "fa-brands fa-snapchat"
    },

    {
        name: "Google Voice",
        key: "Google Voice",
        description: "Numbers compatible with Google Voice",
        logo: "https://cdn.brandfetch.io/voice.google.com/w/256/h/256",
        fallbackIcon: "fa-solid fa-phone"
    },

    {
        name: "TextPlus",
        key: "TextPlus",
        description: "Virtual numbers for TextPlus",
        logo: "https://cdn.brandfetch.io/textplus.com/w/256/h/256",
        fallbackIcon: "fa-solid fa-comment"
    },

    {
        name: "TextNow",
        key: "TextNow",
        description: "Virtual numbers for TextNow",
        logo: "https://cdn.brandfetch.io/textnow.com/w/256/h/256",
        fallbackIcon: "fa-solid fa-comment-dots"
    },

    {
        name: "TextFree",
        key: "TextFree",
        description: "Virtual numbers for TextFree",
        logo: "https://cdn.brandfetch.io/textfree.us/w/256/h/256",
        fallbackIcon: "fa-solid fa-message"
    },

    {
        name: "Hushed",
        key: "Hushed",
        description: "Private numbers for Hushed",
        logo: "https://cdn.brandfetch.io/hushed.com/w/256/h/256",
        fallbackIcon: "fa-solid fa-phone"
    },

    {
        name: "Burner",
        key: "Burner",
        description: "Temporary numbers for Burner",
        logo: "https://cdn.brandfetch.io/burnerapp.com/w/256/h/256",
        fallbackIcon: "fa-solid fa-fire"
    },

    {
        name: "2ndLine",
        key: "2ndLine",
        description: "Second numbers for 2ndLine",
        logo: "https://cdn.brandfetch.io/2ndline.co/w/256/h/256",
        fallbackIcon: "fa-solid fa-phone-volume"
    },

    {
        name: "FreeTone",
        key: "FreeTone",
        description: "Virtual numbers for FreeTone",
        logo: "https://cdn.brandfetch.io/freetone.com/w/256/h/256",
        fallbackIcon: "fa-solid fa-phone"
    },

    {
        name: "CoverMe",
        key: "CoverMe",
        description: "Private numbers for CoverMe",
        logo: "https://cdn.brandfetch.io/coverme.com/w/256/h/256",
        fallbackIcon: "fa-solid fa-shield-halved"
    },

    {
        name: "Numero",
        key: "Numero",
        description: "Virtual numbers from Numero",
        logo: "https://cdn.brandfetch.io/numeroesim.com/w/256/h/256",
        fallbackIcon: "fa-solid fa-hashtag"
    },

    {
        name: "MySudo",
        key: "MySudo",
        description: "Private numbers for MySudo",
        logo: "https://cdn.brandfetch.io/mysudo.com/w/256/h/256",
        fallbackIcon: "fa-solid fa-user-shield"
    },

    {
        name: "Twitter",
        key: "Twitter",
        description: "Numbers compatible with Twitter / X",
        logo: "https://cdn.brandfetch.io/x.com/w/256/h/256",
        fallbackIcon: "fa-brands fa-x-twitter"
    },

    {
        name: "Other",
        key: "Other",
        description: "Browse other available services",
        logo: null,
        fallbackIcon: "fa-solid fa-layer-group"
    }
];


/* =========================================================
   DOM
========================================================= */

const serviceGrid = document.getElementById("serviceGrid");
const serviceCount = document.getElementById("serviceCount");


/* =========================================================
   HELPERS
========================================================= */

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function createServiceURL(serviceKey) {
    return `number-selection.html?service=${encodeURIComponent(serviceKey)}`;
}


/* =========================================================
   SERVICE CARD
========================================================= */

function createServiceCard(service) {
    const card = document.createElement("a");

    card.className = "market-service-card";

    card.href = createServiceURL(service.key);

    card.setAttribute(
        "aria-label",
        `Choose ${service.name}`
    );


    const logoWrapper = document.createElement("span");

    logoWrapper.className = "market-service-logo";


    /*
        External brand logo.

        If the image fails to load, the fallback
        Font Awesome icon is automatically displayed.
    */

    if (service.logo) {

        const image = document.createElement("img");

        image.src = service.logo;

        image.alt = "";

        image.loading = "lazy";

        image.decoding = "async";


        image.addEventListener(
            "error",
            () => {
                logoWrapper.classList.add("logo-failed");
            },
            { once: true }
        );


        logoWrapper.appendChild(image);

    }


    const fallback = document.createElement("span");

    fallback.className = "logo-fallback";

    fallback.innerHTML = `
        <i class="${escapeHTML(service.fallbackIcon)}"
           aria-hidden="true"></i>
    `;

    logoWrapper.appendChild(fallback);


    /* -------------------------------------------------------
       SERVICE INFO
    ------------------------------------------------------- */

    const info = document.createElement("span");

    info.className = "market-service-info";

    info.innerHTML = `
        <strong class="service-card-name">
            ${escapeHTML(service.name)}
        </strong>

        <span class="service-card-description">
            ${escapeHTML(service.description)}
        </span>
    `;


    /* -------------------------------------------------------
       ACTION
    ------------------------------------------------------- */

    const action = document.createElement("span");

    action.className = "market-service-action";

    action.setAttribute(
        "aria-hidden",
        "true"
    );

    action.innerHTML = `
        <i class="fa-solid fa-chevron-right"></i>
    `;


    card.append(
        logoWrapper,
        info,
        action
    );


    return card;
}


/* =========================================================
   RENDER SERVICES
========================================================= */

function renderServices() {

    if (!serviceGrid) {
        return;
    }


    serviceGrid.innerHTML = "";


    if (!SERVICE_DEFINITIONS.length) {

        serviceGrid.innerHTML = `
            <div class="services-empty">

                <div class="services-empty-icon">
                    <i class="fa-solid fa-layer-group"
                       aria-hidden="true"></i>
                </div>

                <h3>
                    No services available
                </h3>

                <p>
                    There are currently no services available.
                    Please check again later.
                </p>

            </div>
        `;

        if (serviceCount) {
            serviceCount.textContent = "0";
        }

        return;
    }


    const fragment = document.createDocumentFragment();


    SERVICE_DEFINITIONS.forEach(
        (service) => {
            fragment.appendChild(
                createServiceCard(service)
            );
        }
    );


    serviceGrid.appendChild(fragment);


    if (serviceCount) {
        serviceCount.textContent =
            SERVICE_DEFINITIONS.length;
    }
}


/* =========================================================
   INITIALIZE
========================================================= */

function initializeBuyNumberPage() {
    renderServices();
}


initializeBuyNumberPage();
