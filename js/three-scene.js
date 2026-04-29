/* ==========================================================================
   THREE-SCENE.JS — Three.js reactor scene for Home hero
   Story-driven camera flythrough, bloom postprocessing, scroll-driven particle flow.
   Loaded dynamically only on index.html.
   ========================================================================== */

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const COLOR_GREEN = 0x39ff14;
const COLOR_TEAL = 0x00f0ff;

/**
 * Initialize the Three.js hero scene.
 * @param {HTMLCanvasElement} canvas
 * @returns {{ dispose: () => void }}
 */
export function initScene(canvas) {
    if (!canvas) return null;

    /* ----------------- Renderer ----------------- */
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    /* ----------------- Scene & camera ----------------- */
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.05);

    const camera = new THREE.PerspectiveCamera(
        55,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        100
    );
    camera.position.set(0, 1.5, 9);

    /* ----------------- Lighting ----------------- */
    scene.add(new THREE.AmbientLight(0x111118, 0.4));

    const keyLight = new THREE.PointLight(COLOR_GREEN, 3, 25, 1.5);
    keyLight.position.set(3.5, 4, 3);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(COLOR_TEAL, 2, 25, 1.5);
    fillLight.position.set(-3.5, 2, 0);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(COLOR_GREEN, 1.2, 18, 2);
    rimLight.position.set(0, -2.5, -4);
    scene.add(rimLight);

    /* ----------------- Reactor group ----------------- */
    const reactor = new THREE.Group();

    // Dome (top hemisphere)
    const domeMat = new THREE.MeshStandardMaterial({
        color: 0x1c1c28,
        metalness: 0.85,
        roughness: 0.18,
        emissive: COLOR_GREEN,
        emissiveIntensity: 0.04,
    });
    const dome = new THREE.Mesh(
        new THREE.SphereGeometry(1.6, 96, 96, 0, Math.PI * 2, 0, Math.PI / 2),
        domeMat
    );
    reactor.add(dome);

    // Cylindrical body
    const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x14141e,
        metalness: 0.95,
        roughness: 0.12,
        emissive: COLOR_TEAL,
        emissiveIntensity: 0.025,
    });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 2.2, 96), bodyMat);
    body.position.y = -1.1;
    reactor.add(body);

    // Bottom cap
    const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(1.6, 1.4, 0.2, 96),
        bodyMat.clone()
    );
    cap.position.y = -2.3;
    reactor.add(cap);

    // Glowing accent rings (each gets its own material so opacity can pulse independently)
    const rings = [];
    for (let i = 0; i < 6; i++) {
        const ringMat = new THREE.MeshBasicMaterial({
            color: COLOR_GREEN,
            transparent: true,
            opacity: 0.85,
        });
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(1.62, 0.018, 16, 128),
            ringMat
        );
        ring.position.y = -2.0 + i * 0.42;
        ring.rotation.x = Math.PI / 2;
        rings.push(ring);
        reactor.add(ring);
    }

    // Top accent ring (teal)
    const topRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.0, 0.025, 20, 128),
        new THREE.MeshBasicMaterial({ color: COLOR_TEAL })
    );
    topRing.position.y = 0.05;
    topRing.rotation.x = Math.PI / 2;
    reactor.add(topRing);

    // Side pipes — angled connectors
    const pipeMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a26,
        metalness: 0.92,
        roughness: 0.15,
        emissive: COLOR_GREEN,
        emissiveIntensity: 0.06,
    });
    const pipeGeo = new THREE.CylinderGeometry(0.085, 0.085, 3.2, 24);
    [-1, 1].forEach((side) => {
        const pipe = new THREE.Mesh(pipeGeo, pipeMat);
        pipe.position.set(side * 2.4, -0.7, 0);
        pipe.rotation.z = (Math.PI / 5.2) * side;
        reactor.add(pipe);

        // Pipe end-cap glow
        const cap = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 16, 16),
            new THREE.MeshBasicMaterial({ color: COLOR_GREEN })
        );
        cap.position.set(side * 3.2, 0.3, 0);
        reactor.add(cap);
    });

    reactor.position.set(2.2, -0.3, 0);
    scene.add(reactor);

    /* ----------------- Particle field (methane bubbles) ----------------- */
    const particleCount = 400;
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);
    const greenColor = new THREE.Color(COLOR_GREEN);
    const tealColor = new THREE.Color(COLOR_TEAL);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 14;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
        speeds[i] = 0.002 + Math.random() * 0.006;

        const c = Math.random() > 0.7 ? tealColor : greenColor;
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
        size: 0.045,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    /* ----------------- Postprocessing (bloom) ----------------- */
    const composer = new EffectComposer(renderer);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    composer.setSize(canvas.clientWidth, canvas.clientHeight);
    composer.addPass(new RenderPass(scene, camera));

    const bloom = new UnrealBloomPass(
        new THREE.Vector2(canvas.clientWidth, canvas.clientHeight),
        0.85,  // strength
        0.7,   // radius
        0.15   // threshold — only bright (emissive/basic) elements bloom
    );
    composer.addPass(bloom);

    /* ----------------- Scroll-driven choreography ----------------- */
    let scrollProgress = 0;
    const heroSection = document.querySelector('.hero');

    if (heroSection) {
        ScrollTrigger.create({
            trigger: heroSection,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
            onUpdate: (self) => {
                scrollProgress = self.progress;
            },
        });
    }

    /* ----------------- Mouse parallax ----------------- */
    const mouse = { x: 0, y: 0 };
    const targetMouse = { x: 0, y: 0 };
    window.addEventListener('mousemove', (e) => {
        targetMouse.x = (e.clientX / window.innerWidth - 0.5) * 0.6;
        targetMouse.y = (e.clientY / window.innerHeight - 0.5) * 0.4;
    });

    /* ----------------- Animation loop ----------------- */
    const clock = new THREE.Clock();
    let rafId;

    function animate() {
        const elapsed = clock.getElapsedTime();

        // Smooth mouse → camera offset
        mouse.x += (targetMouse.x - mouse.x) * 0.05;
        mouse.y += (targetMouse.y - mouse.y) * 0.05;

        // Reactor: slow base rotation + scroll boost
        reactor.rotation.y = elapsed * 0.12 + scrollProgress * Math.PI * 1.2;
        reactor.rotation.x = scrollProgress * 0.15;

        // Camera scroll choreography: pull back + tilt down as user scrolls
        const baseY = 1.5 - scrollProgress * 1.5;
        const baseZ = 9 + scrollProgress * 2.5;
        camera.position.x = mouse.x * 0.8;
        camera.position.y = baseY + mouse.y * 0.4;
        camera.position.z = baseZ;
        camera.lookAt(reactor.position.x - 0.5, 0 + scrollProgress * -0.5, 0);

        // Particles drift upward; reset when out of bounds
        const posArr = particles.geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            posArr[i * 3 + 1] += speeds[i] * (1 + scrollProgress * 1.5);
            // Slight horizontal drift
            posArr[i * 3] += Math.sin(elapsed * 0.5 + i) * 0.0008;

            if (posArr[i * 3 + 1] > 6) {
                posArr[i * 3 + 1] = -6;
                posArr[i * 3] = (Math.random() - 0.5) * 14;
            }
        }
        particles.geometry.attributes.position.needsUpdate = true;

        // Light pulse on rings + key light
        keyLight.intensity = 3 + Math.sin(elapsed * 1.8) * 0.4;
        fillLight.intensity = 2 + Math.cos(elapsed * 1.4) * 0.3;
        rings.forEach((ring, idx) => {
            ring.material.opacity = 0.6 + Math.sin(elapsed * 2 + idx * 0.5) * 0.4;
        });

        // Bloom strength reacts to scroll (more glow as user dives in)
        bloom.strength = 0.85 + scrollProgress * 0.4;

        composer.render();
        rafId = requestAnimationFrame(animate);
    }

    animate();

    /* ----------------- Resize ----------------- */
    const resizeObserver = new ResizeObserver(() => {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        renderer.setSize(w, h, false);
        composer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    });
    resizeObserver.observe(canvas);

    /* ----------------- Visibility pause (perf) ----------------- */
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(rafId);
        } else {
            clock.start();
            animate();
        }
    });

    /* ----------------- Cleanup ----------------- */
    return {
        dispose() {
            cancelAnimationFrame(rafId);
            resizeObserver.disconnect();
            renderer.dispose();
            composer.dispose?.();
            scene.traverse((obj) => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (Array.isArray(obj.material)) {
                        obj.material.forEach((m) => m.dispose());
                    } else {
                        obj.material.dispose();
                    }
                }
            });
        },
    };
}
