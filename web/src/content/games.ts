import { QuestionRef, Rng, mulberry32, shuffle } from '../domain/models';
import {
  CONCEPTS, Concept, DistractorStrategy, Speech, conceptById, conceptsFor, frWithArticle, pickDistractors,
} from './content';
import { RIDDLES } from './riddles';

/** Une réponse possible : une image, un nombre (carte à points) ou un tas d'objets. */
export interface Choice {
  id: string;
  /** Clé de texture de l'image (public/img/<clé>.svg). */
  image?: string;
  /** Pour les cartes nombres (jeu « Combien ? »). */
  count?: number;
  /** Carte remplie de `count` fois la même image (jeu « Le plus »). */
  repeat?: { image: string; count: number };
}

/** Ce qui est montré au-dessus des réponses. */
export type Show =
  /** Objets à compter (le premier groupe est celui qu'on compte, les autres sont mélangés). */
  | { kind: 'count'; groups: { image: string; count: number }[] }
  /** Ombre d'une image (jeu « Les ombres »). */
  | { kind: 'silhouette'; image: string }
  /** Suite d'images dont on cherche la suivante (null = « ? »). */
  | { kind: 'sequence'; images: (string | null)[] };

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
  category: 'foreign_language' | 'world' | 'logic';
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

/** Indices d'une image : sa famille, puis sa devinette si elle en a une. */
function conceptHints(c: Concept): Speech[] {
  const hints: Speech[] = [{ text: `Indice : c'est ${CATEGORY_HINTS[c.category] ?? 'quelque chose'}.`, lang: 'fr' }];
  const riddle = riddleText.get(c.id);
  if (riddle) {
    hints.push({ text: `Indice : ${riddle.replace(/ ?Qui suis-je \?$/, '').replace(/^Qui /, 'qui ')}`, lang: 'fr' });
  }
  return hints;
}

