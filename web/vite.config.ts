/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

export default defineConfig({
  // Chemins relatifs : le jeu fonctionne sous n'importe quel sous-dossier (GitHub Pages…).
  base: './',
  // Tests : certains parcourent tous les jeux, pays et âges (lents sur les serveurs de GitHub).
  test: { testTimeout: 60_000 },
  // Worker de la voix du dino en module ES (il charge le moteur à la demande).
  worker: { format: 'es' },
  build: {
    // Phaser + Three.js (dino 3D) dans le même paquet : ~2,3 Mo minifié.
    chunkSizeWarningLimit: 2600,
  },
});
