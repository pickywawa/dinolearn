import 'dart:async';
import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

import '../audio/voice_service.dart';
import '../content/content_image.dart';
import '../content/models.dart';
import '../core/services.dart';
import '../dino/dino_controller.dart';
import '../domain/models.dart';

enum PlayMode { targeted, category, surprise }

enum SeriesPhase { intro, asking, feedback, finished }

class SeriesItem {
  SeriesItem(this.question, this.choices, {this.isReview = false});

  final ConceptQuestion question;
  final List<Concept> choices;
  final bool isReview;

  Concept get answer => question.concept;
}

class SeriesResult {
  const SeriesResult({
    required this.gameId,
    required this.mode,
    required this.level,
    required this.total,
    required this.firstTrySuccesses,
    required this.stars,
    required this.rewards,
  });

  final String gameId;
  final PlayMode mode;
  final int level;
  final int total;
  final int firstTrySuccesses;
  final int stars;
  final Map<Food, int> rewards;

  bool get perfect => firstTrySuccesses == total;
}

/// Déroulé d'une série de questions (spécifications §5.1–5.3).
/// Gabarit `audio_to_image` : la consigne est dite, l'enfant touche une image.
class SeriesController extends ChangeNotifier {
  SeriesController(this.services, this.game, this.mode, {Random? random})
      : _random = random ?? Random();

  final AppServices services;
  final GameDef game;
  final PlayMode mode;
  final Random _random;

  late final int level;
  late final List<SeriesItem> items;
  SeriesPhase phase = SeriesPhase.intro;
  int index = 0;
  final Set<String> disabled = {};
  String? correctId;
  int wrongAttempts = 0;
  bool hint = false;

  /// Les choix se trémoussent pour attirer l'attention (inactivité).
  bool attention = false;
  int firstTrySuccesses = 0;
  int _streak = 0;
  int _answered = 0;
  SeriesResult? result;

  Timer? _idleReminder;
  Timer? _idlePoint;
  bool _disposed = false;

  VoiceService get _voice => services.voice;
  DinoController get _dino => services.dino;

  SeriesItem get current => items[index];

  void start() {
    final progress = services.progress;
    final category = game.category.id;
    level = services.difficulty.computeLevel(
      experienceLevel: progress.dino.level,
      age: progress.age,
      gameAnswers: progress.answers(gameId: game.id),
      categoryAnswers: progress.answers(category: category),
      allAnswers: progress.answers(),
      previousLevel: progress.gameLevel(game.id),
    );

    final questions = services.content.questionsFor(game.id);
    final byId = {for (final q in questions) q.id: q};
    final selection = services.selector.pick(
      questions: [for (final q in questions) q.ref],
      level: level,
      count: services.balance.seriesLengthFor(progress.age),
      mastered: progress.mastered(game.id),
      recent: progress.recentQuestions(game.id, services.balance.recentSeriesExcluded),
      toRetry: progress.toRetry(game.id, maxAgeDays: services.balance.retryMaxAgeDays),
    );

    final pool = services.content.conceptsFor(game.id);
    final positions = <int>[];
    items = [
      for (final s in selection)
        _buildItem(byId[s.question.id]!, pool, s.isReview, positions),
    ];
    ContentCache.prefetch({
      for (final item in items)
        for (final c in item.choices) c.image,
    });
    _intro();
  }

  SeriesItem _buildItem(
      ConceptQuestion q, List<Concept> pool, bool isReview, List<int> positions) {
    final distractors = services.distractors.pick(
      answer: q.concept,
      pool: pool,
      count: game.choicesFor(level) - 1,
      strategy: game.distractorsFor(level),
    );
    final choices = [...distractors]..shuffle(_random);
    // Position de la bonne réponse : jamais 3 fois de suite la même.
    var position = _random.nextInt(choices.length + 1);
    if (positions.length >= 2 &&
        positions[positions.length - 1] == position &&
        positions[positions.length - 2] == position) {
      position = (position + 1) % (choices.length + 1);
    }
    positions.add(position);
    choices.insert(position, q.concept);
    return SeriesItem(q, choices, isReview: isReview);
  }

  Future<void> _intro() async {
    phase = SeriesPhase.intro;
    _notify();
    final allReview = items.isNotEmpty && items.every((i) => i.isReview);
    await _voice.say([
      if (allReview) Speech(_voice.lines.pick('review_mode')),
      Speech(_voice.lines.pick(game.introLine)),
    ]);
    if (_disposed) return;
    _ask();
  }

  Speech get _prompt =>
      Speech(current.answer.word('en'), locale: 'en', slow: level <= 3);

