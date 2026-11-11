import { VOICE_PACKS, ears, packInstalled, voiceSupported } from './ears';
import { downloads } from './packs';
import { SpeechLang } from '../domain/speech';

/**
 * Reconnaissance vocale à l'éclosion : le dino demande le prénom de l'enfant
 * si le pack français est installé, ou en cours d'installation (choisi dans la
 * fenêtre des téléchargements). Rien n'est téléchargé sans ce choix.
 */

/** Le pack est-il bien servi à côté du jeu ? (sinon certains serveurs renvoient la page du jeu à la place) */
export async function served(lang: SpeechLang): Promise<boolean> {
  try {
    const head = await fetch(VOICE_PACKS[lang].file, { method: 'HEAD' });
    return head.ok && !head.headers.get('content-type')?.includes('html');
  } catch {
    return false;
  }
}

/** Le moteur français, chargé (vrai) ou impossible (pas installé ni en cours d'installation). */
export async function loadFrench(): Promise<boolean> {
  if (!voiceSupported()) return false;
  if (!await packInstalled('fr')) {
    if (!downloads.asrPending) return false;
    await downloads.asrPending;
    if (!await packInstalled('fr')) return false;
  }
  return ears.load('fr').then(() => true, () => false);
}

/** Charge le moteur français en mémoire s'il est installé (l'œuf éclôt : le dino va bientôt demander le prénom). */
export async function preloadFrench(): Promise<void> {
  if (voiceSupported() && await packInstalled('fr')) await ears.load('fr').catch(() => undefined);
}
