import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Vite config with explicit index.html entry for Rollup
export default defineConfig({
  plugins: [react()],
  root: '.', // use frontend folder as root
  build: {
    outDir: 'dist', // Netlify will serve this
    rollupOptions: {
      input: resolve(__dirname, 'index.html'), // ✅ ensures Rollup finds entry point
    },
  },
})
