import type { BuiltQuestion, Choice, GameDef, Script } from './games';
import { QuestionRef, Rng, shuffle } from '../domain/models';
import { SayTarget, withoutArticle } from '../domain/speech';
import {
  CATEGORY_HINTS, CONCEPTS, Concept, Speech, conceptById, conceptsFor, frWithArticle, pickDistractors,
} from './content';
import { BANKNOTES, CELEBRATIONS, Country, FAR_FLAGS, FOREIGN_FOODS, OTHER_ANIMALS, currentCountry } from './countries';
import {
  COUNTRY_NAMES, JOBS, NATURE, OralCard, OralRiddle, SEASONS, SHAPES_COLORS, SPACE, SPORTS, WORLD,
} from './oral';
import { LETTER_NAMES, READ_WORDS } from './reading';
import { RIDDLES, excludedFor } from './riddles';

/**
 * Jeux à voix haute : l'enfant répond en parlant, la reconnaissance vocale se
 * fait sur l'appareil (voir core/ears.ts). Chaque question a aussi des cartes :
 * si le micro n'entend pas l'enfant, il répond au doigt, comme dans les autres jeux.
 */

const oneOf = <T>(rng: Rng, variants: T[]): T => variants[Math.floor(rng() * variants.length)];
const idOf = (ref: QuestionRef) => ref.id.split(':')[1];
const fr = (text: string): Speech => ({ text, lang: 'fr' });
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const conceptChoice = (c: Concept): Choice => ({ id: c.id, image: c.id });
const unique = (list: string[]) => [...new Set(list)];

/** « Indice : ça commence par la lettre P. » */
const firstLetterHint = (answer: string): Speech => {
  const letter = withoutArticle(answer, 'fr').normalize('NFD')[0]?.toUpperCase() ?? '';
  return fr(`Indice : ça commence par la lettre ${LETTER_NAMES[letter] ?? letter}.`);
};

/** Indices d'une image : sa famille, puis sa devinette si elle en a une. */
const riddleText = new Map(RIDDLES.map(([id, , text]) => [id, text]));
function conceptHints(c: Concept): Speech[] {
  const hints = [fr(`Indice : c'est ${CATEGORY_HINTS[c.category] ?? 'quelque chose'}.`)];
  const riddle = riddleText.get(c.id);
  if (riddle) hints.push(fr(`Indice : ${riddle.replace(/ ?Qui suis-je \?$/, '').replace(/^Qui /, 'qui ')}`));
  return hints;
}

/** Mots des autres images : reconnus, ils comptent comme une erreur (et pas comme un bruit). */
const wordsOf = (concepts: Concept[]) => unique(concepts.map((c) => c.fr.word));

// ---- « Comment ça s'appelle ? » (dès 3 ans) ----

const namePool = conceptsFor('MO-1').filter((c) => c.group !== 'color');

const nameIt: GameDef = {
  id: 'VO-1',
  category: 'world',
  voice: 'fr',
  icon: 'vo-name',
  color: 0xe5484d,
  introLine: 'intro.VO-1',
  homeLine: 'home.VO-1',
  shortLine: 'short.VO-1',
  questions: namePool.map((c) => ({ id: `VO-1:${c.id}`, level: c.levels['MO-1']! })),
  build(ref, level, rng) {
    const answer = conceptById(idOf(ref));
    const name = frWithArticle(answer);
    return {
      answer: conceptChoice(answer),
      distractors: pickDistractors(answer, namePool, level >= 15 ? 5 : 3, level >= 2 ? 'same_group' : 'other_group', rng)
        .map(conceptChoice),
      show: { kind: 'image', image: answer.id },
      prompt: [fr(oneOf(rng, ['Comment ça s\'appelle ?', 'Qu\'est-ce que c\'est ?', 'Dis-moi ce que c\'est !',
        'Comment s\'appelle cette image ?', 'Tu sais ce que c\'est ?']))],
      say: {
        lang: 'fr', accept: [name],
        others: wordsOf(pickDistractors(answer, namePool, 12, 'same_group', rng)),
      },
      reinforce: [fr(oneOf(rng, [`Oui, c'est ${name} !`, `Bravo ! ${capitalize(name)} !`, `C'est bien ${name} !`]))],
      repeatAfterMe: [fr(`Écoute bien : ${name}. À toi de le dire !`)],
      fallback: { prompt: [fr(oneOf(rng, [`Montre-moi ${name} !`, `Où est ${name} ?`]))], hideShow: true },
      hints: conceptHints(answer),
    };
  },
};

