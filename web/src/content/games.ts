import { QuestionRef, Rng, mulberry32, shuffle } from '../domain/models';
import { SayTarget, SpeechLang } from '../domain/speech';
import {
  CATEGORY_HINTS, CONCEPTS, Concept, DistractorStrategy, Speech, conceptById, conceptsFor, frWithArticle, pickDistractors,
} from './content';
import { PAIRS, SIZES, SYLLABLES, enNumber } from './extra';
import { frNumber } from './numbers';
import { LETTER_LEVELS, LETTER_NAMES, LOOKALIKE_LETTERS, READ_WORDS, SYLLABLES_TO_READ } from './reading';
import { RIDDLES, excludedFor } from './riddles';
import { BANKNOTES, CELEBRATIONS, COUNTRIES, Country, FAR_FLAGS, FOREIGN_FOODS, OTHER_ANIMALS, currentCountry } from './countries';
import { SENTENCES } from './sentences';
import { STORIES } from './stories';
import { LETTER_MODELS, SHAPE_MODELS, TRACE_MODES, TraceMode, TraceModel, traceModel } from './tracing';
import { ONSETS, RHYMES } from './sounds';
import { VOICE_GAMES } from './voiceGames';

/** Une réponse possible : une image, un nombre (carte à points) ou un tas d'objets. */
export interface Choice {
  id: string;
  /** Clé de texture de l'image (public/img/<clé>.svg). */
  image?: string;
  /** Pour les cartes nombres (jeu « Combien ? »). */
  count?: number;
  /** Carte remplie de `count` fois la même image (jeu « Le plus »). */
  repeat?: { image: string; count: number };
  /** Carte nombre écrit en chiffres, sans points (niveau CP). */
  number?: number;
  /** Carte écrite (jeux de lecture) : en CAPITALES, en minuscules d'imprimerie ou en attaché. */
  text?: { value: string; script: Script };
  /** Forme colorée (jeu « Formes et couleurs »). */
  shape?: ShapeCard;
  /** Horloge à aiguilles (jeu « L'heure »). */
  clock?: { h: number; m: number };
  /** Pièces et billets, en centimes (jeu « La monnaie »). */
  money?: number[];
}

export interface ShapeCard {
  shape: string;
  /** Couleur (#rrggbb). */
  color: number;
  /** Petite forme (les autres sont grandes) — seulement quand la taille compte. */
  small?: boolean;
}

export type Script = 'caps' | 'lower' | 'cursive';

/** Ce qui est montré au-dessus des réponses. */
export type Show =
  /** Objets à compter (le premier groupe est celui qu'on compte, les autres sont mélangés). */
  | { kind: 'count'; groups: { image: string; count: number }[] }
  /** Ombre d'une image (jeu « Les ombres »). */
  | { kind: 'silhouette'; image: string }
  /** Suite d'images dont on cherche la suivante (null = « ? »). */
  | { kind: 'sequence'; images: (string | null)[] }
  /** Suite de nombres écrits (null = « ? »). */
  | { kind: 'numbers'; items: (number | null)[] }
  /** Une image seule (le mot dont on cherche la rime, le début…). */
  | { kind: 'image'; image: string }
  /** Un texte à lire (un mot, une phrase à trou). */
  | { kind: 'text'; value: string; script: Script }
  /** Memory (scène à part) : les images des paires, dites en français ou en anglais quand on les retourne. */
  | { kind: 'memory'; images: string[]; lang: 'fr' | 'en' }
  /** Un modèle à tracer avec le doigt (jeux de tracé, scène à part). */
  | { kind: 'trace'; model: string; mode: TraceMode }
  /**
   * Un calcul. Avec `image` : en images (a fruits, puis + b fruits, ou b fruits
   * barrés pour « − ») ; sans image : écrit en chiffres. `total` : « a + ? = total ».
   */
  | { kind: 'sum'; a: number; b: number; op: '+' | '-'; image?: string; total?: number };

/** Une question prête à jouer, sans la position de la bonne réponse. */
export interface BuiltQuestion {
  answer: Choice;
  distractors: Choice[];
  show?: Show;
  prompt: Speech[];
  reinforce: Speech[];
  /** Indices donnés quand c'est difficile (après une erreur, ou si l'enfant hésite). */
  hints?: Speech[];
  /** Jeu à voix haute : ce que l'enfant doit dire. Les cartes servent si le micro ne l'entend pas. */
  say?: SayTarget;
  /** Jeu à voix haute, quand on passe aux cartes : autre consigne, et `show` caché s'il donne la réponse. */
  fallback?: { prompt?: Speech[]; hideShow?: boolean };
  /** Consigne courte pour relancer ou après une erreur (la question sans toute l'histoire). */
  repeat?: Speech[];
  /** Jeu à voix haute : le dino dit la réponse et l'enfant la répète (après une erreur). */
  repeatAfterMe?: Speech[];
}

export interface GameDef {
  id: string;
  /** Catégorie de la spécification (île) : sert aussi au calcul de difficulté. */
  category: 'foreign_language' | 'world' | 'logic' | 'french' | 'writing';
  /** Jeu de tracé : il se joue dans sa propre scène (dans une série de la planète, le temps d'une question). */
  trace?: boolean;
  /** Memory : il se joue dans sa propre scène (dans une série de la planète, le temps d'un plateau). */
  memory?: boolean;
  /** Nombre de questions d'une série, s'il ne dépend pas de l'âge (un plateau de memory est long). */
  seriesLength?: number;
  /** Âge minimum de l'enfant pour que le jeu soit proposé (3 par défaut). */
  minAge?: number;
  /** Jeu à voix haute : langue du pack de reconnaissance vocale nécessaire. */
  voice?: SpeechLang;
  /** Image de la bulle du jeu. */
  icon: string;
  /** Couleur de la bulle et du décor. */
  color: number;
  introLine: string;
  /** Réplique du dino qui présente le jeu sur l'accueil. */
  homeLine: string;
  /** Annonce courte quand le jeu change, en mode « tout mélangé ». */
  shortLine: string;
  questions: QuestionRef[];
  build(ref: QuestionRef, level: number, rng: Rng): BuiltQuestion;
}

const conceptChoice = (c: Concept): Choice => ({ id: c.id, image: c.id });
/** Une formulation au hasard, pour que les consignes changent un peu. */
const oneOf = <T>(rng: Rng, variants: T[]): T => variants[Math.floor(rng() * variants.length)];
const idOf = (ref: QuestionRef) => ref.id.split(':')[1];

/** Leurres selon le niveau : autre famille → même famille → même sous-famille. */
const strategyFor = (level: number, sameGroupFrom: number, sameCategoryFrom: number): DistractorStrategy =>
  level >= sameCategoryFrom ? 'same_category' : level >= sameGroupFrom ? 'same_group' : 'other_group';

const riddleText = new Map(RIDDLES.map(([id, , text]) => [id, text]));
/** Concept d'une devinette (`whale~2` : deuxième devinette de la baleine). */
const riddleConcept = (riddleId: string) => conceptById(riddleId.split('~')[0]);

/** Indices d'une image : sa famille, puis sa devinette si elle en a une. */
function conceptHints(c: Concept): Speech[] {
  const hints: Speech[] = [{ text: `Indice : c'est ${CATEGORY_HINTS[c.category] ?? 'quelque chose'}.`, lang: 'fr' }];
  const riddle = riddleText.get(c.id);
  if (riddle) {
    hints.push({ text: `Indice : ${riddle.replace(/ ?Qui suis-je \?$/, '').replace(/^Qui /, 'qui ')}`, lang: 'fr' });
  }
  return hints;
}

/**
 * Une question par image, au niveau de l'image ; plus une variante « expert »
 * (identifiant terminé par `:x`) dix niveaux plus haut, pour les niveaux CP :
 * plus de cartes, et des leurres de la même sous-famille.
 */
function imageQuestions(gameId: string, levels: (c: Concept) => number | undefined): QuestionRef[] {
  const withLevel = CONCEPTS.filter((c) => levels(c) !== undefined);
  return [
    ...withLevel.map((c) => ({ id: `${gameId}:${c.id}`, level: levels(c)! })),
    ...withLevel.map((c) => ({ id: `${gameId}:${c.id}:x`, level: Math.min(20, levels(c)! + 10) })),
  ];
}

const isExpert = (ref: QuestionRef) => ref.id.endsWith(':x');

/** Leurres numériques tout proches de la réponse, tous différents et ≥ `min`. */
function nearNumbers(answer: number, count: number, rng: Rng, also: number[] = [], min = 0): number[] {
  const result: number[] = [];
  const add = (k: number) => {
    if (k >= min && k !== answer && !result.includes(k) && result.length < count) result.push(k);
  };
  shuffle(also, rng).forEach(add);
  for (const d of shuffle([1, -1, 2, -2], rng)) add(answer + d);
  for (let d = 3; result.length < count; d++) {
    add(answer + d);
    add(answer - d);
  }
  return result;
}

const numberChoice = (n: number): Choice => ({ id: `n${n}`, number: n });

// ---- Anglais : « Écoute et touche » ----

const listenTap: GameDef = {
  id: 'EN-1',
  category: 'foreign_language',
  minAge: 5,
  icon: 'flag-gb',
  color: 0x3b7de9,
  introLine: 'intro.EN-1',
  homeLine: 'home.EN-1',
  shortLine: 'short.EN-1',
  questions: imageQuestions('EN-1', (c) => c.levels['EN-1']),
  build(ref, level, rng) {
    const answer = conceptById(idOf(ref));
    // Plus facile : 2 images seulement, très différentes jusqu'au niveau 5.
    // Niveau CP (variante expert) : 4 images de la même sous-famille.
    const expert = isExpert(ref);
    const word: Speech = { text: answer.en.word, lang: 'en', slow: !expert, pauseAfter: 700 };
    return {
      answer: conceptChoice(answer),
      distractors: expert
        ? pickDistractors(answer, conceptsFor('EN-1'), 3, 'same_category', rng).map(conceptChoice)
        : pickDistractors(answer, conceptsFor('EN-1'), 1, strategyFor(level, 6, 9), rng).map(conceptChoice),
      // Le mot est dit deux fois, lentement.
      prompt: [word, { ...word, pauseAfter: undefined }],
      reinforce: [{ text: answer.en.word, lang: 'en', slow: true }, { text: `${frWithArticle(answer)} !`, lang: 'fr' }],
      hints: conceptHints(answer),
    };
  },
};

// ---- Monde : « Montre-moi » (leurres de la même sous-famille très tôt) ----

const showMe: GameDef = {
  id: 'MO-1',
  category: 'world',
  icon: 'ui-globe',
  color: 0x30a46c,
  introLine: 'intro.MO-1',
  homeLine: 'home.MO-1',
  shortLine: 'short.MO-1',
  questions: imageQuestions('MO-1', (c) => c.levels['MO-1']),
  build(ref, level, rng) {
    const answer = conceptById(idOf(ref));
    return {
      answer: conceptChoice(answer),
      // Niveau CP : 6 images de la même sous-famille.
      distractors: isExpert(ref)
        ? pickDistractors(answer, conceptsFor('MO-1'), 5, 'same_category', rng).map(conceptChoice)
        : pickDistractors(answer, conceptsFor('MO-1'), 3, strategyFor(level, 1, 2), rng).map(conceptChoice),
      prompt: [{
        text: oneOf(rng, [
          `Montre-moi ${frWithArticle(answer)} !`, `Où est ${frWithArticle(answer)} ?`, `Touche ${frWithArticle(answer)} !`,
          `Tu peux trouver ${frWithArticle(answer)} ?`, `Cherche ${frWithArticle(answer)} !`,
        ]),
        lang: 'fr',
      }],
      reinforce: [{ text: oneOf(rng, [`Oui, ${frWithArticle(answer)} !`, `C'est bien ${frWithArticle(answer)} !`]), lang: 'fr' }],
      hints: conceptHints(answer),
    };
  },
};

// ---- Monde : « Devinettes » ----

const riddlePool = CONCEPTS.filter((c) => c.group !== 'color');

const riddles: GameDef = {
  id: 'MO-2',
  category: 'world',
  icon: 'riddle',
  color: 0xe58a2b,
  introLine: 'intro.MO-2',
  homeLine: 'home.MO-2',
  shortLine: 'short.MO-2',
  questions: RIDDLES.map(([id, level]) => ({ id: `MO-2:${id}`, level })),
  build(ref, level, rng) {
    const answer = riddleConcept(idOf(ref));
    const text = riddleText.get(idOf(ref))!;
    const excluded = excludedFor(answer);
    const pool = riddlePool.filter((c) => !excluded(c));
    return {
      answer: conceptChoice(answer),
      // Niveau CP : 6 images dès le niveau 15.
      distractors: pickDistractors(answer, pool, level >= 15 ? 5 : 3, strategyFor(level, 3, 7), rng).map(conceptChoice),
      prompt: [{
        text: text.startsWith('Qui ')
          ? text
          : `${oneOf(rng, ['Devinette !', 'Écoute bien ma devinette.', 'Une devinette pour toi !', 'Devine !'])} ${text}`,
        lang: 'fr',
      }],
      reinforce: [{ text: `C'est ${frWithArticle(answer)} !`, lang: 'fr' }],
      hints: [{ text: `Indice : c'est ${CATEGORY_HINTS[answer.category] ?? 'quelque chose'}.`, lang: 'fr' }],
    };
  },
};

