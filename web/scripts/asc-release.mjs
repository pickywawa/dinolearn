// Publie une nouvelle version sur l'App Store : crée la version, y met les nouveautés de chaque langue
// (les mêmes que Google Play : fastlane/changelogs.py), attache le build envoyé (xcrun altool) et,
// avec --submit, la soumet à la relecture d'Apple.
//   node scripts/asc-release.mjs                → vérifie (ne change rien)
//   node scripts/asc-release.mjs --commit       → crée la version, nouveautés, build
//   node scripts/asc-release.mjs --commit --submit
// Derrière un proxy d'entreprise : NODE_USE_ENV_PROXY=1.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { api, BUNDLE_ID } from './asc-api.mjs';

const commit = process.argv.includes('--commit');
const submit = process.argv.includes('--submit');
const here = dirname(fileURLToPath(import.meta.url));
const version = JSON.parse(readFileSync(join(here, '..', 'package.json'), 'utf8')).version;
const [major, minor, patch] = version.split('.').map(Number);
const versionCode = major * 10000 + minor * 100 + patch;
// Langue App Store → dossier de nouveautés Google Play.
const NOTES = { 'es-MX': 'es-419', it: 'it-IT', ru: 'ru-RU', 'zh-Hans': 'zh-CN', hi: 'hi-IN', 'ar-SA': 'ar', 'tr': 'tr-TR', pl: 'pl-PL', ko: 'ko-KR' };
const notesFor = (locale) => {
  const file = join(here, '..', 'fastlane', 'metadata', 'android', NOTES[locale] ?? locale, 'changelogs', `${versionCode}.txt`);
  return existsSync(file) ? readFileSync(file, 'utf8').trim() : undefined;
};

const apps = await api('GET', '/v1/apps?limit=50');
const app = apps.data.find((a) => a.attributes.bundleId === BUNDLE_ID);
if (!app) throw new Error(`Appli ${BUNDLE_ID} introuvable sur ce compte`);
console.log(`Appli : ${app.attributes.name} (${app.id}) — version ${version}`);

// ---- Version ----
const versions = (await api('GET', `/v1/apps/${app.id}/appStoreVersions?filter[platform]=IOS`)).data;
let v = versions.find((x) => x.attributes.versionString === version);
console.log(v ? `Version ${version} existe (${v.attributes.appStoreState})` : `Version ${version} à créer`);
if (!v && commit) {
  v = (await api('POST', '/v1/appStoreVersions', {
    data: { type: 'appStoreVersions', attributes: { platform: 'IOS', versionString: version, releaseType: 'AFTER_APPROVAL', copyright: '2026 Alexis Picard' },
      relationships: { app: { data: { type: 'apps', id: app.id } } } },
  })).data;
  console.log(`  créée : ${v.id}`);
}

// ---- Nouveautés par langue ----
if (v) {
  const locs = (await api('GET', `/v1/appStoreVersions/${v.id}/appStoreVersionLocalizations?limit=200`)).data;
  console.log(`${locs.length} langues sur la version`);
  for (const l of locs) {
    const text = notesFor(l.attributes.locale) ?? notesFor('en-US');
    if (!text) { console.log(`  ${l.attributes.locale} : pas de nouveautés`); continue; }
    if (commit) await api('PATCH', `/v1/appStoreVersionLocalizations/${l.id}`, { data: { type: 'appStoreVersionLocalizations', id: l.id, attributes: { whatsNew: text } } });
  }
  console.log(commit ? '  nouveautés enregistrées' : '  nouveautés prêtes');
}

// ---- Build ----
const builds = (await api('GET', `/v1/builds?filter[app]=${app.id}&filter[preReleaseVersion.version]=${version}&sort=-uploadedDate&limit=5`)).data;
const build = builds.find((b) => b.attributes.processingState === 'VALID');
console.log(builds.length ? `Builds ${version} : ${builds.map((b) => `${b.attributes.version} ${b.attributes.processingState}`).join(', ')}` : `Aucun build ${version} (en cours de traitement ?)`);
if (v && build && commit) {
  await api('PATCH', `/v1/appStoreVersions/${v.id}/relationships/build`, { data: { type: 'builds', id: build.id } });
  console.log(`  build ${build.attributes.version} attaché`);
}

// ---- Soumission ----
if (commit && submit && v && build) {
  const sub = (await api('POST', '/v1/reviewSubmissions', {
    data: { type: 'reviewSubmissions', attributes: { platform: 'IOS' }, relationships: { app: { data: { type: 'apps', id: app.id } } } },
  })).data;
  await api('POST', '/v1/reviewSubmissionItems', {
    data: { type: 'reviewSubmissionItems', relationships: { reviewSubmission: { data: { type: 'reviewSubmissions', id: sub.id } }, appStoreVersion: { data: { type: 'appStoreVersions', id: v.id } } } },
  });
  const done = (await api('PATCH', `/v1/reviewSubmissions/${sub.id}`, { data: { type: 'reviewSubmissions', id: sub.id, attributes: { submitted: true } } })).data;
  console.log(`Soumise à la relecture : ${done.attributes.state}`);
} else if (!commit) {
  console.log('\nVérification seulement : --commit pour enregistrer, --submit pour soumettre.');
}
