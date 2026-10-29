import 'dart:math';

import 'package:flutter/material.dart';

/// Pose instantanée du dino, calculée à chaque image par [DinoWidget].
class DinoPose {
  const DinoPose({
    this.breath = 0,
    this.eyeOpen = 1,
    this.mouthOpen = 0,
    this.happyEyes = false,
    this.armsUp = 0,
    this.lookX = 0,
    this.lookY = 0,
    this.headTilt = 0,
    this.bellyFill,
    this.glow = 0,
    this.blush = 0.5,
  });

  /// -1..1, respiration.
  final double breath;

  /// 0 (fermé) .. 1 (ouvert).
  final double eyeOpen;

  /// 0 (sourire fermé) .. 1 (grande ouverture).
  final double mouthOpen;

  /// Yeux en « ^ ^ » (joie).
  final bool happyEyes;

  /// 0 (bras le long du corps) .. 1 (bras levés).
  final double armsUp;
  final double lookX;
  final double lookY;

  /// Inclinaison de la tête en radians.
  final double headTilt;

  /// Jauge de croissance dessinée sur le ventre (null = masquée).
  final double? bellyFill;
  final double glow;
  final double blush;
}

/// Dino bébé dessiné en vectoriel (prototype de l'animation Rive).
/// Repère de dessin : 200 × 230 unités.
class DinoPainter extends CustomPainter {
  DinoPainter(this.pose, {this.skin = const Color(0xFF6CC24A)});

  final DinoPose pose;
  final Color skin;

  static const designSize = Size(200, 230);

  Color get _dark => Color.lerp(skin, Colors.black, 0.25)!;
  static const _belly = Color(0xFFF8EBB0);
  static const _spikes = Color(0xFFFF9F43);
  static const _outline = Color(0xFF2F5D1E);

  @override
  void paint(Canvas canvas, Size size) {
    final scale = min(size.width / designSize.width, size.height / designSize.height);
    canvas.translate((size.width - designSize.width * scale) / 2,
        (size.height - designSize.height * scale) / 2);
    canvas.scale(scale);

    if (pose.glow > 0) {
      canvas.drawCircle(
        const Offset(100, 120),
        110,
        Paint()
          ..shader = RadialGradient(colors: [
            Colors.yellow.withValues(alpha: 0.6 * pose.glow),
            Colors.yellow.withValues(alpha: 0),
          ]).createShader(Rect.fromCircle(center: const Offset(100, 120), radius: 110)),
      );
    }

    final fill = Paint()..color = skin;
    final dark = Paint()..color = _dark;
    final stroke = Paint()
      ..color = _outline
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.round;

    // Ombre au sol
    canvas.drawOval(Rect.fromCenter(center: const Offset(100, 222), width: 130, height: 14),
        Paint()..color = Colors.black.withValues(alpha: 0.12));

    // Queue
    final tail = Path()
      ..moveTo(135, 175)
      ..quadraticBezierTo(185, 185, 192, 150)
      ..quadraticBezierTo(178, 170, 140, 158)
      ..close();
    canvas.drawPath(tail, fill);
    canvas.drawPath(tail, stroke);

    // Corps (respiration)
    final bodyH = 100 + pose.breath * 3;
    final body = Rect.fromCenter(center: Offset(100, 165 - pose.breath * 1.5), width: 112, height: bodyH);
    canvas.drawOval(body, fill);
    canvas.drawOval(body, stroke);

    // Ventre + jauge de croissance
    final belly = Rect.fromCenter(center: Offset(100, 172 - pose.breath), width: 70, height: 66);
    canvas.drawOval(belly, Paint()..color = _belly);
    final bellyFill = pose.bellyFill;
    if (bellyFill != null) {
      canvas.save();
      canvas.clipPath(Path()..addOval(belly.deflate(5)));
      final top = belly.bottom - 5 - (belly.height - 10) * bellyFill.clamp(0, 1);
      canvas.drawRect(Rect.fromLTRB(belly.left, top, belly.right, belly.bottom),
          Paint()..color = const Color(0xFFFFB84D));
      canvas.restore();
      canvas.drawOval(
          belly.deflate(5),
          Paint()
            ..color = const Color(0xFFE09A2D)
            ..style = PaintingStyle.stroke
            ..strokeWidth = 2);
    }

    // Pieds
    for (final x in [72.0, 128.0]) {
      final foot = Rect.fromCenter(center: Offset(x, 214), width: 40, height: 18);
      canvas.drawOval(foot, dark);
      canvas.drawOval(foot, stroke);
    }

    // Bras (pivot à l'épaule)
    for (final side in [-1.0, 1.0]) {
      canvas.save();
      canvas.translate(100 + side * 50, 140);
      canvas.rotate(side * (0.5 - pose.armsUp * 2.2));
      final arm = Rect.fromCenter(center: const Offset(0, 16), width: 18, height: 34);
      canvas.drawOval(arm, fill);
      canvas.drawOval(arm, stroke);
      canvas.restore();
    }

    // Tête
    canvas.save();
    canvas.translate(100, 115);
    canvas.rotate(pose.headTilt);
    canvas.translate(-100, -115);
    _paintHead(canvas, fill, stroke);
    canvas.restore();
  }

