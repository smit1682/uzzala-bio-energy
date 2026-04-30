/* ==========================================================================
   ANIMATIONS.JS — Scroll choreography
   - Generic reveals (.reveal-up / .reveal-fade / .reveal-scale / left / right)
   - Line-aware text reveals via SplitText with overflow masks (.reveal-text)
   - Section-specific scroll choreography (process timeline, stats, services grid)
   - Image clip-path reveals (.reveal-clip)
   - Counter scrubs (.counter)
   ========================================================================== */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Initialize all scroll animations.
 * @param {boolean} reducedMotion - If true, skip all animations and show content.
 */
export function initAnimations(reducedMotion) {
    if (reducedMotion) {
        document
            .querySelectorAll('.reveal-text, .reveal-up, .reveal-fade, .reveal-scale, .reveal-left, .reveal-right, .reveal-clip, .reveal-blur, .reveal-scramble')
            .forEach((el) => {
                el.style.visibility = 'visible';
                el.style.opacity = '1';
                el.style.filter = 'none';
            });
        // Counters: skip the odometer animation and show final values directly.
        document.querySelectorAll('.counter').forEach((el) => {
            const target = Math.round(parseFloat(el.dataset.target) || 0);
            const suffix = el.dataset.suffix || '';
            el.textContent = `${target}${suffix}`;
        });
        return;
    }

    revealUp();
    revealFade();
    revealScale();
    revealLeft();
    revealRight();
    revealText();
    revealClip();
    revealBlur();
    revealScramble();
    parallaxImages();
    counterUp();
    sectionDividers();

    // Section-specific choreography (only run if section exists on page)
    aboutPreviewChoreo();
    servicesGridChoreo();
    processTimelineScrub();
    organicTabsChoreo();
    statsPin();
    teamChoreo();
    ctaChoreo();
    heroParallax();
}

/* ==========================================================================
   GENERIC REVEALS
   ========================================================================== */

function revealUp() {
    gsap.utils.toArray('.reveal-up').forEach((el) => {
        gsap.fromTo(
            el,
            { y: 60, opacity: 0, visibility: 'hidden' },
            {
                y: 0,
                opacity: 1,
                visibility: 'visible',
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 88%', once: true },
            }
        );
    });
}

function revealFade() {
    gsap.utils.toArray('.reveal-fade').forEach((el) => {
        gsap.fromTo(
            el,
            { opacity: 0, visibility: 'hidden' },
            {
                opacity: 1,
                visibility: 'visible',
                duration: 1.2,
                ease: 'power2.out',
                scrollTrigger: { trigger: el, start: 'top 88%', once: true },
            }
        );
    });
}

function revealScale() {
    gsap.utils.toArray('.reveal-scale').forEach((el) => {
        gsap.fromTo(
            el,
            { scale: 0.88, opacity: 0, visibility: 'hidden' },
            {
                scale: 1,
                opacity: 1,
                visibility: 'visible',
                duration: 1.2,
                ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 88%', once: true },
            }
        );
    });
}

function revealLeft() {
    gsap.utils.toArray('.reveal-left').forEach((el) => {
        gsap.fromTo(
            el,
            { x: -80, opacity: 0, visibility: 'hidden' },
            {
                x: 0,
                opacity: 1,
                visibility: 'visible',
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 85%', once: true },
            }
        );
    });
}

function revealRight() {
    gsap.utils.toArray('.reveal-right').forEach((el) => {
        gsap.fromTo(
            el,
            { x: 80, opacity: 0, visibility: 'hidden' },
            {
                x: 0,
                opacity: 1,
                visibility: 'visible',
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 85%', once: true },
            }
        );
    });
}

/* ==========================================================================
   LINE-AWARE TEXT REVEAL — SplitText with overflow masks
   This is the Awwwards-tier headline reveal. Each line slides up from a clip
   mask, character-staggered for premium feel.
   ========================================================================== */