// ---- Logique : « L'intrus » ----

/** Nom des familles, pour expliquer la réponse (« les autres sont des fruits »). */
const FAMILY_NAMES: Record<string, string> = {
  farm: 'des animaux de la ferme', sea: 'des animaux de la mer', bird: 'des oiseaux',
  bug: 'des petites bêtes', wild: 'des animaux sauvages', forest: 'des animaux de la forêt',
  fruit: 'des fruits', veg: 'des légumes', meal: 'des plats et des gourmandises', vehicle: 'des véhicules',
  toy: 'des jouets', home: 'des objets de la maison', clothes: 'des vêtements', tool: 'des outils',
  kitchen: 'des objets de la salle de bain et de la cuisine', music: 'des instruments de musique',
  sky: 'des choses du ciel et de la météo', plant: 'des plantes', body: 'des parties du corps',
  landscape: 'des lieux', color: 'des couleurs',
};

/** Paires de sous-familles assez différentes pour un intrus sans ambiguïté. */
const CLOSE_PAIRS = [
  ['farm', 'sea'], ['farm', 'bug'], ['sea', 'bird'], ['sea', 'bug'], ['bird', 'bug'],
  ['wild', 'bug'], ['forest', 'sea'], ['fruit', 'veg'],
  ['vehicle', 'clothes'], ['vehicle', 'music'], ['clothes', 'tool'], ['music', 'clothes'],
  ['home', 'vehicle'], ['tool', 'music'], ['sky', 'plant'],
];

/**
 * Mots exclus de « L'intrus » parce qu'ils appartiennent à deux familles à la fois
 * (le pingouin est un oiseau qui vit dans la mer, la tomate est un fruit qu'on
 * croit légume, l'œuf vient de la ferme…).
 */
const ODD_EXCLUDED = new Set([
  'penguin', 'duck', 'swan', 'flamingo', 'seal', 'turtle', 'crocodile', 'frog', 'bat', 'dinosaur', 'mammoth',
  'snowman', 'egg', 'milk', 'cheese', 'honey', 'tomato', 'avocado', 'peanuts', 'house', 'sled', 'scooter',
  'skateboard', 'roller_skate', 'balloon', 'umbrella', 'anchor', 'island', 'tent', 'fire', 'drop', 'feather',
  'trophy', 'medal', 'ring', 'glasses', 'candle', 'light_bulb', 'flashlight', 'bucket', 'parachute',
  'satellite', 'rocket', 'worm', 'snail', 'mouse', 'llama', 'koala', 'polar_bear', 'cactus', 'leaf',
  'otter', 'beaver', 'sloth',
]);
const MIN_FAMILY = 4;

const families = () => {
  const byCategory = new Map<string, Concept[]>();
  for (const c of CONCEPTS) {
    if (c.group === 'color' || ODD_EXCLUDED.has(c.id)) continue;
    byCategory.set(c.category, [...(byCategory.get(c.category) ?? []), c]);
  }
  for (const [category, members] of byCategory) {
    if (members.length < MIN_FAMILY || !FAMILY_NAMES[category]) byCategory.delete(category);
  }
  return byCategory;
};

/**
 * Questions générées une fois pour toutes (graine fixe) : pour chaque famille,
 * des intrus faciles (autre grande famille, niveaux 1–4) et difficiles
 * (famille voisine, niveaux 5–10).
 */
function oddOneOutQuestions(): QuestionRef[] {
  const rng = mulberry32(42);
  const byCategory = families();
  const refs: QuestionRef[] = [];
  const candidates = CONCEPTS.filter((c) => c.group !== 'color' && !ODD_EXCLUDED.has(c.id));
  for (const [category, members] of byCategory) {
    const group = members[0].group;
    const far = shuffle(candidates.filter((c) => c.group !== group), rng).slice(0, 4);
    far.forEach((odd, i) => refs.push({ id: `LO-1:${odd.id}:${category}`, level: 1 + i }));
    const neighbours = CLOSE_PAIRS.filter((p) => p.includes(category)).map((p) => (p[0] === category ? p[1] : p[0]));
    const near = shuffle(neighbours.flatMap((n) => byCategory.get(n) ?? []), rng).slice(0, 6);
    near.forEach((odd, i) => refs.push({ id: `LO-1:${odd.id}:${category}`, level: 5 + i }));
    // Niveau CP : 5 images de la famille et un intrus d'une famille voisine.
    if (members.length >= 5 && neighbours.length > 0) {
      const expert = shuffle(neighbours.flatMap((n) => byCategory.get(n) ?? []), rng).slice(0, 10);
      expert.forEach((odd, i) => refs.push({ id: `LO-1:${odd.id}:${category}:x`, level: 11 + i }));
    }
  }
  return refs;
}

const oddOneOut: GameDef = {
  id: 'LO-1',
  category: 'logic',
  icon: 'oddoneout',
  color: 0x8e4ec6,
  introLine: 'intro.LO-1',
  homeLine: 'home.LO-1',
  shortLine: 'short.LO-1',
  questions: oddOneOutQuestions(),
  build(ref, _level, rng) {
    const [, oddId, category] = ref.id.split(':');
    const odd = conceptById(oddId);
    const members = shuffle(families().get(category)!.filter((c) => c.id !== odd.id), rng)
      .slice(0, isExpert(ref) ? 5 : 3);
    return {
      answer: conceptChoice(odd),
      distractors: members.map(conceptChoice),
      prompt: [{
        text: oneOf(rng, [
          'Trouve l\'intrus ! Lequel n\'est pas de la même famille ?',
          'Un intrus se cache ici. Lequel n\'est pas comme les autres ?',
          'Laquelle de ces images n\'est pas de la même famille ?',
        ]),
        lang: 'fr',
      }],
      reinforce: [{ text: `Oui, ${frWithArticle(odd)} ! Les autres sont ${FAMILY_NAMES[category]}.`, lang: 'fr' }],
      hints: [{
        text: `Indice : ${isExpert(ref) ? 'cinq' : 'trois'} images sont ${FAMILY_NAMES[category]}. Cherche celle qui n'en est pas.`,
        lang: 'fr',
      }],
    };
  },
};

// ---- Logique : « Combien ? » ----

/** Objets à compter : [image, singulier, pluriel, féminin]. */
const COUNTABLES: [string, string, string, boolean][] = [
  ['food-red-apple', 'pomme', 'pommes', true],
  ['food-banana', 'banane', 'bananes', true],
  ['food-strawberry', 'fraise', 'fraises', true],
  ['food-pear', 'poire', 'poires', true],
  ['food-lemon', 'citron', 'citrons', false],
  ['food-tangerine', 'orange', 'oranges', true],
  ['food-kiwi-fruit', 'kiwi', 'kiwis', false],
  ['food-peach', 'pêche', 'pêches', true],
];
/** Niveau d'une quantité : jusqu'à 3 au niveau 1, puis +1 par niveau ; de 11 à 20 au niveau CP. */
const countLevel = (n: number) => (n > 10 ? n : Math.max(1, n - 2));

const counting: GameDef = {
  id: 'LO-2',
  category: 'logic',
  icon: 'counting',
  color: 0x0f9bb5,
  introLine: 'intro.LO-2',
  homeLine: 'home.LO-2',
  shortLine: 'short.LO-2',
  questions: COUNTABLES.flatMap(([image]) =>
    Array.from({ length: 20 }, (_, i) => ({ id: `LO-2:${image}:${i + 1}`, level: countLevel(i + 1) }))),
  build(ref, level, rng) {
    const [, image, count] = ref.id.split(':');
    const n = Number(count);
    const [, singular, plural, feminine] = COUNTABLES.find(([img]) => img === image)!;
    // Aux niveaux difficiles, les autres nombres sont tout proches (n−1, n+1…).
    const spread = level >= 6 ? 1 : level >= 3 ? 2 : 3;
    const top = n > 10 ? 20 : 10;
    const candidates = shuffle(
      Array.from({ length: top }, (_, i) => i + 1).filter((k) => k !== n && Math.abs(k - n) <= spread * 2),
      rng,
    ).sort((a, b) => Math.abs(a - n) - Math.abs(b - n));
    const others = candidates.slice(0, 3);
    for (let k = 1; others.length < 3; k++) if (k !== n && !others.includes(k)) others.push(k);
    const name = n === 1 ? singular : plural;
    const howMany = n === 1 ? (feminine ? 'une' : 'un') : frNumber(n);
    const ofPlural = `${/^[aeiouyéèêh]/i.test(plural) ? 'd\'' : 'de '}${plural}`;
    // Niveaux difficiles : d'autres fruits sont mélangés, il ne faut compter que les bons.
    const groups = [{ image, count: n }];
    if (level >= 7) {
      const [other] = shuffle(COUNTABLES.filter(([img]) => img !== image), rng);
      groups.push({ image: other[0], count: 1 + Math.floor(rng() * 4) });
    }
    return {
      answer: { id: `n${n}`, count: n },
      distractors: others.map((k) => ({ id: `n${k}`, count: k })),
      show: { kind: 'count', groups },
      prompt: [{
        text: groups.length > 1
          ? `Combien y a-t-il ${ofPlural} ? Attention, compte seulement les ${plural} !`
          : oneOf(rng, [`Combien y a-t-il ${ofPlural} ? Compte bien !`, `Compte les ${plural}. Combien y en a-t-il ?`]),
        lang: 'fr',
      }],
      reinforce: [{
        text: `${Array.from({ length: n }, (_, i) => frNumber(i + 1)).join(', ')}. Il y a ${howMany} ${name} !`,
        lang: 'fr',
      }],
      hints: [{
        text: n > 10
          ? 'Indice : compte d\'abord jusqu\'à dix, puis continue : onze, douze, treize…'
          : 'Indice : touche chaque fruit avec ton doigt, en comptant tout doucement.',
        lang: 'fr',
      }],
    };
  },
};


// ---- Monde : « Les ombres » ----

const shadows: GameDef = {
  id: 'MO-3',
  category: 'world',
  icon: 'shadow',
  color: 0x5a5f7a,
  introLine: 'intro.MO-3',
  homeLine: 'home.MO-3',
  shortLine: 'short.MO-3',
  questions: imageQuestions('MO-3', (c) => (c.group === 'color' ? undefined : c.levels['MO-1'])),
  build(ref, level, rng) {
    const answer = conceptById(idOf(ref));
    return {
      answer: conceptChoice(answer),
      distractors: isExpert(ref)
        ? pickDistractors(answer, conceptsFor('MO-1'), 5, 'same_category', rng).map(conceptChoice)
        : pickDistractors(answer, conceptsFor('MO-1'), 3, strategyFor(level, 3, 6), rng).map(conceptChoice),
      show: { kind: 'silhouette', image: answer.id },
      prompt: [{
        text: oneOf(rng, ['À qui est cette ombre ? Touche la bonne image !', 'Qui se cache derrière cette ombre ?',
          'Regarde cette ombre. C\'est qui ?']),
        lang: 'fr',
      }],
      reinforce: [{ text: `Oui, c'est ${frWithArticle(answer)} !`, lang: 'fr' }],
      hints: conceptHints(answer),
    };
  },
};

// ---- Logique : « La suite » ----

/** Noms des fruits, pour lire la suite à voix haute. */
const FRUIT_NAMES: Record<string, string> = {
  'red-apple': 'pomme', banana: 'banane', strawberry: 'fraise', cherries: 'cerises', grapes: 'raisin',
  tangerine: 'orange', pear: 'poire', lemon: 'citron', watermelon: 'pastèque', peach: 'pêche',
  pineapple: 'ananas', 'kiwi-fruit': 'kiwi', mango: 'mangue', blueberries: 'myrtilles', melon: 'melon',
  'green-apple': 'pomme verte', coconut: 'noix de coco',
};
const FRUIT_KEYS = Object.keys(FRUIT_NAMES);

/** Motifs du plus simple au plus difficile (une lettre = un fruit). */
const PATTERNS: [string, number][] = [
  ['AB', 1], ['AAB', 3], ['ABB', 4], ['ABC', 5], ['AABB', 6], ['ABAC', 7], ['ABCD', 8], ['AABC', 9], ['ABCCB', 10],
];

/**
 * Suites de nombres (niveau CP, 11–20) : [nom, niveau, pas, départs].
 * Le pas 0 veut dire « on ajoute 1, puis 2, puis 3… ».
 */
