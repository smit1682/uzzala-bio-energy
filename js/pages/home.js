/* ==========================================================================
   HOME.JS — Home page specific logic
   Three.js lazy load, fertilizer tabs, testimonials init.
   ========================================================================== */

import '../../css/pages/home.css';
import { initTestimonials } from '../components/testimonials.js';

/* --------------------------------------------------------------------------
   1. FERTILIZER TABS
   -------------------------------------------------------------------------- */
function initFertilizerTabs() {
    const tabs = document.querySelectorAll('.fertilizer-tab');
    const contents = document.querySelectorAll('.fertilizer-tab-content');
    if (!tabs.length) return;

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;

            // Deactivate all
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            // Activate clicked
            tab.classList.add('active');
            const targetContent = document.getElementById(`tab-${target}`);
            if (targetContent) targetContent.classList.add('active');
        });
    });
}

/* --------------------------------------------------------------------------
   2. INIT
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    initFertilizerTabs();
    initTestimonials();
});
