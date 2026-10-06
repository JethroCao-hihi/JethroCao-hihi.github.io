document.addEventListener("DOMContentLoaded", () => {
    /* ================================
       MOBILE NAVIGATION
    ================================= */

    const mobileMenu = document.getElementById("mobile-menu");
    const navMenu = document.getElementById("nav-menu");
    const navLinks = document.querySelectorAll(".nav-link");

    if (mobileMenu && navMenu) {
        mobileMenu.addEventListener("click", () => {
            mobileMenu.classList.toggle("active");
            navMenu.classList.toggle("active");
        });

        navLinks.forEach((link) => {
            link.addEventListener("click", () => {
                mobileMenu.classList.remove("active");
                navMenu.classList.remove("active");
            });
        });
    }


    /* ================================
       SMOOTH SCROLL
    ================================= */

    navLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetId = link.getAttribute("href");

            if (!targetId || !targetId.startsWith("#")) {
                return;
            }

            const target = document.querySelector(targetId);

            if (!target) {
                return;
            }

            event.preventDefault();

            const offset = 80;

            window.scrollTo({
                top: target.offsetTop - offset,
                behavior: "smooth"
            });
        });
    });


    /* ================================
       NAVBAR SCROLL EFFECT
    ================================= */

    const navbar = document.querySelector(".navbar");

    function updateNavbar() {
        if (!navbar) return;

        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    }

    window.addEventListener("scroll", updateNavbar);
    updateNavbar();


    /* ================================
       ACTIVE NAVIGATION
    ================================= */

    const sections = document.querySelectorAll("section[id]");

    function updateActiveNavigation() {
        let currentSection = "";

        sections.forEach((section) => {
            const sectionTop = section.offsetTop - 150;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (
                window.scrollY >= sectionTop &&
                window.scrollY < sectionBottom
            ) {
                currentSection = section.id;
            }
        });

        navLinks.forEach((link) => {
            link.classList.remove("active");

            if (link.getAttribute("href") === `#${currentSection}`) {
                link.classList.add("active");
            }
        });
    }

    window.addEventListener("scroll", updateActiveNavigation);
    updateActiveNavigation();


    /* ================================
       SCROLL REVEAL ANIMATION
    ================================= */

    const animatedElements = document.querySelectorAll(
        ".project-card, " +
        ".skill-card, " +
        ".certificate-card, " +
        ".stat, " +
        ".game-design-card, " +
        ".about-content, " +
        ".contact-form"
    );

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("animate");
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.1,
            rootMargin: "0px 0px -60px 0px"
        }
    );

    animatedElements.forEach((element) => {
        observer.observe(element);
    });


    /* ================================
       HERO TYPING EFFECT
    ================================= */

    const heroTitle = document.querySelector(".hero-title");

    if (heroTitle) {
        const highlight = heroTitle.querySelector(".highlight");

        if (highlight) {
            const originalText = highlight.textContent;

            highlight.textContent = "";

            let index = 0;

            function typeWriter() {
                if (index < originalText.length) {
                    highlight.textContent += originalText.charAt(index);
                    index++;

                    setTimeout(typeWriter, 80);
                }
            }

            setTimeout(typeWriter, 500);
        }
    }


    /* ================================
       CONTACT FORM
    ================================= */

    const contactForm = document.querySelector(".contact-form");

    if (contactForm) {
        contactForm.addEventListener("submit", (event) => {
            const name = contactForm.querySelector("#name");
            const email = contactForm.querySelector("#email");
            const message = contactForm.querySelector("#message");

            if (!name || !email || !message) {
                return;
            }

            if (!name.value.trim()) {
                event.preventDefault();
                showNotification(
                    "Vui lòng nhập tên của bạn.",
                    "error"
                );
                name.focus();
                return;
            }

            if (!isValidEmail(email.value.trim())) {
                event.preventDefault();
                showNotification(
                    "Vui lòng nhập email hợp lệ.",
                    "error"
                );
                email.focus();
                return;
            }

            if (!message.value.trim()) {
                event.preventDefault();
                showNotification(
                    "Vui lòng nhập nội dung tin nhắn.",
                    "error"
                );
                message.focus();
                return;
            }

            const submitButton =
                contactForm.querySelector('button[type="submit"]');

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Đang gửi...";
            }
        });
    }


    /* ================================
       PROJECT CARD HOVER
    ================================= */

    const projectCards = document.querySelectorAll(".project-card");

    projectCards.forEach((card) => {
        card.addEventListener("mouseenter", () => {
            card.classList.add("hovered");
        });

        card.addEventListener("mouseleave", () => {
            card.classList.remove("hovered");
        });
    });


    /* ================================
       CERTIFICATE CARD HOVER
    ================================= */

    const certificateCards =
        document.querySelectorAll(".certificate-card");

    certificateCards.forEach((card) => {
        card.addEventListener("mouseenter", () => {
            card.classList.add("hovered");
        });

        card.addEventListener("mouseleave", () => {
            card.classList.remove("hovered");
        });
    });


    /* ================================
       HERO PARTICLES
    ================================= */

    createHeroParticles();


    /* ================================
       KONAMI CODE
    ================================= */

    initializeKonamiCode();


    console.log(
        "🎮 Jethro Cao - Game Developer Portfolio loaded successfully!"
    );
});


