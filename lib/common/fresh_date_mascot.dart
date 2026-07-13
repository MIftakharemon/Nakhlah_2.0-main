import 'dart:math' as math;

import 'package:flutter/material.dart';

enum FreshDateMood {
  happy,
  excited,
  celebrating,
  sleeping,
  sad,
  thinking,
  focused,
  encouraging,
  proud,
  confident,
  cool,
  surprised,
}

class FreshDateMascot extends StatefulWidget {
  const FreshDateMascot({
    super.key,
    this.size = 64,
    this.mood = FreshDateMood.happy,
    this.animate = true,
    this.message,
  });

  final double size;
  final FreshDateMood mood;
  final bool animate;
  final String? message;

  @override
  State<FreshDateMascot> createState() => _FreshDateMascotState();
}

class _FreshDateMascotState extends State<FreshDateMascot>
    with TickerProviderStateMixin {
  late final AnimationController _bodyCtrl;
  late final AnimationController _blinkCtrl;
  late final AnimationController _confettiCtrl;

  @override
  void initState() {
    super.initState();
    _bodyCtrl = AnimationController(
      vsync: this,
      duration: _bodyDuration(widget.mood),
    );
    _blinkCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2500),
    );
    _confettiCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1600),
    );

    if (widget.animate) {
      _bodyCtrl.repeat();
      _blinkCtrl.repeat();
      if (widget.mood == FreshDateMood.excited ||
          widget.mood == FreshDateMood.celebrating) {
        _confettiCtrl.repeat();
      }
    }
  }

  static Duration _bodyDuration(FreshDateMood mood) {
    switch (mood) {
      case FreshDateMood.excited:
      case FreshDateMood.celebrating:
        return const Duration(milliseconds: 400);
      case FreshDateMood.sleeping:
        return const Duration(milliseconds: 2000);
      case FreshDateMood.sad:
        return const Duration(milliseconds: 2000);
      case FreshDateMood.thinking:
      case FreshDateMood.focused:
        return const Duration(milliseconds: 2800);
      case FreshDateMood.encouraging:
        return const Duration(milliseconds: 1000);
      default:
        return const Duration(milliseconds: 1800);
    }
  }

  @override
  void didUpdateWidget(covariant FreshDateMascot old) {
    super.didUpdateWidget(old);
    if (widget.mood != old.mood) {
      _bodyCtrl
        ..duration = _bodyDuration(widget.mood)
        ..reset();
      if (widget.animate) _bodyCtrl.repeat();

      _confettiCtrl.reset();
      if (widget.animate &&
          (widget.mood == FreshDateMood.excited ||
              widget.mood == FreshDateMood.celebrating)) {
        _confettiCtrl.repeat();
      }
    }
    if (widget.animate && !_bodyCtrl.isAnimating) {
      _bodyCtrl.repeat();
      _blinkCtrl.repeat();
    } else if (!widget.animate && _bodyCtrl.isAnimating) {
      _bodyCtrl.stop();
      _blinkCtrl.stop();
      _confettiCtrl.stop();
    }
  }

  @override
  void dispose() {
    _bodyCtrl.dispose();
    _blinkCtrl.dispose();
    _confettiCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final w = widget.size;
    final h = widget.size * (92 / 64);

    Widget body = AnimatedBuilder(
      animation: Listenable.merge([_bodyCtrl, _blinkCtrl, _confettiCtrl]),
      builder: (_, _2) {
        return CustomPaint(
          size: Size(w, h),
          painter: _FreshDatePainter(
            mood: widget.mood,
            bodyValue: _bodyCtrl.value,
            blinkValue: _blinkCtrl.value,
          ),
        );
      },
    );

    // Body animation (translateY / rotate / scale)
    if (widget.animate) {
      body = AnimatedBuilder(
        animation: _bodyCtrl,
        builder: (_, child) {
          final t = _bodyTransform(widget.mood, _bodyCtrl.value);
          return Transform.translate(
            offset: Offset(0, t.$1),
            child: Transform.rotate(
              angle: t.$2 * math.pi / 180,
              child: Transform.scale(
                scale: t.$3,
                child: child,
              ),
            ),
          );
        },
        child: body,
      );
    }

    // Accessories layer
    final accessories = _buildAccessories(w, h);

    Widget result = Stack(
      clipBehavior: Clip.none,
      children: [
        if (accessories.isNotEmpty)
          Positioned.fill(child: Stack(children: accessories)),
        body,
      ],
    );

    if (widget.message != null) {
      result = Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          result,
          const SizedBox(height: 4),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE5E7EB)),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x1A000000),
                  blurRadius: 4,
                  offset: Offset(0, 1),
                ),
              ],
            ),
            child: Text(
              widget.message!,
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w600,
                color: Color(0xFF374151),
              ),
              textAlign: TextAlign.center,
            ),
          ),
        ],
      );
    }

    return result;
  }

  // Returns (translateY, rotateDeg, scale)
  static (double, double, double) _bodyTransform(FreshDateMood mood, double t) {
    switch (mood) {
      case FreshDateMood.happy:
        final y = t < 0.5
            ? lerpDouble(0, -3, t * 2)!
            : lerpDouble(-3, 0, (t - 0.5) * 2)!;
        return (y, 0, 1);
      case FreshDateMood.excited:
      case FreshDateMood.celebrating:
        final s = t < 0.5
            ? lerpDouble(1, 1.04, t * 2)!
            : lerpDouble(1.04, 1, (t - 0.5) * 2)!;
        return (0, 0, s);
      case FreshDateMood.sleeping:
        final s = t < 0.5
            ? lerpDouble(1, 1.02, t * 2)!
            : lerpDouble(1.02, 1, (t - 0.5) * 2)!;
        return (0, 0, s);
      case FreshDateMood.sad:
        final y = t < 0.5
            ? lerpDouble(0, 1.5, t * 2)!
            : lerpDouble(1.5, 0, (t - 0.5) * 2)!;
        return (y, 0, 1);
      case FreshDateMood.thinking:
      case FreshDateMood.focused:
        double r;
        if (t < 0.25) {
          r = lerpDouble(0, 1, t * 4)!;
        } else if (t < 0.5) {
          r = lerpDouble(1, -1, (t - 0.25) * 4)!;
        } else if (t < 0.75) {
          r = lerpDouble(-1, 0, (t - 0.5) * 4)!;
        } else {
          r = 0;
        }
        return (0, r, 1);
      case FreshDateMood.encouraging:
        final y = t < 0.5
            ? lerpDouble(0, -2.5, t * 2)!
            : lerpDouble(-2.5, 0, (t - 0.5) * 2)!;
        return (y, 0, 1);
      default:
        final y = t < 0.5
            ? lerpDouble(0, -2, t * 2)!
            : lerpDouble(-2, 0, (t - 0.5) * 2)!;
        return (y, 0, 1);
    }
  }

  List<Widget> _buildAccessories(double w, double h) {
    final sx = w / 64;
    final sy = h / 92;
    final list = <Widget>[];

    switch (widget.mood) {
      case FreshDateMood.happy:
        list.add(_Sparkle(sx: sx, sy: sy, animate: widget.animate));
        break;
      case FreshDateMood.excited:
        list.add(_PartyHat(sx: sx, sy: sy));
        if (widget.animate) {
          list.add(
            ConfettiWidget(
              controller: _confettiCtrl,
              sx: sx,
              sy: sy,
            ),
          );
        }
        break;
      case FreshDateMood.celebrating:
        list.add(_PartyHat(sx: sx, sy: sy));
        if (widget.animate) {
          list.add(
            ConfettiWidget(
              controller: _confettiCtrl,
              sx: sx,
              sy: sy,
            ),
          );
        }
        break;
      case FreshDateMood.thinking:
        list.add(_ThinkingBubble(sx: sx, sy: sy));
        break;
      case FreshDateMood.cool:
        list.add(_Sunglasses(sx: sx, sy: sy));
        list.add(_Sparkle(sx: sx, sy: sy, animate: widget.animate));
        break;
      case FreshDateMood.sad:
        list.add(_TearDrop(sx: sx, sy: sy, animate: widget.animate));
        break;
      case FreshDateMood.sleeping:
        list.add(_ZzzText(sx: sx, sy: sy, animate: widget.animate));
        break;
      case FreshDateMood.surprised:
        list.add(_ExclamationMark(sx: sx, sy: sy));
        break;
      case FreshDateMood.focused:
        list.add(_ReadingGlasses(sx: sx, sy: sy));
        break;
      case FreshDateMood.proud:
        list.add(_Crown(sx: sx, sy: sy));
        list.add(_Sparkle(sx: sx, sy: sy, animate: widget.animate));
        break;
      case FreshDateMood.confident:
        list.add(_Sparkle(sx: sx, sy: sy, animate: widget.animate));
        break;
      default:
        break;
    }

    return list;
  }
}

