import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { serviceWorkerPlugin } from './scripts/vite-plugin-service-worker.ts';

// The base path is configurable so the app can be hosted at a sub-path
// (e.g. GitHub Pages) without code changes: `VITE_BASE=/repo/ npm run build`.
const base = process.env.VITE_BASE ?? '/';

export default defineConfig({
  base,
  plugins: [react(), serviceWorkerPlugin({ base })],
  build: {
    target: 'es2022',
    sourcemap: false,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
