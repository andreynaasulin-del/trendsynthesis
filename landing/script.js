/* ============================================
   TRENDSYNTHESIS — JavaScript
   Micro-interactions & Smooth UX
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initSmoothScroll();
    initParallaxCells();
    initIntersectionObserver();
    initDemoInteraction();
    initModal();
    initMagneticButtons();
});

/**
 * Navbar scroll behavior
 */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateNavbar() {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 100) {
            navbar.style.background = 'rgba(5, 5, 5, 0.95)';
            navbar.style.backdropFilter = 'blur(12px)';
            navbar.style.borderBottom = '1px solid rgba(255, 255, 255, 0.06)';
        } else {
            navbar.style.background = 'linear-gradient(to bottom, rgba(5, 5, 5, 1) 0%, transparent 100%)';
            navbar.style.backdropFilter = 'none';
            navbar.style.borderBottom = 'none';
        }

        lastScrollY = currentScrollY;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    }, { passive: true });
}

// ... existing code ...

/* ============================================
   DEMO INTERACTION LOGIC (Luxe Edition)
   ============================================ */
function initDemoInteraction() {
    const btn = document.getElementById('demo-generate-btn');
    const input = document.getElementById('demo-topic-input');
    const statusBoard = document.getElementById('demo-status');
    const resultsContainer = document.getElementById('demo-results');
    const finalCta = document.getElementById('demo-final-action'); // The +27 Tile
    const finalBtnContainer = document.getElementById('demo-final-btn-container'); // The button wrapper

    const fillParsing = document.getElementById('fill-parsing');
    const fillSynthesis = document.getElementById('fill-synthesis');
    const valParsing = document.getElementById('val-parsing');
    const valSynthesis = document.getElementById('val-synthesis');

    if (!btn || !statusBoard) return;

    btn.addEventListener('click', () => {
        // Detect Language
        const isRu = document.querySelector('.lang-opt[data-lang="ru"]').classList.contains('active');

        // UI Lock
        btn.disabled = true;
        input.disabled = true;
        btn.style.opacity = '0.5';
        btn.textContent = isRu ? 'ОБРАБОТКА...' : 'PROCESSING...';

        // Show Status
        statusBoard.classList.remove('hidden');
        resultsContainer.classList.add('hidden');
        if (finalCta) finalCta.classList.add('hidden');
        if (finalBtnContainer) finalBtnContainer.classList.add('hidden');

        // Reset Bars
        fillParsing.style.width = '0%';
        fillSynthesis.style.width = '0%';
        valParsing.textContent = '0%';
        valSynthesis.textContent = '0%';

        // Phase 1: Neural Parsing
        animateValue(valParsing, 0, 100, 2000);
        animateProgressBar(fillParsing, 100, 2000, () => {
            // Phase 2: Visual Synthesis
            animateValue(valSynthesis, 0, 100, 2500);
            animateProgressBar(fillSynthesis, 100, 2500, () => {
                // Done
                setTimeout(() => {
                    const doneText = isRu ? 'ГОТОВО' : 'DONE';

                    statusBoard.classList.add('hidden');
                    resultsContainer.classList.remove('hidden');
                    if (finalCta) finalCta.classList.remove('hidden');
                    if (finalBtnContainer) finalBtnContainer.classList.remove('hidden');

                    btn.innerHTML = `<span style="color:#000">✓</span> ${doneText}`;
                    btn.style.background = '#fff';
                    btn.style.color = '#000';
                    /* ... */

                    // Animate Results Appearance
                    const tiles = document.querySelectorAll('.result-tile');
                    tiles.forEach((tile, index) => {
                        tile.style.opacity = '0';
                        tile.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            tile.style.transition = 'all 0.5s ease';
                            tile.style.opacity = '1';
                            tile.style.transform = 'translateY(0)';
                            // Simulate "Video Generated" content
                            if (!tile.querySelector('.video-preview')) {
                                tile.style.background = `linear-gradient(135deg, rgba(255,255,255,0.1), rgba(0,0,0,0.5)), url('https://picsum.photos/200/200?random=${index}') center/cover`;
                                tile.style.border = '1px solid rgba(255,255,255,0.3)';
                            }
                        }, index * 100);
                    });
                }, 600);
            });
        });
    });

    function animateProgressBar(el, target, duration, callback) {
        el.style.transition = `width ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        setTimeout(() => {
            el.style.width = target + '%';
            setTimeout(callback, duration);
        }, 50);
    }

    function animateValue(el, start, end, duration) {
        let startTime = null;
        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            el.textContent = Math.floor(progress * (end - start) + start) + '%';
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        }
        window.requestAnimationFrame(step);
    }
}


/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Parallax effect for grid cells
 */
function initParallaxCells() {
    const cells = document.querySelectorAll('.grid-cell.active');

    if (cells.length === 0) return;

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 20;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 20;
    }, { passive: true });

    function animate() {
        currentX += (mouseX - currentX) * 0.05;
        currentY += (mouseY - currentY) * 0.05;

        cells.forEach((cell, index) => {
            const factor = 1 + index * 0.2;
            cell.style.transform = `translate(${currentX * factor}px, ${currentY * factor}px)`;
        });

        requestAnimationFrame(animate);
    }

    animate();
}

/**
 * Intersection Observer for scroll animations (Luxury Reveal)
 */
function initIntersectionObserver() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('section, .hero-content, .hero-demo, .problem-card, .step-item').forEach(el => {
        el.classList.add('reveal-hidden');
        observer.observe(el);
    });

    // Luxury Reveal Styles
    const style = document.createElement('style');
    style.textContent = `
        .reveal-hidden {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), 
                        transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-visible {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
}

/**
 * Magnetic Button Effect
 */
function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .nav-cta, .btn-generate');

    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px) scale(1.02)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0) scale(1)';
        });
    });
}