const NUMBER_RULES: [string, number, number, number[]][] = [
  ['plus1', 11, 1, [3, 6, 9, 11, 12, 14, 15, 16]],
  ['minus1', 12, -1, [10, 12, 15, 18, 20, 9, 14, 17]],
  ['plus2', 13, 2, [0, 2, 4, 6, 8, 10, 12, 14]],
  ['odd', 14, 2, [1, 3, 5, 7, 9, 11, 13, 15]],
  ['plus10', 15, 10, [0, 10, 20, 30, 40, 3, 5, 12]],
  ['plus5', 16, 5, [0, 5, 10, 15, 20, 25, 30, 35]],
  ['minus2', 17, -2, [20, 18, 16, 14, 12, 19, 17, 15]],
  ['minus10', 18, -10, [100, 90, 80, 70, 95, 85, 63, 58]],
  ['plus3', 19, 3, [0, 1, 2, 3, 5, 6, 10, 12]],
  ['grow', 20, 0, [1, 2, 3, 5, 10, 0, 4, 6]],
];

/** Une suite de nombres : 4 nombres montrés, on cherche le cinquième. */
function buildNumberSequence(rule: string, variant: number, rng: Rng): BuiltQuestion {
  const [, , step, starts] = NUMBER_RULES.find(([name]) => name === rule)!;
  const seq = [starts[variant % starts.length]];
  for (let i = 1; i <= 4; i++) seq.push(seq[i - 1] + (step === 0 ? i : step));
  const answer = seq[4];
  const shown = seq.slice(0, 4);
  const said = shown.map(frNumber).join(', ');
  const delta = step === 0 ? 5 : step;
  const hint = step === 0
    ? 'on ajoute un, puis deux, puis trois… et après ?'
    : step > 0 ? `on ajoute ${frNumber(step)} à chaque fois.` : `on enlève ${frNumber(-step)} à chaque fois.`;
  return {
    answer: numberChoice(answer),
    distractors: nearNumbers(answer, 3, rng, [answer + delta, shown[3]], 0).map(numberChoice),
    show: { kind: 'numbers', items: [...shown, null] },
    prompt: [{ text: `Regarde et écoute : ${said}. Quel nombre vient après ?`, lang: 'fr' }],
    reinforce: [{ text: `Oui ! ${said}, ${frNumber(answer)} !`, lang: 'fr' }],
    hints: [{ text: `Indice : ${hint}`, lang: 'fr' }],
  };
}

const sequence: GameDef = {
  id: 'LO-3',
  category: 'logic',
  minAge: 4,
  icon: 'sequence',
  color: 0xd9467a,
  introLine: 'intro.LO-3',
  homeLine: 'home.LO-3',
  shortLine: 'short.LO-3',
  questions: [
    ...PATTERNS.flatMap(([pattern, level]) => Array.from({ length: 8 }, (_, i) =>
      ({ id: `LO-3:${pattern}:${i}`, level: Math.min(10, level + (i >= 6 ? 1 : 0)) }))),
    ...NUMBER_RULES.flatMap(([rule, level, , starts]) =>
      starts.map((_, i) => ({ id: `LO-3:n-${rule}:${i}`, level }))),
  ],
  build(ref, _level, rng) {
    const [, pattern, variant] = ref.id.split(':');
    if (pattern.startsWith('n-')) return buildNumberSequence(pattern.slice(2), Number(variant), rng);
    const letters = [...new Set(pattern)];
    const fruits = shuffle([...FRUIT_KEYS], rng);
    const fruitOf = Object.fromEntries(letters.map((l, i) => [l, fruits[i]]));
    // La suite fait 2 motifs complets (au moins 6 images), puis on cache l'image suivante.
    const length = Math.max(6, pattern.length * 2) + (Number(variant) % pattern.length);
    const seq = Array.from({ length: length + 1 }, (_, i) => fruitOf[pattern[i % pattern.length]]);
    const answer = seq[length];
    const others = shuffle(fruits.filter((f) => f !== answer).slice(0, 6), rng);
    const inPattern = Object.values(fruitOf).filter((f) => f !== answer);
    const distractors = [...new Set([...inPattern, ...others])].slice(0, 3);
    const choice = (f: string): Choice => ({ id: f, image: `food-${f}` });
    return {
      answer: choice(answer),
      distractors: distractors.map(choice),
      show: { kind: 'sequence', images: [...seq.slice(0, length).map((f) => `food-${f}`), null] },
      prompt: [{ text: oneOf(rng, ['Regarde bien la suite. Quel fruit vient après ?', 'Quel fruit continue la suite ?']), lang: 'fr' }],
      reinforce: [{ text: `Oui ! ${seq.slice(Math.max(0, length - 5)).map((f) => FRUIT_NAMES[f]).join(', ')} !`, lang: 'fr' }],
      hints: [{ text: `Indice : la suite recommence toujours pareil. ${seq.slice(0, pattern.length).map((f) => FRUIT_NAMES[f]).join(', ')}…`, lang: 'fr' }],
    };
  },
};

// ---- Logique : « Le plus, le moins » ----

/** Comparaison de nombres écrits (niveau CP, 11–20) : mode par niveau. */
const COMPARE_LEVELS: [number, 'most' | 'least'][] = [
  [11, 'most'], [12, 'most'], [13, 'least'], [14, 'most'], [15, 'least'],
  [16, 'most'], [17, 'least'], [18, 'most'], [19, 'least'], [20, 'most'], [20, 'least'],
];

/** Quatre nombres différents, de plus en plus grands et proches selon le niveau. */
function compareNumbers(level: number, rng: Rng): number[] {
  const pick = (min: number, max: number) => min + Math.floor(rng() * (max - min + 1));
  const numbers = new Set<number>();
  if (level >= 18) {
    // Nombres très proches : 67, 69, 71, 76…
    const base = pick(20, 85);
    while (numbers.size < 4) numbers.add(base + pick(0, 11));
    return [...numbers];
  }
  const [min, max] = level <= 11 ? [1, 10] : level <= 13 ? [1, 20] : level <= 15 ? [10, 50] : [10, 99];
  if (level >= 14) {
    // Le piège des chiffres inversés : 24 et 42.
    const tens = pick(1, Math.floor(max / 10) - 1);
    let units = pick(1, 9);
    if (units === tens) units = units === 9 ? 8 : units + 1;
    numbers.add(tens * 10 + units);
    if (units * 10 + tens <= max) numbers.add(units * 10 + tens);
  }
  while (numbers.size < 4) numbers.add(pick(min, max));
  return [...numbers];
}

function buildCompare(level: number, mode: 'most' | 'least', rng: Rng): BuiltQuestion {
  const numbers = shuffle(compareNumbers(level, rng), rng);
  const target = mode === 'least' ? Math.min(...numbers) : Math.max(...numbers);
  const what = mode === 'least' ? 'le plus petit' : 'le plus grand';
  return {
    answer: numberChoice(target),
    distractors: numbers.filter((k) => k !== target).map(numberChoice),
    prompt: [{ text: `Touche ${what} nombre !`, lang: 'fr' }],
    reinforce: [{ text: `Oui ! ${frNumber(target)}, c'est ${what} !`, lang: 'fr' }],
    hints: [{
      text: level >= 14
        ? 'Indice : regarde d\'abord le premier chiffre, celui des dizaines.'
        : `Indice : quand on compte, ${what === 'le plus grand' ? 'le plus grand vient en dernier' : 'le plus petit vient en premier'}.`,
      lang: 'fr',
    }],
  };
}

const most: GameDef = {
  id: 'LO-4',
  category: 'logic',
  icon: 'most',
  color: 0x2f8f6b,
  introLine: 'intro.LO-4',
  homeLine: 'home.LO-4',
  shortLine: 'short.LO-4',
  // Niveau : plus les tas sont proches (et grands), plus c'est difficile ; « le moins » dès le niveau 5.
  // Niveau CP : comparer des nombres écrits.
  questions: [
    ...COUNTABLES.flatMap(([image]) => Array.from({ length: 10 }, (_, i) => ({
      id: `LO-4:${image}:${i + 1}:${i + 1 >= 5 && i % 2 === 0 ? 'least' : 'most'}`, level: i + 1,
    }))),
    ...COMPARE_LEVELS.flatMap(([level, mode]) => Array.from({ length: 6 }, (_, i) => ({
      id: `LO-4:num:${level}:${mode}:${i}`, level,
    }))),
  ],
  build(ref, _level, rng) {
    const [, image, levelStr, mode] = ref.id.split(':');
    const level = Number(levelStr);
    if (image === 'num') return buildCompare(level, mode as 'most' | 'least', rng);
    const [, , plural] = COUNTABLES.find(([img]) => img === image)!;
    const gap = level <= 3 ? 3 : level <= 6 ? 2 : 1;
    const top = Math.min(10, 4 + Math.floor(level / 2) + gap);
    // Quatre tas tous différents, séparés d'au moins `gap`.
    const counts = [top];
    for (let k = top - gap; counts.length < 4 && k >= 1; k -= gap) counts.push(k);
    while (counts.length < 4) counts.push(Math.max(...counts) + gap);
    const ordered = shuffle([...counts], rng);
    const target = mode === 'least' ? Math.min(...counts) : Math.max(...counts);
    const pile = (k: number): Choice => ({ id: `p${k}`, repeat: { image, count: k } });
    const what = mode === 'least' ? 'le moins' : 'le plus';
    const ofPlural = `${/^[aeiouyéèêh]/i.test(plural) ? 'd\'' : 'de '}${plural}`;
    return {
      answer: pile(target),
      distractors: ordered.filter((k) => k !== target).map(pile),
      prompt: [{ text: `Où y a-t-il ${what} ${ofPlural} ? Touche la bonne carte !`, lang: 'fr' }],
      reinforce: [{ text: `Oui ! Ici, il y en a ${frNumber(target)}. C'est ${what} !`, lang: 'fr' }],
      hints: [{
        text: mode === 'least'
          ? 'Indice : cherche la carte où il y a très peu de fruits.'
          : 'Indice : cherche la carte la plus remplie.',
        lang: 'fr',
      }],
    };
  },
};

// ---- Logique : « Calcul » (additions et soustractions) ----

/**
 * Niveaux 1–10 : en images (« j'en ajoute », « Dino en mange »).
 * Niveaux 11–20 (CP) : calculs écrits, compléments à 10, passage de la dizaine.
 */
function calcQuestions(): QuestionRef[] {
  const refs: QuestionRef[] = [];
  const add = (kind: string, a: number, b: number, level: number) => refs.push({ id: `LO-5:${kind}:${a}:${b}`, level });
  for (let a = 1; a <= 9; a++) {
    for (let b = 1; a + b <= 10; b++) {
      const sum = a + b;
      add('p+', a, b, sum <= 3 ? 1 : sum <= 7 ? sum - 2 : 6);
      add('w+', a, b, sum <= 6 ? 11 : 12);
      if (a !== b && sum === 10) add('c', a, 10, 17);
    }
  }
  for (let a = 2; a <= 10; a++) {
    for (let b = 1; b < a; b++) {
      add('p-', a, b, a <= 3 ? 5 : a <= 5 ? 7 : a <= 7 ? 8 : b >= 4 ? 10 : 9);
      add('w-', a, b, a <= 6 ? 13 : 14);
    }
  }
  for (let a = 11; a <= 15; a++) for (let b = 1; b <= 4 && (a % 10) + b <= 9; b++) add('w+', a, b, 15);
  for (let a = 6; a <= 10; a++) add('w+', a, a, 16);
  for (let a = 13; a <= 19; a++) for (let b = 1; b <= a % 10 - 1 && b <= 5; b++) add('w-', a, b, 16);
  for (let a = 6; a <= 9; a++) {
    for (let b = 11 - a; b <= 9; b++) if (a !== b) add('w+', a, b, a + b <= 14 ? 18 : 19);
  }
  for (let a = 11; a <= 18; a++) for (let b = (a % 10) + 1; b <= 9; b++) add('w-', a, b, 20);
  return refs;
}

