import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../core/services.dart';
import '../dino/dino_controller.dart';
import '../dino/dino_widget.dart';
import '../domain/models.dart';
import '../domain/progression_service.dart';
import '../widgets/common.dart';
import 'series_end_screen.dart';

/// Garde-manger : l'enfant glisse (ou touche) un aliment pour nourrir le dino.
class PantryScreen extends ConsumerStatefulWidget {
  const PantryScreen({super.key});

  @override
  ConsumerState<PantryScreen> createState() => _PantryScreenState();
}

class _PantryScreenState extends ConsumerState<PantryScreen> {
  bool _busy = false;

  AppServices get _services => ref.read(servicesProvider);

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _invite());
  }

  void _invite() {
    final s = _services;
    if (s.progress.pantryCount == 0) {
      s.voice.line('feed_empty');
    } else if (s.progress.xpEatenToday() >= s.balance.dailyXpCap) {
      s.voice.line('full');
    } else {
      s.voice.line('feed_ask');
    }
  }

  Future<void> _feed(Food food) async {
    if (_busy) return;
    final s = _services;
    final result = s.progression.feed(s.progress.dino, food, s.progress.xpEatenToday());
    if (result.outcome == FeedOutcome.full || result.outcome == FeedOutcome.maxLevel) {
      s.dino.react(DinoReaction.think);
      await s.voice.line('full');
      return;
    }
    _busy = true;
    await s.progress.saveFeeding(food, result);
    s.dino.react(DinoReaction.eat);
    await s.voice.line('eating');
    if (result.outcome == FeedOutcome.levelUp) {
      s.dino.react(DinoReaction.levelUp);
      await s.voice.line('level_up');
    }
    _busy = false;
  }

  @override
  Widget build(BuildContext context) {
    final services = ref.watch(servicesProvider);
    return Scaffold(
      body: SceneBackground(
        tint: const Color(0xFFFFE6C7),
        child: ListenableBuilder(
          listenable: services.progress,
          builder: (context, _) {
            final progress = services.progress;
            final food = [
              for (final f in Food.values)
                for (var i = 0; i < min(progress.pantry[f] ?? 0, 12); i++) f,
            ];
            return LayoutBuilder(builder: (context, box) {
              final short = min(box.maxWidth, box.maxHeight);
              return Column(
                children: [
                  TopBar(onBack: () => context.go('/'), onEar: _invite),
                  Expanded(
                    child: Center(
                      child: DragTarget<Food>(
                        onAcceptWithDetails: (d) => _feed(d.data),
                        builder: (context, candidates, _) => AnimatedScale(
                          scale: candidates.isNotEmpty ? 1.08 : 1,
                          duration: const Duration(milliseconds: 200),
                          child: DinoWidget(
                            controller: services.dino,
                            size: short * 0.5,
                            growth: services.dinoGrowth,
                            bellyFill: services.progression.progress(progress.dino),
                          ),
                        ),
                      ),
                    ),
                  ),
                  // Nappe de pique-nique
                  Container(
                    width: double.infinity,
                    margin: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                    padding: const EdgeInsets.all(16),
                    constraints: const BoxConstraints(minHeight: 110),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(28),
                      border: Border.all(color: const Color(0xFFE5484D), width: 6),
                    ),
                    child: Wrap(
                      spacing: 12,
                      runSpacing: 12,
                      alignment: WrapAlignment.center,
                      children: [
                        for (final f in food)
                          Draggable<Food>(
                            data: f,
                            feedback: FoodIcon(f, size: 84),
                            childWhenDragging: Opacity(opacity: 0.3, child: FoodIcon(f, size: 64)),
                            child: GestureDetector(
                              onTap: () => _feed(f),
                              child: FoodIcon(f, size: 64),
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              );
            });
          },
        ),
      ),
    );
  }
}