  void _paintHead(Canvas canvas, Paint fill, Paint stroke) {
    // Piques
    final spikes = Paint()..color = _spikes;
    for (final (x, y, r) in [(66.0, 26.0, -0.6), (100.0, 14.0, 0.0), (134.0, 26.0, 0.6)]) {
      canvas.save();
      canvas.translate(x, y);
      canvas.rotate(r);
      final p = Path()
        ..moveTo(-12, 10)
        ..quadraticBezierTo(0, -22, 12, 10)
        ..close();
      canvas.drawPath(p, spikes);
      canvas.drawPath(p, stroke);
      canvas.restore();
    }

    final head = Rect.fromCenter(center: const Offset(100, 78), width: 140, height: 112);
    canvas.drawOval(head, fill);
    canvas.drawOval(head, stroke);

    // Joues
    final blush = Paint()..color = const Color(0xFFFF8FA3).withValues(alpha: pose.blush);
    canvas.drawOval(Rect.fromCenter(center: const Offset(54, 96), width: 22, height: 12), blush);
    canvas.drawOval(Rect.fromCenter(center: const Offset(146, 96), width: 22, height: 12), blush);

    // Yeux
    for (final x in [76.0, 124.0]) {
      final center = Offset(x, 72);
      if (pose.happyEyes) {
        final p = Path()
          ..moveTo(x - 12, 76)
          ..quadraticBezierTo(x, 58, x + 12, 76);
        canvas.drawPath(p, stroke..strokeWidth = 4);
        stroke.strokeWidth = 3;
        continue;
      }
      final h = 32 * pose.eyeOpen.clamp(0.08, 1.0);
      final eye = Rect.fromCenter(center: center, width: 28, height: h);
      canvas.drawOval(eye, Paint()..color = Colors.white);
      canvas.drawOval(eye, stroke);
      if (pose.eyeOpen > 0.3) {
        final pupil = center + Offset(pose.lookX * 5, pose.lookY * 6 + 2);
        canvas.save();
        canvas.clipPath(Path()..addOval(eye));
        canvas.drawCircle(pupil, 9, Paint()..color = const Color(0xFF2B2B2B));
        canvas.drawCircle(pupil + const Offset(-3, -4), 3.5, Paint()..color = Colors.white);
        canvas.restore();
      }
    }

    // Narines
    final nostril = Paint()..color = _outline;
    canvas.drawCircle(const Offset(92, 98), 2.2, nostril);
    canvas.drawCircle(const Offset(108, 98), 2.2, nostril);

    // Bouche
    final open = pose.mouthOpen.clamp(0.0, 1.0);
    if (open < 0.05) {
      final smile = Path()
        ..moveTo(84, 108)
        ..quadraticBezierTo(100, 122, 116, 108);
      canvas.drawPath(smile, stroke);
    } else {
      final mouth = Rect.fromCenter(
          center: Offset(100, 112 + open * 4), width: 26 + open * 8, height: 6 + open * 22);
      canvas.drawOval(mouth, Paint()..color = const Color(0xFF8E2C3A));
      canvas.save();
      canvas.clipPath(Path()..addOval(mouth));
      canvas.drawOval(
          Rect.fromCenter(center: Offset(100, mouth.bottom - 3), width: 20, height: 12),
          Paint()..color = const Color(0xFFFF7A8A));
      canvas.restore();
      canvas.drawOval(mouth, stroke);
    }
  }

  @override
  bool shouldRepaint(DinoPainter oldDelegate) => true;
}
