import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';

import 'dino_controller.dart';
import 'dino_painter.dart';

/// Le dino animé : respiration, clignements, bouche qui parle, réactions.
class DinoWidget extends StatefulWidget {
  const DinoWidget({
    super.key,
    required this.controller,
    this.size = 220,
    this.bellyFill,
    this.growth = 1,
    this.onTap,
  });

  final DinoController controller;
  final double size;
  final double? bellyFill;

  /// Facteur de taille selon le niveau (le dino grandit).
  final double growth;
  final VoidCallback? onTap;

  @override
  State<DinoWidget> createState() => _DinoWidgetState();
}

class _DinoWidgetState extends State<DinoWidget> with SingleTickerProviderStateMixin {
  static const _reactionLength = {
    DinoReaction.happy: 0.9,
    DinoReaction.cheer: 1.4,
    DinoReaction.dance: 2.4,
    DinoReaction.oops: 1.0,
    DinoReaction.think: 1.4,
    DinoReaction.eat: 1.3,
    DinoReaction.levelUp: 2.5,
    DinoReaction.tickle: 1.2,
    DinoReaction.point: 1.4,
  };

  late final Ticker _ticker;
  final _random = Random();
  double _t = 0;
  double _nextBlink = 2;
  double _reactionStart = -100;
  DinoReaction _reaction = DinoReaction.none;
  int _seenReactionId = 0;
  double _mouth = 0;

  @override
  void initState() {
    super.initState();
    _ticker = createTicker((elapsed) {
      setState(() => _t = elapsed.inMicroseconds / 1e6);
    })
      ..start();
    widget.controller.addListener(_onReaction);
    _seenReactionId = widget.controller.reactionId;
  }

  @override
  void didUpdateWidget(DinoWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.controller != widget.controller) {
      oldWidget.controller.removeListener(_onReaction);
      widget.controller.addListener(_onReaction);
    }
  }

  void _onReaction() {
    if (widget.controller.reactionId == _seenReactionId) return;
    _seenReactionId = widget.controller.reactionId;
    _reaction = widget.controller.reaction;
    _reactionStart = _t;
  }

  @override
  void dispose() {
    widget.controller.removeListener(_onReaction);
    _ticker.dispose();
    super.dispose();
  }

  DinoPose _pose(double t) {
    final talking = widget.controller.talking.value;
    final elapsed = t - _reactionStart;
    final reactionLength = _reactionLength[_reaction] ?? 0;
    final active = elapsed >= 0 && elapsed < reactionLength ? _reaction : DinoReaction.none;
    final p = reactionLength == 0 ? 0.0 : (elapsed / reactionLength).clamp(0.0, 1.0);

    // Clignement des yeux
    if (t > _nextBlink + 0.15) _nextBlink = t + 2 + _random.nextDouble() * 3;
    final blinking = t > _nextBlink && t < _nextBlink + 0.15;

    // Bouche : oscillation irrégulière tant que la voix joue.
    final targetMouth = talking
        ? (0.35 + 0.35 * sin(t * 17) + 0.3 * sin(t * 7.3)).clamp(0.05, 1.0)
        : 0.0;
    _mouth += (targetMouth - _mouth) * 0.45;

    var pose = DinoPose(
      breath: sin(t * 2.2),
      eyeOpen: blinking ? 0.1 : 1,
      mouthOpen: _mouth,
      lookX: sin(t * 0.37) * 0.5,
      lookY: 0,
      headTilt: sin(t * 0.8) * 0.03,
      bellyFill: widget.bellyFill,
    );

    switch (active) {
      case DinoReaction.happy:
      case DinoReaction.cheer:
        pose = _copy(pose, happyEyes: true, armsUp: sin(p * pi), mouthOpen: max(_mouth, 0.5));
      case DinoReaction.dance:
        pose = _copy(pose,
            happyEyes: true,
            armsUp: 0.5 + 0.5 * sin(elapsed * 12),
            headTilt: sin(elapsed * 8) * 0.2,
            mouthOpen: max(_mouth, 0.6));
      case DinoReaction.oops:
        pose = _copy(pose, headTilt: sin(p * pi) * 0.18, lookY: 1, lookX: -0.6);
      case DinoReaction.think:
        pose = _copy(pose, lookX: 0.8, lookY: -1, headTilt: -0.12 * sin(p * pi));
      case DinoReaction.eat:
        pose = _copy(pose,
            mouthOpen: (0.5 + 0.5 * sin(elapsed * 16)).clamp(0, 1), happyEyes: p > 0.3);
      case DinoReaction.levelUp:
        pose = _copy(pose, glow: sin(p * pi), armsUp: sin(p * pi), happyEyes: true);
      case DinoReaction.tickle:
        pose = _copy(pose,
            happyEyes: true,
            headTilt: sin(elapsed * 25) * 0.08,
            mouthOpen: 0.7,
            blush: 0.9);
      case DinoReaction.point:
        pose = _copy(pose, armsUp: 0.6 * sin(p * pi), lookY: 1);
      case DinoReaction.none:
        break;
    }
    return pose;
  }

  DinoPose _copy(
    DinoPose base, {
    bool? happyEyes,
    double? armsUp,
    double? mouthOpen,
    double? headTilt,
    double? lookX,
    double? lookY,
    double? glow,
    double? blush,
  }) =>
      DinoPose(
        breath: base.breath,
        eyeOpen: base.eyeOpen,
        mouthOpen: mouthOpen ?? base.mouthOpen,
        happyEyes: happyEyes ?? base.happyEyes,
        armsUp: armsUp ?? base.armsUp,
        lookX: lookX ?? base.lookX,
        lookY: lookY ?? base.lookY,
        headTilt: headTilt ?? base.headTilt,
        bellyFill: base.bellyFill,
        glow: glow ?? base.glow,
        blush: blush ?? base.blush,
      );

  /// Saut, balancement et pulsation selon la réaction en cours.
  Matrix4 _transform() {
    final elapsed = _t - _reactionStart;
    final length = _reactionLength[_reaction] ?? 0;
    final m = Matrix4.identity();
    if (elapsed < 0 || elapsed >= length) return m;
    final p = elapsed / length;
    switch (_reaction) {
      case DinoReaction.happy:
        m.translate(0.0, -sin(p * pi) * widget.size * 0.12);
      case DinoReaction.cheer:
        m.translate(0.0, -(sin(p * 2 * pi)).abs() * widget.size * 0.14);
      case DinoReaction.dance:
        m.rotateZ(sin(elapsed * 8) * 0.12);
        m.translate(0.0, -(sin(elapsed * 8)).abs() * widget.size * 0.05);
      case DinoReaction.levelUp:
        final s = 1 + sin(p * pi) * 0.15;
        m.scale(s, s);
      case DinoReaction.tickle:
        m.translate(sin(elapsed * 40) * 4, 0.0);
      default:
        break;
    }
    return m;
  }

  @override
  Widget build(BuildContext context) {
    final pose = _pose(_t);
    final size = widget.size * widget.growth;
    return GestureDetector(
      onTap: widget.onTap,
      child: SizedBox(
        width: size,
        height: size * DinoPainter.designSize.height / DinoPainter.designSize.width,
        child: Transform(
          alignment: Alignment.bottomCenter,
          transform: _transform(),
          child: CustomPaint(painter: DinoPainter(pose)),
        ),
      ),
    );
  }
}