function revealText() {
    gsap.utils.toArray('.reveal-text').forEach((el) => {
        // Wait for fonts so split is stable
        document.fonts?.ready.then(() => splitAndAnimate(el));
        if (!document.fonts) splitAndAnimate(el);
    });
}

function splitAndAnimate(el) {
    const split = new SplitText(el, {
        type: 'lines, words',
        linesClass: 'split-line',
        wordsClass: 'split-word',
    });

    // Wrap each line in an overflow-hidden mask so words slide UP from below
    split.lines.forEach((line) => {
        const wrap = document.createElement('span');
        wrap.className = 'split-line-mask';
        wrap.style.display = 'block';
        wrap.style.overflow = 'hidden';
        wrap.style.paddingBottom = '0.12em';
        wrap.style.marginBottom = '-0.12em';
        line.parentNode.insertBefore(wrap, line);
        wrap.appendChild(line);
    });

    el.style.visibility = 'visible';

    gsap.from(split.words, {
        yPercent: 110,
        opacity: 0,
        rotateX: -40,
        transformOrigin: '0% 100%',
        duration: 1.1,
        stagger: 0.018,
        ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
}

/* ==========================================================================
   IMAGE CLIP-PATH REVEAL
   Add class .reveal-clip to any image wrapper. Image unmasks from bottom.
   ========================================================================== */

function revealClip() {
    gsap.utils.toArray('.reveal-clip').forEach((el) => {
        gsap.fromTo(
            el,
            { clipPath: 'inset(0% 0% 100% 0%)' },
            {
                clipPath: 'inset(0% 0% 0% 0%)',
                duration: 1.4,
                ease: 'power4.inOut',
                scrollTrigger: { trigger: el, start: 'top 85%', once: true },
            }
        );

        // Subtle counter-scale on the inner image so it feels like the image
        // settles into frame rather than just being unmasked
        const img = el.querySelector('img, video');
        if (img) {
            gsap.fromTo(
                img,
                { scale: 1.15 },
                {
                    scale: 1,
                    duration: 1.6,
                    ease: 'power4.out',
                    scrollTrigger: { trigger: el, start: 'top 85%', once: true },
                }
            );
        }
    });
}

/* ==========================================================================
   BLUR-TO-SHARP IMAGE REVEAL
   Add class .reveal-blur to an image (or wrapper). Image fades in from a
   16px gaussian blur + 1.04 scale to crisp 1.0 — pairs well with parallax.
   ========================================================================== */

function revealBlur() {
    gsap.utils.toArray('.reveal-blur').forEach((el) => {
        gsap.fromTo(
            el,
            { filter: 'blur(16px)', scale: 1.04, opacity: 0 },
            {
                filter: 'blur(0px)',
                scale: 1,
                opacity: 1,
                duration: 1.3,
                ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 88%', once: true },
            }
        );
    });
}

/* ==========================================================================
   SCRAMBLE TEXT — hand-rolled (no GSAP ScrambleTextPlugin in free tier)
   Add class .reveal-scramble to a heading. Each char shuffles through a
   small glyph pool and settles into its target over ~350ms, staggered.
   ========================================================================== */

function revealScramble() {
    const GLYPHS = '!<>-_\\/[]{}—=+*^?#________';
    const settleDur = 350; // ms per char
    const stagger = 35;    // ms between chars

    gsap.utils.toArray('.reveal-scramble').forEach((el) => {
        const original = el.textContent;
        const chars = original.split('');
        // Build wrapped spans so we can mutate per-char without losing layout.
        el.textContent = '';
        const spans = chars.map((c) => {
            const s = document.createElement('span');
            s.textContent = c === ' ' ? ' ' : c;
            s.dataset.target = c;
            el.appendChild(s);
            return s;
        });
        el.style.visibility = 'hidden';
        el.setAttribute('aria-label', original);

        ScrollTrigger.create({
            trigger: el,
            start: 'top 88%',
            once: true,
            onEnter: () => {
                el.style.visibility = 'visible';
                spans.forEach((span, i) => {
                    const target = span.dataset.target;
                    if (target === ' ') return;
                    const startAt = i * stagger;
                    const endAt = startAt + settleDur;
                    const t0 = performance.now();
                    const tick = (now) => {
                        const elapsed = now - t0;
                        if (elapsed < startAt) {
                            requestAnimationFrame(tick);
                            return;
                        }
                        if (elapsed >= endAt) {
                            span.textContent = target;
                            return;
                        }
                        // Switch glyph every ~30ms while in the scramble window.
                        if (Math.floor(elapsed / 30) % 1 === 0) {
                            span.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
                        }
                        requestAnimationFrame(tick);
                    };
                    requestAnimationFrame(tick);
                });
            },
        });
    });
}

/* ==========================================================================
   PARALLAX IMAGES
   data-speed="0.6" (slower) or "1.4" (faster than scroll)
   ========================================================================== */

function parallaxImages() {
    gsap.utils.toArray('[data-speed]').forEach((el) => {
        const speed = parseFloat(el.dataset.speed) || 1;
        const yMovement = (1 - speed) * 100;

        gsap.fromTo(
            el,
            { y: -yMovement },
            {
                y: yMovement,
                ease: 'none',
                scrollTrigger: {
                    trigger: el.closest('.section') || el.parentElement,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1,
                },
            }
        );
    });
}

/* ==========================================================================
   COUNTER UP
   ========================================================================== */

/**
 * Odometer-style digit-flip counter. Each digit renders as a vertical
 * column 0..9 inside an overflow:hidden mask, then translates to the
 * target digit on scroll trigger. Reads as instrument-grade vs. plain
 * text count-up.
 */
function counterUp() {
    gsap.utils.toArray('.counter').forEach((el) => {
        const target = Math.round(parseFloat(el.dataset.target) || 0);
        const suffix = el.dataset.suffix || '';
        const digits = String(target).split('');

        // Build odometer DOM once. Each digit gets a column of 0..9 stacked
        // vertically; scrolling -10% per integer reveals the next digit.
        el.classList.add('odometer');
        el.textContent = '';
        const cols = digits.map((d) => {
            const col = document.createElement('span');
            col.className = 'odometer__col';
            col.setAttribute('aria-hidden', 'true');
            const inner = document.createElement('span');
            inner.className = 'odometer__roll';
            for (let i = 0; i <= 9; i++) {
                const cell = document.createElement('span');
                cell.className = 'odometer__cell';
                cell.textContent = String(i);
                inner.appendChild(cell);
            }
            col.appendChild(inner);
            el.appendChild(col);
            return { col, inner, target: parseInt(d, 10) };
        });
        if (suffix) {
            const s = document.createElement('span');
            s.className = 'odometer__suffix';
            s.textContent = suffix;
            el.appendChild(s);
        }
        // Accessible label so screen readers still hear the final value.
        el.setAttribute('aria-label', `${target}${suffix}`);

        // Roll each column into place with a subtle stagger left→right.
        gsap.set(cols.map((c) => c.inner), { yPercent: 0 });
        gsap.to(
            cols.map((c) => c.inner),
            {
                yPercent: (i) => -(cols[i].target * 10),
                duration: 1.6,
                ease: 'power3.out',
                stagger: 0.08,
                scrollTrigger: { trigger: el, start: 'top 85%', once: true },
            }
        );
    });
}

/* ==========================================================================
   SECTION DIVIDERS — green line draw
   ========================================================================== */

function sectionDividers() {
    gsap.utils.toArray('.section-divider').forEach((el) => {
        const tl = gsap.timeline({
            scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        });
        tl.fromTo(
            el,
            { scaleX: 0, '--divider-glow': 0 },
            { scaleX: 1, duration: 1.4, ease: 'power4.inOut' }
        )
        // brief glow flash once the line completes drawing — the trace settles
        // with a subtle teal-green pulse, then fades back to the static state.
        .to(el, {
            '--divider-glow': 1,
            duration: 0.35,
            ease: 'power2.out',
        }, '-=0.1')
        .to(el, {
            '--divider-glow': 0,
            duration: 1.2,
            ease: 'power2.inOut',
        });
    });
}

/* ==========================================================================
   ABOUT PREVIEW — image clip + cards stagger
   ========================================================================== */

function aboutPreviewChoreo() {
    const section = document.querySelector('.about-preview');
    if (!section) return;

    // The image already gets .reveal-clip; cards get a stagger
    const cards = section.querySelectorAll('.about-preview__card');
    if (cards.length) {
        gsap.from(cards, {
            y: 40,
            opacity: 0,
            duration: 0.9,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: { trigger: cards[0], start: 'top 85%', once: true },
        });
    }
}

/* ==========================================================================
   SERVICES GRID — staggered scale-in with subtle parallax
   ========================================================================== */

function servicesGridChoreo() {
    const groups = document.querySelectorAll('.services-group');
    if (!groups.length) return;

    groups.forEach((group) => {
        const indexEl = group.querySelector('.services-group__index');
        const titleEl = group.querySelector('.services-group__title');
        const captionEl = group.querySelector('.services-group__caption');
        const ruleEl = group.querySelector('.services-group__rule');
        const countEl = group.querySelector('.services-group__count');
        const cards = group.querySelectorAll('.bento-card');

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: group,
                start: 'top 78%',
                once: true,
            },
            defaults: { ease: 'power3.out' },
        });

        if (indexEl) {
            tl.from(indexEl, { opacity: 0, y: 20, scale: 0.85, duration: 0.7 }, 0);
        }
        if (titleEl) {
            tl.from(titleEl, { opacity: 0, y: 24, duration: 0.7 }, 0.05);
        }
        if (captionEl) {
            tl.from(captionEl, { opacity: 0, y: 16, duration: 0.6 }, 0.15);
        }
        if (ruleEl) {
            tl.to(ruleEl, { scaleX: 1, duration: 1.0, ease: 'power4.out' }, 0.1);
        }
        if (countEl) {
            tl.from(countEl, { opacity: 0, x: 12, duration: 0.5 }, 0.25);
        }
        if (cards.length) {
            tl.from(
                cards,
                {
                    opacity: 0,
                    y: 40,
                    rotateX: 8,
                    transformOrigin: 'center top',
                    duration: 0.8,
                    // Grid stagger from the center outward — gives the cards a
                    // sense of focal-point emergence rather than a flat L→R fade.
                    stagger: { amount: 0.55, grid: 'auto', from: 'center' },
                    ease: 'power3.out',
                },
                0.2
            );

            // Per-card image reveal — the image wipes in bottom→top with a
            // gentle counter-scale. Same stagger settings as the card slide
            // so each image+card pair animates as one synchronized unit.
            // Targeting .bento-card__media (wrapper, no CSS transition on
            // it) avoids fighting the existing img hover transition.
            const medias = group.querySelectorAll('.bento-card__media');
            if (medias.length) {
                tl.fromTo(
                    medias,
                    { clipPath: 'inset(0% 0% 100% 0%)', scale: 1.12 },
                    {
                        clipPath: 'inset(0% 0% 0% 0%)',
                        scale: 1,
                        duration: 1.1,
                        stagger: { amount: 0.55, grid: 'auto', from: 'center' },
                        ease: 'power4.out',
                    },
                    0.2
                );
            }
        }
    });

    /* Pointer-driven spotlight on each card (the ::after radial follows the cursor) */
    document.querySelectorAll('.bento-card').forEach((card) => {
        card.addEventListener('pointermove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mx', `${x}%`);
            card.style.setProperty('--my', `${y}%`);
        });
        card.addEventListener('pointerleave', () => {
            card.style.removeProperty('--mx');
            card.style.removeProperty('--my');
        });
    });

    /* CTA banner — fade up on scroll */
    const cta = document.querySelector('.services-cta');
    if (cta) {
        gsap.from(cta, {
            opacity: 0,
            y: 40,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: cta, start: 'top 85%', once: true },
        });
    }
}

