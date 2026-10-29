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

export type Food = 'leaf' | 'apple' | 'cherry' | 'watermelon' | 'cake';

/** Valeur nutritive (XP) et image de chaque aliment (spécifications §5.4). */
export const FOODS: Record<Food, { xp: number; image: string }> = {
  leaf: { xp: 1, image: 'ui-leaf' },
  apple: { xp: 2, image: 'ui-apple' },
  cherry: { xp: 4, image: 'ui-cherry' },
  watermelon: { xp: 6, image: 'ui-citrus' },
  cake: { xp: 12, image: 'ui-cake' },
};

export const FOOD_ORDER: Food[] = ['leaf', 'apple', 'cherry', 'watermelon', 'cake'];

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
