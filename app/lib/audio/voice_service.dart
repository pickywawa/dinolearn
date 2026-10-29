import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter_tts/flutter_tts.dart';

import 'voice_lines.dart';

/// Un morceau de parole dans une langue donnée.
class Speech {
  const Speech(this.text, {this.locale = 'fr', this.slow = false});

  final String text;
  final String locale;
  final bool slow;
}

/// Voix du dino et des mots étrangers.
///
/// Prototype : synthèse vocale du système (`flutter_tts`). En V1, lecture de
/// fichiers audio pré-générés avec `just_audio` (spécifications §9.6) ;
/// [talking] continuera de piloter la bouche du dino.
class VoiceService {
  VoiceService({VoiceLinePicker? picker}) : lines = picker ?? VoiceLinePicker();

  final VoiceLinePicker lines;
  final FlutterTts _tts = FlutterTts();

  /// Vrai pendant que le dino parle (anime sa bouche).
  final ValueNotifier<bool> talking = ValueNotifier(false);

  int _generation = 0;
  bool _ready = false;

  static const _languages = {'fr': 'fr-FR', 'en': 'en-US'};

  Future<void> init() async {
    try {
      await _tts.awaitSpeakCompletion(true);
      if (!kIsWeb && defaultTargetPlatform == TargetPlatform.iOS) {
        await _tts.setSharedInstance(true);
      }
      _ready = true;
    } catch (_) {
      _ready = false;
    }
  }

  /// Dit une réplique du dino (variante aléatoire du groupe).
  Future<void> line(String group) => say([Speech(lines.pick(group))]);

  /// Dit une suite de morceaux. Une nouvelle demande interrompt la précédente.
  /// La future se termine quand tout a été dit (ou interrompu).
  Future<void> say(List<Speech> parts) async {
    final generation = ++_generation;
    await _stopEngine();
    for (final part in parts) {
      if (generation != _generation) return;
      if (part.text.isEmpty) continue;
      talking.value = true;
      await _speak(part);
      if (generation != _generation) return;
      talking.value = false;
      await Future<void>.delayed(const Duration(milliseconds: 250));
    }
    if (generation == _generation) talking.value = false;
  }

  Future<void> stop() async {
    _generation++;
    talking.value = false;
    await _stopEngine();
  }

  Future<void> _stopEngine() async {
    if (!_ready) return;
    try {
      await _tts.stop().timeout(const Duration(milliseconds: 300));
    } catch (_) {}
  }

  Future<void> _speak(Speech part) async {
    // Durée estimée : garde-fou si le moteur ne signale pas la fin
    // (ou s'il n'existe pas, ex. tests et navigateurs sans voix).
    final estimate = Duration(milliseconds: 600 + part.text.length * (part.slow ? 110 : 75));
    if (!_ready) {
      await Future<void>.delayed(estimate);
      return;
    }
    try {
      await () async {
        await _tts.setLanguage(_languages[part.locale] ?? part.locale);
        final baseRate = kIsWeb ? 0.9 : 0.45;
        await _tts.setSpeechRate(part.slow ? baseRate * 0.75 : baseRate);
        // Voix du dino un peu plus aiguë ; mots étrangers en voix naturelle.
        await _tts.setPitch(part.locale == 'fr' ? 1.25 : 1.0);
        await _tts.speak(part.text);
      }()
          .timeout(estimate * 2);
    } on TimeoutException {
      // Le moteur n'a pas signalé la fin : on ne bloque jamais la partie.
      await _stopEngine();
    } catch (_) {
      await Future<void>.delayed(estimate);
    }
  }
}
