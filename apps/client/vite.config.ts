/// <reference types='vitest' />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

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