// ─── Custom Painter (body, face, arms) ─────────────────────────────────────

class _FreshDatePainter extends CustomPainter {
  _FreshDatePainter({
    required this.mood,
    required this.bodyValue,
    required this.blinkValue,
  });

  final FreshDateMood mood;
  final double bodyValue;
  final double blinkValue;

  static const _darkBrown = Color(0xFF3E2412);
  static const _blushPink = Color(0xFFF9A8D4);

  @override
  void paint(Canvas canvas, Size size) {
    final sx = size.width / 64;
    final sy = size.height / 92;
    canvas
      ..save()
      ..scale(sx, sy);

    _drawShadow(canvas);
    _drawBody(canvas);
    _drawCalyx(canvas);
    _drawStem(canvas);
    _drawEyebrows(canvas);
    _drawEyes(canvas);
    _drawMouth(canvas);
    _drawBlush(canvas);
    _drawArms(canvas);

    canvas.restore();
  }

  // ── Shadow ──────────────────────────────────────────────────────────────
  void _drawShadow(Canvas canvas) {
    canvas.drawOval(
      const Rect.fromLTWH(13, 85, 38, 6),
      Paint()..color = const Color(0x26000000),
    );
  }

  // ── Body ────────────────────────────────────────────────────────────────
  void _drawBody(Canvas canvas) {
    final bodyPath = Path()
      ..moveTo(6, 42)
      ..cubicTo(6, 27, 17, 16, 32, 16)
      ..cubicTo(47, 16, 58, 27, 58, 42)
      ..cubicTo(58.5, 46, 58.5, 51, 58, 56)
      ..cubicTo(57, 66, 52, 75, 44, 79)
      ..cubicTo(40, 81, 36, 81.5, 32, 81.5)
      ..cubicTo(28, 81.5, 24, 81, 20, 79)
      ..cubicTo(12, 75, 7, 66, 6, 56)
      ..cubicTo(5.5, 51, 5.5, 46, 6, 42)
      ..close();

    // Bottom gradient
    canvas.drawPath(
      bodyPath,
      Paint()
        ..shader = const LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFFA9642A), Color(0xFF8A4E1C)],
        ).createShader(const Rect.fromLTWH(0, 16, 64, 76)),
    );

    // Outline
    canvas.drawPath(
      bodyPath,
      Paint()
        ..shader = const LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFFC99A4A), Color(0xFF6E3D14)],
        ).createShader(const Rect.fromLTWH(0, 16, 64, 76))
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.6,
    );

    // Top lighter area
    canvas.drawPath(
      Path()
        ..moveTo(6, 42)
        ..cubicTo(6, 27, 17, 16, 32, 16)
        ..cubicTo(47, 16, 58, 27, 58, 42)
        ..cubicTo(58.3, 48, 58.3, 55, 58, 60)
        ..cubicTo(50, 63, 42, 65, 32, 65)
        ..cubicTo(22, 65, 14, 63, 6, 60)
        ..cubicTo(5.7, 55, 5.7, 48, 6, 42)
        ..close(),
      Paint()
        ..shader = const LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFFF2C878), Color(0xFFDFA84E)],
        ).createShader(const Rect.fromLTWH(0, 16, 64, 49)),
    );

    // Highlights
    canvas
      ..drawOval(
        const Rect.fromLTWH(15, 30, 18, 12),
        Paint()..color = const Color(0x38FFFFFF),
      )
      ..drawOval(
        const Rect.fromLTWH(38, 26, 8, 6),
        Paint()..color = const Color(0x26FFFFFF),
      );

    // Wrinkle line
    canvas.drawPath(
      Path()
        ..moveTo(6, 60)
        ..quadraticBezierTo(14, 64, 22, 63)
        ..quadraticBezierTo(28, 62, 32, 64)
        ..quadraticBezierTo(38, 66, 44, 63)
        ..quadraticBezierTo(52, 61, 58, 60),
      Paint()
        ..color = const Color(0xFFB4762E)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.2
        ..strokeCap = StrokeCap.round,
    );

    // Bottom wrinkle lines
    final wl = Paint()
      ..color = const Color(0x597A4415)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1
      ..strokeCap = StrokeCap.round;
    canvas
      ..drawPath(
        Path()..moveTo(16, 68)..quadraticBezierTo(20, 73, 18, 78),
        wl,
      )
      ..drawPath(
        Path()..moveTo(46, 68)..quadraticBezierTo(44, 72, 46, 76),
        wl..color = const Color(0x4D7A4415),
      )
      ..drawPath(
        Path()..moveTo(27, 76)..quadraticBezierTo(32, 79, 37, 76),
        wl..color = const Color(0x4D7A4415),
      );
  }

  // ── Calyx ───────────────────────────────────────────────────────────────
  void _drawCalyx(Canvas canvas) {
    final calyx = Path()
      ..moveTo(16, 22)
      ..cubicTo(19, 17.5, 25, 15, 32, 15)
      ..cubicTo(39, 15, 45, 17.5, 48, 22)
      ..quadraticBezierTo(46, 25.6, 44, 24.2)
      ..quadraticBezierTo(42, 27.4, 40, 25.8)
      ..quadraticBezierTo(38, 28.7, 36, 26.8)
      ..quadraticBezierTo(34, 29.4, 32, 27.1)
      ..quadraticBezierTo(30, 29.4, 28, 26.8)
      ..quadraticBezierTo(26, 28.7, 24, 25.8)
      ..quadraticBezierTo(22, 27.4, 20, 24.2)
      ..quadraticBezierTo(18, 25.6, 16, 22)
      ..close();

    canvas
      ..drawPath(
        calyx,
        Paint()
          ..shader = const LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFFF2C979), Color(0xFFD9A047)],
          ).createShader(const Rect.fromLTWH(16, 15, 32, 14)),
      )
      ..drawPath(
        calyx,
        Paint()
          ..color = const Color(0xFF8F5F23)
          ..style = PaintingStyle.stroke
          ..strokeWidth = 0.8
          ..strokeJoin = StrokeJoin.round,
      );

    // Inner scallop line
    canvas.drawPath(
      Path()
        ..moveTo(46.5, 21.4)
        ..quadraticBezierTo(46, 23.9, 44, 22.5)
        ..quadraticBezierTo(42, 25.7, 40, 24.1)
        ..quadraticBezierTo(38, 27, 36, 25.1)
        ..quadraticBezierTo(34, 27.7, 32, 25.4)
        ..quadraticBezierTo(30, 27.7, 28, 25.1)
        ..quadraticBezierTo(26, 27, 24, 24.1)
        ..quadraticBezierTo(22, 25.7, 20, 22.5)
        ..quadraticBezierTo(18, 23.9, 17.5, 21.4),
      Paint()
        ..color = const Color(0xFFB07F35)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 0.45
        ..strokeCap = StrokeCap.round,
    );

    // Center dot
    canvas.drawOval(
      const Rect.fromLTWH(31.4, 16.65, 2, 1.5),
      Paint()..color = const Color(0x4D8A5F16),
    );
  }

  // ── Stem ────────────────────────────────────────────────────────────────
  void _drawStem(Canvas canvas) {
    final stem = Path()
      ..moveTo(30.6, 17.6)
      ..cubicTo(30.7, 14, 31.3, 10.6, 32.4, 7.9)
      ..lineTo(35.3, 8.5)
      ..cubicTo(34.7, 11.2, 34.3, 14.4, 34.2, 17.6)
      ..close();

    canvas
      ..drawPath(
        stem,
        Paint()
          ..shader = const LinearGradient(
            colors: [Color(0xFFF4CE5A), Color(0xFFC08E22)],
          ).createShader(const Rect.fromLTWH(30, 7, 6, 11)),
      )
      ..drawPath(
        stem,
        Paint()
          ..color = const Color(0xFF8A5E14)
          ..style = PaintingStyle.stroke
          ..strokeWidth = 0.5,
      );

    // Stem highlight
    canvas.drawPath(
      Path()
        ..moveTo(31.5, 16.8)
        ..cubicTo(31.6, 13.6, 32, 10.8, 32.9, 8.6),
      Paint()
        ..color = const Color(0x99F6DE9C)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 0.5
        ..strokeCap = StrokeCap.round,
    );

    // Tip
    canvas.drawOval(
      const Rect.fromLTWH(33.1, 7.6, 3.1, 1.2),
      Paint()..color = const Color(0xFFF6DE9C),
    );

    // Stem base dot
    canvas.drawOval(
      const Rect.fromLTWH(30.85, 16.6, 1.1, 0.8),
      Paint()..color = const Color(0xA66E4A12),
    );
  }

  // ── Eyebrows ────────────────────────────────────────────────────────────
  void _drawEyebrows(Canvas canvas) {
    final p = Paint()
      ..color = _darkBrown
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    Path brow(double x1, double y1, double cx, double cy, double x2, double y2) =>
        Path()..moveTo(x1, y1)..quadraticBezierTo(cx, cy, x2, y2);

    switch (mood) {
      case FreshDateMood.sad:
        p.strokeWidth = 1.8;
        canvas
          ..drawPath(brow(19, 32, 24, 35, 29, 34), p)
          ..drawPath(brow(35, 34, 40, 35, 45, 32), p);
        break;
      case FreshDateMood.thinking:
        p.strokeWidth = 1.8;
        canvas
          ..drawPath(brow(19, 33, 24, 30, 29, 32), p)
          ..drawPath(brow(35, 30, 40, 27, 45, 30), p);
        break;
      case FreshDateMood.focused:
        p.strokeWidth = 2;
        canvas
          ..drawLine(const Offset(19, 34), const Offset(29, 32.5), p)
          ..drawLine(const Offset(35, 32.5), const Offset(45, 34), p);
        break;
      case FreshDateMood.confident:
        p.strokeWidth = 1.8;
        canvas
          ..drawPath(brow(19, 31, 24, 28, 29, 30), p)
          ..drawPath(brow(35, 34, 40, 33.5, 45, 34.5), p);
        break;
      default:
        p.strokeWidth = 1.6;
        canvas
          ..drawPath(brow(19, 32, 24, 29, 29, 31), p)
          ..drawPath(brow(35, 31, 40, 29, 45, 32), p);
        break;
    }
  }

  // ── Eyes ────────────────────────────────────────────────────────────────
  void _drawEyes(Canvas canvas) {
    final white = Paint()..color = Colors.white;
    final dark = Paint()..color = _darkBrown;
    final shine = Paint()..color = Colors.white;

    switch (mood) {
      case FreshDateMood.happy:
      case FreshDateMood.celebrating:
        final ep = Paint()
          ..color = _darkBrown
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2.4
          ..strokeCap = StrokeCap.round;
        canvas
          ..drawPath(
            Path()..moveTo(19, 43)..quadraticBezierTo(24, 37.5, 29, 43),
            ep,
          )
          ..drawPath(
            Path()..moveTo(35, 43)..quadraticBezierTo(40, 37.5, 45, 43),
            ep,
          );
        break;

      case FreshDateMood.sleeping:
        final ep = Paint()
          ..color = _darkBrown
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2.2
          ..strokeCap = StrokeCap.round;
        canvas
          ..drawPath(
            Path()..moveTo(19, 42)..quadraticBezierTo(24, 46, 29, 42),
            ep,
          )
          ..drawPath(
            Path()..moveTo(35, 42)..quadraticBezierTo(40, 46, 45, 42),
            ep,
          );
        // Lashes
        final lp = Paint()
          ..color = _darkBrown
          ..style = PaintingStyle.stroke
          ..strokeWidth = 0.9
          ..strokeCap = StrokeCap.round;
        canvas
          ..drawLine(const Offset(21, 45), const Offset(22, 47), lp)
          ..drawLine(const Offset(27, 45), const Offset(26, 47), lp)
          ..drawLine(const Offset(37, 45), const Offset(38, 47), lp)
          ..drawLine(const Offset(43, 45), const Offset(42, 47), lp);
        break;

      case FreshDateMood.sad:
        canvas
          ..drawOval(const Rect.fromLTWH(19.2, 37.5, 9.6, 11), white)
          ..drawOval(const Rect.fromLTWH(35.2, 37.5, 9.6, 11), white)
          ..drawOval(const Rect.fromLTWH(21.4, 39, 5.2, 5.2), dark)
          ..drawOval(const Rect.fromLTWH(37.4, 39, 5.2, 5.2), dark)
          ..drawOval(const Rect.fromLTWH(22.5, 43.5, 2, 2), shine)
          ..drawOval(const Rect.fromLTWH(38.5, 43.5, 2, 2), shine);
        break;

      case FreshDateMood.thinking:
        canvas
          ..drawOval(const Rect.fromLTWH(19, 36, 10, 12), white)
          ..drawOval(const Rect.fromLTWH(35, 36, 10, 12), white)
          ..drawOval(const Rect.fromLTWH(22.9, 37.4, 5.2, 5.2), dark)
          ..drawOval(const Rect.fromLTWH(38.9, 37.4, 5.2, 5.2), dark);
        break;

      case FreshDateMood.surprised:
        canvas
          ..drawOval(const Rect.fromLTWH(17.5, 35.5, 13, 13), white)
          ..drawOval(const Rect.fromLTWH(33.5, 35.5, 13, 13), white)
          ..drawOval(const Rect.fromLTWH(20.8, 38.8, 6.4, 6.4), dark)
          ..drawOval(const Rect.fromLTWH(36.8, 38.8, 6.4, 6.4), dark)
          ..drawOval(const Rect.fromLTWH(22, 39.3, 2.4, 2.4), shine)
          ..drawOval(const Rect.fromLTWH(38, 39.3, 2.4, 2.4), shine);
        break;

      case FreshDateMood.focused:
        canvas
          ..drawOval(const Rect.fromLTWH(19, 37.5, 10, 9), white)
          ..drawOval(const Rect.fromLTWH(35, 37.5, 10, 9), white)
          ..drawOval(const Rect.fromLTWH(22.3, 39.3, 5.4, 5.4), dark)
          ..drawOval(const Rect.fromLTWH(38.3, 39.3, 5.4, 5.4), dark)
          ..drawOval(const Rect.fromLTWH(23.5, 39, 2, 2), shine)
          ..drawOval(const Rect.fromLTWH(39.5, 39, 2, 2), shine);
        break;

      case FreshDateMood.confident:
        canvas
          ..drawOval(const Rect.fromLTWH(19, 36, 10, 12), white)
          ..drawOval(const Rect.fromLTWH(35, 37, 10, 10.4), white)
          ..drawOval(const Rect.fromLTWH(22.2, 39.5, 5.6, 5.6), dark)
          ..drawOval(const Rect.fromLTWH(38.2, 40.2, 5.6, 5.6), dark)
          ..drawOval(const Rect.fromLTWH(23.2, 38.2, 2.4, 2.4), shine)
          ..drawOval(const Rect.fromLTWH(39.2, 39, 2.4, 2.4), shine);
        break;

      case FreshDateMood.excited:
        // Animated blink eyes
        final blinkT = bodyValue;
        // 0,0,0.42,0.45,0.48,1 → scaleY values: 1,1,0.1,1,1
        double eyeScaleY;
        if (blinkT < 0.42) {
          eyeScaleY = 1;
        } else if (blinkT < 0.45) {
          eyeScaleY = lerpDouble(1, 0.1, (blinkT - 0.42) / 0.03)!;
        } else if (blinkT < 0.48) {
          eyeScaleY = lerpDouble(0.1, 1, (blinkT - 0.45) / 0.03)!;
        } else {
          eyeScaleY = 1;
        }
        _drawBlinkEyes(canvas, white, dark, shine, eyeScaleY);
        break;

      case FreshDateMood.proud:
        final blinkT = bodyValue;
        double eyeScaleY;
        if (blinkT < 0.42) {
          eyeScaleY = 1;
        } else if (blinkT < 0.45) {
          eyeScaleY = lerpDouble(1, 0.1, (blinkT - 0.42) / 0.03)!;
        } else if (blinkT < 0.48) {
          eyeScaleY = lerpDouble(0.1, 1, (blinkT - 0.45) / 0.03)!;
        } else {
          eyeScaleY = 1;
        }
        _drawBlinkEyes(canvas, white, dark, shine, eyeScaleY);
        break;

      default:
        canvas
          ..drawOval(const Rect.fromLTWH(19, 36, 10, 12), white)
          ..drawOval(const Rect.fromLTWH(35, 36, 10, 12), white)
          ..drawOval(const Rect.fromLTWH(22.2, 40.2, 5.6, 5.6), dark)
          ..drawOval(const Rect.fromLTWH(38.2, 40.2, 5.6, 5.6), dark)
          ..drawOval(const Rect.fromLTWH(23.2, 39.2, 2.4, 2.4), shine)
          ..drawOval(const Rect.fromLTWH(39.2, 39.2, 2.4, 2.4), shine);
        break;
    }
  }

  void _drawBlinkEyes(
    Canvas canvas,
    Paint white,
    Paint dark,
    Paint shine,
    double scaleY,
  ) {
    void blinkOval(Rect r, Paint p) {
      final center = r.center;
      final hw = r.width / 2;
      final hh = r.height / 2 * scaleY;
      canvas.drawOval(
        Rect.fromCenter(center: center, width: hw * 2, height: hh * 2),
        p,
      );
    }

    // White
    blinkOval(const Rect.fromLTWH(19, 36, 10, 12), white);
    blinkOval(const Rect.fromLTWH(35, 36, 10, 12), white);
    // Pupil
    blinkOval(const Rect.fromLTWH(22.2, 40.2, 5.6, 5.6), dark);
    blinkOval(const Rect.fromLTWH(38.2, 40.2, 5.6, 5.6), dark);
    // Shine
    if (scaleY > 0.3) {
      blinkOval(const Rect.fromLTWH(23.2, 39.2, 2.4, 2.4), shine);
      blinkOval(const Rect.fromLTWH(39.2, 39.2, 2.4, 2.4), shine);
    }
  }

  // ── Mouth ───────────────────────────────────────────────────────────────
  void _drawMouth(Canvas canvas) {
    final dp = Paint()..color = _darkBrown;

    switch (mood) {
      case FreshDateMood.excited:
      case FreshDateMood.celebrating:
        canvas.drawPath(
          Path()
            ..moveTo(24, 57)
            ..quadraticBezierTo(32, 58, 40, 57)
            ..quadraticBezierTo(40, 67, 32, 67)
            ..quadraticBezierTo(24, 67, 24, 57)
            ..close(),
          dp,
        );
        canvas.drawPath(
          Path()
            ..moveTo(26, 57.5)
            ..quadraticBezierTo(32, 58.5, 38, 57.5)
            ..lineTo(38, 60)
            ..quadraticBezierTo(32, 61, 26, 60)
            ..close(),
          Paint()..color = Colors.white,
        );
        canvas.drawOval(
          const Rect.fromLTWH(28.5, 62.5, 7, 4),
          Paint()..color = const Color(0xFFFF8A80),
        );
        break;

      case FreshDateMood.cool:
        canvas.drawPath(
          Path()..moveTo(26, 60)..quadraticBezierTo(33, 63.5, 39, 58.5),
          dp
            ..style = PaintingStyle.stroke
            ..strokeWidth = 2.3
            ..strokeCap = StrokeCap.round,
        );
        break;

      case FreshDateMood.proud:
        canvas.drawPath(
          Path()..moveTo(25, 58)..quadraticBezierTo(32, 64, 39, 58),
          dp
            ..style = PaintingStyle.stroke
            ..strokeWidth = 2.4
            ..strokeCap = StrokeCap.round,
        );
        canvas.drawPath(
          Path()
            ..moveTo(27.5, 59.4)
            ..quadraticBezierTo(32, 62.5, 36.5, 59.4)
            ..lineTo(36, 60.8)
            ..quadraticBezierTo(32, 63, 28, 60.8)
            ..close(),
          Paint()..color = Colors.white,
        );
        break;

      case FreshDateMood.thinking:
        canvas.drawPath(
          Path()..moveTo(27, 61)..quadraticBezierTo(30, 59.5, 34, 61.5),
          dp
            ..style = PaintingStyle.stroke
            ..strokeWidth = 2.2
            ..strokeCap = StrokeCap.round,
        );
        break;

      case FreshDateMood.confident:
        canvas.drawPath(
          Path()..moveTo(27, 61.5)..quadraticBezierTo(32, 63, 36, 59.5),
          dp
            ..style = PaintingStyle.stroke
            ..strokeWidth = 2.3
            ..strokeCap = StrokeCap.round,
        );
        break;

      case FreshDateMood.sad:
        canvas.drawPath(
          Path()..moveTo(26, 63)..quadraticBezierTo(32, 58, 38, 63),
          dp
            ..style = PaintingStyle.stroke
            ..strokeWidth = 2.4
            ..strokeCap = StrokeCap.round,
        );
        break;

      case FreshDateMood.surprised:
        canvas.drawOval(const Rect.fromLTWH(28, 56, 8, 10), dp);
        break;

      case FreshDateMood.sleeping:
        canvas.drawOval(const Rect.fromLTWH(29.5, 58, 5, 6), dp);
        break;

      case FreshDateMood.focused:
        canvas.drawLine(
          const Offset(27, 61),
          const Offset(37, 61),
          dp
            ..style = PaintingStyle.stroke
            ..strokeWidth = 2.4
            ..strokeCap = StrokeCap.round,
        );
        break;

      case FreshDateMood.encouraging:
        canvas.drawPath(
          Path()
            ..moveTo(24, 57)
            ..quadraticBezierTo(32, 66, 40, 57)
            ..quadraticBezierTo(32, 60, 24, 57)
            ..close(),
          dp,
        );
        canvas.drawPath(
          Path()
            ..moveTo(26.5, 58)
            ..quadraticBezierTo(32, 60, 37.5, 58)
            ..lineTo(37, 60)
            ..quadraticBezierTo(32, 62, 27, 60)
            ..close(),
          Paint()..color = Colors.white,
        );
        break;

      default:
        // happy
        canvas.drawPath(
          Path()..moveTo(25, 58)..quadraticBezierTo(32, 65, 39, 58),
          dp
            ..style = PaintingStyle.stroke
            ..strokeWidth = 2.5
            ..strokeCap = StrokeCap.round,
        );
        canvas.drawPath(
          Path()
            ..moveTo(28, 60.2)
            ..quadraticBezierTo(32, 63, 36, 60.2)
            ..lineTo(35.5, 61.6)
            ..quadraticBezierTo(32, 64, 28.5, 61.6)
            ..close(),
          Paint()..color = Colors.white,
        );
        break;
    }
  }

  // ── Blush ───────────────────────────────────────────────────────────────
  void _drawBlush(Canvas canvas) {
    if (mood == FreshDateMood.sad || mood == FreshDateMood.focused) {
      return;
    }
    final opacity = mood == FreshDateMood.sleeping ? 0.35 : 0.55;
    final p = Paint()..color = _blushPink.withValues(alpha: opacity);
    canvas
      ..drawOval(const Rect.fromLTWH(10, 47.7, 8, 4.6), p)
      ..drawOval(const Rect.fromLTWH(46, 47.7, 8, 4.6), p);
  }

  // ── Arms ────────────────────────────────────────────────────────────────
  void _drawArms(Canvas canvas) {
    final fill = Paint()..color = const Color(0xFFE8B25A);
    final stroke = Paint()
      ..color = const Color(0xFF8A4E1C)
      ..strokeWidth = 0.8
      ..style = PaintingStyle.stroke
      ..strokeJoin = StrokeJoin.round;

    Path armCap() => Path()
      ..moveTo(-2, -1.35)
      ..quadraticBezierTo(-1.4, 6.39, -5.6, 11.8)
      ..arcToPoint(
        const Offset(-2.4, 14.2),
        radius: const Radius.circular(2),
      )
      ..quadraticBezierTo(2.4, 7.61, 2, -1.65)
      ..close();

    void drawArm(double x, double y, {bool flip = false, double rotate = 0}) {
      canvas.save();
      canvas
        ..translate(x, y)
        ..rotate(rotate * math.pi / 180);
      if (flip) canvas.scale(-1, 1);
      final cap = armCap();
      canvas
        ..drawPath(cap, fill)
        ..drawPath(cap, stroke)
        ..restore();
    }

    switch (mood) {
      case FreshDateMood.happy:
      case FreshDateMood.encouraging:
      case FreshDateMood.excited:
        drawArm(5.5, 36.5, flip: true);
        drawArm(58.5, 36.5);
        break;
      case FreshDateMood.sad:
        drawArm(6, 62, rotate: 180);
        drawArm(58, 62, flip: true, rotate: 180);
        break;
      case FreshDateMood.celebrating:
        drawArm(5.5, 36.5, flip: true, rotate: -15);
        drawArm(58.5, 36.5, rotate: 15);
        break;
      default:
        break;
    }
  }

  @override
  bool shouldRepaint(covariant _FreshDatePainter old) =>
      old.mood != mood ||
      old.bodyValue != bodyValue ||
      old.blinkValue != blinkValue;
}