const calc: GameDef = {
  id: 'LO-5',
  category: 'logic',
  minAge: 5,
  icon: 'calc',
  color: 0xc2410c,
  introLine: 'intro.LO-5',
  homeLine: 'home.LO-5',
  shortLine: 'short.LO-5',
  questions: calcQuestions(),
  build(ref, _level, rng) {
    const [, kind, aStr, bStr] = ref.id.split(':');
    const a = Number(aStr);
    const b = Number(bStr);
    if (kind === 'c') {
      // Complément : a + ? = 10.
      const answer = b - a;
      return {
        answer: numberChoice(answer),
        distractors: nearNumbers(answer, 3, rng, [b, a], 1).map(numberChoice),
        show: { kind: 'sum', a, b: answer, op: '+', total: b },
        prompt: [{ text: `${frNumber(a)} plus combien, ça fait ${frNumber(b)} ?`, lang: 'fr' }],
        reinforce: [{ text: `Oui ! ${frNumber(a)} plus ${frNumber(answer)}, ça fait ${frNumber(b)} !`, lang: 'fr' }],
        hints: [{ text: `Indice : compte sur tes doigts, de ${frNumber(a)} jusqu'à ${frNumber(b)}.`, lang: 'fr' }],
      };
    }
    const plus = kind.endsWith('+');
    const answer = plus ? a + b : a - b;
    const words = `${frNumber(a)} ${plus ? 'plus' : 'moins'} ${frNumber(b)}`;
    const reinforce: Speech[] = [{ text: `Oui ! ${words}, ça fait ${frNumber(answer)} !`, lang: 'fr' }];
    if (kind.startsWith('p')) {
      // En images : on compte les fruits.
      const [image, singular, plural, feminine] = COUNTABLES[Math.floor(rng() * COUNTABLES.length)];
      const some = (n: number) => (n === 1 ? `${feminine ? 'une' : 'un'} ${singular}` : `${frNumber(n)} ${plural}`);
      const count = (n: number): Choice => ({ id: `n${n}`, count: n });
      return {
        answer: count(answer),
        distractors: nearNumbers(answer, 3, rng, [], plus ? 1 : 0).map(count),
        show: { kind: 'sum', a, b, op: plus ? '+' : '-', image },
        prompt: [{
          text: plus
            ? `Il y a ${some(a)}. J'en ajoute ${b === 1 ? (feminine ? 'une' : 'un') : frNumber(b)}. Combien y en a-t-il en tout ?`
            : `Il y a ${some(a)}. Dino en mange ${b === 1 ? (feminine ? 'une' : 'un') : frNumber(b)}. Combien en reste-t-il ?`,
          lang: 'fr',
        }],
        reinforce,
        hints: [{
          text: plus
            ? 'Indice : compte tous les fruits, ceux de gauche et ceux de droite.'
            : 'Indice : compte seulement les fruits qui ne sont pas barrés.',
          lang: 'fr',
        }],
      };
    }
    const [big, small] = plus && b > a ? [b, a] : [a, b];
    return {
      answer: numberChoice(answer),
      distractors: nearNumbers(answer, 3, rng, [plus ? Math.abs(a - b) : a + b], 0).map(numberChoice),
      show: { kind: 'sum', a, b, op: plus ? '+' : '-' },
      prompt: [{ text: oneOf(rng, [`Combien font ${words} ?`, `${words}, ça fait combien ?`]), lang: 'fr' }],
      reinforce,
      hints: [{
        text: plus
          ? `Indice : pars de ${frNumber(big)}, et avance de ${frNumber(small)} sur tes doigts.`
          : `Indice : pars de ${frNumber(a)}, et recule de ${frNumber(b)} sur tes doigts.`,
        lang: 'fr',
      }],
    };
  },
};

// ---- Français : « Les sons » (rimes et débuts de mots) ----

const rhymeOf = new Map(RHYMES.flatMap(([sound, ids]) => ids.map((id) => [id, sound] as const)));
const onsetOf = new Map(ONSETS.flatMap(([syllable, ids]) => ids.map((id) => [id, syllable] as const)));

/**
 * Pour chaque famille, chaque mot est posé une fois avec un autre mot de sa
 * famille comme réponse. Variante `:x` (CP) : les leurres sont piégeux (pour
 * une rime, ils commencent comme le mot ; pour un début, ils riment avec lui).
 */
function soundQuestions(): QuestionRef[] {
  const refs: QuestionRef[] = [];
  const families = (kind: 'rime' | 'debut', list: [string, string[]][], levelOf: (size: number, i: number) => number,
    expertLevel: (i: number) => number) => {
    let n = 0;
    for (const [, ids] of list) {
      ids.forEach((x, i) => {
        const y = ids[(i + 1) % ids.length];
        refs.push({ id: `FR-1:${kind}:${x}:${y}`, level: levelOf(ids.length, i) });
        refs.push({ id: `FR-1:${kind}:${x}:${y}:x`, level: expertLevel(n++) });
      });
    }
  };
  families('rime', RHYMES, (size, i) => (size >= 6 ? 2 + (i % 3) : size >= 4 ? 5 + (i % 3) : 8 + (i % 2)), (n) => 12 + (n % 5));
  families('debut', ONSETS, (size, i) => (size >= 6 ? 8 + (i % 3) : size >= 3 ? 11 + (i % 3) : 13 + (i % 2)), (n) => 16 + (n % 5));
  return refs;
}

const sounds: GameDef = {
  id: 'FR-1',
  category: 'french',
  minAge: 5,
  icon: 'flag-fr',
  color: 0xd93a4a,
  introLine: 'intro.FR-1',
  homeLine: 'home.FR-1',
  shortLine: 'short.FR-1',
  questions: soundQuestions(),
  build(ref, level, rng) {
    const [, kind, xId, yId] = ref.id.split(':');
    const x = conceptById(xId);
    const y = conceptById(yId);
    const rime = kind === 'rime';
    // Leurres sûrs : des mots d'autres familles connues de la même sorte.
    const same = rime ? rhymeOf : onsetOf;
    const other = rime ? onsetOf : rhymeOf;
    const pool = shuffle([...same.keys()].filter((id) => same.get(id) !== same.get(xId)), rng);
    const tricky = isExpert(ref)
      ? pool.filter((id) => other.has(xId) && other.get(id) === other.get(xId))
      : [];
    const seen = new Set([x.fr.word, y.fr.word]);
    const distractors: Concept[] = [];
    for (const id of [...tricky, ...pool]) {
      const c = conceptById(id);
      if (distractors.length >= (level >= 17 ? 5 : 3) || seen.has(c.fr.word)) continue;
      seen.add(c.fr.word);
      distractors.push(c);
    }
    const word = x.fr.word;
    return {
      answer: conceptChoice(y),
      distractors: distractors.map(conceptChoice),
      show: { kind: 'image', image: x.id },
      prompt: [{
        text: rime
          ? `Écoute bien : ${word}. Qu'est-ce qui rime avec ${word} ?`
          : `Écoute bien : ${word}. Qu'est-ce qui commence comme ${word} ?`,
        lang: 'fr',
      }],
      reinforce: [{ text: `Oui ! ${word}, ${y.fr.word} : ça ${rime ? 'finit' : 'commence'} pareil !`, lang: 'fr' }],
      hints: [{
        text: `Indice : dis chaque image tout doucement, et écoute bien ${rime ? 'la fin' : 'le début'}. ${word}…`,
        lang: 'fr',
      }],
    };
  },
};

// ---- Monde : « Ça va ensemble » ----

/** Tout ce qui va avec une image, dans une paire quelconque (avec les exclusions de cette paire). */
const partnersOf = (id: string) => PAIRS.flatMap(([a, b, , , extra]) =>
  (a === id || b === id ? [a, b, ...(extra ?? [])] : []));

const together: GameDef = {
  id: 'MO-4',
  category: 'world',
  icon: 'together',
  color: 0x0d8a8a,
  introLine: 'intro.MO-4',
  homeLine: 'home.MO-4',
  shortLine: 'short.MO-4',
  // Variante CP (`:x`) : 6 images, leurres de la même famille que la réponse.
  questions: PAIRS.flatMap(([a, b, level]) => [
    { id: `MO-4:${a}:${b}`, level },
    { id: `MO-4:${a}:${b}:x`, level: Math.min(20, level + 10) },
  ]),
  build(ref, level, rng) {
    const [, aId, bId] = ref.id.split(':');
    const a = conceptById(aId);
    const b = conceptById(bId);
    const [, , , why, extra] = PAIRS.find(([pa, pb]) => pa === aId && pb === bId)!;
    // Jamais de leurre qui pourrait aussi aller avec l'image (« cat:fruit » : toute une sous-famille).
    const banned = new Set([aId, bId, ...partnersOf(aId), ...partnersOf(bId)]);
    const bannedCategories = new Set((extra ?? []).filter((e) => e.startsWith('cat:')).map((e) => e.slice(4)));
    const pool = CONCEPTS.filter((c) => c.group !== 'color' && !banned.has(c.id) && !bannedCategories.has(c.category));
    const expert = isExpert(ref);
    return {
      answer: conceptChoice(b),
      distractors: pickDistractors(b, pool, expert ? 5 : 3, expert ? 'same_group' : strategyFor(level, 6, 12), rng)
        .map(conceptChoice),
      show: { kind: 'image', image: a.id },
      prompt: [{
        text: oneOf(rng, [
          `Qu'est-ce qui va avec ${frWithArticle(a)} ?`,
          `Regarde : ${frWithArticle(a)}. Qu'est-ce qui va avec ?`,
          `Trouve ce qui va bien avec ${frWithArticle(a)} !`,
        ]),
        lang: 'fr',
      }],
      reinforce: [{ text: `Oui ! ${why}`, lang: 'fr' }],
      hints: [{ text: `Indice : à quoi sert ${frWithArticle(a)} ? Qu'est-ce qu'on fait avec ?`, lang: 'fr' }],
    };
  },
};

// ---- Monde : « Le plus grand » (tailles réelles) ----

const sized = CONCEPTS.filter((c) => SIZES[c.id] !== undefined);

/** Écart minimum de taille entre la réponse et les autres, selon le niveau. */
const sizeRatio = (level: number) =>
  level <= 1 ? 20 : level <= 3 ? 10 : level <= 6 ? 5 : level <= 9 ? 3 : level <= 13 ? 2 : 1.5;

const bigger: GameDef = {
  id: 'MO-5',
  category: 'world',
  minAge: 4,
  icon: 'bigger',
  color: 0x7a5af8,
  introLine: 'intro.MO-5',
  homeLine: 'home.MO-5',
  shortLine: 'short.MO-5',
  questions: Array.from({ length: 20 }, (_, l) => Array.from({ length: 8 }, (_, i) => ({
    id: `MO-5:${l + 1}:${i}:${l + 1 >= 3 && i % 2 === 1 ? 'small' : 'big'}`, level: l + 1,
  }))).flat(),
  build(ref, _level, rng) {
    const [, levelStr, , mode] = ref.id.split(':');
    const level = Number(levelStr);
    const ratio = sizeRatio(level);
    const count = level >= 16 ? 5 : 3;
    const big = mode === 'big';
    for (let attempt = 0; ; attempt++) {
      const answer = sized[Math.floor(rng() * sized.length)];
      const size = SIZES[answer.id];
      // Niveau CP : seulement des animaux, ou seulement des objets.
      const sameKind = (c: Concept) => level < 11 || (c.group === 'animal') === (answer.group === 'animal');
      // Plus le niveau est haut, plus les autres sont proches de la réponse (mais toujours nettement différents).
      const spread = level >= 7 ? ratio * 6 : Infinity;
      const others = shuffle(sized.filter((c) => c.id !== answer.id && sameKind(c) && (big
        ? SIZES[c.id] * ratio <= size && SIZES[c.id] * spread >= size
        : SIZES[c.id] >= size * ratio && SIZES[c.id] <= size * spread)), rng);
      const seen = new Set([answer.fr.word]);
      const picked = others.filter((c) => !seen.has(c.fr.word) && seen.add(c.fr.word)).slice(0, count);
      if (picked.length < count && attempt < 200) continue;
      const what = big ? 'le plus grand' : 'le plus petit';
      return {
        answer: conceptChoice(answer),
        distractors: picked.map(conceptChoice),
        prompt: [{
          text: oneOf(rng, [`En vrai, lequel est ${what} ?`, `Qui est ${what}, en vrai ?`, `Touche ${what}, dans la vraie vie !`]),
          lang: 'fr',
        }],
        reinforce: [{ text: `Oui ! En vrai, ${frWithArticle(answer)}, c'est ${what} !`, lang: 'fr' }],
        hints: [{
          text: 'Indice : sur les images, ils ont tous la même taille. Imagine-les en vrai, à côté de toi !',
          lang: 'fr',
        }],
      };
    }
  },
};

// ---- Logique : « Les nombres » (reconnaître un nombre écrit) ----

const numberLevel = (n: number) =>
  n <= 3 ? 1 : n <= 5 ? 2 : n <= 7 ? 3 : n <= 10 ? 4 : n <= 12 ? 5 : n <= 16 ? 6 : n <= 20 ? 7 : n <= 29 ? 8
    : n <= 39 ? 9 : n <= 49 ? 10 : n <= 59 ? 11 : n <= 69 ? 12 : n <= 76 ? 14 : n <= 79 ? 15 : n <= 84 ? 16
      : n <= 89 ? 17 : n <= 94 ? 18 : n <= 99 ? 19 : 20;

/** Leurres d'un nombre : chiffres inversés (24/42), ±10, ±1… */
function numberLookalikes(n: number, count: number, rng: Rng, max: number): number[] {
  const tens = Math.floor(n / 10);
  const units = n % 10;
  const also = [n + 10, n - 10];
  if (n >= 10 && units !== 0 && units !== tens) also.unshift(units * 10 + tens);
  return nearNumbers(n, count, rng, also.filter((k) => k >= 1 && k <= max), 1);
}

