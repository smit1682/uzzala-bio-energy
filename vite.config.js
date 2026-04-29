import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: '.',
    publicDir: 'assets',
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                about: resolve(__dirname, 'about.html'),
                services: resolve(__dirname, 'services.html'),
                gallery: resolve(__dirname, 'gallery.html'),
                career: resolve(__dirname, 'career.html'),
                contact: resolve(__dirname, 'contact.html'),
                'service-plug-flow': resolve(__dirname, 'services/plug-flow-digester.html'),
                'service-cstr': resolve(__dirname, 'services/cstr-digester.html'),
                'service-h2s': resolve(__dirname, 'services/h2s-removal-system.html'),
                'service-water-scrubber': resolve(__dirname, 'services/water-scrubber.html'),
                'service-psa': resolve(__dirname, 'services/psa-purification-plant.html'),
                'service-membrane': resolve(__dirname, 'services/membrane-biogas-separation.html'),
                'service-sewage': resolve(__dirname, 'services/sewage-treatment-plant.html'),
                'service-organic-fertilizer': resolve(__dirname, 'services/organic-fertilizer.html'),
                'service-cbg': resolve(__dirname, 'services/compressed-biogas.html'),
                'service-cbg-fuel': resolve(__dirname, 'services/cbg-fuel.html'),
                'service-biogas-waste': resolve(__dirname, 'services/biogas-from-waste.html'),
            },
        },
    },
    server: {
        port: 3000,
        open: true,
    },
});
