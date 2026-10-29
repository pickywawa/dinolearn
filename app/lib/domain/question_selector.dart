import 'dart:math';

import 'balance.dart';
import 'models.dart';

class SelectedQuestion {
  const SelectedQuestion(this.question, {this.isReview = false});

  final QuestionRef question;

  /// Question déjà maîtrisée, reposée parce que le jeu est épuisé.
  final bool isReview;
}

/// Sélection des questions d'une série (spécifications §7.3).
class QuestionSelector {
  QuestionSelector(this.balance, {Random? random}) : _random = random ?? Random();

  final Balance balance;
  final Random _random;

  List<SelectedQuestion> pick({
    required List<QuestionRef> questions,
    required int level,
    required int count,
    required Set<String> mastered,
    required Set<String> recent,
    required Set<String> toRetry,
  }) {
    final candidates = questions
        .where((q) => !mastered.contains(q.id) && !recent.contains(q.id))
        .toList();
    final picks = <QuestionRef>[];

    final retry = candidates
        .where((q) => toRetry.contains(q.id) && q.level <= level + 1)
        .toList()
      ..shuffle(_random);
    picks.addAll(retry.take((count * balance.retryShare).round()));

    while (picks.length < count) {
      final q = _nearestAvailable(candidates, _weightedLevel(level), picks);
      if (q == null) break;
      picks.add(q);
    }

    final result = [for (final q in picks) SelectedQuestion(q)];
    if (result.length < count) {
      result.addAll(_review(questions, mastered, recent, picks, count - result.length));
    }
    return _diversify(result);
  }

  int _weightedLevel(int level) {
    final r = _random.nextDouble();
    if (r < balance.levelMixSame) return level;
    if (r < balance.levelMixSame + balance.levelMixBelow) return level - 1;
    return level + 1;
  }

  /// Question au niveau demandé, sinon au niveau le plus proche (N±1, N±2…).
  QuestionRef? _nearestAvailable(
      List<QuestionRef> candidates, int level, List<QuestionRef> exclude) {
    for (var distance = 0; distance < 10; distance++) {
      final levels = distance == 0 ? [level] : [level - distance, level + distance];
      final pool = candidates
          .where((q) => levels.contains(q.level) && !exclude.contains(q))
          .toList();
      if (pool.isNotEmpty) return pool[_random.nextInt(pool.length)];
    }
    return null;
  }

  /// Mode révision : questions maîtrisées (ou récentes en dernier recours).
  List<SelectedQuestion> _review(List<QuestionRef> questions, Set<String> mastered,
      Set<String> recent, List<QuestionRef> exclude, int missing) {
    final masteredPool = questions
        .where((q) => mastered.contains(q.id) && !recent.contains(q.id) && !exclude.contains(q))
        .toList()
      ..shuffle(_random);
    final fallback = questions.where((q) => !exclude.contains(q)).toList()..shuffle(_random);
    final pool = [...masteredPool, ...fallback.where((q) => !masteredPool.contains(q))];
    return [for (final q in pool.take(missing)) SelectedQuestion(q, isReview: true)];
  }

  /// Mélange en évitant deux fois la même question à la suite.
  List<SelectedQuestion> _diversify(List<SelectedQuestion> items) {
    items.shuffle(_random);
    for (var i = 1; i < items.length; i++) {
      if (items[i].question.id == items[i - 1].question.id) {
        final swap = items.indexWhere(
            (s) => s.question.id != items[i].question.id, i + 1);
        if (swap > 0) {
          final tmp = items[i];
          items[i] = items[swap];
          items[swap] = tmp;
        }
      }
    }
    return items;
  }
}
