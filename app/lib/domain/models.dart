/// Une réponse enregistrée (cf. table `answer` des spécifications §13).
class AnswerRecord {
  const AnswerRecord({
    required this.gameId,
    required this.category,
    required this.questionId,
    required this.level,
    required this.firstTrySuccess,
    required this.answeredAt,
  });

  final String gameId;
  final String category;
  final String questionId;
  final int level;
  final bool firstTrySuccess;
  final DateTime answeredAt;

  Map<String, dynamic> toJson() => {
        'g': gameId,
        'c': category,
        'q': questionId,
        'l': level,
        's': firstTrySuccess,
        't': answeredAt.millisecondsSinceEpoch,
      };

  factory AnswerRecord.fromJson(Map<String, dynamic> json) => AnswerRecord(
        gameId: json['g'] as String,
        category: json['c'] as String,
        questionId: json['q'] as String,
        level: json['l'] as int,
        firstTrySuccess: json['s'] as bool,
        answeredAt: DateTime.fromMillisecondsSinceEpoch(json['t'] as int),
      );
}

/// Référence minimale d'une question pour la sélection.
class QuestionRef {
  const QuestionRef(this.id, this.level);

  final String id;
  final int level;

  @override
  String toString() => 'Q($id, L$level)';
}

enum Food {
  leaf(1, '1f33f'),
  apple(2, '1f34e'),
  berries(4, '1fad0'),
  watermelon(6, '1f349'),
  goldenFruit(12, '1f34b');

  const Food(this.xp, this.icon);

  final int xp;

  /// Code Twemoji de l'icône embarquée dans `assets/ui/`.
  final String icon;
}
