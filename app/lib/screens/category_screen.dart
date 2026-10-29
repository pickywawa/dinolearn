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

/// Une île : ses mini-jeux et un dé pour jouer au hasard dans la catégorie.
class CategoryScreen extends ConsumerStatefulWidget {
  const CategoryScreen({super.key, required this.category});

  final Category category;

  @override
  ConsumerState<CategoryScreen> createState() => _CategoryScreenState();
}

/// Jeux prévus mais pas encore disponibles, affichés « en construction ».
const _comingSoon = {
  Category.foreignLanguage: ['1f5bc'],
};

class _CategoryScreenState extends ConsumerState<CategoryScreen> {
  AppServices get _services => ref.read(servicesProvider);

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Future.delayed(const Duration(milliseconds: 1200), () {
        if (mounted) _services.voice.line('category_choose');
      });
    });
  }

  void _play(GameDef game, PlayMode mode) {
    context.push('/play/${game.id}?mode=${mode.name}');
  }

  void _random(List<GameDef> games) {
    _services.dino.react(DinoReaction.dance);
    _services.voice.line('surprise');
    _play(games[Random().nextInt(games.length)], PlayMode.category);
  }

  @override
  Widget build(BuildContext context) {
    final services = ref.watch(servicesProvider);
    final games = services.content.gamesOf(widget.category);
    final color = DinoColors.category(widget.category);
    return Scaffold(
      body: SceneBackground(
        tint: Color.lerp(color, Colors.white, 0.6),
        child: Column(
          children: [
            TopBar(
              onBack: () => context.pop(),
              onEar: () => services.voice.line('category_choose'),
              center: UiIcon(categoryIcon(widget.category), size: 56),
            ),
            Expanded(
              child: Center(
                child: Wrap(
                  spacing: 28,
                  runSpacing: 28,
                  alignment: WrapAlignment.center,
                  children: [
                    for (final game in games)
                      BigButton(
                        size: 150,
                        color: color,
                        onTap: () {
                          services.voice.line('game.listen_tap.title');
                          _play(game, PlayMode.targeted);
                        },
                        semanticLabel: game.id,
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            UiIcon(game.icon, size: 80),
                            const Positioned(
                              right: 0,
                              bottom: 0,
                              child: UiIcon('1f5bc', size: 40),
                            ),
                          ],
                        ),
                      ),
                    for (final icon in _comingSoon[widget.category] ?? const <String>[])
                      Opacity(
                        opacity: 0.5,
                        child: BigButton(
                          size: 150,
                          color: color,
                          onTap: () {
                            services.dino.react(DinoReaction.think);
                            services.voice.line('game.soon');
                          },
                          child: Stack(
                            alignment: Alignment.center,
                            children: [
                              UiIcon(icon, size: 72),
                              const Positioned(
                                right: 0,
                                bottom: 0,
                                child: UiIcon('1f6a7', size: 40),
                              ),
                            ],
                          ),
                        ),
                      ),
                    if (games.isNotEmpty)
                      BigButton(
                        size: 150,
                        color: DinoColors.sun,
                        onTap: () => _random(games),
                        semanticLabel: 'Jeu au hasard',
                        child: const UiIcon('1f3b2', size: 80),
                      ),
                  ],
                ),
              ),
            ),
            Align(
              alignment: Alignment.bottomLeft,
              child: Padding(
                padding: const EdgeInsets.only(left: 16, bottom: 8),
                child: DinoWidget(
                  controller: services.dino,
                  size: 140,
                  growth: services.dinoGrowth,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
