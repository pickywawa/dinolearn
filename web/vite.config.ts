import { defineConfig } from 'vite';

export default defineConfig({
  // Chemins relatifs : le jeu fonctionne sous n'importe quel sous-dossier (GitHub Pages…).
  base: './',
  build: {
    chunkSizeWarningLimit: 2000,
  },
});