const numbers: GameDef = {
  id: 'LO-6',
  category: 'logic',
  minAge: 4,
  icon: 'numbers',
  color: 0x2563eb,
  introLine: 'intro.LO-6',
  homeLine: 'home.LO-6',
  shortLine: 'short.LO-6',
  // Variante CP (`:x`) : 6 cartes, avec les chiffres inversés.
  questions: Array.from({ length: 100 }, (_, i) => i + 1).flatMap((n) => [
    { id: `LO-6:${n}`, level: numberLevel(n) },
    ...(n >= 12 ? [{ id: `LO-6:${n}:x`, level: Math.min(20, numberLevel(n) + 4) }] : []),
  ]),
  build(ref, _level, rng) {
    const n = Number(idOf(ref));
    const expert = isExpert(ref);
    const max = n <= 10 ? 10 : n <= 20 ? 20 : 100;
    const said = frNumber(n);
    return {
      answer: numberChoice(n),
      distractors: numberLookalikes(n, expert ? 5 : 3, rng, max).map(numberChoice),
      prompt: [{
        text: oneOf(rng, [`Touche le nombre ${said} !`, `Où est le nombre ${said} ?`, `Trouve ${said} !`]),
        lang: 'fr',
      }],
      reinforce: [{ text: `Oui ! Ça, c'est ${said} !`, lang: 'fr' }],
      hints: [{
        text: n >= 10
          ? 'Indice : regarde bien le premier chiffre, puis le deuxième.'
          : `Indice : compte sur tes doigts jusqu'à ${said}, et cherche ce chiffre.`,
        lang: 'fr',
      }],
    };
  },
};

// ---- Anglais : « Numbers » (les nombres en anglais) ----

const enNumberLevel = (n: number) =>
  n <= 3 ? 1 : n <= 5 ? 2 : n <= 7 ? 3 : n <= 10 ? 4 : n <= 12 ? 6 : n <= 15 ? 8 : n <= 19 ? 10
    : n % 10 === 0 ? 12 + Math.min(2, Math.floor(n / 40)) : n <= 29 ? 15 : 16 + (n % 5);

const englishNumbers: GameDef = {
  id: 'EN-2',
  category: 'foreign_language',
  minAge: 5,
  icon: 'en-numbers',
  color: 0x1d4ed8,
  introLine: 'intro.EN-2',
  homeLine: 'home.EN-2',
  shortLine: 'short.EN-2',
  // 1 à 20, les dizaines, puis des nombres choisis jusqu'à 99 ; « thirteen » / « thirty » se ressemblent !
  questions: [
    ...Array.from({ length: 20 }, (_, i) => i + 1),
    30, 40, 50, 60, 70, 80, 90, 100, 21, 25, 28, 34, 37, 43, 46, 52, 58, 61, 64, 69, 72, 75, 83, 86, 91, 97, 99,
  ].map((n) => ({ id: `EN-2:${n}`, level: enNumberLevel(n) })),
  build(ref, _level, rng) {
    const n = Number(idOf(ref));
    const word: Speech = { text: enNumber(n), lang: 'en', slow: true, pauseAfter: 600 };
    // Les « -teen » et les « -ty » se ressemblent : 13 et 30, 14 et 40…
    const twin = n >= 13 && n <= 19 ? (n - 10) * 10 : n >= 30 && n <= 90 && n % 10 === 0 ? n / 10 + 10 : undefined;
    const easy = enNumberLevel(n) <= 4;
    const choice = (k: number): Choice => (n <= 10 ? { id: `n${k}`, count: k } : numberChoice(k));
    return {
      answer: choice(n),
      distractors: nearNumbers(n, easy ? 2 : 3, rng, twin ? [twin] : [], 1).map(choice),
      prompt: [word, { ...word, pauseAfter: undefined }],
      reinforce: [{ text: enNumber(n), lang: 'en', slow: true }, { text: `${frNumber(n)} !`, lang: 'fr' }],
      hints: [{ text: `Indice : en français, on dit ${frNumber(n)}.`, lang: 'fr' }],
    };
  },
};

// ---- Français : « Les syllabes » ----

const syllablesOf = new Map(Object.entries(SYLLABLES).flatMap(([k, ids]) => ids.map((id) => [id, Number(k)] as const)));
const SYLLABLE_WORDS = ['', 'une', 'deux', 'trois', 'quatre'];

const syllables: GameDef = {
  id: 'FR-2',
  category: 'french',
  minAge: 5,
  icon: 'syllables',
  color: 0xb4236b,
  introLine: 'intro.FR-2',
  homeLine: 'home.FR-2',
  shortLine: 'short.FR-2',
  // Combien de syllabes dans ce mot ? Puis au niveau CP (`:x`) : quel mot a 3 syllabes ?
  questions: Object.entries(SYLLABLES).flatMap(([k, ids]) => ids.flatMap((id, i) => {
    const count = Number(k);
    const level = [0, 1 + (i % 3), 3 + (i % 4), 7 + (i % 5), 12 + (i % 4)][count];
    return [
      { id: `FR-2:${id}`, level },
      { id: `FR-2:${id}:x`, level: [0, 12, 13 + (i % 2), 15 + (i % 3), 18 + (i % 3)][count] },
    ];
  })),
  build(ref, _level, rng) {
    const target = conceptById(idOf(ref));
    const count = syllablesOf.get(target.id)!;
    const name = target.fr.word;
    if (!isExpert(ref)) {
      const card = (k: number): Choice => ({ id: `n${k}`, count: k });
      return {
        answer: card(count),
        distractors: [1, 2, 3, 4].filter((k) => k !== count).map(card),
        show: { kind: 'image', image: target.id },
        prompt: [{
          text: oneOf(rng, [
            `${name} ! Combien de syllabes ? Tape dans tes mains !`,
            `Tape dans tes mains en disant : ${name}. Combien de fois as-tu tapé ?`,
          ]),
          lang: 'fr',
        }],
        reinforce: [{ text: `Oui ! ${name} : ${SYLLABLE_WORDS[count]} syllabe${count > 1 ? 's' : ''} !`, lang: 'fr' }],
        hints: [{ text: `Indice : dis ${name} tout doucement, et tape une fois pour chaque morceau.`, lang: 'fr' }],
      };
    }
    // Variante CP : une image par nombre de syllabes, trouver celle qui en a `count`.
    const others = [1, 2, 3, 4].filter((k) => k !== count).map((k) => {
      const ids = SYLLABLES[k];
      return conceptById(ids[Math.floor(rng() * ids.length)]);
    });
    const label = `${SYLLABLE_WORDS[count]} syllabe${count > 1 ? 's' : ''}`;
    return {
      answer: conceptChoice(target),
      distractors: others.map(conceptChoice),
      show: { kind: 'numbers', items: [count] },
      prompt: [{ text: `Quel mot a ${label} ? Tape dans tes mains pour chaque image !`, lang: 'fr' }],
      reinforce: [{ text: `Oui ! ${name} : ${label} !`, lang: 'fr' }],
      hints: [{ text: 'Indice : dis le nom de chaque image en tapant dans tes mains, et compte les tapes.', lang: 'fr' }],
    };
  },
};

// ---- Français : « Lis le mot » (à partir de 5 ans) ----

const written = (value: string, script: Script): Choice => ({
  id: `t:${value}`,
  text: { value: script === 'caps' ? value.toLocaleUpperCase('fr-FR') : value, script },
});

/** Ressemblance visuelle de deux mots : même début, même fin, même longueur, lettres communes. */
function likeness(a: string, b: string): number {
  let score = (a[0] === b[0] ? 3 : 0) + (a[a.length - 1] === b[b.length - 1] ? 2 : 0) + (a.length === b.length ? 2 : 0);
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] === b[i]) score++;
  return score - Math.abs(a.length - b.length);
}

/** Leurres écrits : très différents aux premiers niveaux, puis de plus en plus ressemblants. */
function writtenDistractors(target: string, pool: string[], count: number, level: number, rng: Rng): string[] {
  const others = shuffle(pool.filter((w) => w !== target), rng);
  if (level <= 3) {
    // Faciles : un autre début et une autre longueur.
    const far = others.filter((w) => w[0] !== target[0] && w.length !== target.length);
    return [...far, ...others].filter((w, i, all) => all.indexOf(w) === i).slice(0, count);
  }
  const ranked = others.map((w) => ({ w, score: likeness(target, w) })).sort((x, y) => y.score - x.score);
  // Niveaux moyens : on pioche parmi les plus ressemblants ; niveau CP : les plus ressemblants.
  const top = ranked.slice(0, level >= 12 ? count : count * 3).map((x) => x.w);
  return shuffle(top, rng).slice(0, count);
}

const readWord: GameDef = {
  id: 'FR-3',
  category: 'french',
  minAge: 5,
  icon: 'read',
  color: 0x9a3412,
  introLine: 'intro.FR-3',
  homeLine: 'home.FR-3',
  shortLine: 'short.FR-3',
  // Chaque mot en CAPITALES, puis en attaché six niveaux plus haut.
  questions: READ_WORDS.flatMap(([word, , level]) => [
    { id: `FR-3:${word}:caps`, level },
    { id: `FR-3:${word}:cursive`, level: Math.min(20, level + 6) },
  ]),
  build(ref, _level, rng) {
    const [, word, script] = ref.id.split(':') as [string, string, Script];
    const [, conceptId] = READ_WORDS.find(([w]) => w === word)!;
    const count = ref.level <= 3 ? 2 : ref.level >= 16 ? 5 : 3;
    const pool = READ_WORDS.map(([w]) => w);
    return {
      answer: written(word, script),
      distractors: writtenDistractors(word, pool, count, ref.level, rng).map((w) => written(w, script)),
      show: conceptId ? { kind: 'image', image: conceptId } : undefined,
      prompt: [{
        text: oneOf(rng, [`Trouve le mot : ${word} !`, `Où est écrit ${word} ?`, `Lis bien, et touche le mot ${word}.`]),
        lang: 'fr',
      }],
      reinforce: [{ text: oneOf(rng, [`Oui ! Ici, c'est écrit ${word} !`, `Bravo, tu as lu ${word} !`]), lang: 'fr' }],
      hints: [{
        text: `Indice : ${word} commence par la lettre ${LETTER_NAMES[word[0].normalize('NFD')[0].toUpperCase()]}.`,
        lang: 'fr',
      }],
    };
  },
};

// ---- Français : « Les lettres » (lettres, puis syllabes) ----

const lookalikesOf = (letter: string) => LOOKALIKE_LETTERS.filter((g) => g.includes(letter)).join('').split(letter).join('');

const letters: GameDef = {
  id: 'FR-4',
  category: 'french',
  minAge: 5,
  icon: 'letters',
  color: 0x0e7490,
  introLine: 'intro.FR-4',
  homeLine: 'home.FR-4',
  shortLine: 'short.FR-4',
  // Lettres en CAPITALES (1–6), en minuscules (7–10) et en attaché (8–12) ; syllabes (8–20).
  questions: [
    ...LETTER_LEVELS.flatMap(([letter, level]) => [
      { id: `FR-4:L:${letter}:caps`, level },
      { id: `FR-4:L:${letter}:lower`, level: level + 4 },
      { id: `FR-4:L:${letter}:cursive`, level: level + 6 },
    ]),
    ...SYLLABLES_TO_READ.flatMap(([syllable, , level]) => [
      { id: `FR-4:S:${syllable}:caps`, level },
      { id: `FR-4:S:${syllable}:cursive`, level: Math.min(20, level + 4) },
    ]),
  ],
  build(ref, _level, rng) {
    const [, kind, value, script] = ref.id.split(':') as [string, 'L' | 'S', string, Script];
    if (kind === 'L') {
      // Lettres : au début des lettres au hasard, ensuite celles qui se ressemblent (b, d, p, q…).
      const all = LETTER_LEVELS.map(([l]) => l).filter((l) => l !== value);
      const near = script === 'caps' && ref.level <= 3 ? [] : shuffle([...lookalikesOf(value)], rng);
      const others = [...near, ...shuffle(all, rng)].filter((l, i, list) => list.indexOf(l) === i).slice(0, 3);
      const show = (l: string) => written(script === 'caps' ? l : l.toLowerCase(), script);
      const name = LETTER_NAMES[value];
      return {
        answer: show(value),
        distractors: others.map(show),
        prompt: [{ text: oneOf(rng, [`Touche la lettre ${name} !`, `Où est la lettre ${name} ?`]), lang: 'fr' }],
        reinforce: [{ text: `Oui ! C'est la lettre ${name} !`, lang: 'fr' }],
        hints: [{ text: 'Indice : regarde bien la forme de chaque lettre, elles se ressemblent !', lang: 'fr' }],
      };
    }
    const [, said] = SYLLABLES_TO_READ.find(([syl]) => syl === value)!;
    // Leurres : les syllabes qui se ressemblent le plus (MA / MO / AM…).
    const pool = SYLLABLES_TO_READ.map(([syl]) => syl);
    const reversed = value.length === 2 && /[aeiou]$/.test(value) ? [value[1] + value[0]] : [];
    const others = [...(ref.level >= 10 ? reversed : []),
      ...writtenDistractors(value, pool, 3, Math.max(ref.level, 12), rng)].slice(0, 3);
    return {
      answer: written(value, script),
      distractors: others.map((o) => written(o, script)),
      prompt: [{ text: oneOf(rng, [`Trouve la syllabe ${said} !`, `Où est écrit ${said} ?`]), lang: 'fr' }],
      reinforce: [{ text: `Oui ! Ça se lit ${said} !`, lang: 'fr' }],
      hints: [{
        text: `Indice : ${said}, ça commence par la lettre ${LETTER_NAMES[value[0].toUpperCase()]}.`,
        lang: 'fr',
      }],
    };
  },
};

