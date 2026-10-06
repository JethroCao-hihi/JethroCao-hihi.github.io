/* =========================================================
   PORTFOLIO SCRIPT
   Cao Xuân Minh
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const navbar = document.getElementById("navbar");
    const navToggle = document.getElementById("navToggle");
    const navMenu = document.getElementById("navMenu");

    const navLinks = document.querySelectorAll(".nav-link");

    const sections = document.querySelectorAll("section[id]");

    const revealElements =
        document.querySelectorAll(".reveal");

    const backToTop =
        document.getElementById("backToTop");

    const currentYear =
        document.getElementById("currentYear");


    /* =====================================================
       CURRENT YEAR
    ===================================================== */

    if (currentYear) {
        currentYear.textContent =
            new Date().getFullYear();
    }


    /* =====================================================
       MOBILE NAVIGATION
    ===================================================== */

    if (navToggle && navMenu) {

        navToggle.addEventListener("click", () => {

            navToggle.classList.toggle("active");

            navMenu.classList.toggle("active");

            document.body.classList.toggle(
                "menu-open"
            );

        });


        navLinks.forEach(link => {

            link.addEventListener("click", () => {

                navToggle.classList.remove("active");

                navMenu.classList.remove("active");

                document.body.classList.remove(
                    "menu-open"
                );

            });

        });

    }


    /* =====================================================
       NAVBAR SCROLL EFFECT
    ===================================================== */

    function handleNavbar() {

        if (!navbar) return;

        if (window.scrollY > 30) {

            navbar.classList.add("scrolled");

        } else {

            navbar.classList.remove("scrolled");

        }

    }

    window.addEventListener(
        "scroll",
        handleNavbar,
        { passive: true }
    );

    handleNavbar();


    /* =====================================================
       ACTIVE NAVIGATION
    ===================================================== */

    function updateActiveNavigation() {

        const scrollPosition =
            window.scrollY + 140;

        let currentSection = "";

        sections.forEach(section => {

            const top =
                section.offsetTop;

            const height =
                section.offsetHeight;

            if (
                scrollPosition >= top &&
                scrollPosition < top + height
            ) {

                currentSection =
                    section.getAttribute("id");

            }

        });


        navLinks.forEach(link => {

            link.classList.remove("active");

            const href =
                link.getAttribute("href");

            if (
                href === `#${currentSection}`
            ) {

                link.classList.add("active");

            }

        });

    }

    window.addEventListener(
        "scroll",
        updateActiveNavigation,
        { passive: true }
    );

    updateActiveNavigation();


    /* =====================================================
       SCROLL REVEAL
    ===================================================== */

    const revealObserver =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add(
                            "visible"
                        );

                        revealObserver.unobserve(
                            entry.target
                        );

                    }

                });

            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -40px 0px"
            }
        );


    revealElements.forEach(element => {

        revealObserver.observe(element);

    });


    /* =====================================================
       BACK TO TOP
    ===================================================== */

    function handleBackToTop() {

        if (!backToTop) return;

        if (window.scrollY > 600) {

            backToTop.classList.add("visible");

        } else {

            backToTop.classList.remove("visible");

        }

    }

    window.addEventListener(
        "scroll",
        handleBackToTop,
        { passive: true }
    );


    if (backToTop) {

        backToTop.addEventListener(
            "click",
            () => {

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );

    }


    /* =====================================================
       SMOOTH INTERNAL LINKS
    ===================================================== */

    document
        .querySelectorAll('a[href^="#"]')
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    const targetId =
                        link.getAttribute("href");

                    if (
                        !targetId ||
                        targetId === "#"
                    ) {

                        return;

                    }

                    const target =
                        document.querySelector(
                            targetId
                        );

                    if (!target) return;

                    event.preventDefault();

                    const offset = 75;

                    const targetPosition =
                        target.getBoundingClientRect()
                            .top
                        + window.scrollY
                        - offset;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: "smooth"
                    });

                }
            );

        });


    /* =====================================================
       PROJECT CARD MICRO INTERACTION
    ===================================================== */

    const projectCards =
        document.querySelectorAll(
            ".project-card"
        );


    projectCards.forEach(card => {

        card.addEventListener(
            "mouseenter",
            () => {

                card.classList.add(
                    "is-hovered"
                );

            }
        );

        card.addEventListener(
            "mouseleave",
            () => {

                card.classList.remove(
                    "is-hovered"
                );

            }
        );

    });


    /* =====================================================
       DESIGN CARD MICRO INTERACTION
    ===================================================== */

    const designCards =
        document.querySelectorAll(
            ".design-card"
        );


    designCards.forEach(card => {

        card.addEventListener(
            "mouseenter",
            () => {

                card.style.setProperty(
                    "--mouse-active",
                    "1"
                );

            }
        );

        card.addEventListener(
            "mouseleave",
            () => {

                card.style.setProperty(
                    "--mouse-active",
                    "0"
                );

            }
        );

    });


    /* =====================================================
       TYPING EFFECT
       Hero eyebrow
    ===================================================== */

    const eyebrow =
        document.querySelector(
            ".hero-eyebrow"
        );


    if (
        eyebrow &&
        !window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches
    ) {

        const originalText =
            eyebrow.textContent.trim();

        eyebrow.textContent = "";

        let index = 0;

        function typeText() {

            if (index < originalText.length) {

                eyebrow.textContent +=
                    originalText.charAt(index);

                index++;

                setTimeout(
                    typeText,
                    35
                );

            }

        }

        setTimeout(
            typeText,
            400
        );

    }


    /* =====================================================
       HERO CODE CARD FLOAT
    ===================================================== */

    const codeCard =
        document.querySelector(
            ".code-card"
        );


    if (
        codeCard &&
        !window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches
    ) {

        let ticking = false;

        window.addEventListener(
            "scroll",
            () => {

                if (ticking) return;

                window.requestAnimationFrame(
                    () => {

                        const scroll =
                            window.scrollY;

                        if (scroll < 900) {

                            const movement =
                                scroll * 0.025;

                            codeCard.style.transform =
                                `perspective(1000px)
                                 rotateY(-5deg)
                                 translateY(${movement}px)`;

                        }

                        ticking = false;

                    }
                );

                ticking = true;

            },
            { passive: true }
        );

    }


    /* =====================================================
       EXTERNAL LINKS
    ===================================================== */

    document
        .querySelectorAll(
            'a[target="_blank"]'
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    link.setAttribute(
                        "rel",
                        "noopener noreferrer"
                    );

                }
            );

        });


    /* =====================================================
       KEYBOARD ACCESSIBILITY
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                navMenu &&
                navMenu.classList.contains(
                    "active"
                )
            ) {

                navToggle.classList.remove(
                    "active"
                );

                navMenu.classList.remove(
                    "active"
                );

                document.body.classList.remove(
                    "menu-open"
                );

            }

        }
    );


    /* =====================================================
       EASTER EGG
       ↑ ↑ ↓ ↓ ← → ← →
    ===================================================== */

    const konamiCode = [
        "ArrowUp",
        "ArrowUp",
        "ArrowDown",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "ArrowLeft",
        "ArrowRight"
    ];

    let konamiIndex = 0;

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                konamiCode[konamiIndex]
            ) {

                konamiIndex++;

                if (
                    konamiIndex ===
                    konamiCode.length
                ) {

                    activateEasterEgg();

                    konamiIndex = 0;

                }

            } else {

                konamiIndex = 0;

            }

        }
    );


    function activateEasterEgg() {

        document.body.animate(
            [
                {
                    filter: "hue-rotate(0deg)"
                },
                {
                    filter: "hue-rotate(180deg)"
                },
                {
                    filter: "hue-rotate(360deg)"
                }
            ],
            {
                duration: 900
            }
        );

    }


    /* =====================================================
       CONSOLE MESSAGE
    ===================================================== */

    console.log(
        "%c🎮 Cao Xuân Minh — Game Developer Portfolio",
        "font-size: 18px; font-weight: bold;"
    );

    console.log(
        "%cBuilt with HTML, CSS & JavaScript.",
        "color: #9d86ff;"
    );

});
