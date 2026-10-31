// Prépare les packs de reconnaissance vocale (jeux à voix haute) dans public/voice/ :
// les petits modèles Vosk officiels (Alpha Cephei, Apache 2.0), réemballés en .tar.gz
// pour vosk-browser, et la liste des mots que chaque modèle connaît.
// Les packs (≈ 40 Mo chacun) ne sont pas dans le dépôt : ce script les télécharge
// au déploiement. Ils sont servis à côté du jeu, sans aucun service tiers.
//
// Usage : npm run voice-packs   (VOICE_MODELS_URL pour une autre source que alphacephei.com)
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PACKS = [
  { lang: 'fr', model: 'vosk-model-small-fr-0.22' },
  { lang: 'en', model: 'vosk-model-small-en-us-0.15' },
];
const SOURCE = process.env.VOICE_MODELS_URL ?? 'https://alphacephei.com/vosk/models';
const OUT = fileURLToPath(new URL('../public/voice/', import.meta.url));
mkdirSync(OUT, { recursive: true });

for (const { lang, model } of PACKS) {
  const archive = join(OUT, `${model}.tar.gz`);
  const words = join(OUT, `${lang}.words.txt`);
  if (existsSync(archive)) {
    console.log(`${model} : déjà prêt.`);
    continue;
  }
  const work = mkdtempSync(join(tmpdir(), 'voice-'));
  try {
    console.log(`${model} : téléchargement…`);
    const response = await fetch(`${SOURCE}/${model}.zip`);
    if (!response.ok) throw new Error(`${model} : HTTP ${response.status}`);
    writeFileSync(join(work, 'model.zip'), Buffer.from(await response.arrayBuffer()));
    execFileSync('unzip', ['-q', 'model.zip'], { cwd: work });
    // vosk-browser attend une archive .tar.gz avec un dossier au premier niveau.
    execFileSync('tar', ['-czf', archive, model], { cwd: work });
    // Mots connus du modèle : le jeu ne lui demande que ceux-là. Les petits modèles (graphe « lookahead »)
    // n'ont pas cette liste : le pack est servi quand même, et le jeu propose alors tous les mots.
    const wordsFile = join(work, model, 'graph', 'words.txt');
    if (existsSync(wordsFile)) {
      const list = readFileSync(wordsFile, 'utf8')
        .split('\n').map((line) => line.split(' ')[0])
        .filter((w) => w && !/^(<.*>|#\d+)$/.test(w));
      writeFileSync(words, `${list.join('\n')}\n`);
      console.log(`${model} : ${list.length} mots → public/voice/`);
    } else {
      rmSync(words, { force: true });
      console.log(`${model} : pas de liste de mots dans ce modèle (graphe : ${readdirSync(join(work, model, 'graph')).join(', ')})`);
    }
    console.log(`${model} : ${(statSync(archive).size / 1e6).toFixed(1)} Mo → public/voice/`);
  } catch (e) {
    // Le jeu se déploie quand même : les parents verront que le pack n'est pas disponible.
    rmSync(archive, { force: true });
    console.warn(`::warning::Pack ${lang} non préparé (${e.message}) : les jeux à voix haute ne pourront pas le télécharger.`);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}