  void _ask() {
    phase = SeriesPhase.asking;
    _notify();
    _voice.say([_prompt]);
    _armIdle();
  }

  /// Bouton oreille : répète la consigne.
  void repeatPrompt() {
    if (phase != SeriesPhase.asking) return;
    _voice.say([_prompt]);
    _armIdle();
  }

  Future<void> tap(Concept choice) async {
    if (phase != SeriesPhase.asking || disabled.contains(choice.id)) return;
    _cancelIdle();
    attention = false;
    if (choice.id == current.answer.id) {
      await _onCorrect();
    } else {
      await _onWrong(choice);
    }
  }

  Future<void> _onCorrect() async {
    phase = SeriesPhase.feedback;
    correctId = current.answer.id;
    final firstTry = wrongAttempts == 0;
    if (firstTry) {
      firstTrySuccesses++;
      _streak++;
    } else {
      _streak = 0;
    }
    _answered++;
    HapticFeedback.mediumImpact();
    _dino.react(_streak == 3 ? DinoReaction.cheer : DinoReaction.happy);
    _notify();

    unawaited(services.progress.recordAnswer(AnswerRecord(
      gameId: game.id,
      category: game.category.id,
      questionId: current.question.id,
      level: current.question.level,
      firstTrySuccess: firstTry,
      answeredAt: DateTime.now(),
    )));

    final praise = _streak == 3
        ? _voice.lines.pick('streak')
        : (_random.nextInt(3) == 0 ? _voice.lines.pick('correct') : '');
    // Renforcement : le mot anglais puis sa traduction (« Dog… le chien ! »).
    await _voice.say([
      if (praise.isNotEmpty) Speech(praise),
      Speech(current.answer.word('en'), locale: 'en'),
      Speech('${current.answer.wordWithArticle('fr')} !'),
    ]);
    if (_disposed) return;
    _next();
  }

  Future<void> _onWrong(Concept choice) async {
    phase = SeriesPhase.feedback;
    disabled.add(choice.id);
    wrongAttempts++;
    _streak = 0;
    hint = wrongAttempts >= services.balance.hintAfterWrongAttempts;
    HapticFeedback.selectionClick();
    _dino.react(DinoReaction.oops);
    _notify();
    await _voice.say([
      Speech(_voice.lines.pick(hint ? 'hint' : 'wrong')),
      _prompt,
    ]);
    if (_disposed) return;
    phase = SeriesPhase.asking;
    _notify();
    _armIdle();
  }

  void _next() {
    if (index + 1 >= items.length) {
      _finish(items.length);
      return;
    }
    index++;
    disabled.clear();
    correctId = null;
    wrongAttempts = 0;
    hint = false;
    _ask();
  }

  void _finish(int answered) {
    _cancelIdle();
    final score = answered == 0 ? 0.0 : firstTrySuccesses / answered;
    final stars = services.rewards.starsFor(score);
    final rewards = services.rewards.rewardsFor(
      stars: stars,
      perfect: firstTrySuccesses == answered,
      level: level,
      firstSeriesOfDay: services.progress.isFirstSeriesToday(),
    );
    unawaited(services.progress.recordSeries(
      gameId: game.id,
      questionIds: [for (final i in items.take(answered)) i.question.id],
      level: level,
      rewards: rewards,
    ));
    result = SeriesResult(
      gameId: game.id,
      mode: mode,
      level: level,
      total: answered,
      firstTrySuccesses: firstTrySuccesses,
      stars: stars,
      rewards: rewards,
    );
    phase = SeriesPhase.finished;
    _notify();
  }

  /// Sortie en cours de série : récompense au prorata si au moins
  /// [Balance.minQuestionsForReward] réponses (spécifications §5.1).
  void abandon() {
    if (phase == SeriesPhase.finished) return;
    if (_answered >= services.balance.minQuestionsForReward) _finish(_answered);
  }

  void _armIdle() {
    _cancelIdle();
    _idleReminder = Timer(services.balance.idleReminder, () {
      if (phase != SeriesPhase.asking) return;
      _voice.say([Speech(_voice.lines.pick('idle')), _prompt]);
    });
    _idlePoint = Timer(services.balance.idlePoint, () {
      if (phase != SeriesPhase.asking) return;
      attention = true;
      _dino.react(DinoReaction.point);
      _notify();
    });
  }

  void _cancelIdle() {
    _idleReminder?.cancel();
    _idlePoint?.cancel();
  }

  void _notify() {
    if (!_disposed) notifyListeners();
  }

  @override
  void dispose() {
    _disposed = true;
    _cancelIdle();
    _voice.stop();
    super.dispose();
  }
}
