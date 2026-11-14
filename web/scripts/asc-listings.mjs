// Fiche App Store de DinoLearn : textes, catégorie, captures d'écran, notes pour l'examinateur.
//   node scripts/asc-listings.mjs            → vérifie (ne change rien)
//   node scripts/asc-listings.mjs --commit   → enregistre dans App Store Connect (ne soumet PAS à la relecture)
// Textes : `python3 fastlane/appstore.py` → fastlane/metadata/ios/<langue>/*.txt
// Captures : fastlane/metadata/ios/<langue>/screenshots/{iphone,ipad}/*.png (voir STORES.md)
// Clé d'API : voir asc-api.mjs. Derrière un proxy d'entreprise : NODE_USE_ENV_PROXY=1.
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { api, BUNDLE_ID } from './asc-api.mjs';

const commit = process.argv.includes('--commit');
const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7).split(',');
const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'fastlane', 'metadata', 'ios');
const read = (loc, f) => { const p = join(root, loc, f); return existsSync(p) ? readFileSync(p, 'utf8').trim() : undefined; };
const locales = readdirSync(root).filter((d) => statSync(join(root, d)).isDirectory() && (!only || only.includes(d))).sort();

const SITE = 'https://pickywawa.github.io/dinolearn/';
const PRIVACY = `${SITE}confidentialite.html`;
const VERSION = JSON.parse(readFileSync(join(root, '..', '..', '..', 'package.json'), 'utf8')).version;
const REVIEW_NOTES = {
  fr: `DinoLearn est un jeu éducatif pour les 3-7 ans, sans publicité, sans achat ni compte : tout reste sur l'appareil.
Au premier lancement, l'appli télécharge la voix du dino et la reconnaissance vocale de la langue de l'appareil (environ 100 à 150 Mo) : une connexion Wi-Fi est conseillée, la progression s'affiche en bas de l'écran.
Ensuite : toucher l'œuf 4 fois pour le faire éclore, écouter le dino (bouton « Passer » en bas à droite), puis un parent remplit la fiche de l'enfant et choisit un code à 4 chiffres. Ce code ouvre l'espace parents (bouton « Paramètres » de l'accueil).
Le micro sert uniquement aux jeux à voix haute : la reconnaissance se fait sur l'appareil, rien n'est enregistré ni envoyé.`,
  en: `DinoLearn is an educational game for children aged 3 to 7, with no ads, no purchases and no account: everything stays on the device.
On first launch, the app downloads the dino's voice and the speech recognition for the device language (about 100–150 MB). Wi-Fi is recommended; progress is shown at the bottom of the screen.
Then: tap the egg 4 times to hatch it, listen to the dino (a "Skip" button is at the bottom right), then a parent fills in the child's details and chooses a 4-digit code. This code opens the parents' area ("Settings" button on the home screen).
The microphone is only used for the speaking games: recognition runs on the device, nothing is recorded or sent.`,
};
// Taille des captures → type d'écran App Store Connect.
const DISPLAY = { iphone: 'APP_IPHONE_67' /* accepte aussi le 6,9" (1320×2868) */, ipad: 'APP_IPAD_PRO_3GEN_129' };

const log = (...a) => console.log(...a);
const todo = [];
const attempt = async (what, fn) => {
  try { return await fn(); } catch (e) { todo.push(`${what} : ${e.message.slice(0, 400)}`); log(`  ✗ ${what}`); }
};

const apps = await api('GET', '/v1/apps?limit=50');
const app = apps.data.find((a) => a.attributes.bundleId === BUNDLE_ID);
if (!app) throw new Error(`Appli ${BUNDLE_ID} introuvable sur ce compte`);
log(`Appli : ${app.attributes.name} (${app.id}), langue principale ${app.attributes.primaryLocale}`);

// ---- Version en préparation ----
const versions = (await api('GET', `/v1/apps/${app.id}/appStoreVersions?filter[platform]=IOS`)).data;
const version = versions.find((v) => ['PREPARE_FOR_SUBMISSION', 'DEVELOPER_REJECTED', 'REJECTED'].includes(v.attributes.appStoreState));
if (!version) throw new Error('Aucune version modifiable');
log(`Version : ${version.attributes.versionString} (${version.attributes.appStoreState}) → ${VERSION}`);
if (commit) {
  await api('PATCH', `/v1/appStoreVersions/${version.id}`, {
    data: { type: 'appStoreVersions', id: version.id, attributes: { versionString: VERSION, copyright: `2026 Alexis Picard` } },
  });
}