// ─── Accessories ───────────────────────────────────────────────────────────

class _Sparkle extends StatelessWidget {
  const _Sparkle({required this.sx, required this.sy, required this.animate});
  final double sx, sy;
  final bool animate;

  @override
  Widget build(BuildContext context) {
    Widget star(double x, double y, double size, {double rotation = 0, double opacity = 1}) {
      return Positioned(
        left: x * sx - size / 2,
        top: y * sy - size / 2,
        child: Transform.rotate(
          angle: rotation,
          child: Icon(Icons.star, size: size, color: Color(0xFFF5B940).withValues(alpha: opacity)),
        ),
      );
    }

    if (!animate) {
      return Stack(children: [
        star(6, 20, 8 * sx),
        star(58, 16, 6 * sx),
        star(56, 62, 5 * sx),
        star(10, 58, 4 * sx),
      ]);
    }

    return Stack(children: [
      star(6, 20, 8 * sx, opacity: 0.5),
      star(58, 16, 6 * sx, opacity: 0.5),
      star(56, 62, 5 * sx, opacity: 0.5),
      star(10, 58, 4 * sx, opacity: 0.5),
    ]);
  }
}

class _PartyHat extends StatelessWidget {
  const _PartyHat({required this.sx, required this.sy});
  final double sx, sy;

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: 39 * sx,
      top: 3.5 * sy,
      child: CustomPaint(
        size: Size(12 * sx, 20 * sy),
        painter: _PartyHatPainter(),
      ),
    );
  }
}

