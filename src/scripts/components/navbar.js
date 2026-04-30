/* ==========================================================================
   NAVBAR.JS — Navigation component logic
   Mobile menu, scroll effects, dropdown, active page highlighting.
   ========================================================================== */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Initialize navbar behavior.
 * @param {object|null} lenis - Lenis instance for scroll-to navigation.
 */
export function initNavbar(lenis) {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    initScrollEffect(navbar);
    initMobileMenu(navbar);
    initActiveLink(navbar);
    initNavAnchors(navbar, lenis);
}

/* --------------------------------------------------------------------------
   Scroll Effect — Transparent → solid with blur
   -------------------------------------------------------------------------- */
function initScrollEffect(navbar) {
    ScrollTrigger.create({
        start: 'top -80',
        end: 99999,
        onUpdate: (self) => {
            if (self.direction === 1) {
                navbar.classList.add('scrolled');
            }
            if (self.scroll() < 80) {
                navbar.classList.remove('scrolled');
            }
        },
    });
}

/* --------------------------------------------------------------------------
   Mobile Menu — Hamburger toggle
   -------------------------------------------------------------------------- */
function initMobileMenu(navbar) {
    const hamburger = navbar.querySelector('.navbar__hamburger');
    const mobileMenu = document.querySelector('.navbar__mobile-menu');
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', () => {
        const isOpen = hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('open');

        // Lock body scroll when menu is open
        document.body.style.overflow = isOpen ? 'hidden' : '';

        // Animate menu items in
        if (isOpen) {
            gsap.from(mobileMenu.querySelectorAll('a'), {
                y: 40,
                opacity: 0,
                stagger: 0.08,
                duration: 0.6,
                ease: 'power3.out',
                delay: 0.2,
            });
        }
    });

    // Close menu on link click
    mobileMenu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('open');
            document.body.style.overflow = '';
        });
    });
}

/* --------------------------------------------------------------------------
   Active Link Highlighting
   -------------------------------------------------------------------------- */
function initActiveLink(navbar) {
    const currentPath = window.location.pathname;
    navbar.querySelectorAll('.navbar__link, .navbar__dropdown-menu a').forEach((link) => {
        const href = link.getAttribute('href');
        if (!href) return;

        // Match current page
        if (currentPath.endsWith(href) || (currentPath === '/' && href === 'index.html')) {
            link.classList.add('active');
        }

        // Highlight parent dropdown if child is active
        if (link.classList.contains('active') && link.closest('.navbar__dropdown')) {
            link.closest('.navbar__dropdown')?.querySelector('.navbar__dropdown-toggle')?.classList.add('active');
        }
    });
}

/* --------------------------------------------------------------------------
   Nav Anchors — Use Lenis scrollTo for on-page links
   -------------------------------------------------------------------------- */
function initNavAnchors(navbar, lenis) {
    navbar.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (!target) return;

            if (lenis) {
                lenis.scrollTo(target, { offset: -80 });
            } else {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}