// ---- Informations de l'appli : catégorie, noms, sous-titres, confidentialité ----
const infos = (await api('GET', `/v1/apps/${app.id}/appInfos`)).data;
const info = infos.find((i) => !['READY_FOR_SALE', 'REMOVED_FROM_SALE'].includes(i.attributes.state ?? i.attributes.appStoreState)) ?? infos[0];
log(`Informations : ${info.id}`);
if (commit) {
  await attempt('catégorie', () => api('PATCH', `/v1/appInfos/${info.id}`, {
    data: { type: 'appInfos', id: info.id, relationships: { primaryCategory: { data: { type: 'appCategories', id: 'EDUCATION' } } } },
  }));
}
const infoLocs = (await api('GET', `/v1/appInfos/${info.id}/appInfoLocalizations?limit=200`)).data;
const verLocs = (await api('GET', `/v1/appStoreVersions/${version.id}/appStoreVersionLocalizations?limit=200`)).data;
const byLocale = (list) => Object.fromEntries(list.map((l) => [l.attributes.locale, l]));
const infoBy = byLocale(infoLocs), verBy = byLocale(verLocs);

let verIds = {};
for (const loc of locales) {
  const name = read(loc, 'name.txt'), subtitle = read(loc, 'subtitle.txt');
  log(`${loc.padEnd(8)} ${name} — ${subtitle}`);
  if (!commit) continue;
  await attempt(`${loc} nom/sous-titre`, async () => {
    const attributes = { name, subtitle, privacyPolicyUrl: PRIVACY };
    if (infoBy[loc]) await api('PATCH', `/v1/appInfoLocalizations/${infoBy[loc].id}`, { data: { type: 'appInfoLocalizations', id: infoBy[loc].id, attributes } });
    else await api('POST', '/v1/appInfoLocalizations', {
      data: { type: 'appInfoLocalizations', attributes: { locale: loc, ...attributes }, relationships: { appInfo: { data: { type: 'appInfos', id: info.id } } } },
    });
  });
  await attempt(`${loc} description`, async () => {
    // Créer le nom d'une langue crée aussi sa fiche de version : on la relit.
    if (!verBy[loc]) Object.assign(verBy, byLocale((await api('GET', `/v1/appStoreVersions/${version.id}/appStoreVersionLocalizations?limit=200`)).data));
    const attributes = {
      description: read(loc, 'description.txt'), keywords: read(loc, 'keywords.txt'),
      promotionalText: read(loc, 'promotional_text.txt'), supportUrl: SITE, marketingUrl: SITE,
    };
    if (verBy[loc]) {
      await api('PATCH', `/v1/appStoreVersionLocalizations/${verBy[loc].id}`, { data: { type: 'appStoreVersionLocalizations', id: verBy[loc].id, attributes } });
      verIds[loc] = verBy[loc].id;
    } else {
      const r = await api('POST', '/v1/appStoreVersionLocalizations', {
        data: { type: 'appStoreVersionLocalizations', attributes: { locale: loc, ...attributes }, relationships: { appStoreVersion: { data: { type: 'appStoreVersions', id: version.id } } } },
      });
      verIds[loc] = r.data.id;
    }
  });
}
for (const l of verLocs) verIds[l.attributes.locale] ??= l.id;

// ---- Classification d'âge : aucun contenu sensible ----
if (commit) {
  await attempt('classification d\'âge', async () => {
    const d = (await api('GET', `/v1/appInfos/${info.id}/ageRatingDeclaration`)).data;
    const attributes = {};
    for (const k of ['advertising', 'gambling', 'healthOrWellnessTopics', 'lootBox', 'messagingAndChat', 'ageAssurance', 'socialMedia', 'socialMediaAgeRestricted',
      'unrestrictedWebAccess', 'userGeneratedContent']) if (k in d.attributes) attributes[k] = false;
    // L'espace parents (code, temps de jeu, heure du coucher) est un contrôle parental.
    attributes.parentalControls = true;
    for (const k of ['alcoholTobaccoOrDrugUseOrReferences', 'contests', 'gamblingSimulated', 'gunsOrOtherWeapons', 'horrorOrFearThemes', 'matureOrSuggestiveThemes',
      'medicalOrTreatmentInformation', 'profanityOrCrudeHumor', 'sexualContentGraphicAndNudity', 'sexualContentOrNudity', 'violenceCartoonOrFantasy', 'violenceRealistic',
      'violenceRealisticProlongedGraphicOrSadistic']) if (k in d.attributes) attributes[k] = 'NONE';
    await api('PATCH', `/v1/ageRatingDeclarations/${d.id}`, { data: { type: 'ageRatingDeclarations', id: d.id, attributes } });
    log('  classification d\'âge : aucun contenu sensible');
  });
}

