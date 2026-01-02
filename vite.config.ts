import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Ignore TypeScript errors during build
    rollupOptions: {
      onwarn() {
        // Suppress all warnings
        return;
      },
    },
  },
  esbuild: {
    // Ignore TypeScript errors
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
})
