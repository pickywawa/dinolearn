import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../domain/models.dart';
import '../domain/progression_service.dart';

/// Progression d'un profil, stockée localement.
///
/// Prototype : un seul profil, sérialisé en JSON dans `shared_preferences`.
/// La V1 passera à Drift/SQLite avec le schéma des spécifications §13
/// sans changer cette interface.
class ProgressRepository extends ChangeNotifier {
  ProgressRepository._(this._prefs, Map<String, dynamic> data) {
    _read(data);
  }

  static const _key = 'dinolearn.progress.v1';
  static const _maxAnswers = 3000;
  static const _maxFeedLogDays = 30;

  final SharedPreferences _prefs;

  late int age;
  late DinoState dino;
  late List<AnswerRecord> _answers; // du plus récent au plus ancien
  late Map<String, Set<String>> _mastered;
  late Map<String, Map<String, int>> _failedAt;
  late Map<String, List<List<String>>> _recentSeries;
  late Map<String, int> _gameLevels;
  late Map<Food, int> pantry;
  late Map<String, int> _feedLog; // yyyy-mm-dd -> XP mangée
  late int seriesPlayed;
  String? _lastSeriesDay;

  static Future<ProgressRepository> load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_key);
    return ProgressRepository._(
        prefs, raw == null ? <String, dynamic>{} : jsonDecode(raw) as Map<String, dynamic>);
  }

  void _read(Map<String, dynamic> d) {
    age = d['age'] as int? ?? 4;
    dino = d['dino'] == null
        ? const DinoState()
        : DinoState.fromJson(d['dino'] as Map<String, dynamic>);
    _answers = [
      for (final a in d['answers'] as List? ?? const [])
        AnswerRecord.fromJson(a as Map<String, dynamic>),
    ];
    _mastered = {
      for (final e in (d['mastered'] as Map? ?? const {}).entries)
        e.key as String: (e.value as List).cast<String>().toSet(),
    };
    _failedAt = {
      for (final e in (d['failedAt'] as Map? ?? const {}).entries)
        e.key as String: Map<String, int>.from(e.value as Map),
    };
    _recentSeries = {
      for (final e in (d['recentSeries'] as Map? ?? const {}).entries)
        e.key as String: [
          for (final s in e.value as List) List<String>.from(s as List),
        ],
    };
    _gameLevels = Map<String, int>.from(d['gameLevels'] as Map? ?? const {});
    pantry = {
      for (final e in (d['pantry'] as Map? ?? const {}).entries)
        Food.values.byName(e.key as String): e.value as int,
    };
    _feedLog = Map<String, int>.from(d['feedLog'] as Map? ?? const {});
    seriesPlayed = d['seriesPlayed'] as int? ?? 0;
    _lastSeriesDay = d['lastSeriesDay'] as String?;
  }

  Future<void> _save() async {
    notifyListeners();
    await _prefs.setString(
      _key,
      jsonEncode({
        'age': age,
        'dino': dino.toJson(),
        'answers': [for (final a in _answers) a.toJson()],
        'mastered': {for (final e in _mastered.entries) e.key: e.value.toList()},
        'failedAt': _failedAt,
        'recentSeries': _recentSeries,
        'gameLevels': _gameLevels,
        'pantry': {for (final e in pantry.entries) e.key.name: e.value},
        'feedLog': _feedLog,
        'seriesPlayed': seriesPlayed,
        'lastSeriesDay': _lastSeriesDay,
      }),
    );
  }

  static String dayKey(DateTime d) =>
      '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

  // ---- Lecture ----

  List<AnswerRecord> answers({String? gameId, String? category}) => _answers
      .where((a) =>
          (gameId == null || a.gameId == gameId) && (category == null || a.category == category))
      .toList();

  Set<String> mastered(String gameId) => _mastered[gameId] ?? const {};

  /// Questions échouées récemment, à retravailler.
  Set<String> toRetry(String gameId, {required int maxAgeDays, DateTime? now}) {
    final limit = (now ?? DateTime.now()).subtract(Duration(days: maxAgeDays));
    return {
      for (final e in (_failedAt[gameId] ?? const <String, int>{}).entries)
        if (DateTime.fromMillisecondsSinceEpoch(e.value).isAfter(limit) &&
            !mastered(gameId).contains(e.key))
          e.key,
    };
  }

  Set<String> recentQuestions(String gameId, int seriesCount) =>
      {for (final s in (_recentSeries[gameId] ?? const []).take(seriesCount)) ...s};

  int? gameLevel(String gameId) => _gameLevels[gameId];

  int xpEatenToday([DateTime? now]) => _feedLog[dayKey(now ?? DateTime.now())] ?? 0;

  bool isFirstSeriesToday([DateTime? now]) => _lastSeriesDay != dayKey(now ?? DateTime.now());

  int get pantryCount => pantry.values.fold(0, (a, b) => a + b);

  // ---- Écriture ----

  Future<void> recordAnswer(AnswerRecord answer) async {
    _answers.insert(0, answer);
    if (_answers.length > _maxAnswers) _answers.removeRange(_maxAnswers, _answers.length);
    if (answer.firstTrySuccess) {
      (_mastered[answer.gameId] ??= {}).add(answer.questionId);
      _failedAt[answer.gameId]?.remove(answer.questionId);
    } else {
      (_failedAt[answer.gameId] ??= {})[answer.questionId] =
          answer.answeredAt.millisecondsSinceEpoch;
    }
    await _save();
  }

  Future<void> recordSeries({
    required String gameId,
    required List<String> questionIds,
    required int level,
    required Map<Food, int> rewards,
    DateTime? now,
  }) async {
    final series = _recentSeries[gameId] ??= [];
    series.insert(0, questionIds);
    if (series.length > 5) series.removeRange(5, series.length);
    _gameLevels[gameId] = level;
    for (final e in rewards.entries) {
      pantry[e.key] = (pantry[e.key] ?? 0) + e.value;
    }
    seriesPlayed++;
    _lastSeriesDay = dayKey(now ?? DateTime.now());
    await _save();
  }

  Future<void> saveFeeding(Food food, FeedResult result, [DateTime? now]) async {
    if (result.outcome == FeedOutcome.full || result.outcome == FeedOutcome.maxLevel) return;
    pantry[food] = (pantry[food] ?? 1) - 1;
    if (pantry[food]! <= 0) pantry.remove(food);
    dino = result.dino;
    _feedLog[dayKey(now ?? DateTime.now())] = result.xpEatenToday;
    if (_feedLog.length > _maxFeedLogDays) {
      final keys = _feedLog.keys.toList()..sort();
      for (final k in keys.take(_feedLog.length - _maxFeedLogDays)) {
        _feedLog.remove(k);
      }
    }
    await _save();
  }

  Future<void> setAge(int value) async {
    age = value;
    await _save();
  }

  Future<void> reset() async {
    final keepAge = age;
    _read(const {});
    age = keepAge;
    await _save();
  }
}
