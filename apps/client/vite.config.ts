/// <reference types='vitest' />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return {
    root: __dirname,
    cacheDir: '../node_modules/.vite/client',
    server: {
      port: Number(process.env.VITE_CLIENT_PORT),
      host: true,
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@shared': path.resolve(__dirname, '../../libs/shared/src'),
      },
    },
    build: {
      outDir: './dist',
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
  };
});
