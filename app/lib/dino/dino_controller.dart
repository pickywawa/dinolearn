import 'package:flutter/foundation.dart';

enum DinoReaction { none, happy, cheer, dance, oops, think, eat, levelUp, tickle, point }

/// Pilote les réactions du dino (équivalent des *triggers* de la state
/// machine Rive prévue en V1, spécifications §3.2).
class DinoController extends ChangeNotifier {
  DinoController({required this.talking});

  /// Branché sur la voix : anime la bouche.
  final ValueListenable<bool> talking;

  DinoReaction _reaction = DinoReaction.none;
  int _reactionId = 0;

  DinoReaction get reaction => _reaction;

  /// Change à chaque déclenchement, même pour une réaction identique.
  int get reactionId => _reactionId;

  void react(DinoReaction reaction) {
    _reaction = reaction;
    _reactionId++;
    notifyListeners();
  }
}
