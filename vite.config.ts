import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  base: './',
  // OCR is loaded from a worker on demand. Pre-bundling prevents Vite's first
  // development request from invalidating the page while that tool is open.
  optimizeDeps: {include: ['tesseract.js']},
  build: {chunkSizeWarningLimit: 350},
});
