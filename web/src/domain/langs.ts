/**
 * Langues de l'application. Pour chacune : la voix du dino (Piper), le pack de
 * reconnaissance vocale s'il en existe un léger (Vosk), la langue apprise en
 * plus (anglais, ou espagnol pour les anglophones), le pays par défaut, le sens
 * d'écriture. Logique pure, sans navigateur.
 */

export type Lang = 'fr' | 'en' | 'es' | 'it' | 'de' | 'pt' | 'ru' | 'zh' | 'hi' | 'ar' | 'ur' | 'bn' | 'id' | 'vi' | 'tr' | 'fa' | 'pl' | 'uk' | 'ne' | 'ko';

export interface LangInfo {
  code: Lang;
  /** Nom dans la langue elle-même (menu des parents). */
  name: string;
  /** Langue de la page et des voix du téléphone (BCP 47). */
  locale: string;
  dir: 'ltr' | 'rtl';
  /** Alphabet latin : les jeux de tracé des lettres y ont un sens. */
  latin: boolean;
  /** Voix Piper du dino. */
  voice: string;
  /** Pack Vosk léger ; sans pack, les jeux à voix haute sont désactivés dans cette langue. */
  asr?: { model: string; sizeMb: number };
  /** Langue apprise en plus (jeux « langue étrangère »). */
  second: Lang;
  /** Pays proposé par défaut (code ISO en minuscules). */
  country: string;
}

export const LANGS: LangInfo[] = [
  { code: 'fr', name: 'Français', locale: 'fr-FR', dir: 'ltr', latin: true, voice: 'fr_FR-upmc-medium',
    asr: { model: 'vosk-model-small-fr-0.22', sizeMb: 42.2 }, second: 'en', country: 'fr' },
  { code: 'en', name: 'English', locale: 'en-GB', dir: 'ltr', latin: true, voice: 'en_GB-alba-medium',
    asr: { model: 'vosk-model-small-en-us-0.15', sizeMb: 41.2 }, second: 'es', country: 'gb' },
  { code: 'es', name: 'Español', locale: 'es-ES', dir: 'ltr', latin: true, voice: 'es_MX-claude-high',
    asr: { model: 'vosk-model-small-es-0.42', sizeMb: 39.5 }, second: 'en', country: 'es' },
  { code: 'it', name: 'Italiano', locale: 'it-IT', dir: 'ltr', latin: true, voice: 'it_IT-paola-medium',
    asr: { model: 'vosk-model-small-it-0.22', sizeMb: 48.3 }, second: 'en', country: 'it' },
  { code: 'de', name: 'Deutsch', locale: 'de-DE', dir: 'ltr', latin: true, voice: 'de_DE-thorsten-medium',
    asr: { model: 'vosk-model-small-de-0.15', sizeMb: 45.3 }, second: 'en', country: 'de' },
  { code: 'pt', name: 'Português', locale: 'pt-BR', dir: 'ltr', latin: true, voice: 'pt_BR-faber-medium',
    asr: { model: 'vosk-model-small-pt-0.3', sizeMb: 31.4 }, second: 'en', country: 'br' },
  { code: 'ru', name: 'Русский', locale: 'ru-RU', dir: 'ltr', latin: false, voice: 'ru_RU-irina-medium',
    asr: { model: 'vosk-model-small-ru-0.22', sizeMb: 45.6 }, second: 'en', country: 'ru' },
  { code: 'zh', name: '中文', locale: 'zh-CN', dir: 'ltr', latin: false, voice: 'zh_CN-huayan-medium',
    asr: { model: 'vosk-model-small-cn-0.22', sizeMb: 42.3 }, second: 'en', country: 'cn' },
  { code: 'hi', name: 'हिन्दी', locale: 'hi-IN', dir: 'ltr', latin: false, voice: 'hi_IN-priyamvada-medium',
    asr: { model: 'vosk-model-small-hi-0.22', sizeMb: 42.0 }, second: 'en', country: 'in' },
  { code: 'ar', name: 'العربية', locale: 'ar', dir: 'rtl', latin: false, voice: 'ar_JO-kareem-medium', second: 'en', country: 'eg' },
  { code: 'ur', name: 'اردو', locale: 'ur-PK', dir: 'rtl', latin: false, voice: 'ur_PK-aegis_female-medium', second: 'en', country: 'pk' },
  { code: 'bn', name: 'বাংলা', locale: 'bn-BD', dir: 'ltr', latin: false, voice: 'bn_BD-google-medium', second: 'en', country: 'bd' },
  { code: 'id', name: 'Bahasa Indonesia', locale: 'id-ID', dir: 'ltr', latin: true, voice: 'id_ID-news_tts-medium', second: 'en', country: 'id' },
  { code: 'vi', name: 'Tiếng Việt', locale: 'vi-VN', dir: 'ltr', latin: true, voice: 'vi_VN-vais1000-medium',
    asr: { model: 'vosk-model-small-vn-0.4', sizeMb: 33.7 }, second: 'en', country: 'vn' },
  { code: 'tr', name: 'Türkçe', locale: 'tr-TR', dir: 'ltr', latin: true, voice: 'tr_TR-dfki-medium',
    asr: { model: 'vosk-model-small-tr-0.3', sizeMb: 36.9 }, second: 'en', country: 'tr' },
  { code: 'fa', name: 'فارسی', locale: 'fa-IR', dir: 'rtl', latin: false, voice: 'fa_IR-gyro-medium',
    asr: { model: 'vosk-model-small-fa-0.5', sizeMb: 62.2 }, second: 'en', country: 'ir' },
  { code: 'pl', name: 'Polski', locale: 'pl-PL', dir: 'ltr', latin: true, voice: 'pl_PL-gosia-medium',
    asr: { model: 'vosk-model-small-pl-0.22', sizeMb: 53.0 }, second: 'en', country: 'pl' },
  { code: 'uk', name: 'Українська', locale: 'uk-UA', dir: 'ltr', latin: false, voice: 'uk_UA-tetiana-high',
    asr: { model: 'vosk-model-small-uk-v3-nano', sizeMb: 77.6 }, second: 'en', country: 'ua' },
  { code: 'ko', name: '한국어', locale: 'ko-KR', dir: 'ltr', latin: false, voice: 'ko_KR-kss-medium',
    asr: { model: 'vosk-model-small-ko-0.22', sizeMb: 86.9 }, second: 'en', country: 'kr' },
  { code: 'ne', name: 'नेपाली', locale: 'ne-NP', dir: 'ltr', latin: false, voice: 'ne_NP-chitwan-medium', second: 'en', country: 'np' },
];

