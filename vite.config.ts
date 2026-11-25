import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Two builds:
//  • default  → dist/            normal code-split site (fast first load, three.js lazy-loaded)
//  • --mode single → .single/    everything inlined into one HTML file; copied to dist/offline.html.
//    "Download as a file" injects the gift into that file so it works with no internet at all.
// Inline (empty) PostCSS config: stops Vite from searching package.json / rc files for one.
const css = { postcss: {} };

export default defineConfig(({ mode }) =>
  mode === 'single'
    ? {
        plugins: [react(), viteSingleFile({ removeViteModuleLoader: true })],
        publicDir: false,
        css,
        build: { outDir: '.single', assetsInlineLimit: 100000000, chunkSizeWarningLimit: 5000, cssCodeSplit: false },
      }
    : {
        plugins: [react()],
        css,
        build: { chunkSizeWarningLimit: 1200 },
        server: { host: '0.0.0.0', allowedHosts: true },
        preview: { host: '0.0.0.0', allowedHosts: true },
      },
);
