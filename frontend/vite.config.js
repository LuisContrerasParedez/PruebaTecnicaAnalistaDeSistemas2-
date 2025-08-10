// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // ya lo usas para tu API
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      // agrega este para servir archivos locales
      '/local': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
