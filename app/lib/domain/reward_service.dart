import 'dart:math';

import 'balance.dart';
import 'models.dart';

/// Étoiles et aliments gagnés à la fin d'une série (spécifications §5.3, §5.4).
class RewardService {
  RewardService(this.balance, {Random? random}) : _random = random ?? Random();

  final Balance balance;
  final Random _random;

  int starsFor(double score) =>
      balance.starsThresholds.where((t) => score >= t).length;

  Map<Food, int> rewardsFor({
    required int stars,
    required bool perfect,
    required int level,
    required bool firstSeriesOfDay,
  }) {
    final rewards = <Food, int>{};
    void add(Food food) => rewards[food] = (rewards[food] ?? 0) + 1;

    add(Food.leaf);
    if (stars >= 1) add(Food.apple);
    if (stars >= 2) add(Food.berries);
    if (stars >= 3) add(Food.watermelon);
    if (perfect &&
        level >= balance.goldenFruitMinLevel &&
        _random.nextDouble() < balance.goldenFruitChance) {
      add(Food.goldenFruit);
    }
    if (stars >= 2 && level >= 4 && level <= 7) add(Food.apple);
    if (stars >= 2 && level >= 8) add(Food.berries);
    if (firstSeriesOfDay) add(Food.leaf);
    return rewards;
  }
}