class _PartyHatPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final sx = size.width / 12;
    final sy = size.height / 20;
    canvas
      ..save()
      ..scale(sx, sy);

    // Hat body
    canvas.drawPath(
      Path()
        ..moveTo(0, 20)
        ..lineTo(6, 0)
        ..lineTo(12, 20)
        ..close(),
      Paint()..color = const Color(0xFFFBBF24),
    );

    // Stripes
    final stripePaint = Paint()..style = PaintingStyle.stroke..strokeWidth = 1.5;
    canvas
      ..drawPath(
        Path()..moveTo(2, 16)..lineTo(5, 4),
        stripePaint..color = const Color(0xFFA855F7),
      )
      ..drawPath(
        Path()..moveTo(6, 18)..lineTo(7.5, 6),
        stripePaint..color = const Color(0xFFEC4899),
      )
      ..drawPath(
        Path()..moveTo(10, 16)..lineTo(8, 4),
        stripePaint..color = const Color(0xFFA855F7),
      );

    // Top ball
    canvas.drawCircle(
      const Offset(6, 1),
      2,
      Paint()..color = const Color(0xFFEF4444),
    );

    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _ThinkingBubble extends StatelessWidget {
  const _ThinkingBubble({required this.sx, required this.sy});
  final double sx, sy;

  @override
  Widget build(BuildContext context) {
    return Stack(children: [
      // Small bubbles
      Positioned(
        left: 48 * sx,
        top: 26 * sy,
        child: Container(
          width: 4 * sx,
          height: 4 * sy,
          decoration: BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
            border: Border.all(color: const Color(0xFF9CA3AF), width: 0.5),
          ),
        ),
      ),
      Positioned(
        left: 50 * sx,
        top: 22 * sy,
        child: Container(
          width: 6 * sx,
          height: 6 * sy,
          decoration: BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
            border: Border.all(color: const Color(0xFF9CA3AF), width: 0.5),
          ),
        ),
      ),
      // Main bubble
      Positioned(
        left: 44 * sx,
        top: 8 * sy,
        child: Container(
          width: 20 * sx,
          height: 16 * sy,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(8 * sx),
            border: Border.all(color: const Color(0xFF9CA3AF), width: 0.5),
          ),
          child: Center(
            child: Text(
              '?',
              style: TextStyle(
                fontSize: 12 * sx,
                fontWeight: FontWeight.bold,
                color: const Color(0xFF8B5A2B),
              ),
            ),
          ),
        ),
      ),
    ]);
  }
}

