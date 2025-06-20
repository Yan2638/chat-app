import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/chat-app/',
  plugins: [react()],
  root: './',
  publicDir: 'nginx/public',
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
  server: {
    watch: {
      usePolling: true,
    },
    host: true,
    strictPort: true,
    port: 5173,
  },
  build: {
    outDir: 'dist',
  }
})
