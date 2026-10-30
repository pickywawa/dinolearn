import { BALANCE, Balance } from './balance';
import { Food, FRUITS, Rng, shuffle } from './models';

/** Étoiles d'une série (spécifications §5.3). */
export function starsFor(score: number, b: Balance = BALANCE): number {
  return b.starsThresholds.filter((t) => score >= t).length;
}

/** Fruits tous différents pour les `count` questions d'une série. */
export function seriesFruits(count: number, rng: Rng): Food[] {
  return shuffle([...FRUITS], rng).slice(0, count);
}

/** Valeur nutritive (XP) d'un aliment : les niveaux difficiles nourrissent plus. */
export function foodXp(food: Food, level: number, b: Balance = BALANCE): number {
  return food === 'cake' ? b.cakeXp : b.fruitXp + Math.floor(level / 4);
}
