import 'dart:math';

import 'package:flutter/material.dart';

import '../../content/content_image.dart';
import '../../content/models.dart';
import '../series_controller.dart';

/// Gabarit `audio_to_image` : 2 à 4 grandes cartes-images.
class AudioToImageView extends StatelessWidget {
  const AudioToImageView({super.key, required this.controller});

  final SeriesController controller;

  @override
  Widget build(BuildContext context) {
    final item = controller.current;
    final choices = item.choices;
    return LayoutBuilder(builder: (context, box) {
      final landscape = box.maxWidth > box.maxHeight * 1.2;
      final perRow = landscape || choices.length <= 2 ? choices.length : 2;
      final rows = (choices.length / perRow).ceil();
      final gap = 18.0;
      final cardSize = min(
        (box.maxWidth - gap * (perRow + 1)) / perRow,
        (box.maxHeight - gap * (rows + 1)) / rows,
      ).clamp(88.0, 260.0);
      return Center(
        child: Wrap(
          key: ValueKey(controller.index),
          spacing: gap,
          runSpacing: gap,
          alignment: WrapAlignment.center,
          children: [
            for (var i = 0; i < choices.length; i++)
              _ChoiceCard(
                concept: choices[i],
                size: cardSize,
                index: i,
                state: _stateOf(choices[i], item),
                attention: controller.attention,
                onTap: () => controller.tap(choices[i]),
              ),
          ],
        ),
      );
    });
  }

  _CardState _stateOf(Concept c, SeriesItem item) {
    if (controller.correctId == c.id) return _CardState.correct;
    if (controller.disabled.contains(c.id)) return _CardState.wrong;
    if (controller.hint && c.id == item.answer.id) return _CardState.hint;
    if (controller.correctId != null) return _CardState.faded;
    return _CardState.normal;
  }
}

enum _CardState { normal, correct, wrong, hint, faded }

class _ChoiceCard extends StatefulWidget {
  const _ChoiceCard({
    required this.concept,
    required this.size,
    required this.index,
    required this.state,
    required this.attention,
    required this.onTap,
  });

  final Concept concept;
  final double size;
  final int index;
  final _CardState state;
  final bool attention;
  final VoidCallback onTap;

  @override
  State<_ChoiceCard> createState() => _ChoiceCardState();
}

class _ChoiceCardState extends State<_ChoiceCard> with TickerProviderStateMixin {
  late final AnimationController _appear = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 450),
  );
  late final AnimationController _loop = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 900),
  )..repeat();

  @override
  void initState() {
    super.initState();
    Future.delayed(Duration(milliseconds: 90 * widget.index), () {
      if (mounted) _appear.forward();
    });
  }

  @override
  void dispose() {
    _appear.dispose();
    _loop.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = widget.state;
    final scale = switch (state) {
      _CardState.correct => 1.12,
      _CardState.wrong => 0.85,
      _CardState.faded => 0.9,
      _ => 1.0,
    };
    final border = switch (state) {
      _CardState.correct => const Color(0xFF43B649),
      _CardState.hint => const Color(0xFFFFC107),
      _ => Colors.white,
    };
    return AnimatedBuilder(
      animation: Listenable.merge([_appear, _loop]),
      builder: (context, child) {
        final appear = Curves.elasticOut.transform(_appear.value);
        final wiggle = widget.attention && state == _CardState.normal
            ? sin(_loop.value * 2 * pi) * 0.06
            : 0.0;
        final pulse = state == _CardState.hint ? 1 + sin(_loop.value * 2 * pi) * 0.05 : 1.0;
        return Transform.rotate(
          angle: wiggle,
          child: Transform.scale(scale: appear * pulse, child: child),
        );
      },
      child: AnimatedScale(
        scale: scale,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOutBack,
        child: AnimatedOpacity(
          opacity: state == _CardState.wrong ? 0.3 : (state == _CardState.faded ? 0.5 : 1),
          duration: const Duration(milliseconds: 250),
          child: GestureDetector(
            onTap: widget.onTap,
            child: Container(
              width: widget.size,
              height: widget.size,
              padding: EdgeInsets.all(widget.size * 0.14),
              decoration: BoxDecoration(
                color: state == _CardState.wrong ? Colors.grey.shade300 : Colors.white,
                borderRadius: BorderRadius.circular(widget.size * 0.16),
                border: Border.all(color: border, width: state == _CardState.normal ? 4 : 8),
                boxShadow: [
                  BoxShadow(
                    color: state == _CardState.hint
                        ? const Color(0x99FFC107)
                        : const Color(0x26000000),
                    blurRadius: state == _CardState.hint ? 24 : 10,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: ContentImage(widget.concept.image),
            ),
          ),
        ),
      ),
    );
  }
}
