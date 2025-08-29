import { defineConfig } from 'vite'
import { resolve } from 'path'
import htmlPurge from "vite-plugin-purgecss"

export default defineConfig({
  plugins: [
    //@ts-ignore
    htmlPurge({
      safelist: ["is-loading", 'is-success'],
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        success: resolve(__dirname, 'success/index.html'),
        error: resolve(__dirname, 'error/index.html'),
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: p => p.replace(/^\/api/, ''),
      },
    },
  },
})
