import 'dart:convert';
import 'dart:io';
import 'dart:math';

import 'package:dinolearn/audio/voice_lines.dart';
import 'package:dinolearn/content/content_repository.dart';
import 'package:dinolearn/content/models.dart';
import 'package:dinolearn/domain/balance.dart';
import 'package:dinolearn/domain/difficulty_service.dart';
import 'package:dinolearn/domain/distractor_picker.dart';
import 'package:dinolearn/domain/models.dart';
import 'package:dinolearn/domain/progression_service.dart';
import 'package:dinolearn/domain/question_selector.dart';
import 'package:dinolearn/domain/reward_service.dart';
import 'package:flutter_test/flutter_test.dart';

const balance = Balance();

List<AnswerRecord> answers(int count, double rate, {String game = 'EN-1'}) => [
      for (var i = 0; i < count; i++)
        AnswerRecord(
          gameId: game,
          category: 'foreign_language',
          questionId: '$game:$i',
          level: 1,
          firstTrySuccess: i < count * rate,
          answeredAt: DateTime(2026),
        ),
    ];

ContentRepository loadContent() => ContentRepository.fromJson(
      jsonDecode(File('assets/content/concepts.json').readAsStringSync()) as Map,
      jsonDecode(File('assets/content/games.json').readAsStringSync()) as Map,
    );

