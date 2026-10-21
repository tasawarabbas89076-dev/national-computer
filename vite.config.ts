import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const rootDir = import.meta.dirname;

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(rootDir, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(rootDir, 'index.html'),
          products: path.resolve(rootDir, 'products.html'),
          adminIndex: path.resolve(rootDir, 'admin/index.html'),
          adminLogin: path.resolve(rootDir, 'admin/login.html'),
          adminDashboard: path.resolve(rootDir, 'admin/dashboard.html'),
          adminProducts: path.resolve(rootDir, 'admin/products.html'),
          adminCategories: path.resolve(rootDir, 'admin/categories.html'),
          adminServices: path.resolve(rootDir, 'admin/services.html'),
          adminSettings: path.resolve(rootDir, 'admin/settings.html'),
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
