/**
 * Téléchargements de l'application (voix du dino, voix anglaise, reconnaissance
 * vocale) : les langues, les tailles, et l'estimation du temps restant.
 * Logique pure, sans navigateur : testée à part.
 */

export type PackId = 'speech' | 'english' | 'asr';

export interface AppLanguage {
  code: string;
  name: string;
  /** Voix Piper du dino dans cette langue. */
  voice: string;
  /** Le jeu existe dans cette langue (textes, consignes, contenus). */
  available: boolean;
  /** Pack de reconnaissance vocale existant pour cette langue. */
  asr: boolean;
}

/** Langues de l'application. Seul le français a aujourd'hui tous ses contenus. */
export const LANGUAGES: AppLanguage[] = [
  { code: 'fr', name: 'Français', voice: 'fr_FR-upmc-medium', available: true, asr: true },
  { code: 'en', name: 'English', voice: 'en_GB-alba-medium', available: false, asr: true },
  { code: 'es', name: 'Español', voice: 'es_ES-davefx-medium', available: false, asr: false },
  { code: 'de', name: 'Deutsch', voice: 'de_DE-thorsten-medium', available: false, asr: false },
  { code: 'it', name: 'Italiano', voice: 'it_IT-paola-medium', available: false, asr: false },
];

export const languageOf = (code: string) => LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];

/** Voix des mots anglais (jeux d'anglais), quand l'application n'est pas en anglais. */
export const ENGLISH_VOICE = 'en_GB-alba-medium';

/** Tailles en Mo (fichiers téléchargés). */
export const SIZES_MB = {
  /** Moteur de voix Piper : calcul (onnxruntime) et prononciation (espeak), une seule fois pour toutes les voix. */
  engine: 29.5,
  voices: {
    'fr_FR-upmc-medium': 76.7,
    'en_GB-alba-medium': 63.2,
    'es_ES-davefx-medium': 63.2,
    'de_DE-thorsten-medium': 63.2,
    'it_IT-paola-medium': 63.5,
  } as Record<string, number>,
  /** Packs de reconnaissance vocale (Vosk). */
  asr: { fr: 42.2, en: 41.2 } as Record<string, number>,
};

export interface PackChoice {
  id: PackId;
  title: string;
  detail: string;
  sizeMb: number;
}

/**
 * Les packs proposés pour une langue. Le pack anglais n'existe que si
 * l'application n'est pas déjà en anglais ; la reconnaissance vocale comprend
 * l'anglais quand le pack anglais est choisi.
 */
export function packChoices(languageCode: string, englishChosen: boolean, engineInstalled = false): PackChoice[] {
  const lang = languageOf(languageCode);
  const out: PackChoice[] = [{
    id: 'speech',
    title: `Voix du dino (${lang.name.toLowerCase()})`,
    detail: 'Une voix naturelle, la même sur tous les appareils.',
    sizeMb: (engineInstalled ? 0 : SIZES_MB.engine) + (SIZES_MB.voices[lang.voice] ?? 0),
  }];
  if (lang.code !== 'en') {
    out.push({
      id: 'english',
      title: 'Voix anglaise',
      detail: 'Pour les mots des jeux d\'anglais.',
      sizeMb: SIZES_MB.voices[ENGLISH_VOICE],
    });
  }
  if (lang.asr) {
    const langs = asrLanguages(lang.code, englishChosen);
    out.push({
      id: 'asr',
      title: 'Reconnaissance vocale',
      detail: langs.length > 1 ? 'Pour répondre à voix haute (français et anglais).' : 'Pour répondre à voix haute.',
      sizeMb: langs.reduce((sum, l) => sum + (SIZES_MB.asr[l] ?? 0), 0),
    });
  }
  return out;
}

/** Langues de reconnaissance vocale à installer. */
export function asrLanguages(languageCode: string, englishChosen: boolean): string[] {
  const own = languageOf(languageCode).asr ? [languageCode] : [];
  return englishChosen && languageCode !== 'en' ? [...own, 'en'] : own;
}

/** Les jeux d'anglais n'ont de sens que si l'application n'est pas en anglais. */
export const englishGamesAllowed = (languageCode: string) => languageCode !== 'en';

// ---- Temps restant ----

/**
 * Débit lissé (octets par seconde) à partir de mesures successives
 * (instant en ms, octets reçus au total) : moyenne sur les dernières secondes,
 * pour un temps restant qui ne saute pas dans tous les sens.
 */
export function throughput(samples: readonly { at: number; bytes: number }[], windowMs = 6000): number {
  if (samples.length < 2) return 0;
  const last = samples[samples.length - 1];
  const first = samples.find((s) => s.at >= last.at - windowMs) ?? samples[0];
  const dt = (last.at - first.at) / 1000;
  return dt > 0 ? Math.max(0, (last.bytes - first.bytes) / dt) : 0;
}

/** Secondes restantes, ou undefined si on ne peut pas encore estimer. */
export function remainingSeconds(loaded: number, total: number, bytesPerSecond: number): number | undefined {
  if (total <= 0 || bytesPerSecond <= 0) return undefined;
  return Math.max(0, (total - loaded) / bytesPerSecond);
}

/** « ≈ 2 min 30 s », « ≈ 45 s », « quelques secondes ». */
export function formatRemaining(seconds: number | undefined): string {
  if (seconds === undefined) return 'calcul du temps restant…';
  if (seconds < 5) return 'quelques secondes';
  if (seconds < 60) return `≈ ${Math.round(seconds / 5) * 5} s`;
  const min = Math.floor(seconds / 60);
  const sec = Math.round((seconds % 60) / 10) * 10;
  if (min >= 60) return `≈ ${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')}`;
  return sec === 60 ? `≈ ${min + 1} min` : sec ? `≈ ${min} min ${sec} s` : `≈ ${min} min`;
}
