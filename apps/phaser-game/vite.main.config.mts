import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { join } from 'path';
import { builtinModules } from 'module';
import { spawn } from 'child_process';
import type { ChildProcess } from 'child_process';
import electronPath from 'electron';

let electronProcess: ChildProcess | null = null;

export default defineConfig(({ mode }) => {
  return {
    root: __dirname,
    build: {
      outDir: '../../dist/apps/phaser-game',
      emptyOutDir: false,
      lib: {
        entry: 'src-electron/main.ts',
        formats: ['cjs'],
        fileName: () => 'main.js',
      },
      rollupOptions: {
        external: [
          'electron',
          ...builtinModules,
          ...builtinModules.map((m) => `node:${m}`),
          '@nestjs/common',
          '@nestjs/core',
          '@nestjs/platform-express',
          'reflect-metadata',
          'rxjs',
        ],
      },
      target: 'node20',
      minify: mode === 'production',
      watch: mode === 'development' ? {} : null,
    },
    define: {
      __BUILD_VERSION__: JSON.stringify(process.env.npm_package_version || '0.0.0'),
      __BUILD_DATE__: JSON.stringify(Date.now()) // sometimes templates use this too
    },
    resolve: {
      alias: mode === 'production' ? [
        {
          find: /.*\/environments\/environment$/,
          replacement: join(__dirname, 'src-electron/environments/environment.prod.ts')
        }
      ] : []
    },
    plugins: [
      viteStaticCopy({
        targets: [
          {
            src: 'package.json',
            dest: '.'
          },
          {
            src: 'src-electron/assets/*',
            dest: 'assets'
          }
        ]
      }),
      {
        name: 'electron-dev-server',
        writeBundle() {
          if (mode === 'development') {
            if (electronProcess) {
              electronProcess.kill('SIGTERM');
            }
            const mainPath = join(__dirname, '../../dist/apps/phaser-game/main.js');
            electronProcess = spawn(electronPath as any, [mainPath], {
              stdio: 'inherit'
            });
            electronProcess.on('exit', () => {
              process.exit(0);
            });
          }
        }
      }
    ]
  };
});
