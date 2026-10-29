import 'dart:convert';

import 'package:flutter/services.dart';

import 'models.dart';

/// Contenus du prototype : lexique et définitions de jeux embarqués en JSON,
/// images servies par le CDN (cf. [ContentConfig]). En V1, les JSON viendront
/// du manifeste CDN (spécifications §9.5).
class ContentRepository {
  ContentRepository._(this.concepts, this.games);

  final List<Concept> concepts;
  final List<GameDef> games;

  static Future<ContentRepository> load(AssetBundle bundle) async {
    final conceptsJson =
        jsonDecode(await bundle.loadString('assets/content/concepts.json')) as Map;
    final gamesJson =
        jsonDecode(await bundle.loadString('assets/content/games.json')) as Map;
    return ContentRepository.fromJson(conceptsJson, gamesJson);
  }

  factory ContentRepository.fromJson(Map conceptsJson, Map gamesJson) =>
      ContentRepository._(
        [
          for (final c in conceptsJson['concepts'] as List)
            Concept.fromJson(c as Map<String, dynamic>),
        ],
        [
          for (final g in gamesJson['games'] as List)
            GameDef.fromJson(g as Map<String, dynamic>),
        ],
      );

  GameDef game(String id) => games.firstWhere((g) => g.id == id);

  List<GameDef> gamesOf(Category category) =>
      games.where((g) => g.category == category).toList();

  /// Concepts utilisés par un jeu (ceux qui ont un niveau pour ce jeu).
  List<Concept> conceptsFor(String gameId) =>
      concepts.where((c) => c.levels.containsKey(gameId)).toList();

  List<ConceptQuestion> questionsFor(String gameId) => [
        for (final c in conceptsFor(gameId)) ConceptQuestion(gameId, c, c.levels[gameId]!),
      ];
}

class ContentConfig {
  /// Base des images de contenu. Prototype : Twemoji via jsDelivr ;
  /// à remplacer par le CDN DinoLearn. Surchargeable au build :
  /// `--dart-define=CONTENT_BASE_URL=http://localhost:8001/`.
  static const imageBaseUrl = String.fromEnvironment(
    'CONTENT_BASE_URL',
    defaultValue: 'https://cdn.jsdelivr.net/npm/@twemoji/svg@15.0.0/',
  );

  static String imageUrl(String key) => '$imageBaseUrl$key.svg';
}
