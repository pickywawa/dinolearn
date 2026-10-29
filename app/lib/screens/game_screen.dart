import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../core/services.dart';
import '../core/theme.dart';
import '../dino/dino_widget.dart';
import '../games/series_controller.dart';
import '../games/templates/audio_to_image_view.dart';
import '../widgets/common.dart';

class GameScreen extends ConsumerStatefulWidget {
  const GameScreen({super.key, required this.gameId, required this.mode});

  final String gameId;
  final PlayMode mode;

  @override
  ConsumerState<GameScreen> createState() => _GameScreenState();
}

class _GameScreenState extends ConsumerState<GameScreen> {
  late final SeriesController _series;
  bool _leaving = false;

  @override
  void initState() {
    super.initState();
    final services = ref.read(servicesProvider);
    _series = SeriesController(services, services.content.game(widget.gameId), widget.mode)
      ..addListener(_onChange)
      ..start();
  }

  void _onChange() {
    if (_series.phase == SeriesPhase.finished && !_leaving) {
      _leaving = true;
      context.pushReplacement('/end', extra: _series.result);
    }
  }

  void _back() {
    _leaving = true;
    _series.abandon();
    context.go('/');
  }

  @override
  void dispose() {
    _series
      ..removeListener(_onChange)
      ..dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final services = ref.watch(servicesProvider);
    final color = DinoColors.category(_series.game.category);
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) _back();
      },
      child: Scaffold(
        body: SceneBackground(
          tint: Color.lerp(color, Colors.white, 0.75),
          child: ListenableBuilder(
            listenable: _series,
            builder: (context, _) {
              return Column(
                children: [
                  TopBar(
                    onBack: _back,
                    onEar: _series.repeatPrompt,
                    center: FootprintProgress(
                      total: _series.items.length,
                      done: _series.index + (_series.correctId != null ? 1 : 0),
                    ),
                  ),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: AudioToImageView(controller: _series),
                    ),
                  ),
                  Align(
                    alignment: Alignment.bottomLeft,
                    child: Padding(
                      padding: const EdgeInsets.only(left: 16, bottom: 8),
                      child: DinoWidget(
                        controller: services.dino,
                        size: 110,
                        growth: services.dinoGrowth,
                      ),
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}
