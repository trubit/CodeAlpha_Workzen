import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './src/shared'),
      '@client': path.resolve(__dirname, './src/client'),
      '@server': path.resolve(__dirname, './src/server')
    }
  },
  server: {
    port: 3070,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5050',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://localhost:5050',
        ws: true
      }
    }
  }
});

