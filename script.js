/**
 * ============================================================================
 * JAYA MOTORS - SCRIPT PRINCIPAL (ARQUITECTURA MODULAR)
 * ----------------------------------------------------------------------------
 * Contiene:
 * 1. Cotizador Inteligente por WhatsApp según el servicio elegido
 * 2. Navegación, Menú Móvil y Header Glassmorphism Dinámico
 * 3. Efecto Spotlight Metálico en Tarjetas
 * 4. Contadores Animados de Telemetría (17+, 7,000+, 85%+, 100%)
 * 5. Galería de Productos Filtrable y Visor Lightbox
 * 6. Coreografía de Scroll (Barra de Progreso + Reveal Escalonado)
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    initWhatsAppLinks();
    initNavigation();
    initSpotlightCards();
    initTelemetryCounters();
    initGalleryAndLightbox();
    initTestimonialsCarousel();
    initScrollChoreography();
});

/* ============================================================================
   1. COTIZADOR INTELIGENTE DE WHATSAPP
   Abre WhatsApp con un mensaje personalizado dependiendo del botón pulsado
   ============================================================================ */
function initWhatsAppLinks() {
    const WHATSAPP_NUMBER = '18092902929';
    const DEFAULT_MESSAGE = 'Hola Jaya Motors! Me gustaría agendar una cita o cotizar un servicio para mi vehículo.';

    document.addEventListener('click', (event) => {
        const trigger = event.target.closest('[data-wa-service]');
        if (!trigger) return;

        event.preventDefault();
        const customMessage = trigger.getAttribute('data-wa-service') || DEFAULT_MESSAGE;
        const encodedText = encodeURIComponent(customMessage);
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`, '_blank', 'noopener,noreferrer');
    });
}

/* ============================================================================
   2. NAVEGACIÓN, MENÚ MÓVIL Y HEADER GLASSMORPHISM
   ============================================================================ */
function initNavigation() {
    const header = document.getElementById('siteHeader');
    const menuToggle = document.getElementById('menuToggle');
    const navLinksContainer = document.getElementById('navLinks');
    const navLinks = document.querySelectorAll('.nav-link');

    // Cambia el estilo del header al hacer scroll
    const handleScrollHeader = () => {
        if (!header) return;
        if (window.scrollY > 30) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScrollHeader, { passive: true });
    handleScrollHeader();

    // Menú hamburguesa en dispositivos móviles
    if (menuToggle && navLinksContainer) {
        menuToggle.addEventListener('click', () => {
            const isOpen = navLinksContainer.classList.toggle('active');
            menuToggle.classList.toggle('active', isOpen);
            menuToggle.setAttribute('aria-expanded', String(isOpen));
        });

        // Cerrar menú móvil al pulsar un enlace
        navLinks.forEach((link) => {
            link.addEventListener('click', () => {
                navLinksContainer.classList.remove('active');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // Resaltar sección activa en el menú mientras se hace scroll
    const sections = document.querySelectorAll('main section[id]');
    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach((link) => {
                        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                    });
                }
            });
        },
        { rootMargin: '-35% 0px -55% 0px' }
    );
    sections.forEach((sec) => sectionObserver.observe(sec));
}

/* ============================================================================
   3. EFECTO SPOTLIGHT METÁLICO EN TARJETAS
   Rastrea la posición del cursor dentro de cada tarjeta para iluminar su borde
   ============================================================================ */
function initSpotlightCards() {
    const cards = document.querySelectorAll('.spotlight-card');
    cards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}

/* ============================================================================
   4. CONTADORES ANIMADOS DE TELEMETRÍA
   Anima los números (17+, 7,000+, 85%+, 100%) cuando entran en pantalla
   ============================================================================ */
function initTelemetryCounters() {
    const counters = document.querySelectorAll('.counter');
    if (!counters.length) return;

    const animateCounter = (el) => {
        const target = parseInt(el.getAttribute('data-target'), 10) || 0;
        const duration = 1600;
        const startTime = performance.now();

        const step = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            // Curva easeOutQuart
            const eased = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(eased * target);
            el.textContent = current.toLocaleString('en-US');

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target.toLocaleString('en-US');
            }
        };
        requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    obs.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.4 }
    );

    counters.forEach((counter) => observer.observe(counter));
}

/* ============================================================================
   5. GALERÍA FILTRABLE Y LIGHTBOX MODAL
   Permite filtrar los productos por categoría y ampliar cualquier foto
   ============================================================================ */
function initGalleryAndLightbox() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryCards = document.querySelectorAll('.gallery-card');
    const lightbox = document.getElementById('lightboxModal');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxTag = document.getElementById('lightboxTag');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxDesc = document.getElementById('lightboxDesc');

    // Filtrado por categoría
    filterBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');

            filterBtns.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');

            galleryCards.forEach((card) => {
                const category = card.getAttribute('data-category');
                const shouldShow = filter === 'all' || category === filter;
                card.classList.toggle('is-hidden', !shouldShow);
            });
        });
    });

    // Abrir Lightbox al hacer clic o presionar Enter en una tarjeta de la galería
    const openLightbox = (card) => {
        if (!lightbox) return;
        const img = card.querySelector('img');
        const tag = card.querySelector('.caption-tag');
        const title = card.querySelector('h3');
        const desc = card.querySelector('p');

        if (img && lightboxImg) {
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
        }
        if (tag && lightboxTag) lightboxTag.textContent = tag.textContent;
        if (title && lightboxTitle) lightboxTitle.textContent = title.textContent;
        if (desc && lightboxDesc) lightboxDesc.textContent = desc.textContent;

        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
    };

    const closeLightbox = () => {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
    };

    galleryCards.forEach((card) => {
        card.addEventListener('click', () => openLightbox(card));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(card);
            }
        });
    });

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });
}

/* ============================================================================
   6. CARRUSEL DESLIZABLE DE TESTIMONIOS (FLECHAS IZQUIERDA Y DERECHA)
   ============================================================================ */
function initTestimonialsCarousel() {
    const track = document.getElementById('testimonialsTrack');
    const prevBtn = document.getElementById('testimonioPrev');
    const nextBtn = document.getElementById('testimonioNext');
    if (!track || !prevBtn || !nextBtn) return;

    const getStepWidth = () => {
        const firstCard = track.querySelector('.testimonial-card');
        if (!firstCard) return 380;
        const gap = parseFloat(window.getComputedStyle(track).gap) || 24;
        return firstCard.getBoundingClientRect().width + gap;
    };

    prevBtn.addEventListener('click', () => {
        const step = getStepWidth();
        if (track.scrollLeft <= 10) {
            track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' });
        } else {
            track.scrollBy({ left: -step, behavior: 'smooth' });
        }
    });

    nextBtn.addEventListener('click', () => {
        const step = getStepWidth();
        const maxScroll = track.scrollWidth - track.clientWidth - 10;
        if (track.scrollLeft >= maxScroll) {
            track.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            track.scrollBy({ left: step, behavior: 'smooth' });
        }
    });
}

/* ============================================================================
   7. COREOGRAFÍA DE SCROLL (BARRA DE PROGRESO + REVEAL ESCALONADO TIPO APPLE)
   ============================================================================ */
function initScrollChoreography() {
    const progressBar = document.getElementById('scrollProgressBar');
    const redGlow = document.querySelector('.ambient-glow--red');
    const blueGlow = document.querySelector('.ambient-glow--blue');

    // Actualizar barra de progreso superior y parallax ambiental al hacer scroll
    const updateScrollTelemetry = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

        if (progressBar) {
            progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        }

        if (redGlow && blueGlow) {
            redGlow.style.transform = `translate3d(${scrollTop * -0.04}px, ${scrollTop * 0.08}px, 0)`;
            blueGlow.style.transform = `translate3d(${scrollTop * 0.05}px, ${scrollTop * -0.06}px, 0)`;
        }
    };

    window.addEventListener('scroll', updateScrollTelemetry, { passive: true });
    updateScrollTelemetry();

    // Reveal escalonado para cabeceras, tarjetas y paneles al entrar en el viewport
    const revealTargets = document.querySelectorAll(
        '.section-header, .service-card, .pillar-card, .gallery-card, .testimonial-card, .contact-panel, .pitstop-inner, .telemetry-bar'
    );

    revealTargets.forEach((el, index) => {
        el.classList.add('reveal-on-scroll');
        // Retardo sutil escalonado para elementos en la misma fila
        el.style.transitionDelay = `${(index % 3) * 75}ms`;
    });

    const revealObserver = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealTargets.forEach((el) => revealObserver.observe(el));
}
