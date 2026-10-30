import { QuestionRef, Rng, mulberry32, shuffle } from '../domain/models';
import {
  CONCEPTS, Concept, DistractorStrategy, Speech, conceptById, conceptsFor, frWithArticle, pickDistractors,
} from './content';
import { frNumber } from './numbers';
import { RIDDLES } from './riddles';
import { ONSETS, RHYMES } from './sounds';

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
}

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
}

export interface GameDef {
  id: string;
  /** Catégorie de la spécification (île) : sert aussi au calcul de difficulté. */
  category: 'foreign_language' | 'world' | 'logic' | 'french';
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
const idOf = (ref: QuestionRef) => ref.id.split(':')[1];

/** Leurres selon le niveau : autre famille → même famille → même sous-famille. */
const strategyFor = (level: number, sameGroupFrom: number, sameCategoryFrom: number): DistractorStrategy =>
  level >= sameCategoryFrom ? 'same_category' : level >= sameGroupFrom ? 'same_group' : 'other_group';

/** Indice de famille, au singulier (« c'est un animal de la ferme »). */
const CATEGORY_HINTS: Record<string, string> = {
  farm: 'un animal de la ferme', sea: 'un animal de la mer', bird: 'un oiseau', bug: 'une petite bête',
  wild: 'un animal sauvage', forest: 'un animal de la forêt', fruit: 'un fruit', veg: 'un légume',
  meal: 'quelque chose qui se mange', vehicle: 'un véhicule', toy: 'un jouet', home: 'un objet de la maison',
  clothes: 'quelque chose qu\'on porte', tool: 'un outil', kitchen: 'un objet de tous les jours',
  music: 'un instrument de musique', sky: 'quelque chose qu\'on voit dans le ciel', plant: 'une plante',
  body: 'une partie du corps', landscape: 'un endroit', color: 'une couleur', element: 'quelque chose de la nature',
};

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
      prompt: [{ text: `Montre-moi ${frWithArticle(answer)} !`, lang: 'fr' }],
      reinforce: [{ text: `Oui, ${frWithArticle(answer)} !`, lang: 'fr' }],
      hints: conceptHints(answer),
    };
  },
};

// ---- Monde : « Devinettes » ----

const riddlePool = CONCEPTS.filter((c) => c.group !== 'color');

/**
 * Leurres interdits parce qu'ils répondraient aussi à la devinette
 * (« je brille la nuit » : la lune, mais aussi l'étoile). `cat:` = toute une sous-famille.
 */
const RIDDLE_EXCLUDE: Record<string, string[]> = {
  moon: ['star'], sun: ['star'], mouth: ['tooth'], tooth: ['mouth', 'tongue'], bat: ['owl'], owl: ['bat'], hat: ['cap'],
  fish: ['cat:sea'], bird: ['cat:bird'], plane: ['helicopter', 'rocket'], helicopter: ['plane', 'rocket'],
  wolf: ['dog', 'fox'], horse: ['zebra'], zebra: ['horse'], eye: ['glasses'], glasses: ['eye'],
  socks: ['shoe'], cow: ['goat', 'ox'], guitar: ['violin'], drum: ['piano'], snail: ['turtle'], turtle: ['snail'],
  fire: ['fire_engine', 'volcano'], volcano: ['fire', 'mountain'], milk: ['cheese', 'bottle'],
  honey: ['bee'], bee: ['honey'], potato: ['fries'], fries: ['potato'], candle: ['cake', 'fire'],
  window: ['mirror', 'glasses'], mirror: ['window', 'glasses'], seal: ['penguin', 'polar_bear'],
  polar_bear: ['bear', 'seal', 'penguin'], bone: ['dog', 'tooth'], worm: ['snake', 'snail'], snake: ['worm'],
  mosquito: ['bee', 'spider'], jellyfish: ['octopus'], lightning: ['rain', 'cloud'], comet: ['star', 'rocket'],
  rocket: ['satellite', 'comet'], satellite: ['rocket'], parachute: ['plane', 'helicopter', 'balloon'],
  axe: ['saw'], saw: ['axe'], octopus: ['squid', 'jellyfish'], kangaroo: ['koala'], clock: ['bell', 'hourglass'],
  hourglass: ['clock'], snowman: ['snowflake'], bread: ['croissant', 'cake', 'sandwich'], dolphin: ['whale', 'seal'],
  whale: ['dolphin'], compass: ['clock'], magnet: ['key'],
  feather: ['bird', 'leaf'], koala: ['monkey', 'sloth'], sloth: ['koala', 'monkey'],
  mammoth: ['elephant'], elephant: ['mammoth'], scorpion: ['crab', 'spider'], oyster: ['crab'],
  lock: ['key', 'door'], key: ['lock', 'door'], bell: ['clock'], light_bulb: ['lamp', 'flashlight', 'candle'],
  lamp: ['light_bulb', 'flashlight'], tongue: ['mouth'], rooster: ['hen', 'bird', 'turkey'],
  hen: ['rooster', 'turkey'], turkey: ['hen', 'rooster'], donkey: ['horse'], onion: ['garlic'],
  bucket: ['bottle'], brain: ['eye'], tornado: ['cloud'], paintbrush: ['pencil', 'crayon'],
};

const excludedFor = (answer: Concept) => {
  const rules = RIDDLE_EXCLUDE[answer.id] ?? [];
  return (c: Concept) => rules.some((r) => (r.startsWith('cat:') ? c.category === r.slice(4) : c.id === r));
};

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
      prompt: [{ text: text.startsWith('Qui ') ? text : `Devinette ! ${text}`, lang: 'fr' }],
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
      prompt: [{ text: 'Trouve l\'intrus ! Lequel n\'est pas de la même famille ?', lang: 'fr' }],
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
          : `Combien y a-t-il ${ofPlural} ? Compte bien !`,
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
      prompt: [{ text: 'À qui est cette ombre ? Touche la bonne image !', lang: 'fr' }],
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
      prompt: [{ text: 'Regarde bien la suite. Quel fruit vient après ?', lang: 'fr' }],
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
      prompt: [{ text: `Combien font ${words} ?`, lang: 'fr' }],
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

export const GAMES: GameDef[] = [listenTap, showMe, riddles, shadows, sounds, oddOneOut, counting, sequence, most, calc];

export const gameById = (id: string): GameDef => {
  const game = GAMES.find((g) => g.id === id);
  if (!game) throw new Error(`Jeu inconnu : ${id}`);
  return game;
};
