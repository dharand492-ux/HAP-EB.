import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // or vue/svelte plugin

export default defineConfig({
  plugins: [react()],
  root: '.', // Explicitly set root directory
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './index.html' // Explicit entry point
      }
    }
  },
  server: {
    port: 3000
  }
})
