import 'dart:convert';
import 'dart:io';
import 'dart:math';

import 'package:dinolearn/audio/voice_service.dart';
import 'package:dinolearn/content/content_image.dart';
import 'package:dinolearn/content/content_repository.dart';
import 'package:dinolearn/core/services.dart';
import 'package:dinolearn/domain/models.dart';
import 'package:dinolearn/games/series_controller.dart';
import 'package:dinolearn/progress/progress_repository.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Voix muette et instantanée pour les tests.
class SilentVoice extends VoiceService {
  final said = <String>[];

  @override
  Future<void> say(List<Speech> parts) async => said.addAll(parts.map((p) => p.text));

  @override
  Future<void> stop() async {}
}

Future<AppServices> buildServices() async {
  SharedPreferences.setMockInitialValues({});
  return AppServices(
    content: ContentRepository.fromJson(
      jsonDecode(File('assets/content/concepts.json').readAsStringSync()) as Map,
      jsonDecode(File('assets/content/games.json').readAsStringSync()) as Map,
    ),
    progress: await ProgressRepository.load(),
    voice: SilentVoice(),
  );
}

Future<void> settle() => Future<void>.delayed(const Duration(milliseconds: 10));

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  ContentCache.prefetchEnabled = false;

  test('une série sans faute donne 3 étoiles et des aliments', () async {
    final services = await buildServices();
    final series =
        SeriesController(services, services.content.game('EN-1'), PlayMode.targeted, random: Random(1))
          ..start();
    await settle();
    expect(series.items, hasLength(services.balance.seriesLengthFor(4)));
    expect(series.level, 1);

    while (series.phase != SeriesPhase.finished) {
      expect(series.phase, SeriesPhase.asking);
      await series.tap(series.current.answer);
      await settle();
    }

    final result = series.result!;
    expect(result.stars, 3);
    expect(result.perfect, isTrue);
    expect(services.progress.pantry[Food.watermelon], 1);
    expect(services.progress.mastered('EN-1'), hasLength(series.items.length));
    expect(services.progress.gameLevel('EN-1'), 1);
    expect(services.progress.isFirstSeriesToday(), isFalse);
  });

  test('une erreur grise la carte, puis indice après 2 erreurs', () async {
    final services = await buildServices();
    // 7 ans : niveau de départ 4, donc 4 choix par question.
    await services.progress.setAge(7);
    final series =
        SeriesController(services, services.content.game('EN-1'), PlayMode.targeted, random: Random(2))
          ..start();
    await settle();
    expect(series.level, 4);
    expect(series.current.choices, hasLength(4));

    final wrong = series.current.choices.where((c) => c.id != series.current.answer.id).toList();
    await series.tap(wrong[0]);
    expect(series.disabled, contains(wrong[0].id));
    expect(series.hint, isFalse);
    await series.tap(wrong[1]);
    expect(series.hint, isTrue);
    final id = series.current.question.id;
    await series.tap(series.current.answer);
    await settle();
    expect(services.progress.mastered('EN-1'), isNot(contains(id)));
    expect(services.progress.toRetry('EN-1', maxAgeDays: 14), contains(id));
  });

  test('abandon après 3 réponses : récompense au prorata', () async {
    final services = await buildServices();
    final series =
        SeriesController(services, services.content.game('EN-1'), PlayMode.targeted, random: Random(3))
          ..start();
    await settle();
    for (var i = 0; i < 3; i++) {
      await series.tap(series.current.answer);
      await settle();
    }
    series.abandon();
    expect(series.result!.total, 3);
    expect(series.result!.stars, 3);
    expect(services.progress.pantryCount, greaterThan(0));
  });
}
