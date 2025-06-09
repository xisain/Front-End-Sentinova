import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import flowbiteReact from "flowbite-react/plugin/vite";

export default defineConfig({
  plugins: [react(), flowbiteReact()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.sentinova.my.id',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
        }
      }
    }
  }
})