import '../domain/models.dart';

enum Category {
  foreignLanguage('foreign_language'),
  nativeLanguage('native_language'),
  logic('logic'),
  world('world');

  const Category(this.id);

  final String id;

  static Category fromId(String id) => values.firstWhere((c) => c.id == id);
}

enum DistractorStrategy {
  otherCategory('other_category'),
  sameCategory('same_category'),
  similar('similar');

  const DistractorStrategy(this.id);

  final String id;

  static DistractorStrategy fromId(String id) => values.firstWhere((s) => s.id == id);
}

/// Un élément du lexique partagé entre les jeux (spécifications §9.2).
class Concept {
  const Concept({
    required this.id,
    required this.image,
    required this.tags,
    required this.levels,
    required this.similar,
    required this.i18n,
  });

  final String id;

  /// Clé de l'image sur le CDN de contenu.
  final String image;
  final List<String> tags;
  final Map<String, int> levels;
  final List<String> similar;
  final Map<String, Map<String, String>> i18n;

  String get category => tags.first;

  String word(String locale) => i18n[locale]?['word'] ?? id;

  /// Mot avec article, prêt à être prononcé (« le chien », « l'oiseau »).
  String wordWithArticle(String locale) {
    final article = i18n[locale]?['article'];
    if (article == null || article.isEmpty) return word(locale);
    return article.endsWith("'") ? '$article${word(locale)}' : '$article ${word(locale)}';
  }

  factory Concept.fromJson(Map<String, dynamic> json) => Concept(
        id: json['id'] as String,
        image: json['image'] as String,
        tags: (json['tags'] as List).cast<String>(),
        levels: (json['levels'] as Map).cast<String, int>(),
        similar: (json['similar'] as List? ?? const []).cast<String>(),
        i18n: (json['i18n'] as Map).map((locale, value) =>
            MapEntry(locale as String, (value as Map).cast<String, String>())),
      );
}

class GameDef {
  const GameDef({
    required this.id,
    required this.category,
    required this.template,
    required this.icon,
    required this.introLine,
    required this.choicesByLevel,
    required this.distractorsByLevel,
  });

  final String id;
  final Category category;
  final String template;
  final String icon;
  final String introLine;
  final List<int> choicesByLevel;
  final List<DistractorStrategy> distractorsByLevel;

  int choicesFor(int level) => choicesByLevel[(level - 1).clamp(0, 9)];

  DistractorStrategy distractorsFor(int level) =>
      distractorsByLevel[(level - 1).clamp(0, 9)];

  factory GameDef.fromJson(Map<String, dynamic> json) {
    final generator = json['generator'] as Map<String, dynamic>;
    return GameDef(
      id: json['id'] as String,
      category: Category.fromId(json['category'] as String),
      template: json['template'] as String,
      icon: json['icon'] as String,
      introLine: json['intro_line'] as String,
      choicesByLevel: (generator['choices_by_level'] as List).cast<int>(),
      distractorsByLevel: [
        for (final s in generator['distractors_by_level'] as List)
          DistractorStrategy.fromId(s as String),
      ],
    );
  }
}

/// Une question générée à partir d'un concept : `id = jeu:concept`.
class ConceptQuestion {
  const ConceptQuestion(this.gameId, this.concept, this.level);

  final String gameId;
  final Concept concept;
  final int level;

  String get id => '$gameId:${concept.id}';

  QuestionRef get ref => QuestionRef(id, level);
}
