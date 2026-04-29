/* ==========================================================================
   MAIN.JS — Global entry point
   Lenis + GSAP sync, navbar, cursor, preloader, footer, shared init.
   Loaded on every page.
   ========================================================================== */

import '../css/style.css';
import '../css/components.css';

import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initNavbar } from './components/navbar.js';
import { initAnimations } from './animations.js';

gsap.registerPlugin(ScrollTrigger);

/* --------------------------------------------------------------------------
   1. REDUCED MOTION CHECK
   -------------------------------------------------------------------------- */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --------------------------------------------------------------------------
   2. LENIS SMOOTH SCROLL
   -------------------------------------------------------------------------- */
let lenis;

if (!prefersReducedMotion) {
    lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
    });

    // Sync Lenis → ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Sync GSAP ticker → Lenis RAF
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
}

// Export for use in nav anchors
export { lenis };

/* --------------------------------------------------------------------------
   3. PRELOADER
   -------------------------------------------------------------------------- */
function initPreloader() {
    const preloader = document.querySelector('.preloader');
    if (!preloader) return;

    const counter = preloader.querySelector('.preloader__counter');
    const barFill = preloader.querySelector('.preloader__bar-fill');

    if (prefersReducedMotion) {
        preloader.remove();
        return;
    }

    const tl = gsap.timeline({
        onComplete: () => {
            preloader.remove();
            // Refresh so ScrollTrigger recalculates positions now layout is final
            ScrollTrigger.refresh();
        },
    });

    // Count 0 → 100 (faked progress; assets are mostly already loaded thanks to lazy hints)
    tl.to({ val: 0 }, {
        val: 100,
        duration: 1.6,
        ease: 'power2.inOut',
        onUpdate: function () {
            const v = Math.round(this.targets()[0].val);
            if (counter) counter.textContent = v + '%';
            if (barFill) barFill.style.width = v + '%';
        },
    })
        // Curtain wipe up — hero content reveals via .reveal-* classes after this
        .to(preloader, {
            yPercent: -100,
            duration: 0.9,
            ease: 'power4.inOut',
            delay: 0.15,
        });
}

/* --------------------------------------------------------------------------
   4. CUSTOM CURSOR
   -------------------------------------------------------------------------- */
function initCursor() {
    // Skip on touch devices
    if (window.matchMedia('(pointer: coarse)').matches || prefersReducedMotion) return;

    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;

    const xDot = gsap.quickTo(dot, 'left', { duration: 0.15, ease: 'power3' });
    const yDot = gsap.quickTo(dot, 'top', { duration: 0.15, ease: 'power3' });
    const xRing = gsap.quickTo(ring, 'left', { duration: 0.4, ease: 'power3' });
    const yRing = gsap.quickTo(ring, 'top', { duration: 0.4, ease: 'power3' });

    window.addEventListener('mousemove', (e) => {
        xDot(e.clientX);
        yDot(e.clientY);
        xRing(e.clientX);
        yRing(e.clientY);
    });

    // Scale ring on interactive elements
    const interactives = document.querySelectorAll('a, button, .magnetic, input, textarea, select');
    interactives.forEach((el) => {
        el.addEventListener('mouseenter', () => ring.classList.add('hover'));
        el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });

    // Magnetic effect on .magnetic elements. Pull is clamped to MAX_PULL px on
    // each axis — wide CTAs would otherwise drift 30px+ at the corners, which
    // reads as agency-tier rather than B2B-credible.
    const MAX_PULL = 10;
    const clampPull = gsap.utils.clamp(-MAX_PULL, MAX_PULL);
    document.querySelectorAll('.magnetic').forEach((el) => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const dx = (e.clientX - rect.left - rect.width / 2) * 0.3;
            const dy = (e.clientY - rect.top - rect.height / 2) * 0.3;
            gsap.to(el, { x: clampPull(dx), y: clampPull(dy), duration: 0.3, ease: 'power2.out' });
        });

        el.addEventListener('mouseleave', () => {
            gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
        });
    });
}

/* --------------------------------------------------------------------------
   5. MARQUEE
   -------------------------------------------------------------------------- */
function initMarquees() {
    document.querySelectorAll('.marquee__track').forEach((track) => {
        // Duplicate content for seamless loop
        track.innerHTML += track.innerHTML;

        const tween = gsap.to(track, {
            xPercent: -50,
            duration: 30,
            ease: 'none',
            repeat: -1,
        });

        // Pause on hover
        track.closest('.marquee')?.addEventListener('mouseenter', () => tween.pause());
        track.closest('.marquee')?.addEventListener('mouseleave', () => tween.resume());
    });
}

/* --------------------------------------------------------------------------
   6. WHATSAPP WIDGET
   -------------------------------------------------------------------------- */
function initWhatsApp() {
    const widget = document.querySelector('.whatsapp-widget');
    if (!widget) return;

    const btn = widget.querySelector('.whatsapp-widget__btn');
    const popup = widget.querySelector('.whatsapp-widget__popup');

    btn?.addEventListener('click', () => {
        popup?.classList.toggle('open');
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!widget.contains(e.target)) {
            popup?.classList.remove('open');
        }
    });
}

/* --------------------------------------------------------------------------
   7. INIT ALL
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initNavbar(lenis);
    initCursor();
    initMarquees();
    initWhatsApp();
    initAnimations(prefersReducedMotion);
});
