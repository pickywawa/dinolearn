import { BALANCE, Balance } from './balance';
import { Food, Rng } from './models';

/** Étoiles et aliments gagnés à la fin d'une série (spécifications §5.3, §5.4). */
export function starsFor(score: number, b: Balance = BALANCE): number {
  return b.starsThresholds.filter((t) => score >= t).length;
}

export function rewardsFor(
  opts: { stars: number; perfect: boolean; level: number; firstSeriesOfDay: boolean },
  rng: Rng,
  b: Balance = BALANCE,
): Partial<Record<Food, number>> {
  const rewards: Partial<Record<Food, number>> = {};
  const add = (food: Food) => (rewards[food] = (rewards[food] ?? 0) + 1);
  const { stars, perfect, level, firstSeriesOfDay } = opts;

  add('leaf');
  if (stars >= 1) add('apple');
  if (stars >= 2) add('cherry');
  if (stars >= 3) add('watermelon');
  if (perfect && level >= b.goldenFruitMinLevel && rng() < b.goldenFruitChance) add('cake');
  if (stars >= 2 && level >= 4 && level <= 7) add('apple');
  if (stars >= 2 && level >= 8) add('cherry');
  if (firstSeriesOfDay) add('leaf');
  return rewards;
}
