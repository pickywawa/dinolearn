import 'dart:math';

import '../content/models.dart';

/// Choisit les mauvaises réponses d'une question à concepts (spécifications §9.3).
class DistractorPicker {
  DistractorPicker({Random? random}) : _random = random ?? Random();

  final Random _random;

  List<Concept> pick({
    required Concept answer,
    required List<Concept> pool,
    required int count,
    required DistractorStrategy strategy,
  }) {
    final others = pool.where((c) => c.id != answer.id).toList()..shuffle(_random);
    final ordered = switch (strategy) {
      DistractorStrategy.otherCategory => [
          ...others.where((c) => c.category != answer.category),
          ...others.where((c) => c.category == answer.category),
        ],
      DistractorStrategy.sameCategory => [
          ...others.where((c) => c.category == answer.category),
          ...others.where((c) => c.category != answer.category),
        ],
      DistractorStrategy.similar => [
          ...others.where((c) => answer.similar.contains(c.id)),
          ...others.where(
              (c) => c.category == answer.category && !answer.similar.contains(c.id)),
          ...others.where(
              (c) => c.category != answer.category && !answer.similar.contains(c.id)),
        ],
    };
    return _distinctWords(answer, ordered).take(count).toList();
  }

  /// Évite deux choix qui se prononcent pareil (ex. « orange » couleur et fruit).
  Iterable<Concept> _distinctWords(Concept answer, List<Concept> ordered) sync* {
    final seen = <String>{answer.word('en')};
    for (final c in ordered) {
      if (seen.add(c.word('en'))) yield c;
    }
  }
}