class _Sunglasses extends StatelessWidget {
  const _Sunglasses({required this.sx, required this.sy});
  final double sx, sy;

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: 16 * sx,
      top: 37 * sy,
      child: CustomPaint(
        size: Size(32 * sx, 10 * sy),
        painter: _SunglassesPainter(),
      ),
    );
  }
}

class _SunglassesPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final sx = size.width / 32;
    final sy = size.height / 10;
    canvas
      ..save()
      ..scale(sx, sy);

    final lensPaint = Paint()..color = const Color(0xFF1a1a2e);
    final framePaint = Paint()
      ..color = const Color(0xFF1a1a2e)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 0.6;

    // Left lens
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        const Rect.fromLTWH(0, 1, 12, 8),
        const Radius.circular(3),
      ),
      lensPaint,
    );
    // Right lens
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        const Rect.fromLTWH(17, 1, 12, 8),
        const Radius.circular(3),
      ),
      lensPaint,
    );
    // Bridge
    canvas.drawLine(const Offset(12, 4), const Offset(17, 4), framePaint..strokeWidth = 1.2);
    // Left arm
    canvas.drawLine(const Offset(0, 4), const Offset(-3, 3), framePaint);
    // Right arm
    canvas.drawLine(const Offset(29, 4), const Offset(32, 3), framePaint);
    // Shine
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        const Rect.fromLTWH(2, 2.5, 4, 2),
        const Radius.circular(1),
      ),
      Paint()..color = const Color(0x40FFFFFF),
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        const Rect.fromLTWH(19, 2.5, 3.5, 1.5),
        const Radius.circular(0.75),
      ),
      Paint()..color = const Color(0x26FFFFFF),
    );

    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _TearDrop extends StatelessWidget {
  const _TearDrop({required this.sx, required this.sy, required this.animate});
  final double sx, sy;
  final bool animate;

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: 44 * sx,
      top: 44.5 * sy,
      child: CustomPaint(
        size: Size(4 * sx, 6 * sy),
        painter: _TearDropPainter(),
      ),
    );
  }
}

