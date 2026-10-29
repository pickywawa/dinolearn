/// Paramètres d'équilibrage (cf. spécifications §17.1).
///
/// Toutes les valeurs sont centralisées ici pour pouvoir être ajustées
/// (et, en V1, surchargées par un `balance.json` téléchargé).
class Balance {
  const Balance({
    this.seriesLengthByAge = const {3: 6, 4: 6, 5: 8, 6: 10, 7: 10},
    this.starsThresholds = const [0.4, 0.7, 0.9],
    this.goldenFruitChance = 0.3,
    this.goldenFruitMinLevel = 5,
    this.dailyXpCap = 40,
    this.dinoMaxLevel = 20,
    this.xpA = 10,
    this.xpB = 8,
    this.xpExp = 1.3,
    this.ageLevelOffset = const {3: 0, 4: 0, 5: 1, 6: 2, 7: 3},
    this.successWindow = 100,
    this.successWindowMin = 20,
    this.successAdjust = const [
      (0.9, 2),
      (0.75, 1),
      (0.5, 0),
      (0.35, -1),
      (0.0, -2),
    ],
    this.levelMixSame = 0.7,
    this.levelMixBelow = 0.2,
    this.retryShare = 0.2,
    this.retryMaxAgeDays = 14,
    this.recentSeriesExcluded = 2,
    this.maxLevelStepPerSeries = 1,
    this.hintAfterWrongAttempts = 2,
    this.idleReminder = const Duration(seconds: 8),
    this.idlePoint = const Duration(seconds: 15),
    this.minQuestionsForReward = 3,
  });

  final Map<int, int> seriesLengthByAge;
  final List<double> starsThresholds;
  final double goldenFruitChance;
  final int goldenFruitMinLevel;
  final int dailyXpCap;
  final int dinoMaxLevel;
  final int xpA;
  final int xpB;
  final double xpExp;
  final Map<int, int> ageLevelOffset;
  final int successWindow;
  final int successWindowMin;

  /// Paires (taux minimum, ajustement), triées par taux décroissant.
  final List<(double, int)> successAdjust;
  final double levelMixSame;
  final double levelMixBelow;
  final double retryShare;
  final int retryMaxAgeDays;
  final int recentSeriesExcluded;
  final int maxLevelStepPerSeries;
  final int hintAfterWrongAttempts;
  final Duration idleReminder;
  final Duration idlePoint;
  final int minQuestionsForReward;

  int seriesLengthFor(int age) => seriesLengthByAge[age.clamp(3, 7)]!;
}