// ---- Français : « Lis et touche l'image » (le mot est écrit, pas dit) ----

const readPicture: GameDef = {
  id: 'FR-5',
  category: 'french',
  minAge: 5,
  icon: 'read-picture',
  color: 0x6d28d9,
  introLine: 'intro.FR-5',
  homeLine: 'home.FR-5',
  shortLine: 'short.FR-5',
  // Seulement les mots illustrés ; en CAPITALES, puis en attaché.
  questions: READ_WORDS.filter(([, conceptId]) => conceptId).flatMap(([word, , level]) => [
    { id: `FR-5:${word}:caps`, level },
    { id: `FR-5:${word}:cursive`, level: Math.min(20, level + 6) },
  ]),
  build(ref, _level, rng) {
    const [, word, script] = ref.id.split(':') as [string, string, Script];
    const illustrated = READ_WORDS.filter(([, c]) => c);
    const answer = conceptById(illustrated.find(([w]) => w === word)![1]);
    const count = ref.level <= 3 ? 2 : ref.level >= 16 ? 5 : 3;
    // Leurres : des images dont le nom s'écrit presque pareil (il faut vraiment lire).
    const lookalikes = writtenDistractors(word, illustrated.map(([w]) => w), count, ref.level, rng)
      .map((w) => conceptById(illustrated.find(([x]) => x === w)![1]));
    return {
      answer: conceptChoice(answer),
      distractors: lookalikes.map(conceptChoice),
      show: { kind: 'text', value: script === 'caps' ? word.toLocaleUpperCase('fr-FR') : word, script },
      prompt: [{ text: oneOf(rng, ['Lis le mot, et touche la bonne image !', 'Qu\'est-ce qui est écrit ? Touche l\'image !']), lang: 'fr' }],
      reinforce: [{ text: `Oui ! C'est écrit ${word} !`, lang: 'fr' }],
      hints: [{
        text: `Indice : le mot commence par la lettre ${LETTER_NAMES[word[0].normalize('NFD')[0].toUpperCase()]}. `
          + 'Dis le nom de chaque image, et écoute si ça commence pareil.',
        lang: 'fr',
      }],
    };
  },
};

// ---- Français : « La phrase à trou » (images dès 3 ans, mots écrits dès 5 ans) ----

/** Réponse et leurres d'une phrase : jamais une image qui irait aussi dans la phrase. */
function sentenceQuestion(index: number, level: number, count: number, rng: Rng) {
  const [sentence, answerId, , extra] = SENTENCES[index];
  const answer = conceptById(answerId);
  const banned = new Set(extra ?? []);
  const pool = CONCEPTS.filter((c) => c.group !== 'color' && !banned.has(c.id) && !banned.has(`cat:${c.category}`));
  const distractors = pickDistractors(answer, pool, count, strategyFor(level, 7, 14), rng);
  const [before, after] = sentence.split('___');
  // Le dino dit la phrase avec un petit silence à la place du mot.
  const prompt: Speech[] = [
    // « l'… » ne se dit pas bien : on s'arrête avant l'article élidé.
    { text: `${before.trim().replace(/\s+(?:l'|d'|L')$/, '')}…`, lang: 'fr', pauseAfter: 450 },
    ...(after.trim().length > 1 ? [{ text: `…${after.trim()}`, lang: 'fr' as const, pauseAfter: 350 }] : []),
    { text: oneOf(rng, ['Quel mot manque ?', 'Qu\'est-ce qui manque ?', 'Trouve le mot qui manque !']), lang: 'fr' },
  ];
  const full = `${before}${answer.fr.word}${after}`.replace(/(\b(?:l'|d'))\s+/g, '$1');
  return { answer, distractors, prompt, full, sentence };
}

const SENTENCE_REFS = SENTENCES.map(([, answer, level], i) => ({ i, answer, level }));

const missingWord: GameDef = {
  id: 'FR-6',
  category: 'french',
  icon: 'missing-word',
  color: 0xea580c,
  introLine: 'intro.FR-6',
  homeLine: 'home.FR-6',
  shortLine: 'short.FR-6',
  questions: SENTENCE_REFS.map(({ i, answer, level }) => ({ id: `FR-6:${i}:${answer}`, level })),
  build(ref, level, rng) {
    const q = sentenceQuestion(Number(idOf(ref)), level, ref.level >= 16 ? 5 : ref.level <= 2 ? 2 : 3, rng);
    return {
      answer: conceptChoice(q.answer),
      distractors: q.distractors.map(conceptChoice),
      prompt: q.prompt,
      reinforce: [{ text: `Oui ! ${q.full}`, lang: 'fr' }],
      hints: conceptHints(q.answer),
    };
  },
};

// ---- Français : « Écoute l'histoire » (compréhension orale) ----

const storyPool = CONCEPTS.filter((c) => c.group !== 'color');
const storyChoice = (key: string): Choice => {
  const n = /^n(\d+)$/.exec(key);
  return n ? { id: key, count: Number(n[1]) } : conceptChoice(conceptById(key));
};

const listenStory: GameDef = {
  id: 'FR-8',
  category: 'french',
  icon: 'story',
  color: 0xc2410c,
  introLine: 'intro.FR-8',
  homeLine: 'home.FR-8',
  shortLine: 'short.FR-8',
  questions: STORIES.map(([level], i) => ({ id: `FR-8:${i}`, level })),
  build(ref, _level, rng) {
    const [level, lines, question, answer, traps, key] = STORIES[Number(idOf(ref))];
    // 3 images au début, 4 ensuite, 6 au niveau CP ; d'abord les pièges (des choses entendues dans l'histoire).
    const count = level <= 2 ? 2 : level >= 15 ? 5 : 3;
    const keys = shuffle(traps.filter((t) => t !== answer), rng).slice(0, count);
    const number = /^n(\d+)$/.exec(answer);
    if (number) {
      for (const k of shuffle([1, 2, 3, 4, 5, 6], rng)) {
        if (keys.length >= count) break;
        if (`n${k}` !== answer && !keys.includes(`n${k}`)) keys.push(`n${k}`);
      }
    } else {
      const used = new Set([answer, ...keys].flatMap((k) => (/^n\d/.test(k) ? [] : [conceptById(k).fr.word])));
      const fill = pickDistractors(conceptById(answer), storyPool, 12, 'same_group', rng)
        .filter((c) => !used.has(c.fr.word));
      for (const c of fill) {
        if (keys.length >= count) break;
        keys.push(c.id);
      }
    }
    return {
      answer: storyChoice(answer),
      distractors: keys.map(storyChoice),
      // L'histoire, phrase par phrase, puis la question.
      prompt: [
        ...lines.map((text): Speech => ({ text, lang: 'fr', pauseAfter: 550 })),
        { text: question, lang: 'fr' },
      ],
      repeat: [{ text: question, lang: 'fr' }],
      reinforce: [{ text: number ? `Oui, ${frNumber(Number(number[1]))} !` : `Oui ! ${lines[key]}`, lang: 'fr' }],
      hints: [{ text: `Indice : écoute encore cette phrase. ${lines[key]}`, lang: 'fr' }],
    };
  },
};

const missingWordRead: GameDef = {
  id: 'FR-7',
  category: 'french',
  minAge: 5,
  icon: 'missing-word-read',
  color: 0x0f766e,
  introLine: 'intro.FR-7',
  homeLine: 'home.FR-7',
  shortLine: 'short.FR-7',
  // Même phrases, mais les réponses sont des mots écrits : il faut les lire.
  questions: SENTENCE_REFS.map(({ i, answer, level }) => ({ id: `FR-7:${i}:${answer}`, level: Math.min(20, level + 1) })),
  build(ref, level, rng) {
    const q = sentenceQuestion(Number(idOf(ref)), level, ref.level >= 16 ? 5 : 3, rng);
    const script: Script = ref.level >= 12 ? 'lower' : 'caps';
    const word = (c: Concept) => written(c.fr.word, script);
    return {
      answer: word(q.answer),
      distractors: q.distractors.map(word),
      show: { kind: 'text', value: q.sentence.replace('___', '……'), script: 'lower' },
      prompt: q.prompt,
      reinforce: [{ text: `Oui ! ${q.full}`, lang: 'fr' }],
      hints: [{
        text: `Indice : le mot commence par la lettre ${LETTER_NAMES[q.answer.fr.word[0].normalize('NFD')[0].toUpperCase()]}.`,
        lang: 'fr',
      }],
    };
  },
};

// ---- Logique : « Formes et couleurs » ----

/** Formes : [id, nom, féminin, niveau d'apparition]. */
const SHAPES: [string, string, boolean, number][] = [
  ['circle', 'rond', false, 1], ['square', 'carré', false, 1], ['triangle', 'triangle', false, 1],
  ['star', 'étoile', true, 1], ['heart', 'cœur', false, 1],
  ['rectangle', 'rectangle', false, 11], ['diamond', 'losange', false, 11], ['oval', 'ovale', false, 11],
  ['hexagon', 'hexagone', false, 12], ['cross', 'croix', true, 12],
];
/** Couleurs : [couleur, masculin, féminin]. */
const COLORS: [number, string, string][] = [
  [0xe5484d, 'rouge', 'rouge'], [0x2f6fde, 'bleu', 'bleue'], [0x30a46c, 'vert', 'verte'],
  [0xf5c518, 'jaune', 'jaune'], [0xf28c28, 'orange', 'orange'], [0x8e4ec6, 'violet', 'violette'],
  [0xf27aa6, 'rose', 'rose'],
];

function shapeWords(card: ShapeCard, withSize: boolean): string {
  const [, name, fem] = SHAPES.find(([id]) => id === card.shape)!;
  const color = COLORS.find(([c]) => c === card.color)!;
  const adj = fem ? color[2] : color[1];
  if (withSize) {
    const size = card.small ? (fem ? 'petite' : 'petit') : (fem ? 'grande' : 'grand');
    return `${fem ? 'la' : 'le'} ${size} ${name} ${adj}`;
  }
  const article = /^[aeiouéh]/.test(name) ? 'l\'' : fem ? 'la ' : 'le ';
  return `${article}${name} ${adj}`;
}

const shapeChoice = (card: ShapeCard): Choice =>
  ({ id: `s:${card.shape}:${card.color}:${card.small ? 's' : 'b'}`, shape: card });

/** Génère une question « Formes et couleurs » selon le niveau. */
function buildShapes(level: number, rng: Rng): BuiltQuestion {
  const shapes = SHAPES.filter(([, , , from]) => from <= Math.max(level, 1)).map(([id]) => id);
  const pick = <T>(list: T[]) => list[Math.floor(rng() * list.length)];
  const colors = COLORS.map(([c]) => c);
  const count = level >= 18 ? 6 : level <= 2 ? 3 : 4;
  const key = (c: ShapeCard) => `${c.shape}:${c.color}:${!!c.small}`;
  const fill = (cards: ShapeCard[], make: () => ShapeCard, ok: (c: ShapeCard) => boolean) => {
    for (let guard = 0; cards.length < count && guard < 500; guard++) {
      const c = make();
      if (ok(c) && !cards.some((x) => key(x) === key(c))) cards.push(c);
    }
    return cards;
  };
  const answer: ShapeCard = { shape: pick(shapes), color: pick(colors) };
  let cards: ShapeCard[] = [answer];
  let prompt: string;
  let said: string;

  if (level <= 1 || level === 3) {
    // La forme seulement (au niveau 3, toutes de la même couleur).
    const sameColor = level === 3;
    const used = new Set([answer.shape]);
    cards = fill(cards, () => ({ shape: pick(shapes), color: sameColor ? answer.color : pick(colors) }), (c) => {
      if (used.has(c.shape)) return false;
      used.add(c.shape);
      return true;
    });
    const [, name, fem] = SHAPES.find(([id]) => id === answer.shape)!;
    said = `${/^[aeiouéh]/.test(name) ? 'l\'' : fem ? 'la ' : 'le '}${name}`;
    prompt = `Touche ${said} !`;
  } else if (level === 2 || level === 4) {
    // La couleur seulement (au niveau 4, toutes de la même forme).
    const sameShape = level === 4;
    const used = new Set([answer.color]);
    cards = fill(cards, () => ({ shape: sameShape ? answer.shape : pick(shapes), color: pick(colors) }), (c) => {
      if (used.has(c.color)) return false;
      used.add(c.color);
      return true;
    });
    said = `la forme ${COLORS.find(([c]) => c === answer.color)![2]}`;
    prompt = `Touche ${said} !`;
  } else if (level <= 13 || level >= 18) {
    // Forme + couleur. Dès le niveau 8, des pièges : même forme autre couleur, même couleur autre forme.
    const withSize = level >= 18;
    if (withSize) answer.small = rng() < 0.5;
    if (level >= 8) {
      cards.push({ shape: answer.shape, color: pick(colors.filter((c) => c !== answer.color)), small: withSize ? answer.small : undefined });
      cards.push({ shape: pick(shapes.filter((s) => s !== answer.shape)), color: answer.color, small: withSize ? answer.small : undefined });
      if (withSize) cards.push({ shape: answer.shape, color: answer.color, small: !answer.small });
    }
    cards = fill(cards, () => ({ shape: pick(shapes), color: pick(colors), small: withSize ? rng() < 0.5 : undefined }),
      (c) => level >= 8 || (c.shape !== answer.shape && c.color !== answer.color));
    said = shapeWords(answer, withSize);
    prompt = `Touche ${said} !`;
  } else if (level <= 15) {
    // La taille compte : « le petit cœur rouge ».
    answer.small = rng() < 0.5;
    cards.push({ ...answer, small: !answer.small });
    cards.push({ shape: answer.shape, color: pick(colors.filter((c) => c !== answer.color)), small: answer.small });
    cards = fill(cards, () => ({ shape: pick(shapes), color: pick(colors), small: rng() < 0.5 }), () => true);
    said = shapeWords(answer, true);
    prompt = `Touche ${said} !`;
  } else {
    // « Le carré qui n'est pas bleu » : une seule forme de ce type n'a pas cette couleur.
    const [, name, fem] = SHAPES.find(([id]) => id === answer.shape)!;
    const notColor = pick(colors.filter((c) => c !== answer.color));
    const colorName = COLORS.find(([c]) => c === notColor)!;
    cards.push({ shape: answer.shape, color: notColor, small: false });
    cards.push({ shape: answer.shape, color: notColor, small: true });
    cards = fill(cards, () => ({ shape: pick(shapes.filter((x) => x !== answer.shape)), color: pick(colors) }), () => true);
    said = `${fem ? 'la' : 'le'} ${name} qui n'est pas ${fem ? colorName[2] : colorName[1]}`;
    prompt = `Attention ! Touche ${said} !`;
  }
  const [first, ...rest] = cards.map(shapeChoice);
  return {
    answer: first,
    distractors: rest,
    prompt: [{ text: prompt, lang: 'fr' }],
    reinforce: [{ text: `Oui ! ${said.charAt(0).toUpperCase()}${said.slice(1)} !`, lang: 'fr' }],
    hints: [{ text: 'Indice : cherche d\'abord la bonne couleur, puis regarde bien la forme.', lang: 'fr' }],
  };
}

