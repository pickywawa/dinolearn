import conceptsJson from './concepts.json';
import { Rng, shuffle } from '../domain/models';

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

/** Un morceau de parole : texte et langue. */
export interface Speech {
  text: string;
  lang: 'fr' | 'en';
  slow?: boolean;
  /** Silence après ce morceau, en ms (180 par défaut). */
  pauseAfter?: number;
}

/** Concepts ayant un niveau pour un jeu donné (champ `levels` du lexique). */
export const conceptsFor = (gameId: string): Concept[] =>
  CONCEPTS.filter((c) => c.levels[gameId] !== undefined);

export const conceptById = (id: string): Concept => {
  const c = CONCEPTS.find((x) => x.id === id);
  if (!c) throw new Error(`Concept inconnu : ${id}`);
  return c;
};

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

/** Indice de famille, au singulier (« c'est un animal de la ferme »). */
export const CATEGORY_HINTS: Record<string, string> = {
  farm: 'un animal de la ferme', sea: 'un animal de la mer', bird: 'un oiseau', bug: 'une petite bête',
  wild: 'un animal sauvage', forest: 'un animal de la forêt', fruit: 'un fruit', veg: 'un légume',
  meal: 'quelque chose qui se mange', vehicle: 'un véhicule', toy: 'un jouet', home: 'un objet de la maison',
  clothes: 'quelque chose qu\'on porte', tool: 'un outil', kitchen: 'un objet de tous les jours',
  music: 'un instrument de musique', sky: 'quelque chose qu\'on voit dans le ciel', plant: 'une plante',
  body: 'une partie du corps', landscape: 'un endroit', color: 'une couleur', element: 'quelque chose de la nature',
};