export const isLang = (code: string): code is Lang => LANGS.some((l) => l.code === code);
export const langInfo = (code: string): LangInfo => LANGS.find((l) => l.code === code) ?? LANGS[0];

/** Langue de l'appareil (« pt-BR » → pt), sinon le français. */
export function deviceLang(languages: readonly string[]): Lang {
  for (const tag of languages) {
    // « in » est l'ancien code de l'indonésien (encore donné par certains Android).
    const base = tag.toLowerCase().split(/[-_]/)[0].replace(/^in$/, 'id');
    if (isLang(base)) return base;
  }
  return 'fr';
}

/** Pays de l'appareil (« pt-BR » → br), s'il est indiqué. */
export function deviceCountry(languages: readonly string[]): string | undefined {
  for (const tag of languages) {
    const region = tag.split(/[-_]/)[1];
    if (region && /^[a-z]{2}$/i.test(region)) return region.toLowerCase();
  }
  return undefined;
}

/**
 * Fichiers des voix Piper (sans l'extension). Les deux premières viennent du miroir
 * déjà utilisé (voix déjà téléchargées gardées) ; les autres du dépôt officiel.
 */
const MIRROR = 'https://huggingface.co/diffusionstudio/piper-voices/resolve/main/';
const OFFICIAL = 'https://huggingface.co/rhasspy/piper-voices/resolve/main/';
const pathOf = (id: string) => {
  const [locale, name, quality] = id.split('-');
  return `${locale.split('_')[0]}/${locale}/${name}/${quality}/${id}`;
};
export const VOICE_URLS: Record<string, string> = Object.fromEntries([
  ...['fr_FR-upmc-medium', 'en_GB-alba-medium'].map((id) => [id, MIRROR + pathOf(id)]),
  ...LANGS.map((l) => l.voice).filter((id) => !['fr_FR-upmc-medium', 'en_GB-alba-medium'].includes(id))
    .map((id) => [id, OFFICIAL + pathOf(id)]),
]);

/** Tailles des voix, en Mo. */
export const VOICE_SIZES_MB: Record<string, number> = {
  'fr_FR-upmc-medium': 76.7, 'en_GB-alba-medium': 63.2, 'es_MX-claude-high': 63.1, 'it_IT-paola-medium': 63.5,
  'de_DE-thorsten-medium': 63.2, 'pt_BR-faber-medium': 63.2, 'ru_RU-irina-medium': 63.2, 'zh_CN-huayan-medium': 63.2,
  'hi_IN-priyamvada-medium': 63.5, 'ar_JO-kareem-medium': 63.2, 'ur_PK-aegis_female-medium': 63.5, 'bn_BD-google-medium': 76.8,
  'id_ID-news_tts-medium': 62.9, 'vi_VN-vais1000-medium': 63.2, 'tr_TR-dfki-medium': 63.2, 'fa_IR-gyro-medium': 63.1,
  'pl_PL-gosia-medium': 63.2, 'uk_UA-tetiana-high': 114.2,
  'ko_KR-kss-medium': 63.2, 'ne_NP-chitwan-medium': 63.2,
};
