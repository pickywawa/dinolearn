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
  /** Niveau de départ selon l'âge (1–10 maternelle, 11–20 CP). */
  ageLevelOffset: { 3: 1, 4: 3, 5: 5, 6: 8, 7: 11 } as Record<number, number>,
  /** Le niveau du dino fait monter la difficulté de 1 tous les `xpLevelsPerStep` niveaux. */
  xpLevelsPerStep: 3,
  /** Difficulté maximale selon l'âge : pas de questions de CP pour les petits. */
  ageLevelCap: { 3: 8, 4: 11, 5: 15, 6: 20, 7: 20 } as Record<number, number>,
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
  /** Révision espacée : une question ratée revient 1 jour, puis 3 jours, puis 7 jours plus tard. */
  reviewDays: [1, 3, 7],
  /** Part maximale de questions à réviser dans une série. */
  reviewShare: 0.4,
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
