import { BALANCE, Balance } from './balance';
import { DinoState } from './models';

export type FeedOutcome = 'eaten' | 'levelUp' | 'full' | 'maxLevel';

export interface FeedResult {
  outcome: FeedOutcome;
  dino: DinoState;
  xpEatenToday: number;
}

/** Croissance du dinosaure par le nourrissage (spécifications §5.5, §6). */
export function xpToNext(level: number, b: Balance = BALANCE): number {
  return b.xpA + Math.round(b.xpB * Math.pow(level, b.xpExp));
}

/** Stade de croissance : 1 Bébé … 5 Géant. */
export function stageFor(level: number): number {
  return Math.min(5, Math.max(1, Math.floor((level - 1) / 4) + 1));
}

export function growthProgress(dino: DinoState, b: Balance = BALANCE): number {
  return dino.level >= b.dinoMaxLevel ? 1 : dino.xp / xpToNext(dino.level, b);
}

export function feed(dino: DinoState, value: number, xpEatenToday: number, b: Balance = BALANCE): FeedResult {
  if (xpEatenToday >= b.dailyXpCap) return { outcome: 'full', dino, xpEatenToday };
  if (dino.level >= b.dinoMaxLevel) return { outcome: 'maxLevel', dino, xpEatenToday };
  let level = dino.level;
  let xp = dino.xp + value;
  let leveledUp = false;
  while (level < b.dinoMaxLevel && xp >= xpToNext(level, b)) {
    xp -= xpToNext(level, b);
    level++;
    leveledUp = true;
  }
  if (level >= b.dinoMaxLevel) xp = 0;
  return {
    outcome: leveledUp ? 'levelUp' : 'eaten',
    dino: { level, xp },
    xpEatenToday: xpEatenToday + value,
  };
}
