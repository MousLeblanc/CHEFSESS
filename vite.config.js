import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        login: resolve(__dirname, 'src/pages/login.html'),
        register: resolve(__dirname, 'src/pages/register.html'),
        siteLogin: resolve(__dirname, 'src/pages/site-login.html'),
        groupDashboard: resolve(__dirname, 'src/pages/group-dashboard.html'),
        siteDashboard: resolve(__dirname, 'src/pages/site-dashboard.html'),
        siteResidents: resolve(__dirname, 'src/pages/site-residents.html'),
        addResident: resolve(__dirname, 'src/pages/add-resident.html'),
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