const shapesGame: GameDef = {
  id: 'LO-7',
  category: 'logic',
  icon: 'shapes',
  color: 0xdb2777,
  introLine: 'intro.LO-7',
  homeLine: 'home.LO-7',
  shortLine: 'short.LO-7',
  questions: Array.from({ length: 20 }, (_, l) =>
    Array.from({ length: 8 }, (_, i) => ({ id: `LO-7:${l + 1}:${i}`, level: l + 1 }))).flat(),
  build(ref, _level, rng) {
    return buildShapes(ref.level, rng);
  },
};

// ---- Logique : « L'heure » (horloges à aiguilles) ----

const hourName = (h: number) => (h === 1 ? 'une heure' : h === 12 ? 'midi' : `${frNumber(h)} heures`);

/** L'heure dite comme à l'école : « trois heures et demie », « quatre heures moins le quart »… */
export function sayTime(h: number, m: number, afternoon = false): string {
  if (afternoon) {
    const hh = h === 12 ? 12 : h + 12;
    return `${frNumber(hh)} heures${m ? ` ${frNumber(m)}` : ''}`;
  }
  if (m === 0) return hourName(h);
  if (m === 15) return `${hourName(h)} et quart`;
  if (m === 30) return `${hourName(h)} et demie`;
  if (m === 45) return `${hourName((h % 12) + 1)} moins le quart`;
  return `${hourName(h)} ${frNumber(m)}`;
}

function buildClock(level: number, variant: number, rng: Rng): BuiltQuestion {
  const pick = <T>(list: T[]) => list[Math.floor(rng() * list.length)];
  const minutes = level <= 4 ? [0] : level <= 8 ? [0, 30] : level <= 12 ? [0, 15, 30, 45]
    : Array.from({ length: 12 }, (_, i) => i * 5);
  const h = 1 + Math.floor(rng() * 12);
  // Aux niveaux des demies et des quarts, la moitié des questions en ont une.
  const m = level >= 5 && level <= 12 && variant % 2 === 1 ? pick(minutes.filter((x) => x !== 0)) : pick(minutes);
  const afternoon = level >= 18 && variant % 2 === 0;
  const count = level <= 2 ? 2 : level >= 17 ? 5 : 3;
  const key = (a: number, b: number) => `${a}:${b}`;
  const seen = new Set([key(h, m)]);
  const others: { h: number; m: number }[] = [];
  const add = (a: number, b: number) => {
    const hh = ((a - 1 + 12) % 12) + 1;
    if (others.length < count && !seen.has(key(hh, b))) {
      seen.add(key(hh, b));
      others.push({ h: hh, m: b });
    }
  };
  if (level <= 3) {
    // Faciles : des heures très différentes.
    for (const d of shuffle([3, 4, 5, 6, 7, 8, 9], rng)) add(h + d, m);
  } else {
    if (level >= 9) {
      // Pièges : aiguilles inversées, même heure autres minutes, heure d'à côté.
      add(m === 0 ? 12 : m / 5, (h % 12) * 5);
      add(h, pick(minutes.filter((x) => x !== m)));
      add(h + 1, m);
    }
    for (const d of shuffle([1, -1, 2, -2], rng)) add(h + d, m);
    if (minutes.length > 1) add(h, pick(minutes.filter((x) => x !== m)));
  }
  for (let guard = 0; others.length < count && guard < 50; guard++) add(1 + Math.floor(rng() * 12), pick(minutes));
  const said = sayTime(h, m, afternoon);
  const choice = (c: { h: number; m: number }): Choice => ({ id: `c:${c.h}:${c.m}`, clock: c });
  return {
    answer: choice({ h, m }),
    distractors: others.map(choice),
    prompt: [{ text: oneOf(rng, [`Touche l'horloge qui montre ${said} !`, `Où est-il ${said} ?`]), lang: 'fr' }],
    reinforce: [{ text: `Oui ! Il est ${said} !`, lang: 'fr' }],
    hints: [{
      text: afternoon
        ? `Indice : ${frNumber(h + 12)} heures, c'est l'après-midi. Sur l'horloge, la petite aiguille montre le ${frNumber(h)}.`
        : level <= 8
          ? 'Indice : la petite aiguille montre l\'heure, la grande aiguille montre les minutes.'
          : 'Indice : regarde d\'abord la petite aiguille pour l\'heure, puis la grande pour les minutes.',
      lang: 'fr',
    }],
  };
}

const clockGame: GameDef = {
  id: 'LO-8',
  category: 'logic',
  minAge: 5,
  icon: 'clock',
  color: 0x1e88e5,
  introLine: 'intro.LO-8',
  homeLine: 'home.LO-8',
  shortLine: 'short.LO-8',
  questions: Array.from({ length: 20 }, (_, l) =>
    Array.from({ length: 8 }, (_, i) => ({ id: `LO-8:${l + 1}:${i}`, level: l + 1 }))).flat(),
  build(ref, _level, rng) {
    return buildClock(ref.level, Number(ref.id.split(':')[2]), rng);
  },
};

// ---- Logique : « La monnaie » (pièces et billets en euros) ----

/** Par niveau : [pièces et billets possibles (centimes), somme min, somme max, pas, nombre de cartes]. */
const MONEY_LEVELS: [number[], number, number, number, number][] = [
  [[100, 200], 100, 300, 100, 3], [[100, 200], 100, 400, 100, 3], [[100, 200], 200, 500, 100, 4],
  [[100, 200, 500], 300, 700, 100, 4], [[100, 200, 500], 500, 1000, 100, 4],
  [[100, 200, 500, 1000], 600, 1500, 100, 4], [[100, 200, 500, 1000], 1000, 2000, 100, 4],
  [[500, 1000, 2000], 1500, 4000, 500, 4], [[100, 200, 500, 1000, 2000], 1000, 3000, 100, 4],
  [[10, 20, 50], 30, 100, 10, 4], [[10, 20, 50, 100], 50, 200, 10, 4], [[10, 20, 50, 100], 100, 300, 10, 4],
  [[10, 20, 50, 100, 200], 150, 400, 10, 4], [[5, 10, 20, 50, 100], 50, 200, 5, 4],
  [[1, 2, 5, 10, 20, 50], 10, 100, 1, 4], [[10, 20, 50, 100, 200, 500], 300, 800, 10, 4],
  [[10, 20, 50, 100, 200, 500, 1000], 500, 1500, 10, 6], [[10, 20, 50, 100, 200, 500, 1000], 500, 2000, 10, 6],
  [[1, 2, 5, 10, 20, 50, 100, 200], 100, 500, 1, 6], [[10, 20, 50, 100, 200, 500, 1000, 2000], 1000, 3000, 10, 6],
];

/** Une somme dite en euros : « deux euros cinquante », « cinquante centimes ». */
export function sayMoney(cents: number): string {
  const euros = Math.floor(cents / 100);
  const rest = cents % 100;
  const e = euros === 1 ? 'un euro' : `${frNumber(euros)} euros`;
  if (euros && rest) return `${e} ${frNumber(rest)}`;
  if (euros) return e;
  return rest === 1 ? 'un centime' : `${frNumber(rest)} centimes`;
}

/** Des pièces et billets qui font `total` (7 au plus), un peu au hasard pour varier. */
function makeChange(total: number, denoms: number[], rng: Rng): number[] | undefined {
  const sorted = [...denoms].sort((a, b) => b - a);
  for (let attempt = 0; attempt < 30; attempt++) {
    const parts: number[] = [];
    let rest = total;
    while (rest > 0 && parts.length < 8) {
      const fits = sorted.filter((d) => d <= rest);
      if (!fits.length) break;
      parts.push(rng() < 0.65 ? fits[0] : fits[Math.floor(rng() * fits.length)]);
      rest -= parts[parts.length - 1];
    }
    if (rest === 0 && parts.length <= 7) return parts.sort((a, b) => b - a);
  }
  return undefined;
}

function buildMoney(level: number, rng: Rng): BuiltQuestion {
  const [denoms, min, max, step, cards] = MONEY_LEVELS[level - 1];
  const amount = () => min + step * Math.floor(rng() * ((max - min) / step + 1));
  let target = amount();
  let answer = makeChange(target, denoms, rng);
  while (!answer) {
    target = amount();
    answer = makeChange(target, denoms, rng);
  }
  // Leurres : des sommes toutes proches (un pas de plus ou de moins, puis deux…).
  const totals: number[] = [];
  for (const k of shuffle([1, -1, 2, -2, 3, -3, 4, 5], rng)) {
    const t = target + k * step;
    if (t > 0 && !totals.includes(t) && totals.length < cards - 1) totals.push(t);
  }
  const card = (coins: number[], total: number): Choice => ({ id: `m:${total}`, money: coins });
  const distractors = totals.map((t) => makeChange(t, denoms, rng) ?? makeChange(t, [...denoms, 1, 2, 5, 10], rng)!)
    .map((coins, i) => card(coins, totals[i]));
  const said = sayMoney(target);
  return {
    answer: card(answer, target),
    distractors,
    prompt: [{
      text: oneOf(rng, [`Touche la carte où il y a ${said} !`, `Où y a-t-il exactement ${said} ?`]),
      lang: 'fr',
    }],
    reinforce: [{ text: `Oui ! Ça fait bien ${said} !`, lang: 'fr' }],
    hints: [{
      text: 'Indice : compte d\'abord les billets et les grosses pièces, puis ajoute les petites.',
      lang: 'fr',
    }],
  };
}

const moneyGame: GameDef = {
  id: 'LO-9',
  category: 'logic',
  minAge: 5,
  icon: 'money',
  color: 0xb45309,
  introLine: 'intro.LO-9',
  homeLine: 'home.LO-9',
  shortLine: 'short.LO-9',
  questions: Array.from({ length: 20 }, (_, l) =>
    Array.from({ length: 8 }, (_, i) => ({ id: `LO-9:${l + 1}:${i}`, level: l + 1 }))).flat(),
  build(ref, _level, rng) {
    return buildMoney(ref.level, rng);
  },
};

// ---- Écriture : « Trace les formes », « Trace les lettres » ----

/** Questions de tracé : chaque modèle avec pointillés, avec des points légers, puis tout seul. */
function traceQuestions(gameId: string, models: TraceModel[], offsets: number[]): QuestionRef[] {
  return models.flatMap((m) => TRACE_MODES.map(([mode], i) =>
    ({ id: `${gameId}:${m.id}:${mode}`, level: Math.min(20, m.level + offsets[i]) })));
}

