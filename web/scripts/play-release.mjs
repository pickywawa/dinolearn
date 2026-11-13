// Envoie une version à Google Play : le .aab (web/dinolearn-v<version>.aab, construit par
// scripts/android-aab.sh) et ses nouveautés dans chaque langue (fastlane/metadata/android/<langue>/
// changelogs/<versionCode>.txt, écrites par fastlane/changelogs.py), sur le canal de test interne.
//
//   node scripts/play-release.mjs                 → vérifie tout auprès de Google, sans rien publier
//   node scripts/play-release.mjs --commit        → enregistre la version
//   --track=alpha (test fermé), --track=production…
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { API, UPLOAD, call } from './play-api.mjs';

const commit = process.argv.includes('--commit');
const track = process.argv.find((a) => a.startsWith('--track='))?.slice(8) ?? 'internal';
const version = JSON.parse(readFileSync(new URL('../package.json', import.meta.url))).version;
const [major, minor, patch] = version.split('.').map(Number);
const versionCode = major * 10000 + minor * 100 + patch;
const aab = new URL(`../dinolearn-v${version}.aab`, import.meta.url).pathname;
if (!existsSync(aab)) {
  console.error(`${aab} introuvable : lance d'abord scripts/android-aab.sh.`);
  process.exit(1);
}
const ROOT = new URL('../fastlane/metadata/android/', import.meta.url).pathname;
const releaseNotes = readdirSync(ROOT).sort().flatMap((language) => {
  const file = join(ROOT, language, 'changelogs', `${versionCode}.txt`);
  return existsSync(file) ? [{ language, text: readFileSync(file, 'utf8').trim() }] : [];
});
if (!releaseNotes.length) console.warn(`Aucune note de version pour ${versionCode} (fastlane/changelogs.py).`);

const edit = await call('POST', `${API}/edits`, '{}');
try {
  console.log(`Envoi de ${version} (${versionCode}), ${Math.round(readFileSync(aab).length / 1e6)} Mo…`);
  const bundle = await call('POST', `${UPLOAD}/edits/${edit.id}/bundles?uploadType=media`, readFileSync(aab),
    { 'Content-Type': 'application/octet-stream' });
  console.log(`  .aab reçu (versionCode ${bundle.versionCode})`);
  // Une appli jamais publiée n'accepte que des versions « brouillon » (à déployer dans la Play Console).
  const release = (status) => JSON.stringify({ track, releases: [{ name: version, versionCodes: [String(bundle.versionCode)], status, releaseNotes }] });
  let status = 'completed';
  try {
    await call('PUT', `${API}/edits/${edit.id}/tracks/${track}`, release(status));
  } catch (e) {
    if (!/draft/i.test(String(e.message))) throw e;
    status = 'draft';
    await call('PUT', `${API}/edits/${edit.id}/tracks/${track}`, release(status));
  }
  console.log(`  canal « ${track} » : version ${version}, ${status === 'draft' ? 'brouillon' : 'déployée'}, nouveautés en ${releaseNotes.length} langues`);
  await call('POST', `${API}/edits/${edit.id}:validate`);
  if (commit) {
    await call('POST', `${API}/edits/${edit.id}:commit`);
    console.log(status === 'draft' ? 'Version enregistrée en brouillon : à déployer dans la Play Console.' : 'Version enregistrée et déployée sur le canal.');
  } else {
    await call('DELETE', `${API}/edits/${edit.id}`);
    console.log('Tout est valide (rien n\'a été publié). Relancer avec --commit pour enregistrer.');
  }
} catch (e) {
  await call('DELETE', `${API}/edits/${edit.id}`).catch(() => undefined);
  throw e;
}
