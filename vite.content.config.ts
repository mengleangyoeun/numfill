import { defineConfig } from 'vite';
import { resolve } from 'path';

// Standalone build for Chrome Extension Content Script
// Built as an IIFE to ensure it is 100% self-contained without ES module chunk imports
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: resolve(import.meta.dirname, 'src/content/content.ts'),
      name: 'ContentScript',
      formats: ['iife'],
      fileName: () => 'content.js',
    },
  },
});
