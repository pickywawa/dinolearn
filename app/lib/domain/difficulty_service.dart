import 'balance.dart';
import 'models.dart';

/// Calcul du niveau de difficulté d'un mini-jeu (spécifications §7.2).
class DifficultyService {
  const DifficultyService(this.balance);

  final Balance balance;

  int baseLevel({required int experienceLevel, required int age}) {
    final offset = balance.ageLevelOffset[age.clamp(3, 7)] ?? 0;
    return ((experienceLevel / 2).ceil() + offset).clamp(1, 10);
  }

  /// Ajustement selon le taux de réussite du premier coup.
  int adjustment(double successRate) {
    for (final (threshold, adjust) in balance.successAdjust) {
      if (successRate >= threshold) return adjust;
    }
    return balance.successAdjust.last.$2;
  }

  /// Choisit l'échantillon de réponses : jeu, puis catégorie, puis global.
  /// Chaque liste doit être triée de la plus récente à la plus ancienne.
  List<AnswerRecord> sample({
    required List<AnswerRecord> gameAnswers,
    required List<AnswerRecord> categoryAnswers,
    required List<AnswerRecord> allAnswers,
  }) {
    for (final answers in [gameAnswers, categoryAnswers, allAnswers]) {
      if (answers.length >= balance.successWindowMin) {
        return answers.take(balance.successWindow).toList();
      }
    }
    return const [];
  }

  int computeLevel({
    required int experienceLevel,
    required int age,
    required List<AnswerRecord> gameAnswers,
    required List<AnswerRecord> categoryAnswers,
    required List<AnswerRecord> allAnswers,
    int? previousLevel,
  }) {
    final base = baseLevel(experienceLevel: experienceLevel, age: age);
    final window = sample(
      gameAnswers: gameAnswers,
      categoryAnswers: categoryAnswers,
      allAnswers: allAnswers,
    );
    final adjust = window.isEmpty
        ? 0
        : adjustment(
            window.where((a) => a.firstTrySuccess).length / window.length);
    final target = (base + adjust).clamp(1, 10);
    if (previousLevel == null) return target;
    final step = balance.maxLevelStepPerSeries;
    return target.clamp(previousLevel - step, previousLevel + step).clamp(1, 10);
  }
}
