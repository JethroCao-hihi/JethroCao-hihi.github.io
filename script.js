// Certificate data
const certificates = {
    cert1: {
        title: "Hoàn thành khóa học HB Academy",
        issuer: "HB Academy",
        date: "2024",
        description: "Chứng nhận hoàn thành chương trình đào tạo lập trình cơ bản tại HB Academy. Khóa học bao gồm các kiến thức nền tảng về lập trình, thuật toán và cấu trúc dữ liệu.",
        skills: ["Lập trình cơ bản", "Thuật toán", "Cấu trúc dữ liệu", "Problem Solving"],
        image: "fas fa-award"
    },
    cert2: {
        title: "Unity Certified User",
        issuer: "Unity Technologies",
        date: "2025 (Dự kiến)",
        description: "Chứng nhận kỹ năng sử dụng Unity Engine cho phát triển game. Đang trong quá trình học và chuẩn bị thi để đạt được chứng chỉ này.",
        skills: ["Unity Engine", "Game Development", "C# for Unity", "3D/2D Games"],
        image: "fab fa-unity"
    },
    cert3: {
        title: "C# Programming Certificate",
        issuer: "Microsoft Learning",
        date: "2025 (Dự kiến)",
        description: "Chứng nhận lập trình C# nâng cao. Đang học để nắm vững các concepts nâng cao của C# và .NET framework.",
        skills: ["C# Advanced", ".NET Framework", "Object-Oriented Programming", "Design Patterns"],
        image: "fas fa-code"
    }
};

// DOM Elements
document.addEventListener('DOMContentLoaded', function () {
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const skillCards = document.querySelectorAll('.skill-card');

    // Mobile menu toggle
    mobileMenu.addEventListener('click', function () {
        mobileMenu.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            mobileMenu.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar background on scroll
    window.addEventListener('scroll', function () {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(243, 156, 18, 0.3)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 20px rgba(255, 193, 7, 0.2)';
        }
    });

    // Active navigation link highlighting
    window.addEventListener('scroll', function () {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-link');

        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });

    // Scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');

                // Animate progress bars when skill cards come into view
                if (entry.target.classList.contains('skill-card')) {
                    const progressBar = entry.target.querySelector('.progress-bar');
                    const progress = progressBar.getAttribute('data-progress');
                    progressBar.style.setProperty('--progress', progress + '%');
                    progressBar.style.width = progress + '%';
                }
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.skill-card, .certificate-card, .stat, .contact-form');
    animateElements.forEach(el => {
        observer.observe(el);
    });

    // Typing effect for hero title
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.innerHTML;
        const highlightText = heroTitle.querySelector('.highlight').textContent;
        const beforeHighlight = originalText.split('<span class="highlight">')[0];
        const afterHighlight = originalText.split('</span>')[1] || '';

        heroTitle.innerHTML = beforeHighlight;

        let i = 0;
        const typeWriter = () => {
            if (i < highlightText.length) {
                if (i === 0) {
                    heroTitle.innerHTML = beforeHighlight + '<span class="highlight">';
                }
                heroTitle.innerHTML += highlightText.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            } else {
                heroTitle.innerHTML += '</span>' + afterHighlight;
            }
        };

        setTimeout(() => {
            heroTitle.innerHTML = beforeHighlight;
            typeWriter();
        }, 1000);
    }

    // Contact form handling
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');

            // Simple form validation
            if (!name || !email || !message) {
                showNotification('Vui lòng điền đầy đủ thông tin!', 'error');
                return;
            }

            if (!isValidEmail(email)) {
                showNotification('Vui lòng nhập email hợp lệ!', 'error');
                return;
            }

            // Simulate form submission
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Đang gửi...';
            submitBtn.disabled = true;

            setTimeout(() => {
                showNotification('Cảm ơn bạn! Tin nhắn đã được gửi thành công.', 'success');
                this.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 2000);
        });
    }

    // Skill progress animation
    function animateSkillProgress() {
        skillCards.forEach((card, index) => {
            const progressBar = card.querySelector('.progress-bar');
            const progress = progressBar.getAttribute('data-progress');

            setTimeout(() => {
                progressBar.style.width = progress + '%';
            }, index * 200);
        });
    }

    // Initialize skill progress animation when section is visible
    const skillsSection = document.querySelector('.skills');
    if (skillsSection) {
        const skillsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateSkillProgress();
                    skillsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        skillsObserver.observe(skillsSection);
    }

    // Parallax effect for hero section
    window.addEventListener('scroll', function () {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero && scrolled < window.innerHeight) {
            const rate = scrolled * -0.3;
            hero.style.transform = `translateY(${rate}px)`;
        }
    });

    // Certificate cards hover effects
    const certificateCards = document.querySelectorAll('.certificate-card');
    certificateCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Smooth reveal animations
    function revealElements() {
        const reveals = document.querySelectorAll('.skill-card, .certificate-card, .stat');

        reveals.forEach(element => {
            const windowHeight = window.innerHeight;
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;

            if (elementTop < windowHeight - elementVisible) {
                element.classList.add('animate');
            }
        });
    }

    window.addEventListener('scroll', revealElements);

    // Initialize animations
    revealElements();

    console.log('Game Developer Portfolio loaded successfully! 🎮');
});

