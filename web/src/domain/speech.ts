/**
 * Jeux à voix haute : ce que l'enfant doit dire, et la correction de ce que
 * la reconnaissance vocale a entendu. La reconnaissance ne choisit qu'entre
 * quelques mots (une « grammaire ») : la bonne réponse, des mauvaises réponses
 * plausibles et « [unk] » (un bruit, un mot inconnu). Elle est donc bien plus
 * fiable qu'une dictée libre, même avec une voix d'enfant.
 */

export type SpeechLang = 'fr' | 'en';

export interface SayTarget {
  lang: SpeechLang;
  /** Réponses acceptées (« chien », « pompière »…). */
  accept: string[];
  /** Mauvaises réponses plausibles : reconnues, elles comptent comme une erreur. */
  others: string[];
}

/** Ce que la reconnaissance a entendu (mots avec leur confiance, de 0 à 1). */
export interface Heard {
  text: string;
  words?: { word: string; conf: number }[];
}

export type Verdict =
  | { kind: 'correct' }
  | { kind: 'wrong'; heard: string }
  /** Rien de clair : on ne compte pas d'erreur, l'enfant recommence. */
  | { kind: 'unheard' };

/** Confiance minimale pour compter une bonne réponse, et (plus sévère) une erreur. */
export const MIN_CONF_CORRECT = 0.3;
export const MIN_CONF_WRONG = 0.6;

/** Petits mots que les enfants ajoutent (« c'est un chien ! ») : reconnus, puis ignorés. */
const FILLERS: Record<SpeechLang, string[]> = {
  fr: ['le', 'la', 'les', 'l\'', 'un', 'une', 'des', 'du', 'de', 'c\'est', 'est', 'euh', 'au', 'en'],
  en: ['the', 'a', 'an', 'it\'s', 'it', 'is', 'um'],
};