class _TearDropPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final sx = size.width / 4;
    final sy = size.height / 6;
    canvas
      ..save()
      ..scale(sx, sy);

    canvas.drawPath(
      Path()
        ..moveTo(2, 0)
        ..cubicTo(3.4, 2.4, 3.4, 4.1, 2, 4.9)
        ..cubicTo(0.6, 4.1, 0.6, 2.4, 2, 0)
        ..close(),
      Paint()..color = const Color(0xFF7EC8F7),
    );
    canvas.drawPath(
      Path()
        ..moveTo(2, 0)
        ..cubicTo(3.4, 2.4, 3.4, 4.1, 2, 4.9)
        ..cubicTo(0.6, 4.1, 0.6, 2.4, 2, 0)
        ..close(),
      Paint()
        ..color = const Color(0xFF5BA8DC)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 0.4,
    );

    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _ZzzText extends StatelessWidget {
  const _ZzzText({required this.sx, required this.sy, required this.animate});
  final double sx, sy;
  final bool animate;

  @override
  Widget build(BuildContext context) {
    return Stack(children: [
      Positioned(
        left: 46 * sx,
        top: 22 * sy,
        child: Text(
          'Z',
          style: TextStyle(
            fontSize: 10 * sx,
            fontWeight: FontWeight.bold,
            color: const Color(0xFFB0AFAF),
          ),
        ),
      ),
      Positioned(
        left: 52 * sx,
        top: 15 * sy,
        child: Text(
          'z',
          style: TextStyle(
            fontSize: 7 * sx,
            fontWeight: FontWeight.bold,
            color: const Color(0xFFC8C7C7),
          ),
        ),
      ),
      Positioned(
        left: 56 * sx,
        top: 10 * sy,
        child: Text(
          'z',
          style: TextStyle(
            fontSize: 5 * sx,
            fontWeight: FontWeight.bold,
            color: const Color(0xFFDEDDDD),
          ),
        ),
      ),
    ]);
  }
}

