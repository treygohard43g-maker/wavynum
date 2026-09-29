/* =========================================================
   WAVYNUM — GLOBAL JAVASCRIPT
   Landing page interactions
========================================================= */

"use strict";


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initMobileMenu();
    initSmoothScrolling();
    initFaq();
    initHeaderState();
    initScrollReveal();
    initButtonFeedback();

});


/* =========================================================
   MOBILE NAVIGATION
========================================================= */

function initMobileMenu() {

    const menuButton = document.getElementById("mobileMenuButton");
    const mobileMenu = document.getElementById("mobileMenu");

    if (!menuButton || !mobileMenu) {
        return;
    }


    const menuLinks = mobileMenu.querySelectorAll("a");


    function openMenu() {

        mobileMenu.classList.add("is-open");

        menuButton.setAttribute("aria-expanded", "true");
        menuButton.setAttribute("aria-label", "Close navigation menu");

        const icon = menuButton.querySelector("i");

        if (icon) {
            icon.classList.remove("fa-bars");
            icon.classList.add("fa-xmark");
        }

        document.body.classList.add("menu-open");
    }


    function closeMenu() {

        mobileMenu.classList.remove("is-open");

        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation menu");

        const icon = menuButton.querySelector("i");

        if (icon) {
            icon.classList.remove("fa-xmark");
            icon.classList.add("fa-bars");
        }

        document.body.classList.remove("menu-open");
    }


    menuButton.addEventListener("click", () => {

        const isOpen =
            mobileMenu.classList.contains("is-open");

        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }

    });


    menuLinks.forEach(link => {

        link.addEventListener("click", () => {
            closeMenu();
        });

    });


    document.addEventListener("click", event => {

        const clickedInsideMenu =
            mobileMenu.contains(event.target);

        const clickedButton =
            menuButton.contains(event.target);

        if (
            mobileMenu.classList.contains("is-open") &&
            !clickedInsideMenu &&
            !clickedButton
        ) {
            closeMenu();
        }

    });


    document.addEventListener("keydown", event => {

        if (
            event.key === "Escape" &&
            mobileMenu.classList.contains("is-open")
        ) {
            closeMenu();
            menuButton.focus();
        }

    });


    window.addEventListener("resize", () => {

        if (window.innerWidth > 768) {
            closeMenu();
        }

    });

}


/* =========================================================
   SMOOTH SCROLLING
========================================================= */

function initSmoothScrolling() {

    const links =
        document.querySelectorAll('a[href^="#"]');


    links.forEach(link => {

        link.addEventListener("click", event => {

            const targetId =
                link.getAttribute("href");

            if (
                !targetId ||
                targetId === "#"
            ) {
                return;
            }


            const target =
                document.querySelector(targetId);

            if (!target) {
                return;
            }


            event.preventDefault();


            const header =
                document.querySelector(".site-header");


            const headerHeight =
                header ? header.offsetHeight : 0;


            const targetPosition =
                target.getBoundingClientRect().top +
                window.scrollY -
                headerHeight -
                20;


            window.scrollTo({
                top: targetPosition,
                behavior: getScrollBehavior()
            });

        });

    });

}


/* =========================================================
   SCROLL BEHAVIOR
   Respects reduced-motion preference
========================================================= */

function getScrollBehavior() {

    const prefersReducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

    return prefersReducedMotion
        ? "auto"
        : "smooth";

}


/* =========================================================
   FAQ ACCORDION
========================================================= */

function initFaq() {

    const faqItems =
        document.querySelectorAll(".faq-item");


    if (!faqItems.length) {
        return;
    }


    faqItems.forEach(item => {

        item.addEventListener("toggle", () => {

            if (!item.open) {
                return;
            }


            faqItems.forEach(otherItem => {

                if (
                    otherItem !== item &&
                    otherItem.open
                ) {
                    otherItem.removeAttribute("open");
                }

            });

        });

    });

}


/* =========================================================
   HEADER SCROLL STATE
========================================================= */

function initHeaderState() {

    const header =
        document.querySelector(".site-header");


    if (!header) {
        return;
    }


    function updateHeader() {

        if (window.scrollY > 20) {

            header.classList.add("is-scrolled");

        } else {

            header.classList.remove("is-scrolled");

        }

    }


    updateHeader();


    window.addEventListener(
        "scroll",
        updateHeader,
        { passive: true }
    );

}


/* =========================================================
   SCROLL REVEAL
========================================================= */

function initScrollReveal() {

    const revealElements =
        document.querySelectorAll(
            ".service-card, " +
            ".step-card, " +
            ".pricing-card, " +
            ".faq-item, " +
            ".final-cta"
        );


    if (!revealElements.length) {
        return;
    }


    const reducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;


    if (reducedMotion) {

        revealElements.forEach(element => {
            element.classList.add("is-visible");
        });

        return;
    }


    if (!("IntersectionObserver" in window)) {

        revealElements.forEach(element => {
            element.classList.add("is-visible");
        });

        return;
    }


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) {
                        return;
                    }


                    entry.target.classList.add(
                        "is-visible"
                    );


                    observer.unobserve(
                        entry.target
                    );

                });

            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -40px 0px"
            }
        );


    revealElements.forEach(element => {
        observer.observe(element);
    });

}


/* =========================================================
   BUTTON / LINK FEEDBACK
========================================================= */

function initButtonFeedback() {

    const buttons =
        document.querySelectorAll(
            ".button, .nav-cta, .mobile-menu-cta"
        );


    buttons.forEach(button => {

        button.addEventListener("click", () => {

            button.classList.add("is-clicked");

            window.setTimeout(() => {

                button.classList.remove(
                    "is-clicked"
                );

            }, 180);

        });

    });

}


/* =========================================================
   ACTIVE SECTION TRACKING
========================================================= */

function initActiveSectionTracking() {

    const sections =
        document.querySelectorAll(
            "main section[id]"
        );


    const navigationLinks =
        document.querySelectorAll(
            '.desktop-nav a[href^="#"], ' +
            '.mobile-menu a[href^="#"]'
        );


    if (
        !sections.length ||
        !navigationLinks.length
    ) {
        return;
    }


    if (!("IntersectionObserver" in window)) {
        return;
    }


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) {
                        return;
                    }


                    const sectionId =
                        entry.target.id;


                    navigationLinks.forEach(link => {

                        const targetId =
                            link
                                .getAttribute("href")
                                ?.replace("#", "");


                        link.classList.toggle(
                            "is-active",
                            targetId === sectionId
                        );

                    });

                });

            },
            {
                rootMargin: "-35% 0px -55% 0px",
                threshold: 0
            }
        );


    sections.forEach(section => {
        observer.observe(section);
    });

}


/* =========================================================
   INITIALIZE ACTIVE NAVIGATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initActiveSectionTracking
);


/* =========================================================
   EXTERNAL / PLACEHOLDER LINKS
========================================================= */

document.addEventListener("click", event => {

    const link =
        event.target.closest(
            'a[href="#"]'
        );


    if (!link) {
        return;
    }


    /*
       Placeholder links currently use "#".
       Prevent the browser from jumping to the top.
    */

    event.preventDefault();

});
