import { QuestionRef, Rng, mulberry32, shuffle } from '../domain/models';
import {
  CONCEPTS, Concept, DistractorStrategy, Speech, conceptById, conceptsFor, frWithArticle, pickDistractors,
} from './content';
import { RIDDLES } from './riddles';

/** Une réponse possible : une image, ou un nombre (carte à points). */
export interface Choice {
  id: string;
  /** Clé de texture de l'image (public/img/<clé>.svg). */
  image?: string;
  /** Pour les cartes nombres (jeu « Combien ? »). */
  count?: number;
}

/** Une question prête à jouer, sans la position de la bonne réponse. */
export interface BuiltQuestion {
  answer: Choice;
  distractors: Choice[];
  /** Objets à montrer au-dessus des réponses (jeu « Combien ? »). */
  show?: { image: string; count: number };
  prompt: Speech[];
  reinforce: Speech[];
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
  questions: QuestionRef[];
  build(ref: QuestionRef, level: number, rng: Rng): BuiltQuestion;
}

const conceptChoice = (c: Concept): Choice => ({ id: c.id, image: c.id });
const idOf = (ref: QuestionRef) => ref.id.split(':')[1];

/** Leurres selon le niveau : autre famille → même famille → même sous-famille. */
const strategyFor = (level: number, sameGroupFrom: number, sameCategoryFrom: number): DistractorStrategy =>
  level >= sameCategoryFrom ? 'same_category' : level >= sameGroupFrom ? 'same_group' : 'other_group';

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
  questions: imageQuestions('EN-1', (c) => c.levels['EN-1']),
  build(ref, level, rng) {
    const answer = conceptById(idOf(ref));
    return {
      answer: conceptChoice(answer),
      distractors: pickDistractors(answer, conceptsFor('EN-1'), 3, strategyFor(level, 2, 5), rng).map(conceptChoice),
      prompt: [{ text: answer.en.word, lang: 'en', slow: true }],
      reinforce: [{ text: answer.en.word, lang: 'en', slow: true }, { text: `${frWithArticle(answer)} !`, lang: 'fr' }],
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
  questions: imageQuestions('MO-1', (c) => c.levels['MO-1']),
  build(ref, level, rng) {
    const answer = conceptById(idOf(ref));
    return {
      answer: conceptChoice(answer),
      distractors: pickDistractors(answer, conceptsFor('MO-1'), 3, strategyFor(level, 1, 2), rng).map(conceptChoice),
      prompt: [{ text: `Montre-moi ${frWithArticle(answer)} !`, lang: 'fr' }],
      reinforce: [{ text: `Oui, ${frWithArticle(answer)} !`, lang: 'fr' }],
    };
  },
};

// ---- Monde : « Devinettes » ----

const riddleText = new Map(RIDDLES.map(([id, , text]) => [id, text]));
const riddlePool = CONCEPTS.filter((c) => c.group !== 'color');

/**
 * Leurres interdits parce qu'ils répondraient aussi à la devinette
 * (« je brille la nuit » : la lune, mais aussi l'étoile). `cat:` = toute une sous-famille.
 */
const RIDDLE_EXCLUDE: Record<string, string[]> = {
  moon: ['star'], mouth: ['tooth'], tooth: ['mouth'], bat: ['owl'], owl: ['bat'], hat: ['cap'],
  fish: ['cat:sea'], bird: ['cat:bird'], plane: ['helicopter', 'rocket'], helicopter: ['plane', 'rocket'],
  wolf: ['dog', 'fox'], horse: ['zebra'], zebra: ['horse'], eye: ['glasses'], glasses: ['eye'],
  socks: ['shoe'], cow: ['goat'], guitar: ['violin'], drum: ['piano'], snail: ['turtle'], turtle: ['snail'],
  fire: ['fire_engine', 'volcano'], volcano: ['fire', 'mountain'], milk: ['cheese', 'bottle'],
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
    };
  },
};

// ---- Logique : « L'intrus » ----

/** Nom des familles, pour expliquer la réponse (« les autres sont des fruits »). */
const FAMILY_NAMES: Record<string, string> = {
  farm: 'des animaux de la ferme', sea: 'des animaux de la mer', bird: 'des oiseaux',
  bug: 'des petites bêtes', wild: 'des animaux sauvages', forest: 'des animaux de la forêt',
  fruit: 'des fruits', veg: 'des légumes', meal: 'des choses à manger', vehicle: 'des véhicules',
  toy: 'des jouets', home: 'des objets de la maison', clothes: 'des vêtements', tool: 'des outils',
  kitchen: 'des objets de la salle de bain et de la cuisine', music: 'des instruments de musique',
  sky: 'des choses du ciel et de la météo', plant: 'des plantes', body: 'des parties du corps',
  landscape: 'des lieux', color: 'des couleurs',
};

/** Paires de sous-familles assez différentes pour un intrus sans ambiguïté. */
const CLOSE_PAIRS = [
  ['farm', 'sea'], ['farm', 'bug'], ['sea', 'bird'], ['sea', 'bug'], ['bird', 'bug'], ['wild', 'sea'],
  ['wild', 'bug'], ['forest', 'sea'], ['fruit', 'veg'], ['fruit', 'meal'], ['veg', 'meal'],
  ['vehicle', 'clothes'], ['vehicle', 'music'], ['clothes', 'tool'], ['music', 'clothes'],
  ['kitchen', 'vehicle'], ['home', 'vehicle'], ['tool', 'music'], ['sky', 'plant'],
];

const families = () => {
  const byCategory = new Map<string, Concept[]>();
  for (const c of CONCEPTS) {
    if (c.group === 'color') continue;
    byCategory.set(c.category, [...(byCategory.get(c.category) ?? []), c]);
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
  for (const [category, members] of byCategory) {
    if (members.length < 3) continue;
    const group = members[0].group;
    const far = shuffle(CONCEPTS.filter((c) => c.group !== group && c.group !== 'color'), rng).slice(0, 4);
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
    return {
      answer: { id: `n${n}`, count: n },
      distractors: others.map((k) => ({ id: `n${k}`, count: k })),
      show: { image, count: n },
      prompt: [{ text: `Combien y a-t-il ${/^[aeiouyéèêh]/i.test(plural) ? 'd\'' : 'de '}${plural} ? Compte bien !`, lang: 'fr' }],
      reinforce: [{ text: `${NUMBERS.slice(1, n + 1).join(', ')}. Il y a ${howMany} ${name} !`, lang: 'fr' }],
    };
  },
};

export const GAMES: GameDef[] = [listenTap, showMe, riddles, oddOneOut, counting];

export const gameById = (id: string): GameDef => {
  const game = GAMES.find((g) => g.id === id);
  if (!game) throw new Error(`Jeu inconnu : ${id}`);
  return game;
};
