import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../content/content_image.dart';
import '../core/theme.dart';

/// Gros bouton rond sans texte, qui rebondit au toucher.
class BigButton extends StatefulWidget {
  const BigButton({
    super.key,
    required this.child,
    required this.onTap,
    this.color = Colors.white,
    this.size = 88,
    this.semanticLabel,
  });

  final Widget child;
  final VoidCallback? onTap;
  final Color color;
  final double size;

  /// Pour les lecteurs d'écran des parents ; jamais affiché.
  final String? semanticLabel;

  @override
  State<BigButton> createState() => _BigButtonState();
}

class _BigButtonState extends State<BigButton> {
  bool _down = false;
  DateTime _lastTap = DateTime(0);

  void _tap() {
    // Anti-rebond (spécifications §4.1, règle 7).
    final now = DateTime.now();
    if (now.difference(_lastTap) < const Duration(milliseconds: 400)) return;
    _lastTap = now;
    HapticFeedback.lightImpact();
    widget.onTap?.call();
  }

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: widget.semanticLabel,
      child: GestureDetector(
        onTapDown: (_) => setState(() => _down = true),
        onTapCancel: () => setState(() => _down = false),
        onTapUp: (_) => setState(() => _down = false),
        onTap: widget.onTap == null ? null : _tap,
        child: AnimatedScale(
          scale: _down ? 0.88 : 1,
          duration: const Duration(milliseconds: 120),
          child: Container(
            width: widget.size,
            height: widget.size,
            decoration: BoxDecoration(
              color: widget.color,
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 4),
              boxShadow: const [
                BoxShadow(color: Color(0x33000000), blurRadius: 8, offset: Offset(0, 5)),
              ],
            ),
            padding: EdgeInsets.all(widget.size * 0.18),
            child: Center(child: widget.child),
          ),
        ),
      ),
    );
  }
}

/// Ciel + colline : décor commun.
class SceneBackground extends StatelessWidget {
  const SceneBackground({super.key, required this.child, this.tint});

  final Widget child;
  final Color? tint;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned.fill(
          child: DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [tint ?? DinoColors.sky, DinoColors.skyLow],
              ),
            ),
          ),
        ),
        Positioned(
          left: -80,
          right: -80,
          bottom: -140,
          height: 300,
          child: Container(
            decoration: const BoxDecoration(
              color: DinoColors.grass,
              borderRadius: BorderRadius.all(Radius.elliptical(600, 260)),
            ),
          ),
        ),
        Positioned.fill(child: SafeArea(child: child)),
      ],
    );
  }
}

/// Bouton retour (haut gauche) et bouton oreille (haut droite).
class TopBar extends StatelessWidget {
  const TopBar({super.key, this.onBack, this.onEar, this.center});

  final VoidCallback? onBack;
  final VoidCallback? onEar;
  final Widget? center;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(12),
      child: Row(
        children: [
          if (onBack != null)
            BigButton(
              size: 64,
              color: DinoColors.sun,
              onTap: onBack,
              semanticLabel: 'Retour',
              child: const Icon(Icons.arrow_back_rounded, size: 34, color: Color(0xFF6B4E00)),
            )
          else
            const SizedBox(width: 64),
          Expanded(child: Center(child: center ?? const SizedBox())),
          if (onEar != null)
            BigButton(
              size: 64,
              onTap: onEar,
              semanticLabel: 'Réécouter',
              child: const UiIcon('1f442'),
            )
          else
            const SizedBox(width: 64),
        ],
      ),
    );
  }
}

/// Avancement de la série en empreintes de dino (sans chiffre).
class FootprintProgress extends StatelessWidget {
  const FootprintProgress({super.key, required this.total, required this.done});

  final int total;
  final int done;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 4,
      children: [
        for (var i = 0; i < total; i++)
          AnimatedScale(
            scale: i == done ? 1.3 : 1,
            duration: const Duration(milliseconds: 250),
            child: Icon(
              Icons.pets_rounded,
              size: 22,
              color: i < done ? DinoColors.grassDark : Colors.white.withValues(alpha: 0.8),
            ),
          ),
      ],
    );
  }
}
