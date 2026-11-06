import { defineConfig } from 'vite';

export default defineConfig({
  // Chemins relatifs : le jeu fonctionne sous n'importe quel sous-dossier (GitHub Pages…).
  base: './',
  build: {
    // Phaser + Three.js (dino 3D) dans le même paquet : ~2,3 Mo minifié.
    chunkSizeWarningLimit: 2600,
  },
});
