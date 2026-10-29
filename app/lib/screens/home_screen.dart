import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../content/content_image.dart';
import '../content/models.dart';
import '../core/services.dart';
import '../core/theme.dart';
import '../dino/dino_controller.dart';
import '../dino/dino_widget.dart';
import '../games/series_controller.dart';
import '../widgets/common.dart';

/// Accueil : le dino au centre, quatre îles, le dé, le panier.
class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  static bool _greeted = false;

  AppServices get _services => ref.read(servicesProvider);

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _greet());
  }

  void _greet() {
    final voice = _services.voice;
    if (!_greeted) {
      _greeted = true;
      _services.dino.react(DinoReaction.happy);
      voice.line('welcome').then((_) {
        if (mounted) voice.line('home_choose');
      });
    } else {
      voice.line('home_choose');
    }
  }

  bool _isOpen(Category c) => _services.content.gamesOf(c).isNotEmpty;

  Future<void> _openIsland(Category c) async {
    if (!_isOpen(c)) {
      _services.dino.react(DinoReaction.think);
      await _services.voice.line('island.soon');
      return;
    }
    _services.voice.line('island.${c.id}');
    context.push('/category/${c.id}');
  }

  void _surprise() {
    final games = _services.content.games;
    final game = games[Random().nextInt(games.length)];
    _services.dino.react(DinoReaction.dance);
    _services.voice.line('surprise');
    context.push('/play/${game.id}?mode=${PlayMode.surprise.name}');
  }

  @override
  Widget build(BuildContext context) {
    final services = ref.watch(servicesProvider);
    return Scaffold(
      body: SceneBackground(
        child: ListenableBuilder(
          listenable: services.progress,
          builder: (context, _) => LayoutBuilder(builder: (context, box) {
            final short = min(box.maxWidth, box.maxHeight);
            final island = (short * 0.27).clamp(96.0, 170.0);
            return Stack(
              children: [
                Align(
                  alignment: const Alignment(0, 0.1),
                  child: DinoWidget(
                    controller: services.dino,
                    size: short * 0.5,
                    growth: services.dinoGrowth,
                    onTap: () {
                      services.dino.react(DinoReaction.tickle);
                      services.voice.line('tickle');
                    },
                  ),
                ),
                _island(Category.foreignLanguage, const Alignment(-0.85, -0.75), island),
                _island(Category.nativeLanguage, const Alignment(0.85, -0.75), island),
                _island(Category.logic, const Alignment(-0.9, 0.35), island),
                _island(Category.world, const Alignment(0.9, 0.35), island),
                Align(
                  alignment: const Alignment(0, 0.95),
                  child: BigButton(
                    size: island * 0.8,
                    color: DinoColors.sun,
                    onTap: _surprise,
                    semanticLabel: 'Surprise',
                    child: const UiIcon('1f3b2', size: 80),
                  ),
                ),
                Align(
                  alignment: const Alignment(0.9, 0.95),
                  child: _Basket(
                    count: services.progress.pantryCount,
                    size: island * 0.65,
                    onTap: () => context.push('/pantry'),
                  ),
                ),
                Align(
                  alignment: const Alignment(-0.95, 0.97),
                  child: Opacity(
                    opacity: 0.55,
                    child: BigButton(
                      size: 48,
                      onTap: () => context.push('/parents'),
                      semanticLabel: 'Espace parents',
                      child: const UiIcon('1f512', size: 28),
                    ),
                  ),
                ),
              ],
            );
          }),
        ),
      ),
    );
  }

  Widget _island(Category c, Alignment alignment, double size) {
    final open = _isOpen(c);
    return Align(
      alignment: alignment,
      child: Opacity(
        opacity: open ? 1 : 0.55,
        child: BigButton(
          size: size,
          color: DinoColors.category(c),
          onTap: () => _openIsland(c),
          semanticLabel: c.id,
          child: Stack(
            alignment: Alignment.center,
            children: [
              UiIcon(categoryIcon(c), size: size * 0.55),
              if (!open)
                Positioned(
                  right: 0,
                  bottom: 0,
                  child: UiIcon('1f6a7', size: size * 0.3),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Panier : les aliments en attente sont représentés par des points.
class _Basket extends StatelessWidget {
  const _Basket({required this.count, required this.size, required this.onTap});

  final int count;
  final double size;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        BigButton(
          size: size,
          color: const Color(0xFFFFB84D),
          onTap: onTap,
          semanticLabel: 'Nourrir le dino',
          child: const UiIcon('1f9fa', size: 64),
        ),
        if (count > 0)
          Positioned(
            top: -6,
            right: -6,
            child: Container(
              padding: const EdgeInsets.all(6),
              decoration: const BoxDecoration(color: Color(0xFFE5484D), shape: BoxShape.circle),
              child: Wrap(
                spacing: 2,
                children: [
                  for (var i = 0; i < min(count, 3); i++)
                    const CircleAvatar(radius: 4, backgroundColor: Colors.white),
                ],
              ),
            ),
          ),
      ],
    );
  }
}