/* ==========================================================================
   PROCESS TIMELINE — pinned scrub sequence
   The 4 steps reveal as the user scrolls past, with the green vertical line
   drawing in sync.
   ========================================================================== */

function processTimelineScrub() {
    const section = document.querySelector('.process-section');
    const timeline = document.querySelector('.process-timeline');
    if (!section || !timeline) return;

    const steps = Array.from(timeline.querySelectorAll('.process-step'));
    if (!steps.length) return;

    /* ---------- SVG flow line ---------- */
    const flow = timeline.querySelector('.process-flow');
    const path = flow?.querySelector('.process-flow__path');
    const particle = flow?.querySelector('.process-flow__particle');
    let pathLen = 0;
    if (path) {
        pathLen = path.getTotalLength();
        path.style.strokeDasharray = pathLen;
        path.style.strokeDashoffset = pathLen;
    }

    /* Path draw + particle scrub tied to timeline scroll */
    if (path && particle) {
        gsap.to(path, {
            strokeDashoffset: 0,
            ease: 'none',
            scrollTrigger: {
                trigger: timeline,
                start: 'top 65%',
                end: 'bottom 65%',
                scrub: 0.6,
            },
        });

        const proxy = { len: 0 };
        gsap.to(proxy, {
            len: pathLen,
            ease: 'none',
            scrollTrigger: {
                trigger: timeline,
                start: 'top 65%',
                end: 'bottom 65%',
                scrub: 0.6,
                onUpdate: (self) => {
                    const dist = pathLen * self.progress;
                    if (dist <= 0) {
                        particle.style.opacity = 0;
                        return;
                    }
                    particle.style.opacity = 1;
                    const pt = path.getPointAtLength(dist);
                    particle.setAttribute('cx', pt.x);
                    particle.setAttribute('cy', pt.y);
                },
            },
        });
    }

    /* ---------- Per-step entrance choreography ---------- */
    steps.forEach((step) => {
        const number = step.querySelector('.process-step__number');
        const image = step.querySelector('.process-step__image');
        const img = image?.querySelector('img');
        const eyebrow = step.querySelector('.process-step__eyebrow');
        const title = step.querySelector('.process-step__title');
        const text = step.querySelector('.process-step__text');

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: step,
                start: 'top 80%',
                toggleActions: 'play none none none',
            },
            defaults: { ease: 'power3.out' },
        });

        /* Number count-up 00 → target */
        if (number) {
            const target = parseInt(number.dataset.target || '0', 10);
            const counter = { val: 0 };
            tl.to(counter, {
                val: target,
                duration: 1.1,
                ease: 'power2.out',
                onUpdate: () => {
                    number.textContent = String(Math.round(counter.val)).padStart(2, '0');
                },
            }, 0);
            tl.fromTo(number, { y: 12, opacity: 0 }, { y: 0, opacity: 0.18, duration: 0.6 }, 0);
        }

        if (image) {
            tl.fromTo(
                image,
                { clipPath: 'inset(0% 0% 100% 0%)' },
                { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power4.inOut' },
                0.1
            );
            if (img) {
                tl.fromTo(img, { scale: 1.2 }, { scale: 1, duration: 1.3 }, 0.1);
            }
        }

        if (eyebrow) {
            tl.fromTo(eyebrow, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 0.25);
        }

        /* SplitText word reveal on title */
        if (title) {
            try {
                const split = new SplitText(title, { type: 'words', wordsClass: 'word' });
                tl.from(split.words, {
                    yPercent: 110,
                    opacity: 0,
                    stagger: 0.05,
                    duration: 0.8,
                    ease: 'power3.out',
                }, 0.3);
            } catch {
                tl.fromTo(title, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 0.3);
            }
        }

        if (text) {
            tl.fromTo(text, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 0.45);
        }

        /* Subtle parallax on the image while in view */
        if (image) {
            gsap.to(image, {
                yPercent: -8,
                ease: 'none',
                scrollTrigger: {
                    trigger: step,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 0.8,
                },
            });
        }
    });

    /* ---------- Scrollspy: active step + hue ---------- */
    const setActiveStep = (i) => {
        const idx = Math.max(0, Math.min(steps.length - 1, i));
        if (timeline.dataset.activeStep === String(idx)) return;
        timeline.dataset.activeStep = String(idx);

        steps.forEach((s, j) => {
            s.classList.toggle('is-active', j === idx);
            s.classList.toggle('is-passed', j < idx);
        });

        const stage = steps[idx]?.dataset.stage;
        if (stage) section.dataset.stage = stage;
    };

    steps.forEach((step, i) => {
        ScrollTrigger.create({
            trigger: step,
            start: 'top 55%',
            end: 'bottom 45%',
            onEnter:    () => setActiveStep(i),
            onEnterBack: () => setActiveStep(i),
        });
    });
}