function imageQuestions(gameId: string, levels: (c: Concept) => number | undefined): QuestionRef[] {
  return CONCEPTS.filter((c) => levels(c) !== undefined)
    .map((c) => ({ id: `${gameId}:${c.id}`, level: levels(c)! }));
}

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
    const word: Speech = { text: answer.en.word, lang: 'en', slow: true, pauseAfter: 700 };
    return {
      answer: conceptChoice(answer),
      distractors: pickDistractors(answer, conceptsFor('EN-1'), 1, strategyFor(level, 6, 9), rng).map(conceptChoice),
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
      distractors: pickDistractors(answer, conceptsFor('MO-1'), 3, strategyFor(level, 1, 2), rng).map(conceptChoice),
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
  moon: ['star'], mouth: ['tooth'], tooth: ['mouth'], bat: ['owl'], owl: ['bat'], hat: ['cap'],
  fish: ['cat:sea'], bird: ['cat:bird'], plane: ['helicopter', 'rocket'], helicopter: ['plane', 'rocket'],
  wolf: ['dog', 'fox'], horse: ['zebra'], zebra: ['horse'], eye: ['glasses'], glasses: ['eye'],
  socks: ['shoe'], cow: ['goat', 'ox'], guitar: ['violin'], drum: ['piano'], snail: ['turtle'], turtle: ['snail'],
  fire: ['fire_engine', 'volcano'], volcano: ['fire', 'mountain'], milk: ['cheese', 'bottle'],
  honey: ['bee'], bee: ['honey'], potato: ['fries'], fries: ['potato'], candle: ['cake', 'fire'],
  window: ['mirror', 'glasses'], mirror: ['window', 'glasses'], seal: ['penguin', 'polar_bear'],
  polar_bear: ['bear', 'seal', 'penguin'], bone: ['dog'], worm: ['snake', 'snail'], snake: ['worm'],
  mosquito: ['bee', 'spider'], jellyfish: ['octopus'], lightning: ['rain', 'cloud'], comet: ['star', 'rocket'],
  rocket: ['satellite', 'comet'], satellite: ['rocket'], parachute: ['plane', 'helicopter', 'balloon'],
  axe: ['saw'], saw: ['axe'], feather: ['bird', 'leaf'], koala: ['monkey', 'sloth'], sloth: ['koala', 'monkey'],
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
    const answer = conceptById(idOf(ref));
    const text = riddleText.get(answer.id)!;
    const excluded = excludedFor(answer);
    const pool = riddlePool.filter((c) => !excluded(c));
    return {
      answer: conceptChoice(answer),
      distractors: pickDistractors(answer, pool, 3, strategyFor(level, 3, 7), rng).map(conceptChoice),
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
    const members = shuffle(families().get(category)!.filter((c) => c.id !== odd.id), rng).slice(0, 3);
    return {
      answer: conceptChoice(odd),
      distractors: members.map(conceptChoice),
      prompt: [{ text: 'Trouve l\'intrus ! Lequel n\'est pas de la même famille ?', lang: 'fr' }],
      reinforce: [{ text: `Oui, ${frWithArticle(odd)} ! Les autres sont ${FAMILY_NAMES[category]}.`, lang: 'fr' }],
      hints: [{ text: `Indice : trois images sont ${FAMILY_NAMES[category]}. Cherche celle qui n'en est pas.`, lang: 'fr' }],
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
const NUMBERS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix'];
/** Niveau d'une quantité : jusqu'à 3 au niveau 1, puis +1 par niveau. */
const countLevel = (n: number) => Math.max(1, n - 2);

const counting: GameDef = {
  id: 'LO-2',
  category: 'logic',
  icon: 'counting',
  color: 0x0f9bb5,
  introLine: 'intro.LO-2',
  homeLine: 'home.LO-2',
  shortLine: 'short.LO-2',
  questions: COUNTABLES.flatMap(([image]) =>
    Array.from({ length: 10 }, (_, i) => ({ id: `LO-2:${image}:${i + 1}`, level: countLevel(i + 1) }))),
  build(ref, level, rng) {
    const [, image, count] = ref.id.split(':');
    const n = Number(count);
    const [, singular, plural, feminine] = COUNTABLES.find(([img]) => img === image)!;
    // Aux niveaux difficiles, les autres nombres sont tout proches (n−1, n+1…).
    const spread = level >= 6 ? 1 : level >= 3 ? 2 : 3;
    const candidates = shuffle(
      Array.from({ length: 10 }, (_, i) => i + 1).filter((k) => k !== n && Math.abs(k - n) <= spread * 2),
      rng,
    ).sort((a, b) => Math.abs(a - n) - Math.abs(b - n));
    const others = candidates.slice(0, 3);
    for (let k = 1; others.length < 3; k++) if (k !== n && !others.includes(k)) others.push(k);
    const name = n === 1 ? singular : plural;
    const howMany = n === 1 ? (feminine ? 'une' : 'un') : NUMBERS[n];
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
      reinforce: [{ text: `${NUMBERS.slice(1, n + 1).join(', ')}. Il y a ${howMany} ${name} !`, lang: 'fr' }],
      hints: [{ text: 'Indice : touche chaque fruit avec ton doigt, en comptant tout doucement.', lang: 'fr' }],
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
      distractors: pickDistractors(answer, conceptsFor('MO-1'), 3, strategyFor(level, 3, 6), rng).map(conceptChoice),
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

const sequence: GameDef = {
  id: 'LO-3',
  category: 'logic',
  icon: 'sequence',
  color: 0xd9467a,
  introLine: 'intro.LO-3',
  homeLine: 'home.LO-3',
  shortLine: 'short.LO-3',
  questions: PATTERNS.flatMap(([pattern, level]) =>
    Array.from({ length: 8 }, (_, i) => ({ id: `LO-3:${pattern}:${i}`, level: Math.min(10, level + (i >= 6 ? 1 : 0)) }))),
  build(ref, _level, rng) {
    const [, pattern, variant] = ref.id.split(':');
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

const most: GameDef = {
  id: 'LO-4',
  category: 'logic',
  icon: 'most',
  color: 0x2f8f6b,
  introLine: 'intro.LO-4',
  homeLine: 'home.LO-4',
  shortLine: 'short.LO-4',
  // Niveau : plus les tas sont proches (et grands), plus c'est difficile ; « le moins » dès le niveau 5.
  questions: COUNTABLES.flatMap(([image]) => Array.from({ length: 10 }, (_, i) => ({
    id: `LO-4:${image}:${i + 1}:${i + 1 >= 5 && i % 2 === 0 ? 'least' : 'most'}`, level: i + 1,
  }))),
  build(ref, _level, rng) {
    const [, image, levelStr, mode] = ref.id.split(':');
    const level = Number(levelStr);
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
      reinforce: [{ text: `Oui ! Ici, il y en a ${NUMBERS[target]}. C'est ${what} !`, lang: 'fr' }],
      hints: [{
        text: mode === 'least'
          ? 'Indice : cherche la carte où il y a très peu de fruits.'
          : 'Indice : cherche la carte la plus remplie.',
        lang: 'fr',
      }],
    };
  },
};

export const GAMES: GameDef[] = [listenTap, showMe, riddles, shadows, oddOneOut, counting, sequence, most];

export const gameById = (id: string): GameDef => {
  const game = GAMES.find((g) => g.id === id);
  if (!game) throw new Error(`Jeu inconnu : ${id}`);
  return game;
};
