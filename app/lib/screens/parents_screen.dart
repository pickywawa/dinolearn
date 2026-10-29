import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../core/services.dart';

/// Espace parents (version prototype) : verrou, âge, suivi, réinitialisation.
class ParentsScreen extends ConsumerStatefulWidget {
  const ParentsScreen({super.key});

  @override
  ConsumerState<ParentsScreen> createState() => _ParentsScreenState();
}

class _ParentsScreenState extends ConsumerState<ParentsScreen> {
  bool _unlocked = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Espace parents')),
      body: _unlocked
          ? const _ParentsPanel()
          : _ParentalGate(
              onSuccess: () => setState(() => _unlocked = true),
              onFail: () => context.go('/'),
            ),
    );
  }
}

/// Verrou réservé aux adultes lecteurs : toucher des chiffres écrits en lettres.
class _ParentalGate extends StatefulWidget {
  const _ParentalGate({required this.onSuccess, required this.onFail});

  final VoidCallback onSuccess;
  final VoidCallback onFail;

  @override
  State<_ParentalGate> createState() => _ParentalGateState();
}

class _ParentalGateState extends State<_ParentalGate> {
  static const _words = [
    'zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
  ];
  late final List<int> _code;
  final List<int> _typed = [];

  @override
  void initState() {
    super.initState();
    final random = Random();
    _code = List.generate(3, (_) => random.nextInt(10));
  }

  void _press(int digit) {
    setState(() => _typed.add(digit));
    if (_typed.length < _code.length) return;
    for (var i = 0; i < _code.length; i++) {
      if (_typed[i] != _code[i]) {
        widget.onFail();
        return;
      }
    }
    widget.onSuccess();
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 420),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Touchez dans l\'ordre : ${_code.map((d) => _words[d]).join(', ')}',
              style: Theme.of(context).textTheme.titleLarge,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text('${_typed.length} / ${_code.length}'),
            const SizedBox(height: 16),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              alignment: WrapAlignment.center,
              children: [
                for (var d = 0; d < 10; d++)
                  SizedBox(
                    width: 64,
                    height: 64,
                    child: FilledButton.tonal(
                      onPressed: () => _press(d),
                      child: Text('$d', style: const TextStyle(fontSize: 22)),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _ParentsPanel extends ConsumerWidget {
  const _ParentsPanel();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final services = ref.watch(servicesProvider);
    final progress = services.progress;
    return ListenableBuilder(
      listenable: progress,
      builder: (context, _) {
        final answers = progress.answers().take(services.balance.successWindow).toList();
        final rate = answers.isEmpty
            ? null
            : answers.where((a) => a.firstTrySuccess).length / answers.length;
        final dino = progress.dino;
        return ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text('Âge de l\'enfant', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            SegmentedButton<int>(
              segments: [
                for (var a = 3; a <= 7; a++) ButtonSegment(value: a, label: Text('$a ans')),
              ],
              selected: {progress.age},
              onSelectionChanged: (s) => progress.setAge(s.first),
            ),
            const SizedBox(height: 8),
            Text(
              'Séries de ${services.balance.seriesLengthFor(progress.age)} questions. '
              'L\'âge ajuste aussi le niveau de départ.',
            ),
            const Divider(height: 32),
            Text('Suivi', style: Theme.of(context).textTheme.titleMedium),
            ListTile(
              title: const Text('Dinosaure'),
              subtitle: Text(
                'Niveau ${dino.level} · stade ${services.progression.stageFor(dino.level)} · '
                '${dino.xp} / ${services.progression.xpToNext(dino.level)} XP · '
                'mangé aujourd\'hui : ${progress.xpEatenToday()} / ${services.balance.dailyXpCap} XP',
              ),
            ),
            ListTile(
              title: const Text('Séries jouées'),
              subtitle: Text('${progress.seriesPlayed}'),
            ),
            ListTile(
              title: const Text('Réussite du premier coup (100 dernières réponses)'),
              subtitle: Text(rate == null ? '—' : '${(rate * 100).round()} %'),
            ),
            for (final game in services.content.games)
              ListTile(
                title: Text('Jeu ${game.id}'),
                subtitle: Text(
                  'Niveau actuel : ${progress.gameLevel(game.id) ?? '—'} · '
                  'mots maîtrisés : ${progress.mastered(game.id).length} / '
                  '${services.content.questionsFor(game.id).length}',
                ),
              ),
            const Divider(height: 32),
            OutlinedButton.icon(
              icon: const Icon(Icons.restart_alt),
              label: const Text('Réinitialiser la progression'),
              onPressed: () async {
                final ok = await showDialog<bool>(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: const Text('Tout réinitialiser ?'),
                    content: const Text('Le dinosaure, les aliments et l\'historique seront effacés.'),
                    actions: [
                      TextButton(
                          onPressed: () => Navigator.pop(context, false),
                          child: const Text('Annuler')),
                      FilledButton(
                          onPressed: () => Navigator.pop(context, true),
                          child: const Text('Réinitialiser')),
                    ],
                  ),
                );
                if (ok == true) await progress.reset();
              },
            ),
            const Divider(height: 32),
            Text(
              'Illustrations : Twemoji © Twitter, Inc. et contributeurs, licence CC-BY 4.0. '
              'Voix : synthèse vocale de l\'appareil (prototype).',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        );
      },
    );
  }
}
