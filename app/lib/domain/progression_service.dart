import 'dart:math';

import 'balance.dart';
import 'models.dart';

class DinoState {
  const DinoState({this.level = 1, this.xp = 0});

  final int level;

  /// XP accumulée vers le niveau suivant.
  final int xp;

  Map<String, dynamic> toJson() => {'level': level, 'xp': xp};

  factory DinoState.fromJson(Map<String, dynamic> json) =>
      DinoState(level: json['level'] as int, xp: json['xp'] as int);
}

enum FeedOutcome { eaten, levelUp, full, maxLevel }

class FeedResult {
  const FeedResult(this.outcome, this.dino, this.xpEatenToday);

  final FeedOutcome outcome;
  final DinoState dino;
  final int xpEatenToday;
}

/// Croissance du dinosaure par le nourrissage (spécifications §5.5, §6).
class ProgressionService {
  const ProgressionService(this.balance);

  final Balance balance;

  int xpToNext(int level) =>
      balance.xpA + (balance.xpB * pow(level, balance.xpExp)).round();

  /// Stade de croissance (1 Bébé … 5 Géant).
  int stageFor(int level) => ((level - 1) ~/ 4 + 1).clamp(1, 5);

  double progress(DinoState dino) =>
      dino.level >= balance.dinoMaxLevel ? 1 : dino.xp / xpToNext(dino.level);

  /// Un aliment est mangé entièrement s'il reste de la place dans le ventre ;
  /// sinon il reste dans le garde-manger (rien n'est perdu).
  FeedResult feed(DinoState dino, Food food, int xpEatenToday) {
    if (xpEatenToday >= balance.dailyXpCap) {
      return FeedResult(FeedOutcome.full, dino, xpEatenToday);
    }
    if (dino.level >= balance.dinoMaxLevel) {
      return FeedResult(FeedOutcome.maxLevel, dino, xpEatenToday);
    }
    var level = dino.level;
    var xp = dino.xp + food.xp;
    var leveledUp = false;
    while (level < balance.dinoMaxLevel && xp >= xpToNext(level)) {
      xp -= xpToNext(level);
      level++;
      leveledUp = true;
    }
    if (level >= balance.dinoMaxLevel) xp = 0;
    return FeedResult(
      leveledUp ? FeedOutcome.levelUp : FeedOutcome.eaten,
      DinoState(level: level, xp: xp),
      xpEatenToday + food.xp,
    );
  }
}