// Certificate Modal Functions
function openCertificateModal(certId) {
    const modal = document.getElementById('certificateModal');
    const modalContent = document.getElementById('modalContent');
    const cert = certificates[certId];

    if (cert) {
        modalContent.innerHTML = `
            <div class="certificate-modal-content">
                <div class="modal-header">
                    <div class="modal-icon">
                        <i class="${cert.image}"></i>
                    </div>
                    <h2>${cert.title}</h2>
                    <p class="modal-issuer">${cert.issuer}</p>
                    <span class="modal-date">${cert.date}</span>
                </div>
                <div class="modal-body">
                    <p class="modal-description">${cert.description}</p>
                    <div class="modal-skills">
                        <h4>Kỹ năng đạt được:</h4>
                        <div class="skills-tags">
                            ${cert.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .certificate-modal-content {
                text-align: center;
            }
            .modal-header {
                border-bottom: 2px solid #f39c12;
                padding-bottom: 1rem;
                margin-bottom: 1.5rem;
            }
            .modal-icon {
                width: 80px;
                height: 80px;
                background: linear-gradient(45deg, #f39c12, #e67e22);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 1rem;
            }
            .modal-icon i {
                font-size: 2rem;
                color: white;
            }
            .modal-header h2 {
                color: #333;
                margin-bottom: 0.5rem;
            }
            .modal-issuer {
                color: #f39c12;
                font-weight: 600;
                font-size: 1.1rem;
            }
            .modal-date {
                background: linear-gradient(45deg, #f39c12, #e67e22);
                color: white;
                padding: 0.25rem 1rem;
                border-radius: 20px;
                font-size: 0.9rem;
                font-weight: 600;
                display: inline-block;
                margin-top: 0.5rem;
            }
            .modal-description {
                text-align: left;
                line-height: 1.6;
                color: #666;
                margin-bottom: 1.5rem;
            }
            .modal-skills h4 {
                color: #333;
                margin-bottom: 1rem;
                text-align: left;
            }
            .skills-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
            }
            .skill-tag {
                background: linear-gradient(45deg, #f39c12, #e67e22);
                color: white;
                padding: 0.25rem 0.75rem;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: 500;
            }
        `;
        document.head.appendChild(style);

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeCertificateModal() {
    const modal = document.getElementById('certificateModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
window.addEventListener('click', function (event) {
    const modal = document.getElementById('certificateModal');
    if (event.target === modal) {
        closeCertificateModal();
    }
});

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type) {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(45deg, #27ae60, #2ecc71)' : 'linear-gradient(45deg, #e74c3c, #c0392b)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;

    notification.querySelector('.notification-content').style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.5rem;
    `;

    notification.querySelector('.notification-close').style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        margin-left: auto;
        padding: 0 0.5rem;
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);

    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    });
}

// Easter egg - Konami code
let konamiCode = [];
const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

document.addEventListener('keydown', function (e) {
    konamiCode.push(e.keyCode);

    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }

    if (konamiCode.length === konamiSequence.length) {
        let match = true;
        for (let i = 0; i < konamiSequence.length; i++) {
            if (konamiCode[i] !== konamiSequence[i]) {
                match = false;
                break;
            }
        }

        if (match) {
            showNotification('🎮 Konami Code activated! Welcome to the secret game developer mode!', 'success');
            document.body.style.filter = 'hue-rotate(180deg)';
            setTimeout(() => {
                document.body.style.filter = 'none';
            }, 3000);
            konamiCode = [];
        }
    }
});

// Performance optimization - lazy loading
const lazyImages = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
        }
    });
});

lazyImages.forEach(img => imageObserver.observe(img));

// Add some game-related animations
function addGameEffects() {
    // Floating particles effect
    const heroSection = document.querySelector('.hero');

    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            animation: float${i} ${3 + Math.random() * 4}s linear infinite;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            z-index: 0;
        `;

        const keyframes = `
            @keyframes float${i} {
                0% { transform: translateY(0) rotate(0deg); opacity: 0; }
                50% { opacity: 1; }
                100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
            }
        `;

        const style = document.createElement('style');
        style.textContent = keyframes;
        document.head.appendChild(style);

        if (heroSection) {
            heroSection.appendChild(particle);
        }
    }
}

// Initialize game effects
setTimeout(addGameEffects, 1000);