void main() {
  group('DifficultyService', () {
    const service = DifficultyService(balance);

    test('niveau de base selon le niveau du dino et l\'âge', () {
      expect(service.baseLevel(experienceLevel: 1, age: 3), 1);
      expect(service.baseLevel(experienceLevel: 1, age: 7), 4);
      expect(service.baseLevel(experienceLevel: 20, age: 4), 10);
      expect(service.baseLevel(experienceLevel: 20, age: 7), 10);
    });

    test('ajustement selon le taux de réussite', () {
      expect(service.adjustment(0.95), 2);
      expect(service.adjustment(0.8), 1);
      expect(service.adjustment(0.6), 0);
      expect(service.adjustment(0.4), -1);
      expect(service.adjustment(0.1), -2);
    });

    test('pas d\'ajustement sous 20 réponses', () {
      final level = service.computeLevel(
        experienceLevel: 5,
        age: 4,
        gameAnswers: answers(10, 1),
        categoryAnswers: answers(10, 1),
        allAnswers: answers(10, 1),
      );
      expect(level, 3);
    });

    test('repli sur la catégorie quand le jeu a peu de réponses', () {
      final level = service.computeLevel(
        experienceLevel: 5,
        age: 4,
        gameAnswers: answers(5, 1),
        categoryAnswers: answers(40, 0.2, game: 'EN-2'),
        allAnswers: answers(40, 0.2),
      );
      expect(level, 1);
    });

    test('lissage : ±1 par série au maximum', () {
      final level = service.computeLevel(
        experienceLevel: 20,
        age: 7,
        gameAnswers: answers(100, 1),
        categoryAnswers: const [],
        allAnswers: const [],
        previousLevel: 3,
      );
      expect(level, 4);
    });

    test('seules les 100 dernières réponses comptent', () {
      final recent = answers(100, 1);
      final old = answers(300, 0);
      final level = service.computeLevel(
        experienceLevel: 4,
        age: 4,
        gameAnswers: [...recent, ...old],
        categoryAnswers: const [],
        allAnswers: const [],
      );
      expect(level, 4); // base 2 + 2
    });
  });

  group('QuestionSelector', () {
    final questions = [
      for (var l = 1; l <= 10; l++)
        for (var i = 0; i < 30; i++) QuestionRef('q$l-$i', l),
    ];

    test('respecte la longueur et le niveau', () {
      final selector = QuestionSelector(balance, random: Random(1));
      final picks = selector.pick(
        questions: questions,
        level: 5,
        count: 10,
        mastered: const {},
        recent: const {},
        toRetry: const {},
      );
      expect(picks, hasLength(10));
      expect(picks.map((p) => p.question.id).toSet(), hasLength(10));
      for (final p in picks) {
        expect(p.question.level, inInclusiveRange(4, 6));
      }
    });

    test('ne repose jamais une question maîtrisée tant qu\'il en reste d\'autres', () {
      final selector = QuestionSelector(balance, random: Random(7));
      final mastered = <String>{};
      final recentSeries = <Set<String>>[];
      var series = 0;
      while (mastered.length < questions.length - 10 && series < 1000) {
        final picks = selector.pick(
          questions: questions,
          level: 1 + series % 10,
          count: 10,
          mastered: mastered,
          recent: {for (final s in recentSeries.take(2)) ...s},
          toRetry: const {},
        );
        for (final p in picks) {
          expect(mastered, isNot(contains(p.question.id)));
          expect(p.isReview, isFalse);
        }
        mastered.addAll(picks.map((p) => p.question.id));
        recentSeries.insert(0, picks.map((p) => p.question.id).toSet());
        series++;
      }
      expect(mastered.length, greaterThanOrEqualTo(questions.length - 10));
    });

    test('mode révision quand tout est maîtrisé', () {
      final selector = QuestionSelector(balance, random: Random(3));
      final picks = selector.pick(
        questions: questions,
        level: 5,
        count: 8,
        mastered: questions.map((q) => q.id).toSet(),
        recent: const {},
        toRetry: const {},
      );
      expect(picks, hasLength(8));
      expect(picks.every((p) => p.isReview), isTrue);
    });

    test('inclut des questions à retravailler', () {
      final selector = QuestionSelector(balance, random: Random(5));
      final picks = selector.pick(
        questions: questions,
        level: 5,
        count: 10,
        mastered: const {},
        recent: const {},
        toRetry: {'q4-1', 'q4-2', 'q5-3'},
      );
      final retried = picks.where((p) => {'q4-1', 'q4-2', 'q5-3'}.contains(p.question.id));
      expect(retried.length, greaterThanOrEqualTo(2));
    });
  });

  group('RewardService', () {
    test('étoiles', () {
      final service = RewardService(balance);
      expect(service.starsFor(1), 3);
      expect(service.starsFor(0.9), 3);
      expect(service.starsFor(0.75), 2);
      expect(service.starsFor(0.5), 1);
      expect(service.starsFor(0.2), 0);
    });

    test('toujours au moins une feuille, cumul des aliments', () {
      final service = RewardService(balance, random: Random(1));
      expect(
        service.rewardsFor(stars: 0, perfect: false, level: 1, firstSeriesOfDay: false),
        {Food.leaf: 1},
      );
      expect(
        service.rewardsFor(stars: 3, perfect: false, level: 1, firstSeriesOfDay: true),
        {Food.leaf: 2, Food.apple: 1, Food.berries: 1, Food.watermelon: 1},
      );
      expect(
        service.rewardsFor(stars: 2, perfect: false, level: 9, firstSeriesOfDay: false),
        {Food.leaf: 1, Food.apple: 1, Food.berries: 2},
      );
    });

    test('fruit d\'or seulement en sans-faute à partir du niveau 5', () {
      final service = RewardService(balance, random: Random(2));
      var golden = 0;
      for (var i = 0; i < 1000; i++) {
        final low = service.rewardsFor(stars: 3, perfect: true, level: 4, firstSeriesOfDay: false);
        expect(low.containsKey(Food.goldenFruit), isFalse);
        final high = service.rewardsFor(stars: 3, perfect: true, level: 6, firstSeriesOfDay: false);
        if (high.containsKey(Food.goldenFruit)) golden++;
      }
      expect(golden, inInclusiveRange(240, 360));
    });
  });

  group('ProgressionService', () {
    const service = ProgressionService(balance);

    test('table d\'XP des spécifications', () {
      expect(service.xpToNext(1), 18);
      expect(service.xpToNext(10), 170);
      expect(service.xpToNext(19), 378);
      final total = [for (var l = 1; l < 20; l++) service.xpToNext(l)].reduce((a, b) => a + b);
      expect(total, 3412);
    });

    test('passage de niveau', () {
      final r = service.feed(const DinoState(level: 1, xp: 15), Food.berries, 0);
      expect(r.outcome, FeedOutcome.levelUp);
      expect(r.dino.level, 2);
      expect(r.dino.xp, 1);
      expect(r.xpEatenToday, 4);
    });

    test('ventre plein : plafond quotidien', () {
      final r = service.feed(const DinoState(level: 3), Food.apple, 40);
      expect(r.outcome, FeedOutcome.full);
      expect(r.dino.level, 3);
    });

    test('il faut au moins ~85 jours pour atteindre le niveau 20', () {
      var dino = const DinoState();
      var days = 0;
      while (dino.level < 20) {
        days++;
        var today = 0;
        while (true) {
          final r = service.feed(dino, Food.watermelon, today);
          if (r.outcome == FeedOutcome.full) break;
          dino = r.dino;
          today = r.xpEatenToday;
          if (dino.level >= 20) break;
        }
      }
      expect(days, greaterThanOrEqualTo(80));
    });

    test('stades', () {
      expect(service.stageFor(1), 1);
      expect(service.stageFor(5), 2);
      expect(service.stageFor(20), 5);
    });
  });

  group('Contenu', () {
    final content = loadContent();

    test('lexique valide', () {
      final ids = content.concepts.map((c) => c.id).toSet();
      expect(ids, hasLength(content.concepts.length));
      for (final c in content.concepts) {
        expect(c.word('fr'), isNotEmpty);
        expect(c.word('en'), isNotEmpty);
        expect(ids.containsAll(c.similar), isTrue, reason: c.id);
        for (final l in c.levels.values) {
          expect(l, inInclusiveRange(1, 10));
        }
      }
    });

    test('article français', () {
      final bird = content.concepts.firstWhere((c) => c.id == 'bird');
      final dog = content.concepts.firstWhere((c) => c.id == 'dog');
      expect(bird.wordWithArticle('fr'), 'l\'oiseau');
      expect(dog.wordWithArticle('fr'), 'le chien');
    });

    test('distracteurs : bon nombre, sans doublon ni homonyme', () {
      final picker = DistractorPicker(random: Random(4));
      final pool = content.conceptsFor('EN-1');
      final game = content.game('EN-1');
      for (final answer in pool) {
        for (var level = 1; level <= 10; level++) {
          final d = picker.pick(
            answer: answer,
            pool: pool,
            count: game.choicesFor(level) - 1,
            strategy: game.distractorsFor(level),
          );
          expect(d, hasLength(game.choicesFor(level) - 1));
          final words = {answer.word('en'), ...d.map((c) => c.word('en'))};
          expect(words, hasLength(d.length + 1));
        }
      }
    });

    test('stratégie « same_category »', () {
      final picker = DistractorPicker(random: Random(4));
      final pool = content.conceptsFor('EN-1');
      final red = pool.firstWhere((c) => c.id == 'red');
      final d = picker.pick(
          answer: red, pool: pool, count: 3, strategy: DistractorStrategy.sameCategory);
      expect(d.every((c) => c.category == 'color'), isTrue);
    });
  });

  test('VoiceLinePicker ne répète pas les dernières variantes', () {
    final picker = VoiceLinePicker(random: Random(9));
    final variants = frenchLines['correct']!.length;
    final history = <String>[];
    for (var i = 0; i < 200; i++) {
      final line = picker.pick('correct');
      final window = min(5, variants - 1);
      expect(history.take(window), isNot(contains(line)));
      history.insert(0, line);
    }
  });
}
