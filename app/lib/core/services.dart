import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../audio/voice_service.dart';
import '../content/content_repository.dart';
import '../dino/dino_controller.dart';
import '../domain/balance.dart';
import '../domain/difficulty_service.dart';
import '../domain/distractor_picker.dart';
import '../domain/progression_service.dart';
import '../domain/question_selector.dart';
import '../domain/reward_service.dart';
import '../progress/progress_repository.dart';

/// Services partagés, créés au démarrage (`main.dart`) et injectés par Riverpod.
class AppServices {
  AppServices({
    required this.content,
    required this.progress,
    required this.voice,
    this.balance = const Balance(),
  })  : dino = DinoController(talking: voice.talking),
        difficulty = DifficultyService(balance),
        selector = QuestionSelector(balance),
        distractors = DistractorPicker(),
        rewards = RewardService(balance),
        progression = ProgressionService(balance);

  final Balance balance;
  final ContentRepository content;
  final ProgressRepository progress;
  final VoiceService voice;

  /// Un seul dino « vivant » partagé par tous les écrans.
  final DinoController dino;
  final DifficultyService difficulty;
  final QuestionSelector selector;
  final DistractorPicker distractors;
  final RewardService rewards;
  final ProgressionService progression;

  /// Facteur de taille d'affichage du dino selon son niveau.
  double get dinoGrowth => 0.85 + progress.dino.level * 0.015;
}

final servicesProvider = Provider<AppServices>(
  (ref) => throw UnimplementedError('Surchargé dans main.dart'),
);