// ---- « Say it in English! » ----

const englishPool = conceptsFor('EN-1');

const sayEnglish: GameDef = {
  id: 'VO-2',
  category: 'foreign_language',
  voice: 'en',
  minAge: 5,
  icon: 'flag-gb',
  color: 0x3b7de9,
  introLine: 'intro.VO-2',
  homeLine: 'home.VO-2',
  shortLine: 'short.VO-2',
  questions: englishPool.map((c) => ({ id: `VO-2:${c.id}`, level: c.levels['EN-1']! })),
  build(ref, level, rng) {
    const answer = conceptById(idOf(ref));
    const name = frWithArticle(answer);
    const word: Speech = { text: answer.en.word, lang: 'en', slow: true, pauseAfter: 500 };
    return {
      answer: conceptChoice(answer),
      distractors: pickDistractors(answer, englishPool, 3, level >= 6 ? 'same_group' : 'other_group', rng).map(conceptChoice),
      show: { kind: 'image', image: answer.id },
      prompt: [fr(oneOf(rng, [`Comment dit-on ${name} en anglais ?`, `En anglais, ${name}, ça se dit comment ?`,
        `Dis-moi ${name} en anglais !`]))],
      say: {
        lang: 'en', accept: [answer.en.word],
        others: unique(pickDistractors(answer, englishPool, 12, 'same_group', rng).map((c) => c.en.word)),
      },
      reinforce: [{ ...word, pauseAfter: undefined }, fr(oneOf(rng, ['Bravo, très bien dit !', 'Super, tu parles anglais !',
        'Yes ! C\'est parfait !']))],
      repeatAfterMe: [fr('Écoute bien, et répète après moi :'), word],
      fallback: { prompt: [fr('Touche l\'image du mot anglais :'), word, { ...word, pauseAfter: undefined }], hideShow: true },
      hints: [word],
    };
  },
};

// ---- « Lis à voix haute » ----

const readable = READ_WORDS.filter(([, concept]) => concept);
const SCRIPT_SHIFT: [Script, number][] = [['caps', 0], ['lower', 3], ['cursive', 6]];

const readAloud: GameDef = {
  id: 'VO-3',
  category: 'french',
  voice: 'fr',
  minAge: 5,
  icon: 'read',
  color: 0x8e4ec6,
  introLine: 'intro.VO-3',
  homeLine: 'home.VO-3',
  shortLine: 'short.VO-3',
  questions: readable.flatMap(([word, , level]) =>
    SCRIPT_SHIFT.map(([script, shift]) => ({ id: `VO-3:${word}:${script}`, level: Math.min(20, level + shift) }))),
  build(ref, _level, rng) {
    const [, word, script] = ref.id.split(':') as [string, string, Script];
    const concept = conceptById(readable.find(([w]) => w === word)![1]);
    const others = shuffle(readable.filter(([w]) => w !== word), rng);
    // D'abord les mots qui commencent pareil : ceux qu'on confond en devinant.
    const close = [...others.filter(([w]) => w[0] === word[0]), ...others.filter(([w]) => w[0] !== word[0])];
    const cards = unique(close.map(([, c]) => c)).filter((c) => c !== concept.id).slice(0, 3).map(conceptById);
    return {
      answer: conceptChoice(concept),
      distractors: cards.map(conceptChoice),
      show: { kind: 'text', value: script === 'caps' ? word.toLocaleUpperCase('fr-FR') : word, script },
      prompt: [fr(oneOf(rng, ['Lis ce mot à voix haute !', 'Qu\'est-ce qui est écrit ? Lis-le moi !',
        'Tu peux lire ce mot ? Dis-le bien fort !']))],
      say: { lang: 'fr', accept: [word], others: close.slice(0, 12).map(([w]) => w) },
      reinforce: [fr(`Bravo ! C'est écrit « ${word} » : ${frWithArticle(concept)} !`)],
      fallback: { prompt: [fr('Lis le mot dans ta tête, et touche la bonne image !')] },
      hints: [fr(`Indice : c'est ${CATEGORY_HINTS[concept.category] ?? 'quelque chose'}.`)],
    };
  },
};

