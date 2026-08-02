/// <reference types='vitest' />
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../../node_modules/.vite/apps/phaser-game',
  server: {
    port: 4200,
    host: true,
    watch: {
      usePolling: true,
    },
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  plugins: [
    tsconfigPaths(),
    {
      name: 'phaser-full-reload',
      handleHotUpdate({ file, server }) {
        if (file.endsWith('.ts')) {
          server.ws.send({ type: 'full-reload' });
          return [];
        }
      }
    }
  ],
  build: {
    outDir: '../dist/game',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  test: {
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/phaser-game',
      provider: 'v8',
    },
  },
}));
