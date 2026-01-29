import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests in development to avoid CORS issues
      '/api': {
        target: 'https://piecespoidslourdsguinee.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path, // Keep the /api prefix
      },
      // Proxy image requests in development
      '/images': {
        target: 'https://piecespoidslourdsguinee.com',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})