/**
 * Button ripple effect
 */
document.querySelectorAll('.btn-primary').forEach(button => {
    button.addEventListener('click', function (e) {
        const rect = this.getBoundingClientRect();
        const ripple = document.createElement('span');

        ripple.style.cssText = `
            position: absolute;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple-effect 0.6s ease-out;
            pointer-events: none;
        `;

        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';

        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    });
});

// Add ripple animation
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple-effect {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

console.log('%c⬡ TRENDSYNTHESIS', 'color: #6366f1; font-size: 20px; font-weight: bold;');
console.log('%cСистема активна. Контентная независимость.', 'color: #888; font-size: 12px;');

/* ============================================
   MODAL LOGIC
   ============================================ */
function initModal() {
    const modal = document.getElementById('waitlist-modal');
    if (!modal) return;

    const closeBtn = modal.querySelector('.modal-close');
    const backdrop = modal.querySelector('.modal-backdrop');
    const form = document.getElementById('waitlist-form');
    const triggers = document.querySelectorAll('a[href="#deploy"], .cta-btn, .btn-primary:not(#demo-generate-btn)');

    // Open Modal
    triggers.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.remove('hidden');
        });
    });

    // Close Modal
    function closeModal() {
        modal.classList.add('hidden');
    }

    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });

    // Form Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('button');
        const originalText = btn.innerHTML;

        btn.disabled = true;
        btn.textContent = 'ОТПРАВКА...'; // Simple localization fallback

        // Simulate API call
        setTimeout(() => {
            btn.innerHTML = '✓ ВЫ В СПИСКЕ';
            btn.style.background = '#10b981';
            btn.style.color = '#fff';

            setTimeout(() => {
                closeModal();
                // Reset form after closing
                setTimeout(() => {
                    form.reset();
                    btn.disabled = false;
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.style.color = '';
                }, 500);
            }, 1000);
        }, 1500);
    });
}
