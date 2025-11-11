import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          'animation': ['framer-motion', 'react-intersection-observer'],
          'ui-libs': ['@headlessui/react', '@paypal/react-paypal-js'],
          'utils': ['axios', 'cloudinary']
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Increase limit to 1000kb
    sourcemap: false, // Disable sourcemaps in production for smaller bundle
  },
  optimizeDeps: {
    include: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage']
  }
});
