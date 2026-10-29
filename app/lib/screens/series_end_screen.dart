import 'dart:async';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../audio/voice_service.dart';
import '../content/content_image.dart';
import '../core/services.dart';
import '../core/theme.dart';
import '../dino/dino_controller.dart';
import '../dino/dino_widget.dart';
import '../domain/models.dart';
import '../games/series_controller.dart';
import '../widgets/common.dart';

/// Bilan de série : étoiles, réaction du dino, aliments gagnés, suite.
class SeriesEndScreen extends ConsumerStatefulWidget {
  const SeriesEndScreen({super.key, required this.result});

  final SeriesResult result;

  @override
  ConsumerState<SeriesEndScreen> createState() => _SeriesEndScreenState();
}

class _SeriesEndScreenState extends ConsumerState<SeriesEndScreen> {
  int _starsShown = 0;
  bool _rewardsShown = false;
  bool _buttonsShown = false;

  AppServices get _services => ref.read(servicesProvider);

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _celebrate());
  }

  Future<void> _celebrate() async {
    final r = widget.result;
    final dino = _services.dino;
    final voice = _services.voice;
    final (reaction, group) = switch (r.stars) {
      3 => (DinoReaction.dance, r.perfect ? 'series_perfect' : 'series_great'),
      2 => (DinoReaction.cheer, 'series_good'),
      1 => (DinoReaction.happy, 'series_ok'),
      _ => (DinoReaction.think, 'series_encourage'),
    };
    for (var i = 1; i <= r.stars; i++) {
      await Future<void>.delayed(const Duration(milliseconds: 450));
      if (!mounted) return;
      setState(() => _starsShown = i);
    }
    dino.react(reaction);
    await voice.say([Speech(voice.lines.pick(group))]);
    if (!mounted) return;
    setState(() => _rewardsShown = true);
    dino.react(DinoReaction.happy);
    await voice.say([Speech(voice.lines.pick('reward'))]);
    if (!mounted) return;
    setState(() => _buttonsShown = true);
    unawaited(voice.line('continue_ask'));
  }

  void _again() {
    final r = widget.result;
    final content = _services.content;
    final current = content.game(r.gameId);
    final candidates = switch (r.mode) {
      PlayMode.targeted => [current],
      PlayMode.category => content.gamesOf(current.category),
      PlayMode.surprise => content.games,
    };
    // En mode aléatoire, éviter de rejouer le même jeu si possible.
    final others = candidates.where((g) => g.id != r.gameId).toList();
    final pool = r.mode == PlayMode.targeted || others.isEmpty ? candidates : others;
    final next = pool[Random().nextInt(pool.length)];
    context.pushReplacement('/play/${next.id}?mode=${r.mode.name}');
  }

  @override
  Widget build(BuildContext context) {
    final services = ref.watch(servicesProvider);
    final r = widget.result;
    final food = [
      for (final e in r.rewards.entries)
        for (var i = 0; i < e.value; i++) e.key,
    ];
    return Scaffold(
      body: SceneBackground(
        tint: const Color(0xFFFFF1C1),
        child: LayoutBuilder(builder: (context, box) {
          final short = min(box.maxWidth, box.maxHeight);
          return Column(
            children: [
              const SizedBox(height: 16),
              _Stars(shown: _starsShown, size: (short * 0.16).clamp(48.0, 96.0)),
              Expanded(
                child: Center(
                  child: DinoWidget(
                    controller: services.dino,
                    size: short * 0.45,
                    growth: services.dinoGrowth,
                  ),
                ),
              ),
              AnimatedOpacity(
                opacity: _rewardsShown ? 1 : 0,
                duration: const Duration(milliseconds: 400),
                child: _FoodRow(food: food, visible: _rewardsShown),
              ),
              const SizedBox(height: 16),
              AnimatedOpacity(
                opacity: _buttonsShown ? 1 : 0,
                duration: const Duration(milliseconds: 400),
                child: IgnorePointer(
                  ignoring: !_buttonsShown,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      BigButton(
                        size: 80,
                        color: DinoColors.sun,
                        onTap: () => context.go('/'),
                        semanticLabel: 'Accueil',
                        child: const UiIcon('1f3e0', size: 48),
                      ),
                      const SizedBox(width: 24),
                      BigButton(
                        size: 120,
                        color: DinoColors.playGreen,
                        onTap: _again,
                        semanticLabel: 'Encore',
                        child: const Icon(Icons.play_arrow_rounded, size: 80, color: Colors.white),
                      ),
                      const SizedBox(width: 24),
                      BigButton(
                        size: 80,
                        color: const Color(0xFFFFB84D),
                        onTap: () => context.pushReplacement('/pantry'),
                        semanticLabel: 'Nourrir',
                        child: const UiIcon('1f9fa', size: 48),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
            ],
          );
        }),
      ),
    );
  }
}

class _Stars extends StatelessWidget {
  const _Stars({required this.shown, required this.size});

  final int shown;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        for (var i = 1; i <= 3; i++)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: AnimatedScale(
              scale: i <= shown ? 1 : 0.7,
              duration: const Duration(milliseconds: 500),
              curve: Curves.elasticOut,
              child: Opacity(
                opacity: i <= shown ? 1 : 0.25,
                child: UiIcon('2b50', size: size),
              ),
            ),
          ),
      ],
    );
  }
}

class _FoodRow extends StatelessWidget {
  const _FoodRow({required this.food, required this.visible});

  final List<Food> food;
  final bool visible;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 10,
      alignment: WrapAlignment.center,
      children: [
        for (var i = 0; i < food.length; i++)
          TweenAnimationBuilder<double>(
            key: ValueKey('$visible-$i'),
            tween: Tween(begin: visible ? -80 : 0, end: 0),
            duration: Duration(milliseconds: 500 + i * 150),
            curve: Curves.bounceOut,
            builder: (context, dy, child) =>
                Transform.translate(offset: Offset(0, dy), child: child),
            child: FoodIcon(food[i], size: 52),
          ),
      ],
    );
  }
}

/// Icône d'aliment ; le fruit d'or scintille.
class FoodIcon extends StatelessWidget {
  const FoodIcon(this.food, {super.key, this.size = 56});

  final Food food;
  final double size;

  @override
  Widget build(BuildContext context) {
    return SizedBox.square(
      dimension: size,
      child: Stack(
        children: [
          if (food == Food.goldenFruit)
            Container(
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                boxShadow: [BoxShadow(color: Color(0xAAFFD700), blurRadius: 16, spreadRadius: 4)],
              ),
            ),
          UiIcon(food.icon, size: size),
          if (food == Food.goldenFruit)
            Positioned(right: 0, top: 0, child: UiIcon('2728', size: size * 0.45)),
        ],
      ),
    );
  }
}
