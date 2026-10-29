import { BALANCE, Balance, clamp } from './balance';
import { AnswerRecord } from './models';

/** Calcul du niveau de difficulté d'un mini-jeu (spécifications §7.2). */
export function baseLevel(experienceLevel: number, age: number, b: Balance = BALANCE): number {
  return clamp(Math.ceil(experienceLevel / 2) + (b.ageLevelOffset[clamp(age, 3, 7)] ?? 0), 1, b.maxLevel);
}

export function adjustment(successRate: number, b: Balance = BALANCE): number {
  for (const [threshold, adjust] of b.successAdjust) {
    if (successRate >= threshold) return adjust;
  }
  return b.successAdjust[b.successAdjust.length - 1][1];
}

/** Réponses du jeu, sinon de la catégorie, sinon toutes (du plus récent au plus ancien). */
export function sample(
  sources: AnswerRecord[][],
  b: Balance = BALANCE,
): AnswerRecord[] {
  for (const answers of sources) {
    if (answers.length >= b.successWindowMin) return answers.slice(0, b.successWindow);
  }
  return [];
}

export function computeLevel(
  opts: {
    experienceLevel: number;
    age: number;
    gameAnswers: AnswerRecord[];
    categoryAnswers: AnswerRecord[];
    allAnswers: AnswerRecord[];
    previousLevel?: number;
  },
  b: Balance = BALANCE,
): number {
  const base = baseLevel(opts.experienceLevel, opts.age, b);
  const window = sample([opts.gameAnswers, opts.categoryAnswers, opts.allAnswers], b);
  const adjust = window.length === 0
    ? 0
    : adjustment(window.filter((a) => a.firstTrySuccess).length / window.length, b);
  const target = clamp(base + adjust, 1, b.maxLevel);
  if (opts.previousLevel === undefined) return target;
  const step = b.maxLevelStepPerSeries;
  return clamp(clamp(target, opts.previousLevel - step, opts.previousLevel + step), 1, b.maxLevel);
}