// ---- Devinettes à voix haute, par thème ----

/** Devinettes du jeu « Devinettes » dont la réponse est d'une de ces familles. */
const conceptRiddles = (keep: (c: Concept) => boolean): (OralRiddle & { concept: string })[] =>
  RIDDLES.filter(([id]) => keep(conceptById(id.split('~')[0]))).map(([id, level, text]) => {
    const c = conceptById(id.split('~')[0]);
    return { id, level, text, answer: frWithArticle(c), card: { image: c.id }, concept: c.id };
  });

const SHAPE_COLOR = 0x2f6fde;
const answerKey = (r: OralRiddle) => withoutArticle(r.answer, 'fr');
const cardKey = (card: OralCard) => JSON.stringify(card);
const cardKind = (card: OralCard) => Object.keys(card)[0];

function cardChoice(r: OralRiddle): Choice {
  const card = r.card;
  if ('image' in card) return { id: `o:${r.id}`, image: card.image };
  if ('shape' in card) return { id: `o:${r.id}`, shape: { shape: card.shape, color: SHAPE_COLOR } };
  if ('number' in card) return { id: `n${card.number}`, number: card.number };
  return { id: `t:${card.text}`, text: { value: card.text.toLocaleUpperCase('fr-FR'), script: 'caps' } };
}

/** Nombres proches pour les cartes d'une réponse en nombre. */
function nearNumbers(n: number, count: number, rng: Rng): Choice[] {
  const pool = shuffle([n - 2, n - 1, n + 1, n + 2, n + 3].filter((k) => k > 0), rng).slice(0, count);
  return pool.map((k) => ({ id: `n${k}`, number: k }));
}

function buildRiddle(pool: (OralRiddle & { concept?: string })[], ref: QuestionRef, level: number, rng: Rng): BuiltQuestion {
  const r = pool.find((x) => x.id === idOf(ref))!;
  const key = answerKey(r);
  const excluded = r.concept ? excludedFor(conceptById(r.concept)) : () => false;
  const wrong = pool.filter((o) => answerKey(o) !== key);
  const count = level >= 15 ? 5 : 3;
  let distractors: Choice[];
  if ('number' in r.card) {
    distractors = nearNumbers(r.card.number, count, rng);
  } else {
    const seen = new Set([cardKey(r.card)]);
    const keys = new Set([key]);
    distractors = [];
    for (const o of shuffle(wrong.filter((o) => cardKind(o.card) === cardKind(r.card)), rng)) {
      if (distractors.length >= count) break;
      if (seen.has(cardKey(o.card)) || keys.has(answerKey(o))) continue;
      if (r.not?.includes(o.id) || o.not?.includes(r.id)) continue;
      if (o.concept && excluded(conceptById(o.concept))) continue;
      seen.add(cardKey(o.card));
      keys.add(answerKey(o));
      distractors.push(cardChoice(o));
    }
  }
  const text = r.text;
  return {
    answer: cardChoice(r),
    distractors,
    prompt: [fr(text)],
    say: { lang: 'fr', accept: [r.answer, ...(r.also ?? [])], others: unique(wrong.flatMap((o) => [o.answer, ...(o.also ?? [])])) },
    reinforce: [fr(r.bravo ?? `Oui ! ${capitalize(r.answer)} !`)],
    hints: [
      r.hint ? fr(`Indice : ${r.hint}`)
        : r.concept ? fr(`Indice : c'est ${CATEGORY_HINTS[conceptById(r.concept).category] ?? 'quelque chose'}.`)
          : firstLetterHint(r.answer),
      ...(r.hint || r.concept ? [firstLetterHint(r.answer)] : []),
    ],
    fallback: { prompt: [fr(`${text} Touche la bonne réponse !`)] },
  };
}

