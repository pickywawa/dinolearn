/**
 * Téléchargements de l'application (voix du dino, voix de la langue apprise en
 * plus, reconnaissance vocale) : les tailles, et l'estimation du temps restant.
 * Logique pure, sans navigateur : testée à part.
 */
import { LANGS, Lang, VOICE_SIZES_MB, langInfo } from './langs';

/** speech : voix du dino ; second : voix de la langue apprise en plus ; asr : reconnaissance vocale. */
export type PackId = 'speech' | 'second' | 'asr';

/** Langues de l'application (voir `langs.ts`). */
export const LANGUAGES = LANGS.map((l) => ({ code: l.code, name: l.name, voice: l.voice, available: true, asr: !!l.asr }));
export const languageOf = (code: string) => langInfo(code);

/** Tailles en Mo (fichiers téléchargés). */
export const SIZES_MB = {
  /** Moteur de voix Piper : embarqué avec le jeu. */
  engine: 0,
  voices: VOICE_SIZES_MB,
  /** Packs de reconnaissance vocale (Vosk). */
  asr: Object.fromEntries(LANGS.filter((l) => l.asr).map((l) => [l.code, l.asr!.sizeMb])) as Record<string, number>,
};

export interface PackChoice {
  id: PackId;
  title: string;
  detail: string;
  sizeMb: number;
}

/** Langue apprise en plus : l'anglais, ou l'espagnol pour les anglophones. */
export const secondLanguage = (code: string): Lang => langInfo(code).second;

/** Textes des packs pour l'espace parents (traduits par l'appelant). */
export interface PackTexts {
  speech: (language: string) => string;
  speechDetail: string;
  second: (language: string) => string;
  secondDetail: string;
  asr: string;
  asrDetail: string;
}

const FR_TEXTS: PackTexts = {
  speech: (l) => `Voix du dino (${l})`,
  speechDetail: 'Une voix naturelle, la même sur tous les appareils.',
  second: (l) => `Voix ${l}`,
  secondDetail: 'Pour les mots des jeux de langue étrangère.',
  asr: 'Reconnaissance vocale',
  asrDetail: 'Pour répondre à voix haute.',
};

/**
 * Les packs proposés pour une langue : la voix du dino, la voix de la langue
 * apprise en plus, et la reconnaissance vocale (des deux langues) quand elle existe.
 */
export function packChoices(languageCode: string, secondChosen = true, _engineInstalled = true, texts = FR_TEXTS,
  nameOf: (code: string) => string = (c) => langInfo(c).name): PackChoice[] {
  const lang = langInfo(languageCode);
  const second = langInfo(lang.second);
  const out: PackChoice[] = [{
    id: 'speech', title: texts.speech(nameOf(lang.code)), detail: texts.speechDetail,
    sizeMb: SIZES_MB.voices[lang.voice] ?? 0,
  }, {
    id: 'second', title: texts.second(nameOf(second.code)), detail: texts.secondDetail,
    sizeMb: SIZES_MB.voices[second.voice] ?? 0,
  }];
  const langs = asrLanguages(lang.code, secondChosen);
  if (langs.length) {
    out.push({ id: 'asr', title: texts.asr, detail: texts.asrDetail, sizeMb: langs.reduce((sum, l) => sum + (SIZES_MB.asr[l] ?? 0), 0) });
  }
  return out;
}

/**
 * Langues de reconnaissance vocale à installer : celle de l'application (si un
 * pack existe) et, si le pack existe, celle apprise en plus.
 */
export function asrLanguages(languageCode: string, secondChosen = true): string[] {
  const lang = langInfo(languageCode);
  if (!lang.asr) return [];
  const second = langInfo(lang.second);
  return secondChosen && second.asr ? [lang.code, second.code] : [lang.code];
}

/** Toutes les langues ont des jeux de langue étrangère (anglais, ou espagnol pour les anglophones). */
export const englishGamesAllowed = (_languageCode: string) => true;

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