function buildTrace(ref: QuestionRef, rng: Rng): BuiltQuestion {
  const [, id, mode] = ref.id.split(':') as [string, string, TraceMode];
  const model = traceModel(id)!;
  const prompt = mode === 'free'
    ? oneOf(rng, [`Maintenant, dessine ${model.name} tout seul, comme le modèle !`, `À toi : dessine ${model.name}, sans les points !`])
    : mode === 'faint'
      ? `Trace ${model.name} en suivant les petits points.`
      : oneOf(rng, [`Trace ${model.name} en suivant les pointillés !`, `Avec ton doigt, repasse sur les pointillés : ${model.name} !`]);
  return {
    answer: { id: 'ok' },
    distractors: [],
    show: { kind: 'trace', model: id, mode },
    prompt: [{ text: prompt, lang: 'fr' }],
    reinforce: [{ text: oneOf(rng, [`Bravo ! C'est ${model.name} magnifique !`, `Super, ${model.name} !`, 'Quel joli dessin !']), lang: 'fr' }],
    hints: [{ text: 'Regarde, je te montre ! Commence au point vert numéro un.', lang: 'fr' }],
  };
}

const traceShapes: GameDef = {
  id: 'TR-1',
  category: 'writing',
  trace: true,
  icon: 'trace-shapes',
  color: 0x0891b2,
  introLine: 'intro.TR-1',
  homeLine: 'home.TR-1',
  shortLine: 'short.TR-1',
  questions: traceQuestions('TR-1', SHAPE_MODELS, [0, 5, 11]),
  build: (ref, _level, rng) => buildTrace(ref, rng),
};

const traceLetters: GameDef = {
  id: 'TR-2',
  category: 'writing',
  trace: true,
  minAge: 4,
  icon: 'trace-letters',
  color: 0x7c3aed,
  introLine: 'intro.TR-2',
  homeLine: 'home.TR-2',
  shortLine: 'short.TR-2',
  questions: traceQuestions('TR-2', LETTER_MODELS, [0, 6, 12]),
  build: (ref, _level, rng) => buildTrace(ref, rng),
};

// ---- Monde : « Mon pays » (le pays de l'enfant, choisi par les parents) ----

/** Questions sur un pays : [type, niveau], selon ce qu'on sait de lui. */
function countryQuestions(c: Country): QuestionRef[] {
  const q: [string, number][] = [['flag', 1], ['symbol:0', 2], ['day', 4], ['flag-hard', 10], ['capital', 12],
    ['neighbour', 14], ['flag-hard6', 16], ['neighbour6', 18], ['capital6', 20]];
  c.foods.forEach((_, i) => q.push([`food:${i}`, [3, 5, 7][i]]));
  if (c.symbols[1]) q.push(['symbol:1', 9]);
  if (c.currency) q.push(['currency', 6]);
  if (c.landmark) q.push(['landmark', 8]);
  if (c.code === 'fr') q.push(['hexagon', 9]);
  return q.map(([type, level]) => ({ id: `MO-6:${c.code}:${type}`, level }));
}

function buildCountry(ref: QuestionRef, rng: Rng): BuiltQuestion {
  const [, code, type, index] = ref.id.split(':');
  const c = COUNTRIES.find((x) => x.code === code)!;
  const img = (key: string): Choice => ({ id: key, image: key });
  const flag = (code: string): Choice => img(`flag-${code}`);
  const take = <T>(list: T[], n: number, not: T[] = []) => shuffle(list.filter((x) => !not.includes(x)), rng).slice(0, n);
  const fact = (prompt: string, answer: Choice, distractors: Choice[], reinforce: string, hint?: string): BuiltQuestion => ({
    answer, distractors, prompt: [{ text: prompt, lang: 'fr' }], reinforce: [{ text: reinforce, lang: 'fr' }],
    hints: hint ? [{ text: `Indice : ${hint}`, lang: 'fr' }] : [],
  });
  const country = c.name.charAt(0).toUpperCase() + c.name.slice(1);
  switch (type) {
    case 'flag':
      return fact(`Quel est le drapeau ${c.of} ?`, flag(c.code), take(FAR_FLAGS, 2, [c.code, ...c.neighbours]).map(flag),
        `Oui ! C'est le drapeau ${c.of} !`);
    case 'flag-hard':
    case 'flag-hard6': {
      // Des drapeaux qui se ressemblent : il faut bien regarder les couleurs et leur ordre.
      const n = type === 'flag-hard' ? 3 : 5;
      const traps = take(c.flagTraps, n);
      const more = take(FAR_FLAGS, n - traps.length, [c.code, ...traps]);
      return fact(`Attention, ils se ressemblent ! Quel est le drapeau ${c.of} ?`, flag(c.code), [...traps, ...more].map(flag),
        `Bravo ! C'est bien le drapeau ${c.of} !`, 'regarde bien les couleurs, et dans quel ordre elles sont.');
    }
    case 'symbol': {
      const [image, name] = c.symbols[Number(index)];
      return fact(`Quel est un symbole ${c.of} ?`, img(image), take(OTHER_ANIMALS, 3, [image]).map(img),
        `Oui ! ${name.charAt(0).toUpperCase()}${name.slice(1)}, c'est un symbole ${c.of} !`);
    }
    case 'food': {
      const [image, name] = c.foods[Number(index)];
      return fact(oneOf(rng, [`Lequel est une spécialité ${c.of} ?`, `Qu'est-ce qu'on aime manger ${c.in} ?`]), img(image),
        take(FOREIGN_FOODS, 3).map(img), `Miam ! ${name.charAt(0).toUpperCase()}${name.slice(1)}, c'est une spécialité ${c.of} !`);
    }
    case 'day':
      return fact(`${c.nationalDay.charAt(0).toUpperCase()}${c.nationalDay.slice(1)}, c'est la fête nationale ${c.of} ! `
        + 'Qu\'est-ce qu\'on regarde dans le ciel, le soir ?', img('cty-fireworks'), take(CELEBRATIONS, 3).map(img),
      `Oui ! ${c.nationalDay.charAt(0).toUpperCase()}${c.nationalDay.slice(1)}, il y a un grand feu d'artifice !`);
    case 'currency': {
      const [image, name] = c.currency!;
      return fact(`Avec quel argent est-ce qu'on paie ${c.in} ?`, img(image), take(BANKNOTES, 3, [image]).map(img),
        `Oui ! ${c.in.charAt(0).toUpperCase()}${c.in.slice(1)}, on paie avec ${name} !`);
    }
    case 'landmark': {
      const [image, question, name, others] = c.landmark!;
      return fact(question, img(image), take(others, 3).map(img), `Oui ! C'est ${name} !`);
    }
    case 'hexagon': {
      const shapes: ShapeCard[] = [{ shape: 'hexagon', color: 0x2f6fde }, { shape: 'triangle', color: 0x2f6fde },
        { shape: 'circle', color: 0x2f6fde }, { shape: 'star', color: 0x2f6fde }];
      const [answer, ...rest] = shapes.map((sh) => ({ id: `s:${sh.shape}`, shape: sh }));
      return fact('On appelle la France l\'Hexagone, à cause de sa forme à six côtés. Touche l\'hexagone !', answer, rest,
        'Oui ! L\'hexagone a six côtés, comme la forme de la France !', 'compte les côtés : il en faut six.');
    }
    case 'capital':
    case 'capital6': {
      // Les villes sont écrites : il faut les lire.
      const n = type === 'capital' ? 3 : 5;
      const word = (w: string) => ({ id: `t:${w}`, text: { value: w.toLocaleUpperCase('fr-FR'), script: 'caps' as Script } });
      return fact(`Quelle est la capitale ${c.of} ? Lis bien les noms des villes !`, word(c.capital),
        take(c.cities, n).map(word), `Oui ! La capitale ${c.of}, c'est ${c.capital} !`,
        `elle commence par la lettre ${LETTER_NAMES[c.capital[0].toUpperCase()]}.`);
    }
    default: {
      // Pays voisins : un seul drapeau est celui d'un voisin.
      const n = type === 'neighbour' ? 3 : 5;
      const neighbour = take(c.neighbours, 1)[0];
      return fact(`Lequel de ces drapeaux est celui d'un pays voisin ${c.of} ?`, flag(neighbour),
        take(FAR_FLAGS, n, [c.code, ...c.neighbours]).map(flag),
        `Oui ! Ce pays touche ${c.name}. ${country} a des voisins : on peut aller chez eux en voiture !`,
        'les voisins sont tout près, en Europe ou sur le même continent.');
    }
  }
}

const myCountry: GameDef = {
  id: 'MO-6',
  category: 'world',
  minAge: 5,
  icon: 'my-country',
  color: 0x2563eb,
  introLine: 'intro.MO-6',
  homeLine: 'home.MO-6',
  shortLine: 'short.MO-6',
  // Les questions dépendent du pays choisi par les parents.
  get questions() {
    const c = currentCountry();
    return c ? countryQuestions(c) : [];
  },
  build: (ref, _level, rng) => buildCountry(ref, rng),
};

// ---- Memory (dès 3 ans) et memory en anglais (dès 5 ans) ----

/** Nombre de paires selon le niveau : 3 (6 cartes) au début, jusqu'à 10 (20 cartes) au niveau CP. */
export const memoryPairs = (level: number) => (level <= 3 ? 3 : level <= 6 ? 4 : level <= 10 ? 6 : level <= 15 ? 8 : 10);

/** Familles d'images des plateaux : des faciles d'abord, puis toutes. */
const MEMORY_THEMES = ['farm', 'fruit', 'wild', 'vehicle', 'toy', 'sea', 'meal', 'forest', 'veg', 'home', 'sky', 'bug', 'tool'];

function memoryQuestions(gameId: string): QuestionRef[] {
  const refs: QuestionRef[] = [];
  for (let level = 1; level <= 20; level++) {
    // Trois plateaux par niveau, chacun d'une famille.
    const themes = MEMORY_THEMES.slice(0, level <= 4 ? 6 : MEMORY_THEMES.length);
    for (let k = 0; k < 3; k++) refs.push({ id: `${gameId}:${level}:${themes[(level * 3 + k) % themes.length]}`, level });
  }
  return refs;
}

function buildMemory(ref: QuestionRef, rng: Rng, lang: 'fr' | 'en'): BuiltQuestion {
  const [, level, theme] = ref.id.split(':');
  const pairs = memoryPairs(Number(level));
  const usable = (c: Concept) => c.group !== 'color' && (lang === 'fr' || c.levels['EN-1'] !== undefined);
  // La famille du plateau ; complétée par d'autres images s'il en manque (sans deux fois le même mot).
  const pool = [...shuffle(CONCEPTS.filter((c) => c.category === theme && usable(c)), rng),
    ...shuffle(CONCEPTS.filter((c) => c.category !== theme && usable(c)), rng)];
  const words = new Set<string>();
  const chosen: Concept[] = [];
  for (const c of pool) {
    const word = lang === 'en' ? c.en.word : c.fr.word;
    if (chosen.length >= pairs || words.has(word)) continue;
    words.add(word);
    chosen.push(c);
  }
  return {
    answer: { id: 'ok' },
    distractors: [],
    show: { kind: 'memory', images: chosen.map((c) => c.id), lang },
    prompt: [{ text: lang === 'en'
      ? oneOf(rng, ['Retourne deux cartes, et trouve les paires ! J\'écoute… en anglais !', 'Trouve les paires, et écoute les mots anglais !'])
      : oneOf(rng, ['Retourne deux cartes. Si ce sont les mêmes, tu gagnes la paire !', 'Trouve toutes les paires !']), lang: 'fr' }],
    reinforce: [{ text: oneOf(rng, ['Bravo, tu as trouvé toutes les paires !', 'Quelle mémoire ! Toutes les paires !',
      'Toutes les paires ! Tu es un champion du memory !']), lang: 'fr' }],
    hints: [{ text: 'Souviens-toi bien où sont les images que tu as déjà vues !', lang: 'fr' }],
  };
}

const memory: GameDef = {
  id: 'LO-10',
  category: 'logic',
  memory: true,
  seriesLength: 3,
  icon: 'memory',
  color: 0x7c3aed,
  introLine: 'intro.LO-10',
  homeLine: 'home.LO-10',
  shortLine: 'short.LO-10',
  questions: memoryQuestions('LO-10'),
  build: (ref, _level, rng) => buildMemory(ref, rng, 'fr'),
};

const memoryEnglish: GameDef = {
  id: 'EN-3',
  category: 'foreign_language',
  memory: true,
  seriesLength: 3,
  minAge: 5,
  icon: 'memory-en',
  color: 0x2563eb,
  introLine: 'intro.EN-3',
  homeLine: 'home.EN-3',
  shortLine: 'short.EN-3',
  questions: memoryQuestions('EN-3'),
  build: (ref, _level, rng) => buildMemory(ref, rng, 'en'),
};

export const GAMES: GameDef[] = [
  listenTap, englishNumbers, showMe, riddles, shadows, together, bigger, myCountry, missingWord, missingWordRead, listenStory, sounds,
  syllables, readWord, readPicture, letters, oddOneOut, shapesGame, counting, numbers, sequence, most, calc,
  clockGame, moneyGame, memory, memoryEnglish, traceShapes, traceLetters, ...VOICE_GAMES,
];

/** Jeux proposés à un enfant de cet âge. */
export const gamesForAge = (age: number): GameDef[] => GAMES.filter((g) => age >= (g.minAge ?? 3));

export const gameById = (id: string): GameDef => {
  const game = GAMES.find((g) => g.id === id);
  if (!game) throw new Error(`Jeu inconnu : ${id}`);
  return game;
};