interface Theme {
  id: string;
  category: GameDef['category'];
  icon: string;
  color: number;
  riddles: (OralRiddle & { concept?: string })[];
}

const riddleGame = ({ id, category, icon, color, riddles }: Theme): GameDef => ({
  id,
  category,
  voice: 'fr',
  minAge: 5,
  icon,
  color,
  introLine: `intro.${id}`,
  homeLine: `home.${id}`,
  shortLine: `short.${id}`,
  questions: riddles.map((r) => ({ id: `${id}:${r.id}`, level: r.level })),
  build: (ref, level, rng) => buildRiddle(riddles, ref, level, rng),
});

export const ORAL_THEMES: Theme[] = [
  { id: 'VO-4', category: 'world', icon: 'lion', color: 0xe58a2b, riddles: conceptRiddles((c) => c.group === 'animal') },
  { id: 'VO-5', category: 'world', icon: 'or-firefighter', color: 0xd9467a, riddles: JOBS },
  { id: 'VO-6', category: 'world', icon: 'or-soccer-ball', color: 0x30a46c, riddles: SPORTS },
  { id: 'VO-7', category: 'world', icon: 'rocket', color: 0x3e3a8f, riddles: SPACE },
  { id: 'VO-8', category: 'world', icon: 'or-fallen-leaf', color: 0xf28c28, riddles: SEASONS },
  { id: 'VO-9', category: 'logic', icon: 'shapes', color: 0x8e4ec6, riddles: SHAPES_COLORS },
  { id: 'VO-10', category: 'world', icon: 'or-globe-showing-europe-africa', color: 0x0891b2, riddles: WORLD },
  {
    id: 'VO-12', category: 'world', icon: 'or-evergreen-tree', color: 0x2f9e44,
    riddles: [...conceptRiddles((c) => ['plant', 'landscape', 'element'].includes(c.category)), ...NATURE],
  },
];

// ---- « Mon pays », à voix haute ----

const FOREIGN_FOOD_NAMES = ['les sushis', 'les tacos', 'le curry', 'les raviolis', 'les nems', 'la paella'];
const CURRENCY_NAMES = ['l\'euro', 'le dollar', 'le yen', 'la livre', 'le franc'];
const LANGUAGE_NAMES = ['l\'anglais', 'l\'espagnol', 'l\'italien', 'l\'allemand', 'le chinois', 'le japonais', 'le portugais',
  'le français', 'le néerlandais', 'le russe', 'l\'arabe'];
const DAYS = ['le quatorze juillet', 'le vingt et un juillet', 'le premier août', 'le premier juillet', 'le vingt-trois juin',
  'le vingt-cinq décembre', 'le premier janvier', 'le premier mai', 'le quatre juillet'];
const FAR_COUNTRIES: Record<string, string> = {
  jp: 'le Japon', br: 'le Brésil', us: 'les États-Unis', cn: 'la Chine', mx: 'le Mexique', in: 'l\'Inde', sn: 'le Sénégal', gb: 'l\'Angleterre',
};
const LANDMARKS = ['la tour Eiffel', 'la statue de la Liberté', 'les pyramides', 'la tour de Tokyo', 'les Alpes', 'le désert',
  'la plage', 'les châteaux forts', 'le hockey sur glace', 'le basket', 'le tennis', 'le football américain'];