// ---- Notes pour l'examinateur ----
if (commit) {
  await attempt('notes pour l\'examinateur', async () => {
    const existing = await api('GET', `/v1/appStoreVersions/${version.id}/appStoreReviewDetail`).then((r) => r.data).catch(() => null);
    // Contact de l'examinateur : le téléphone est à renseigner une fois dans App Store Connect (ASC_REVIEW_PHONE pour l'envoyer d'ici).
    const attributes = { contactFirstName: 'Alexis', contactLastName: 'Picard', contactEmail: 'picard.alexis@yahoo.fr', ...(process.env.ASC_REVIEW_PHONE ? { contactPhone: process.env.ASC_REVIEW_PHONE } : {}), demoAccountRequired: false, notes: `${REVIEW_NOTES.en}\n\n${REVIEW_NOTES.fr}` };
    if (existing) await api('PATCH', `/v1/appStoreReviewDetails/${existing.id}`, { data: { type: 'appStoreReviewDetails', id: existing.id, attributes } });
    else await api('POST', '/v1/appStoreReviewDetails', { data: { type: 'appStoreReviewDetails', attributes, relationships: { appStoreVersion: { data: { type: 'appStoreVersions', id: version.id } } } } });
  });
}

// ---- Captures d'écran ----
async function upload(setId, file) {
  const data = readFileSync(file);
  const name = file.split('/').pop();
  const created = (await api('POST', '/v1/appScreenshots', {
    data: { type: 'appScreenshots', attributes: { fileName: name, fileSize: data.length }, relationships: { appScreenshotSet: { data: { type: 'appScreenshotSets', id: setId } } } },
  })).data;
  for (const op of created.attributes.uploadOperations) {
    const res = await fetch(op.url, {
      method: op.method, headers: Object.fromEntries(op.requestHeaders.map((h) => [h.name, h.value])),
      body: data.subarray(op.offset, op.offset + op.length),
    });
    if (!res.ok) throw new Error(`envoi ${name} : ${res.status}`);
  }
  await api('PATCH', `/v1/appScreenshots/${created.id}`, {
    data: { type: 'appScreenshots', id: created.id, attributes: { uploaded: true, sourceFileChecksum: createHash('md5').update(data).digest('hex') } },
  });
}
for (const loc of locales) {
  for (const [kind, displayType] of Object.entries(DISPLAY)) {
    const dir = join(root, loc, 'screenshots', kind);
    if (!existsSync(dir)) continue;
    const files = readdirSync(dir).filter((f) => /\.(png|jpe?g)$/i.test(f)).sort().map((f) => join(dir, f));
    log(`${loc.padEnd(8)} captures ${kind} : ${files.length}`);
    if (!commit || !files.length) continue;
    await attempt(`${loc} captures ${kind}`, async () => {
      const id = verIds[loc];
      if (!id) throw new Error('pas de fiche pour cette langue');
      const sets = (await api('GET', `/v1/appStoreVersionLocalizations/${id}/appScreenshotSets`)).data;
      let set = sets.find((s) => s.attributes.screenshotDisplayType === displayType);
      if (set) {
        const old = (await api('GET', `/v1/appScreenshotSets/${set.id}/appScreenshots`)).data;
        for (const o of old) await api('DELETE', `/v1/appScreenshots/${o.id}`);
      } else {
        set = (await api('POST', '/v1/appScreenshotSets', {
          data: { type: 'appScreenshotSets', attributes: { screenshotDisplayType: displayType }, relationships: { appStoreVersionLocalization: { data: { type: 'appStoreVersionLocalizations', id } } } },
        })).data;
      }
      for (const f of files) await upload(set.id, f);
    });
  }
}

log(commit ? '\nEnregistré.' : '\nVérification seulement : relancer avec --commit pour enregistrer.');
if (todo.length) { log('\nÀ regarder :'); todo.forEach((t) => log(' - ' + t)); process.exitCode = 1; }
