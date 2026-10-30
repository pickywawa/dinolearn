/** Paramètres d'équilibrage (spécifications §17.1). */
export const BALANCE = {
  seriesLengthByAge: { 3: 6, 4: 6, 5: 8, 6: 10, 7: 10 } as Record<number, number>,
  starsThresholds: [0.4, 0.7, 0.9],
  /** XP d'un fruit (+1 tous les 4 niveaux de difficulté) et du gâteau du sans-faute. */
  fruitXp: 2,
  cakeXp: 6,
  /** Le dino peut beaucoup manger avant d'avoir le ventre plein (≈ 10 séries par jour). */
  dailyXpCap: 200,
  dinoMaxLevel: 40,
  xpA: 10,
  xpB: 8,
  xpExp: 1.3,
  ageLevelOffset: { 3: 0, 4: 1, 5: 2, 6: 3, 7: 4 } as Record<number, number>,
  successWindow: 100,
  successWindowMin: 20,
  /** [taux minimum, ajustement], par taux décroissant. */
  successAdjust: [
    [0.9, 2],
    [0.75, 1],
    [0.5, 0],
    [0.35, -1],
    [0, -2],
  ] as [number, number][],
  levelMixSame: 0.7,
  levelMixBelow: 0.2,
  retryShare: 0.2,
  retryMaxAgeDays: 14,
  recentSeriesExcluded: 2,
  maxLevelStepPerSeries: 1,
  hintAfterWrongAttempts: 2,
  idleReminderMs: 7000,
  idlePointMs: 12000,
  minQuestionsForReward: 3,
  /** Difficulté max : 1–10 maternelle, 11–20 niveau CP (dino niveaux 21 à 40). */
  maxLevel: 20,
};

export type Balance = typeof BALANCE;

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function seriesLengthFor(age: number, b: Balance = BALANCE): number {
  return b.seriesLengthByAge[clamp(age, 3, 7)];
}
