export interface AnswerRecord {
  gameId: string;
  category: string;
  questionId: string;
  level: number;
  firstTrySuccess: boolean;
  /** Horodatage en millisecondes. */
  at: number;
}

export interface QuestionRef {
  id: string;
  level: number;
}

/**
 * Fruits de la barre de progression : chaque question d'une série a son
 * fruit (tous différents) ; il est gagné si la réponse est trouvée du premier
 * coup, puis donné à manger au dino. `cake` est le bonus du sans-faute.
 */
export const FRUITS = [
  'red-apple', 'banana', 'strawberry', 'cherries', 'grapes', 'tangerine', 'pear', 'lemon',
  'watermelon', 'peach', 'pineapple', 'kiwi-fruit', 'mango', 'blueberries', 'melon',
  'green-apple', 'coconut',
] as const;

export type Food = (typeof FRUITS)[number] | 'cake';

/** Clé de l'image d'un aliment (public/img/food-*.svg). */
export const foodImage = (food: Food) => `food-${food}`;

export interface DinoState {
  level: number;
  /** XP accumulée vers le niveau suivant. */
  xp: number;
}

/** Générateur aléatoire injectable (tests déterministes). */
export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: T[], rng: Rng): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

export const pick = <T>(items: readonly T[], rng: Rng): T => items[Math.floor(rng() * items.length)];