/* ====================================
   CERTIFICATE DATA
==================================== */

const certificates = {
    cert1: {
        title: "Hoàn thành khóa học HB Academy",
        issuer: "HB Academy",
        date: "2024",
        description:
            "Hoàn thành chương trình đào tạo lập trình cơ bản tại HB Academy, tập trung vào nền tảng lập trình, thuật toán và tư duy giải quyết vấn đề.",
        skills: [
            "Lập trình cơ bản",
            "Thuật toán",
            "Cấu trúc dữ liệu",
            "Problem Solving"
        ],
        icon: "fas fa-award"
    }
};


/* ====================================
   CERTIFICATE MODAL
==================================== */

function openCertificateModal(certId) {
    const modal = document.getElementById("certificateModal");
    const modalContent = document.getElementById("modalContent");

    if (!modal || !modalContent) {
        return;
    }

    const certificate = certificates[certId];

    if (!certificate) {
        return;
    }

    modalContent.innerHTML = `
        <div class="certificate-modal-content">

            <div class="modal-header">

                <div class="modal-icon">
                    <i class="${certificate.icon}"></i>
                </div>

                <h2>${certificate.title}</h2>

                <p class="modal-issuer">
                    ${certificate.issuer}
                </p>

                <span class="modal-date">
                    ${certificate.date}
                </span>

            </div>

            <div class="modal-body">

                <p class="modal-description">
                    ${certificate.description}
                </p>

                <div class="modal-skills">

                    <h4>Kỹ năng / Nội dung:</h4>

                    <div class="skills-tags">
                        ${certificate.skills
                            .map(
                                (skill) =>
                                    `<span class="skill-tag">${skill}</span>`
                            )
                            .join("")}
                    </div>

                </div>

            </div>

        </div>
    `;

    modal.classList.add("active");
    modal.style.display = "block";

    document.body.style.overflow = "hidden";
}


function closeCertificateModal() {
    const modal = document.getElementById("certificateModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("active");
    modal.style.display = "none";

    document.body.style.overflow = "";
}


/* ====================================
   CLOSE MODAL
==================================== */

window.addEventListener("click", (event) => {
    const modal = document.getElementById("certificateModal");

    if (event.target === modal) {
        closeCertificateModal();
    }
});


document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeCertificateModal();
    }
});


/* ====================================
   EMAIL VALIDATION
==================================== */

function isValidEmail(email) {
    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email);
}


/* ====================================
   NOTIFICATION
==================================== */