class _ExclamationMark extends StatelessWidget {
  const _ExclamationMark({required this.sx, required this.sy});
  final double sx, sy;

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: 46 * sx,
      top: 18 * sy,
      child: Text(
        '!',
        style: TextStyle(
          fontSize: 16 * sx,
          fontWeight: FontWeight.w900,
          color: const Color(0xFF7C3AED),
        ),
      ),
    );
  }
}

class _Crown extends StatelessWidget {
  const _Crown({required this.sx, required this.sy});
  final double sx, sy;

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: 14 * sx,
      top: 2 * sy,
      child: CustomPaint(
        size: Size(36 * sx, 16 * sy),
        painter: _CrownPainter(),
      ),
    );
  }
}

class _CrownPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final sx = size.width / 36;
    final sy = size.height / 16;
    canvas
      ..save()
      ..scale(sx, sy);

    // Crown body
    canvas.drawPath(
      Path()
        ..moveTo(0, 10)
        ..lineTo(5, 0)
        ..lineTo(10, 8)
        ..lineTo(14, 2)
        ..lineTo(18, 6)
        ..lineTo(22, 0)
        ..lineTo(26, 8)
        ..lineTo(31, 2)
        ..lineTo(36, 10)
        ..close(),
      Paint()..color = const Color(0xFFFFD700),
    );

    // Band
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        const Rect.fromLTWH(0, 10, 36, 4),
        const Radius.circular(1.5),
      ),
      Paint()..color = const Color(0xFFDAA520),
    );

    // Gems
    canvas
      ..drawCircle(const Offset(7, 7), 2, Paint()..color = const Color(0xFFE11D48))
      ..drawCircle(const Offset(18, 5), 2.2, Paint()..color = const Color(0xFF3B82F6))
      ..drawCircle(const Offset(29, 7), 2, Paint()..color = const Color(0xFF10B981));

    // Crown tip shine
    canvas.drawOval(
      const Rect.fromLTWH(14, 3, 8, 3),
      Paint()..color = const Color(0x59FFFFFF),
    );

    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _ReadingGlasses extends StatelessWidget {
  const _ReadingGlasses({required this.sx, required this.sy});
  final double sx, sy;

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: 17 * sx,
      top: 38 * sy,
      child: CustomPaint(
        size: Size(30 * sx, 8 * sy),
        painter: _ReadingGlassesPainter(),
      ),
    );
  }
}

