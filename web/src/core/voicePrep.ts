import { app } from './app';
import { VOICE_PACKS, ears, packInstalled, storageRoom, voiceSupported } from './ears';
import { SpeechLang } from '../domain/speech';

/**
 * Les jeux à voix haute sont activés par défaut : dès l'ouverture du jeu, le
 * pack français se télécharge (une seule fois, puis il reste dans le
 * navigateur). Il sert au dino pour entendre le prénom de l'enfant quand il
 * sort de son œuf, puis aux jeux à voix haute. Le pack anglais suit, une fois
 * l'enfant installé (pour « Say it in English! », dès 5 ans).
 */

/** Note le pack comme prêt pour tous les enfants. */
function markInstalled(lang: SpeechLang) {
  for (const id of app.profiles.ids) {
    const child = app.profiles.progressOf(id);
    if (!child.settings.voicePacks.includes(lang)) child.updateSettings({ voicePacks: [...child.settings.voicePacks, lang] });
  }
}

let busy = false;

/** Le pack est-il bien servi à côté du jeu ? (sinon certains serveurs renvoient la page du jeu à la place) */
async function served(lang: SpeechLang): Promise<boolean> {
  try {
    const head = await fetch(new URL(VOICE_PACKS[lang].file, document.baseURI).href, { method: 'HEAD' });
    return head.ok && !head.headers.get('content-type')?.includes('html');
  } catch {
    return false;
  }
}

/** Le moteur français, chargé (vrai) ou impossible (pack absent, appareil incompatible). */
export async function loadFrench(): Promise<boolean> {
  if (!voiceSupported()) return false;
  if (!await packInstalled('fr') && (!await served('fr') || await storageRoom('fr') === 'full')) return false;
  return ears.load('fr').then(() => true, () => false);
}

/** Charge le moteur français en mémoire (l'œuf éclôt : le dino va bientôt demander le prénom). */
export async function preloadFrench(): Promise<void> {
  if (!voiceSupported()) return;
  if (await packInstalled('fr')) await ears.load('fr').catch(() => undefined);
  else if (await served('fr') && await storageRoom('fr') !== 'full') await ears.load('fr').catch(() => undefined);
}

async function ensure(lang: SpeechLang): Promise<boolean> {
  if (await packInstalled(lang)) {
    markInstalled(lang);
    return true;
  }
  if (!await served(lang)) return false;
  // Navigation privée (ou appareil plein) : pas de téléchargement voué à l'échec.
  if (await storageRoom(lang) === 'full') return false;
  await ears.install(lang);
  markInstalled(lang);
  return true;
}

/** Au démarrage : le pack français, téléchargé s'il manque. */
export function prepareVoiceAtStart() {
  if (!voiceSupported() || busy) return;
  busy = true;
  ensure('fr').catch(() => false).finally(() => { busy = false; });
}

/**
 * À l'accueil (rien n'écoute) : le pack anglais, si un enfant en a l'âge et
 * que le français est prêt. Le moteur ne garde qu'une langue en mémoire : le
 * français se rechargera depuis le navigateur au prochain jeu.
 */
export function prepareEnglishPack() {
  if (!voiceSupported() || busy) return;
  const children = app.profiles.ids.map((id) => app.profiles.progressOf(id));
  const wanted = children.some((c) => c.settings.voice && c.age >= 5 && c.settings.voicePacks.includes('fr')
    && !c.settings.voicePacks.includes('en'));
  if (!wanted) return;
  busy = true;
  ensure('en').catch(() => false).finally(() => { busy = false; });
}
