import conceptsJson from './concepts.json';
import { QuestionRef, Rng, shuffle } from '../domain/models';

export interface Concept {
  id: string;
  icon: string;
  /** Grande famille : animal, food, object, nature, body, place, color. */
  group: string;
  /** Sous-famille : farm, sea, bird, fruit, vehicle, music… */
  category: string;
  levels: Partial<Record<string, number>>;
  fr: { article: string; word: string };
  en: { word: string };
}

export const CONCEPTS = conceptsJson.concepts as Concept[];

/** « le chien », « l'oiseau », « rouge ». */
export function frWithArticle(c: Concept): string {
  const { article, word } = c.fr;
  if (!article) return word;
  return article.endsWith("'") ? `${article}${word}` : `${article} ${word}`;
}

/**
 * Choix des mauvaises réponses, du plus facile au plus difficile :
 * autre famille (un chien parmi des fruits), même famille (parmi des animaux),
 * même sous-famille (parmi des animaux de la mer).
 */
export type DistractorStrategy = 'other_group' | 'same_group' | 'same_category';

/** 4 réponses à chaque question ; les leurres se rapprochent avec le niveau. */
const CHOICES = [4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
const DISTRACTORS: DistractorStrategy[] = [
  'other_group', 'same_group', 'same_group', 'same_group', 'same_category',
  'same_category', 'same_category', 'same_category', 'same_category', 'same_category',
];

/** Un morceau de parole : texte et langue. */
export interface Speech {
  text: string;
  lang: 'fr' | 'en';
  slow?: boolean;
}

export interface GameDef {
  id: string;
  category: 'foreign_language' | 'world';
  /** Image de la bulle du jeu (public/img). */
  icon: string;
  /** Couleur de la bulle et du décor. */
  color: number;
  introLine: string;
  choicesByLevel: number[];
  distractorsByLevel: DistractorStrategy[];
  /** Consigne de chaque question. */
  prompt(c: Concept, level: number): Speech[];
  /** Renforcement après la bonne réponse. */
  reinforce(c: Concept): Speech[];
}

export const GAMES: GameDef[] = [
  {
    id: 'EN-1',
    category: 'foreign_language',
    icon: 'flag-gb',
    color: 0x3b7de9,
    introLine: 'intro.EN-1',
    choicesByLevel: CHOICES,
    distractorsByLevel: DISTRACTORS,
    prompt: (c, level) => [{ text: c.en.word, lang: 'en', slow: level <= 3 }],
    reinforce: (c) => [
      { text: c.en.word, lang: 'en' },
      { text: `${frWithArticle(c)} !`, lang: 'fr' },
    ],
  },
  {
    id: 'MO-1',
    category: 'world',
    icon: 'ui-globe',
    color: 0x30a46c,
    introLine: 'intro.MO-1',
    choicesByLevel: CHOICES,
    distractorsByLevel: DISTRACTORS,
    prompt: (c) => [{ text: `Montre-moi ${frWithArticle(c)} !`, lang: 'fr' }],
    reinforce: (c) => [{ text: `Oui, ${frWithArticle(c)} !`, lang: 'fr' }],
  },
];

export const gameById = (id: string): GameDef => {
  const game = GAMES.find((g) => g.id === id);
  if (!game) throw new Error(`Jeu inconnu : ${id}`);
  return game;
};

export const conceptsFor = (gameId: string): Concept[] =>
  CONCEPTS.filter((c) => c.levels[gameId] !== undefined);

export const questionId = (gameId: string, c: Concept) => `${gameId}:${c.id}`;

export const questionsFor = (gameId: string): QuestionRef[] =>
  conceptsFor(gameId).map((c) => ({ id: questionId(gameId, c), level: c.levels[gameId]! }));

export const choicesFor = (g: GameDef, level: number) => g.choicesByLevel[Math.min(9, level - 1)];
export const distractorsFor = (g: GameDef, level: number) => g.distractorsByLevel[Math.min(9, level - 1)];

/** Mauvaises réponses d'une question (sans doublon de mot prononcé). */
export function pickDistractors(
  answer: Concept,
  pool: Concept[],
  count: number,
  strategy: DistractorStrategy,
  rng: Rng,
): Concept[] {
  const others = shuffle(pool.filter((c) => c.id !== answer.id), rng);
  const sameCategory = others.filter((c) => c.category === answer.category);
  const sameGroup = others.filter((c) => c.group === answer.group && c.category !== answer.category);
  const otherGroup = others.filter((c) => c.group !== answer.group);
  const ordered = {
    other_group: [...otherGroup, ...sameGroup, ...sameCategory],
    same_group: [...shuffle([...sameGroup, ...sameCategory], rng), ...otherGroup],
    same_category: [...sameCategory, ...sameGroup, ...otherGroup],
  }[strategy];
  const seen = new Set([answer.en.word, answer.fr.word]);
  const result: Concept[] = [];
  for (const c of ordered) {
    if (result.length >= count) break;
    if (seen.has(c.en.word) || seen.has(c.fr.word)) continue;
    seen.add(c.en.word);
    seen.add(c.fr.word);
    result.push(c);
  }
  return result;
}