const PEOPLES = WORLD.filter((r) => r.id.startsWith('p-')).flatMap((r) => [r.answer, ...(r.also ?? [])]);

/** Symbole animal du pays (« le coq »), s'il en a un. */
const animalSymbol = (c: Country) => c.symbols.find(([image]) => CONCEPTS.some((x) => x.id === image && x.group === 'animal'));

function myCountryQuestions(c: Country): QuestionRef[] {
  const q: [string, number][] = [['name', 4], ['language', 5], ['people', 6], ['capital', 8], ['day', 10], ['neighbour', 12]];
  if (c.foods.length) q.push(['food', 6]);
  if (c.currency) q.push(['currency', 7]);
  if (animalSymbol(c)) q.push(['symbol', 7]);
  if (c.landmark) q.push(['landmark', 9]);
  return q.map(([type, level]) => ({ id: `VO-11:${c.code}:${type}`, level }));
}

function buildMyCountry(ref: QuestionRef, rng: Rng): BuiltQuestion {
  const [, code, type] = ref.id.split(':');
  const c = currentCountry()?.code === code ? currentCountry()! : undefined;
  if (!c) throw new Error(`Pays inconnu : ${code}`);
  const image = (key: string): Choice => ({ id: key, image: key });
  const flag = (k: string) => image(`flag-${k}`);
  const text = (t: string): Choice => ({ id: `t:${t}`, text: { value: t.toLocaleUpperCase('fr-FR'), script: 'caps' } });
  const take = <T>(list: T[], n: number, not: T[] = []) => shuffle(list.filter((x) => !not.includes(x)), rng).slice(0, n);
  const without = (list: string[], accept: string[]) => {
    const keys = new Set(accept.map((a) => withoutArticle(a, 'fr')));
    return list.filter((x) => !keys.has(withoutArticle(x, 'fr')));
  };
  const country = capitalize(c.name);
  const q = (prompt: string, accept: string[], others: string[], answer: Choice, distractors: Choice[], bravo: string,
    fallback?: string, hint?: string): BuiltQuestion => {
    const say: SayTarget = { lang: 'fr', accept, others: without(others, accept) };
    return {
      answer, distractors, prompt: [fr(prompt)], say, reinforce: [fr(bravo)],
      hints: [hint ? fr(`Indice : ${hint}`) : firstLetterHint(accept[0])],
      fallback: { prompt: [fr(fallback ?? `${prompt} Touche la bonne réponse !`)] },
    };
  };
  switch (type) {
    case 'name':
      return q('Comment s\'appelle le pays où tu habites ?', [c.name], [...Object.values(FAR_COUNTRIES), ...Object.values(COUNTRY_NAMES)],
        flag(c.code), take(FAR_FLAGS, 3, [c.code]).map(flag), `Oui ! Tu habites ${c.in} !`,
        'Quel est le drapeau de ton pays ? Touche-le !');
    case 'language':
      return q(`Quelle langue est-ce qu'on parle ${c.in} ?`, c.languages, LANGUAGE_NAMES, flag(c.code),
        take(FAR_FLAGS, 3, [c.code]).map(flag),
        c.languages.length > 1
          ? `Oui ! ${capitalize(c.in)}, on parle ${c.languages.map((l) => withoutArticle(l, 'fr')).join(', ').replace(/, ([^,]*)$/, ' et $1')} !`
          : `Oui ! ${capitalize(c.in)}, on parle ${withoutArticle(c.languages[0], 'fr')}, comme moi !`,
        `Touche le drapeau ${c.of} !`);
    case 'people':
      return q(`Comment s'appellent les habitants ${c.of} ?`, c.people, PEOPLES, flag(c.code),
        take(FAR_FLAGS, 3, [c.code]).map(flag), `Oui ! ${capitalize(c.people[0])} habitent ${c.in} !`,
        `Touche le drapeau ${c.of} !`);
    case 'capital':
      return q(`Quelle est la capitale ${c.of} ?`, [c.capital], c.cities, text(c.capital), take(c.cities, 3).map(text),
        `Oui ! La capitale ${c.of}, c'est ${c.capital} !`, `Quelle est la capitale ${c.of} ? Lis bien les noms des villes !`);
    case 'food':
      return q(`Dis-moi une spécialité qu'on aime manger ${c.in} !`, c.foods.map(([, name]) => name), FOREIGN_FOOD_NAMES,
        image(c.foods[0][0]), take(FOREIGN_FOODS, 3).map(image), `Miam ! C'est une spécialité ${c.of} !`,
        `Lequel est une spécialité ${c.of} ? Touche-le !`, `pense à ce qu'on achète à la boulangerie ou au marché.`);
    case 'currency': {
      const [img, name] = c.currency!;
      return q(`Avec quel argent est-ce qu'on paie ${c.in} ?`, [name], CURRENCY_NAMES, image(img), take(BANKNOTES, 3, [img]).map(image),
        `Oui ! ${capitalize(c.in)}, on paie avec ${name} !`);
    }
    case 'symbol': {
      const [img, name] = animalSymbol(c)!;
      return q(`Quel animal est le symbole ${c.of} ?`, [name, frWithArticle(conceptById(img))],
        OTHER_ANIMALS.map((a) => frWithArticle(conceptById(a))), image(img), take(OTHER_ANIMALS, 3, [img]).map(image),
        `Oui ! ${capitalize(name)}, c'est le symbole ${c.of} !`);
    }
    case 'landmark': {
      const [img, question, name, others] = c.landmark!;
      return q(question, [name], LANDMARKS, image(img), take(others, 3).map(image), `Oui ! C'est ${name} !`);
    }
    case 'day':
      return q(`Quel jour est la fête nationale ${c.of} ?`, [c.nationalDay], DAYS, image('cty-fireworks'),
        take(CELEBRATIONS, 3).map(image), `Oui ! ${capitalize(c.nationalDay)}, c'est la fête nationale ${c.of} !`,
        `Le jour de la fête nationale ${c.of}, qu'est-ce qu'on regarde dans le ciel, le soir ?`, 'c\'est en été.');
    default: {
      const names = c.neighbours.map((n) => COUNTRY_NAMES[n]).filter(Boolean);
      return q(`Dis-moi le nom d'un pays voisin ${c.of} !`, names, Object.values(FAR_COUNTRIES), flag(c.neighbours[0]),
        take(FAR_FLAGS, 3, [c.code, ...c.neighbours]).map(flag),
        `Oui ! C'est un voisin ${c.of}. ${country} a des voisins : ${names.join(', ')}.`,
        `Lequel de ces drapeaux est celui d'un pays voisin ${c.of} ?`, 'c\'est un pays tout proche, où on peut aller en voiture.');
    }
  }
}

const myCountryAloud: GameDef = {
  id: 'VO-11',
  category: 'world',
  voice: 'fr',
  minAge: 5,
  icon: 'my-country',
  color: 0x2563eb,
  introLine: 'intro.VO-11',
  homeLine: 'home.VO-11',
  shortLine: 'short.VO-11',
  get questions() {
    const c = currentCountry();
    return c ? myCountryQuestions(c) : [];
  },
  build: (ref, _level, rng) => buildMyCountry(ref, rng),
};

export const VOICE_GAMES: GameDef[] = [
  nameIt, sayEnglish, readAloud, ...ORAL_THEMES.slice(0, 7).map(riddleGame), myCountryAloud, riddleGame(ORAL_THEMES[7]),
];