class _ReadingGlassesPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final sx = size.width / 30;
    final sy = size.height / 8;
    canvas
      ..save()
      ..scale(sx, sy);

    final framePaint = Paint()
      ..color = const Color(0xFF1a1a2e)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.8;

    // Left lens
    canvas.drawOval(
      const Rect.fromLTWH(1, 0, 11, 8),
      framePaint,
    );
    // Right lens
    canvas.drawOval(
      const Rect.fromLTWH(18, 0, 11, 8),
      framePaint,
    );
    // Bridge
    canvas.drawLine(const Offset(12, 3.5), const Offset(18, 3.5), framePaint);
    // Arms
    canvas.drawLine(const Offset(1, 3), const Offset(-2, 2), framePaint);
    canvas.drawLine(const Offset(29, 3), const Offset(32, 2), framePaint);
    // Shine
    canvas.drawOval(
      const Rect.fromLTWH(3, 1.5, 2.5, 1.5),
      Paint()..color = const Color(0x33FFFFFF),
    );
    canvas.drawOval(
      const Rect.fromLTWH(20, 1.5, 2.5, 1.5),
      Paint()..color = const Color(0x26FFFFFF),
    );

    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// ─── Confetti ──────────────────────────────────────────────────────────────

class ConfettiWidget extends StatelessWidget {
  const ConfettiWidget({
    required this.controller,
    required this.sx,
    required this.sy,
  });

  final AnimationController controller;
  final double sx, sy;

  static const _confettiData = [
    (x: 8.0, y: 26.0, color: Color(0xFFEC4899), w: 3.0, h: 3.0, rx: 0.5),
    (x: 54.0, y: 22.0, color: Color(0xFF60A5FA), w: 3.0, h: 3.0, rx: 0.5),
    (x: 14.0, y: 14.0, color: Color(0xFFFBBF24), w: 3.2, h: 3.2, rx: 1.6),
    (x: 50.0, y: 10.0, color: Color(0xFF34D399), w: 3.2, h: 3.2, rx: 1.6),
    (x: 6.0, y: 40.0, color: Color(0xFFFBBF24), w: 3.0, h: 3.0, rx: 0.5),
    (x: 55.0, y: 44.0, color: Color(0xFFF472B6), w: 3.0, h: 3.0, rx: 0.5),
  ];

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: controller,
      builder: (_, _2) {
        return Stack(
          children: _confettiData.map((c) {
            final progress = controller.value;
            final fallDistance = progress * 60 * sy;
            final opacity = (1 - progress).clamp(0.0, 1.0);
            final rotation = progress * 360 * (c.x > 32 ? -1 : 1);

            return Positioned(
              left: c.x * sx,
              top: c.y * sy + fallDistance,
              child: Transform.rotate(
                angle: rotation * math.pi / 180,
                child: Opacity(
                  opacity: opacity,
                  child: Container(
                    width: c.w * sx,
                    height: c.h * sy,
                    decoration: BoxDecoration(
                      color: c.color,
                      borderRadius: BorderRadius.circular(c.rx),
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        );
      },
    );
  }
}

double? lerpDouble(num? a, num? b, double t) {
  if (a == null || b == null) return null;
  return a + (b - a) * t;
}
