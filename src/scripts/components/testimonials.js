/* ==========================================================================
   TESTIMONIALS.JS — Swiper carousel for testimonials
   ========================================================================== */

import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

/**
 * Initialize testimonials carousel.
 */
export function initTestimonials() {
    const container = document.querySelector('.testimonials__swiper');
    if (!container) return;

    const swiper = new Swiper(container, {
        modules: [Navigation, Pagination, Autoplay, EffectFade],
        effect: 'fade',
        fadeEffect: { crossFade: true },
        slidesPerView: 1,
        spaceBetween: 0,
        loop: true,
        speed: 800,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
        },
        pagination: {
            el: '.testimonials__pagination',
            clickable: true,
            bulletClass: 'testimonials__bullet',
            bulletActiveClass: 'testimonials__bullet--active',
        },
        navigation: {
            prevEl: '.testimonials__prev',
            nextEl: '.testimonials__next',
        },
        a11y: {
            prevSlideMessage: 'Previous testimonial',
            nextSlideMessage: 'Next testimonial',
            firstSlideMessage: 'This is the first testimonial',
            lastSlideMessage: 'This is the last testimonial',
        },
    });

    return swiper;
}
