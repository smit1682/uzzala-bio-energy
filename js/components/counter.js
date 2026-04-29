/* ==========================================================================
   COUNTER.JS — Scroll-triggered count-up animation for stats
   ========================================================================== */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Initialize counter animations.
 * Targets elements with class "counter" and data-target attribute.
 * Already handled in animations.js — this is for standalone use if needed.
 */
export function initCounters() {
    gsap.utils.toArray('.counter').forEach((el) => {
        const target = parseInt(el.dataset.target, 10) || 0;
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';

        gsap.fromTo(el,
            { textContent: 0 },
            {
                textContent: target,
                duration: 2.5,
                ease: 'power2.out',
                snap: { textContent: 1 },
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    once: true,
                },
                onUpdate: function () {
                    el.textContent = prefix + Math.round(this.targets()[0].textContent) + suffix;
                },
            }
        );
    });
}