/* ==========================================================================
   ORGANIC FERTILIZER — content + media reveal in sync
   ========================================================================== */

function organicTabsChoreo() {
    const section = document.querySelector('.fertilizer-section');
    if (!section) return;

    const tabs = section.querySelectorAll('.fertilizer-tab');
    if (tabs.length) {
        gsap.from(tabs, {
            y: 20,
            opacity: 0,
            duration: 0.7,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: { trigger: tabs[0], start: 'top 85%', once: true },
        });
    }
}

/* ==========================================================================
   STATS — pin section briefly, counter-up runs while pinned
   ========================================================================== */

function statsPin() {
    const section = document.querySelector('.stats-section');
    if (!section) return;

    const items = section.querySelectorAll('.stat-item');
    if (!items.length) return;

    gsap.set(items, { y: 50, opacity: 0 });
    gsap.to(items, {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out',
        overwrite: 'auto',
        scrollTrigger: { trigger: section, start: 'top 75%', once: true },
    });
}

/* ==========================================================================
   TEAM — staggered reveal
   ========================================================================== */

function teamChoreo() {
    const grid = document.querySelector('.team-grid');
    if (!grid) return;
    const cards = grid.querySelectorAll('.team-card');
    if (!cards.length) return;

    gsap.from(cards, {
        y: 60,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: grid, start: 'top 85%', once: true },
    });
}

/* ==========================================================================
   CTA — soft scale + glow
   ========================================================================== */

function ctaChoreo() {
    const card = document.querySelector('.cta-card');
    if (!card) return;
    // Already gets .reveal-scale via class; this just adds a subtle floating glow
    gsap.to(card, {
        boxShadow: '0 20px 80px rgba(57, 255, 20, 0.12)',
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
    });
}

/* ==========================================================================
   HERO PARALLAX — content rises as user scrolls
   ========================================================================== */

function heroParallax() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const content = hero.querySelector('.hero-content');
    const overlay = hero.querySelector('.hero__overlay');

    if (content) {
        gsap.to(content, {
            yPercent: -20,
            opacity: 0,
            ease: 'none',
            scrollTrigger: {
                trigger: hero,
                start: 'top top',
                end: 'bottom top',
                scrub: 1,
            },
        });
    }
    if (overlay) {
        gsap.to(overlay, {
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
                trigger: hero,
                start: 'top top',
                end: 'bottom top',
                scrub: 1,
            },
        });
    }
}
