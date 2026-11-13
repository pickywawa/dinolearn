// Envoie les fiches Google Play (fastlane/metadata/android/<langue>/) avec l'API Google Play :
// titre, descriptions courte et complète de chaque langue, et les images (icône, image de
// présentation, captures d'écran) des dossiers `images/`.
//
//   node scripts/play-listings.mjs            → vérifie tout auprès de Google, sans rien publier
//   node scripts/play-listings.mjs --commit   → enregistre les fiches dans la Play Console
//
// Clé du compte de service : voir scripts/play-api.mjs. Google n'accepte l'API qu'après un premier
// envoi d'appli (.aab) fait à la main dans la Play Console.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { API, UPLOAD, call } from './play-api.mjs';

const ROOT = new URL('../fastlane/metadata/android/', import.meta.url).pathname;
const commit = process.argv.includes('--commit');

const read = (dir, file) => (existsSync(join(dir, file)) ? readFileSync(join(dir, file), 'utf8').trim() : undefined);

const edit = await call('POST', `${API}/edits`, '{}');
const details = await call('GET', `${API}/edits/${edit.id}/details`);
console.log(`Modification ouverte (${edit.id}) — langue par défaut de la fiche : ${details.defaultLanguage}`);
// Coordonnées de la fiche (site, e-mail…) : fastlane/details.json, si présent.
const detailsFile = new URL('../fastlane/details.json', import.meta.url).pathname;
// Google refuse ces coordonnées tant que l'e-mail de contact manque : on attend qu'il soit renseigné.
const change = existsSync(detailsFile) ? JSON.parse(readFileSync(detailsFile, 'utf8')) : {};
if (!change.contactEmail && !details.contactEmail) {
  if (Object.keys(change).length) console.log('  coordonnées non envoyées : ajouter "contactEmail" dans fastlane/details.json');
} else if (Object.keys(change).length) {
  await call('PATCH', `${API}/edits/${edit.id}/details`, JSON.stringify(change));
  console.log(`  coordonnées : ${Object.keys(change).join(', ')}`);
}
try {
  for (const language of readdirSync(ROOT).sort()) {
    const dir = join(ROOT, language);
    const title = read(dir, 'title.txt');
    if (!title) continue;
    await call('PUT', `${API}/edits/${edit.id}/listings/${language}`, JSON.stringify({
      language, title, shortDescription: read(dir, 'short_description.txt'), fullDescription: read(dir, 'full_description.txt'),
    }));
    console.log(`  ${language.padEnd(7)} ${title}`);
    // Images : icône, image de présentation, captures (remplacent celles de cette langue).
    const images = join(dir, 'images');
    if (!existsSync(images)) continue;
    const kinds = [['icon', 'icon.png'], ['featureGraphic', 'featureGraphic.png']];
    for (const [type, file] of kinds) {
      if (!existsSync(join(images, file))) continue;
      await call('DELETE', `${API}/edits/${edit.id}/listings/${language}/${type}`);
      await call('POST', `${UPLOAD}/edits/${edit.id}/listings/${language}/${type}?uploadType=media`, readFileSync(join(images, file)), { 'Content-Type': 'image/png' });
      console.log(`          image ${type}`);
    }
    for (const [type, folder] of [['phoneScreenshots', 'phoneScreenshots'], ['sevenInchScreenshots', 'sevenInchScreenshots'], ['tenInchScreenshots', 'tenInchScreenshots']]) {
      const shots = join(images, folder);
      if (!existsSync(shots)) continue;
      await call('DELETE', `${API}/edits/${edit.id}/listings/${language}/${type}`);
      for (const file of readdirSync(shots).filter((f) => /\.(png|jpe?g)$/i.test(f)).sort()) {
        await call('POST', `${UPLOAD}/edits/${edit.id}/listings/${language}/${type}?uploadType=media`, readFileSync(join(shots, file)),
          { 'Content-Type': file.endsWith('.png') ? 'image/png' : 'image/jpeg' });
      }
      console.log(`          captures ${type}`);
    }
  }
  await call('POST', `${API}/edits/${edit.id}:validate`);
  if (commit) {
    await call('POST', `${API}/edits/${edit.id}:commit`);
    console.log('Fiches enregistrées dans la Play Console.');
  } else {
    await call('DELETE', `${API}/edits/${edit.id}`);
    console.log('Tout est valide (rien n\'a été publié). Relancer avec --commit pour enregistrer.');
  }
} catch (e) {
  await call('DELETE', `${API}/edits/${edit.id}`).catch(() => undefined);
  throw e;
}