/** Minuscules, apostrophes droites, ponctuation retirée, espaces simples. */
export function normalize(text: string): string {
  return text.normalize('NFC').toLowerCase()
    .replace(/[’`]/g, '\'')
    .replace(/[^\p{L}\p{N}' -]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Mots d'une phrase, sans les petits mots ajoutés (articles, « c'est »). */
function tokens(text: string, lang: SpeechLang): string[] {
  const fillers = new Set(FILLERS[lang]);
  return normalize(text)
    // « l'oiseau » → « oiseau »
    .replace(/\b(l|d|c|qu)'/g, ' ')
    .split(' ')
    .filter((w) => w && w !== '[unk]' && !fillers.has(w));
}

/** Variante sans article au début (« le chien » → « chien », « l'oiseau » → « oiseau ») ; les mots du milieu restent. */
export function withoutArticle(phrase: string, lang: SpeechLang): string {
  const fillers = new Set(FILLERS[lang]);
  const words = normalize(phrase).split(' ').filter(Boolean);
  while (words.length > 1 && fillers.has(words[0])) words.shift();
  if (words.length) words[0] = words[0].replace(/^(l|d|c|qu)'/, '');
  return words.join(' ');
}

/** Toutes les formes d'une réponse : telle quelle et sans article ; les traits d'union aussi en espaces. */
function forms(phrase: string, lang: SpeechLang): string[] {
  const base = [normalize(phrase), withoutArticle(phrase, lang)];
  return [...new Set(base.flatMap((p) => (p.includes('-') ? [p, p.replace(/-/g, ' ')] : [p])))].filter(Boolean);
}

/**
 * Grammaire de la reconnaissance : réponses acceptées, autres réponses, petits
 * mots et « [unk] ». Avec le vocabulaire du modèle, on écarte les phrases
 * qu'il ne connaît pas (sinon il les ignore en silence).
 */
export function grammarFor(target: SayTarget, vocab?: Set<string>): string[] {
  const known = (p: string) => !vocab || p.split(' ').every((w) => vocab.has(w));
  const phrases = [...target.accept, ...target.others].flatMap((p) => forms(p, target.lang));
  const fillers = FILLERS[target.lang].filter((w) => !w.endsWith('\''));
  return [...new Set([...phrases, ...fillers])].filter(known).concat('[unk]');
}

/** Vrai si au moins une bonne réponse peut être reconnue avec ce vocabulaire. */
export function canRecognize(target: SayTarget, vocab?: Set<string>): boolean {
  if (!vocab) return true;
  return target.accept.some((p) => forms(p, target.lang).some((f) => f.split(' ').every((w) => vocab.has(w))));
}

/** Position de `phrase` (suite de mots) dans `words`, ou -1. */
function find(words: string[], phrase: string[]): number {
  if (phrase.length === 0) return -1;
  for (let i = 0; i + phrase.length <= words.length; i++) {
    if (phrase.every((w, k) => words[i + k] === w)) return i;
  }
  return -1;
}

/**
 * Correction : la bonne réponse entendue (même entourée d'autres mots, l'enfant
 * se reprend souvent) → bravo ; une autre réponse entendue nettement → erreur ;
 * sinon, on n'a pas bien entendu, et ce n'est pas compté.
 */
export function judge(heard: Heard, target: SayTarget): Verdict {
  const lang = target.lang;
  const words = tokens(heard.text.replace(/-/g, ' '), lang);
  if (words.length === 0) return { kind: 'unheard' };
  const confOf = (word: string) =>
    heard.words?.find((w) => tokens(w.word.replace(/-/g, ' '), lang).includes(word))?.conf ?? 1;
  const confident = (phrase: string[], min: number) => phrase.every((w) => confOf(w) >= min);
  const phrasesOf = (list: string[]) => list.map((p) => tokens(p.replace(/-/g, ' '), lang)).filter((p) => p.length > 0);

  const accepted = phrasesOf(target.accept);
  if (accepted.some((p) => find(words, p) >= 0 && confident(p, MIN_CONF_CORRECT))) return { kind: 'correct' };
  const acceptedText = new Set(accepted.map((p) => p.join(' ')));
  const other = target.others
    .map((phrase) => ({ phrase, words: tokens(phrase.replace(/-/g, ' '), lang) }))
    .filter((o) => o.words.length > 0 && !acceptedText.has(o.words.join(' ')))
    // La plus longue d'abord : « pomme de terre » plutôt que « pomme ».
    .sort((a, b) => b.words.length - a.words.length)
    .find((o) => find(words, o.words) >= 0 && confident(o.words, MIN_CONF_WRONG));
  return other ? { kind: 'wrong', heard: withoutArticle(other.phrase, lang) } : { kind: 'unheard' };
}

// ---- Présentation : le prénom et l'âge de l'enfant ----

const AGE_WORDS: Record<string, number> = {
  deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9,
  2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9,
};
/** Mots autour du prénom ou de l'âge (« je m'appelle Léa », « j'ai cinq ans »). */
const INTRO_FILLERS = ['je', 'm\'appelle', 'moi', 'c\'est', 'suis', 'j\'ai', 'ans', 'an', 'euh'];

/** Grammaire de l'âge : les nombres de deux à neuf. */
export const AGE_GRAMMAR = [...Object.keys(AGE_WORDS).filter((w) => !/\d/.test(w)), ...INTRO_FILLERS, '[unk]'];

/** Âge entendu (« cinq », « j'ai six ans »), ou undefined. */
export function findAge(heard: Heard): number | undefined {
  for (const word of normalize(heard.text).split(' ')) {
    if (AGE_WORDS[word] !== undefined) return AGE_WORDS[word];
  }
  return undefined;
}

/** Grammaire du prénom : les prénoms connus du modèle, et les petits mots autour. */
export function nameGrammar(names: string[], vocab?: Set<string>): string[] {
  const known = (w: string) => !vocab || vocab.has(w);
  return [...new Set([...names, ...INTRO_FILLERS])].filter(known).concat('[unk]');
}

/** Prénom entendu, avec ses majuscules (« Léa », « Pierre-Louis »), ou undefined si rien de sûr. */
export function findName(heard: Heard, names: string[]): string | undefined {
  const list = new Set(names);
  const word = heard.words?.length
    ? heard.words.find((w) => list.has(normalize(w.word)) && w.conf >= MIN_CONF_WRONG)?.word
    : normalize(heard.text).split(' ').find((w) => list.has(w));
  return word ? normalize(word).replace(/(^|-)(\p{L})/gu, (_, sep: string, c: string) => sep + c.toUpperCase()) : undefined;
}
