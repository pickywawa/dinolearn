// Copie le moteur de voix Piper (prononciation + calcul) dans public/piper/ :
// le jeu et l'appli l'embarquent, rien n'est chargé depuis un CDN.
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public', 'piper');
mkdirSync(out, { recursive: true });
const nm = (p) => join(root, 'node_modules', p);
const files = [
  [nm('onnxruntime-web/dist/esm/ort.wasm.min.js'), 'ort.wasm.min.js'],
  [nm('onnxruntime-web/dist/ort-wasm-simd.wasm'), 'ort-wasm-simd.wasm'],
  [nm('onnxruntime-web/dist/ort-wasm.wasm'), 'ort-wasm.wasm'],
  [nm('@mintplex-labs/piper-tts-web/dist/piper-o91UDS6e.js'), 'piper-phonemize.js'],
  [nm('@diffusionstudio/piper-wasm/build/piper_phonemize.wasm'), 'piper_phonemize.wasm'],
  [nm('@diffusionstudio/piper-wasm/build/piper_phonemize.data'), 'piper_phonemize.data'],
];
for (const [from, to] of files) copyFileSync(from, join(out, to));
console.log(`Moteur Piper copié dans public/piper (${files.length} fichiers).`);