function showNotification(message, type = "success") {

    const existing =
        document.querySelector(".notification");

    if (existing) {
        existing.remove();
    }

    const notification =
        document.createElement("div");

    notification.className =
        `notification ${type}`;

    notification.innerHTML = `
        <div class="notification-content">

            <i class="fas ${
                type === "success"
                    ? "fa-check-circle"
                    : "fa-exclamation-circle"
            }"></i>

            <span>${message}</span>

            <button
                class="notification-close"
                aria-label="Đóng thông báo"
            >
                &times;
            </button>

        </div>
    `;

    document.body.appendChild(notification);

    requestAnimationFrame(() => {
        notification.classList.add("show");
    });

    const closeButton =
        notification.querySelector(
            ".notification-close"
        );

    if (closeButton) {
        closeButton.addEventListener(
            "click",
            () => removeNotification(notification)
        );
    }

    setTimeout(() => {
        removeNotification(notification);
    }, 5000);
}


function removeNotification(notification) {

    if (!notification) {
        return;
    }

    notification.classList.remove("show");

    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 300);
}


/* ====================================
   HERO PARTICLES
==================================== */

function createHeroParticles() {

    const hero =
        document.querySelector(".hero");

    if (!hero) {
        return;
    }

    const particleContainer =
        document.createElement("div");

    particleContainer.className =
        "hero-particles";

    particleContainer.setAttribute(
        "aria-hidden",
        "true"
    );

    for (let i = 0; i < 20; i++) {

        const particle =
            document.createElement("span");

        particle.className =
            "hero-particle";

        particle.style.left =
            `${Math.random() * 100}%`;

        particle.style.top =
            `${Math.random() * 100}%`;

        particle.style.animationDelay =
            `${Math.random() * 5}s`;

        particle.style.animationDuration =
            `${3 + Math.random() * 4}s`;

        particleContainer.appendChild(
            particle
        );
    }

    hero.appendChild(
        particleContainer
    );
}


/* ====================================
   KONAMI CODE
==================================== */

function initializeKonamiCode() {

    const konamiSequence = [
        "ArrowUp",
        "ArrowUp",
        "ArrowDown",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "ArrowLeft",
        "ArrowRight",
        "b",
        "a"
    ];

    let inputSequence = [];

    document.addEventListener(
        "keydown",
        (event) => {

            inputSequence.push(
                event.key
            );

            if (
                inputSequence.length >
                konamiSequence.length
            ) {
                inputSequence.shift();
            }

            const activated =
                inputSequence.length ===
                    konamiSequence.length &&
                inputSequence.every(
                    (key, index) =>
                        key.toLowerCase() ===
                        konamiSequence[index].toLowerCase()
                );

            if (activated) {

                showNotification(
                    "🎮 Secret Developer Mode Activated!",
                    "success"
                );

                document.body.classList.add(
                    "developer-mode"
                );

                setTimeout(() => {

                    document.body.classList.remove(
                        "developer-mode"
                    );

                }, 3000);

                inputSequence = [];
            }
        }
    );
}


/* ====================================
   IMAGE LAZY LOADING
==================================== */

const lazyImages =
    document.querySelectorAll(
        "img[data-src]"
    );

if ("IntersectionObserver" in window) {

    const imageObserver =
        new IntersectionObserver(
            (entries, observer) => {

                entries.forEach((entry) => {

                    if (
                        !entry.isIntersecting
                    ) {
                        return;
                    }

                    const image =
                        entry.target;

                    image.src =
                        image.dataset.src;

                    image.removeAttribute(
                        "data-src"
                    );

                    image.classList.remove(
                        "lazy"
                    );

                    observer.unobserve(
                        image
                    );
                });
            }
        );

    lazyImages.forEach((image) => {
        imageObserver.observe(image);
    });

} else {

    lazyImages.forEach((image) => {

        image.src =
            image.dataset.src;

        image.removeAttribute(
            "data-src"
        );

    });
}
