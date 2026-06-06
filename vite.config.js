import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Split heavy/rarely-changing deps into their own chunk for better caching
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('react')) return 'react';
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
})
