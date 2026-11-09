// Avant de copier le jeu dans l'appli : on retire les packs de reconnaissance
// vocale (≈ 83 Mo), que l'appli télécharge depuis le site au premier lancement.
import { rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
rmSync(join(dist, 'voice'), { recursive: true, force: true });
console.log('Packs de reconnaissance retirés de l\'appli (téléchargés au premier lancement).');
