import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

enum MascotType {
  celebrating,
  focused,
  encouraging,
  happy,
  thinking,
  excited,
  proud,
  cool,
  confident,
  sad,
  sleeping,
  surprised,
  defaultMascot;

  String get assetPath {
    if (this == MascotType.defaultMascot) return 'assets/nakhlah_web/mascot.svg';
    return 'assets/$name.svg';
  }
}

/// Nakhlah water-drop mascot rendered from the web SVG asset.
///
/// Animates with the same floating keyframes as the web CSS:
///   0%, 100%  → translateY(0)   rotate(-3deg)
///   50%       → translateY(-12) rotate(3deg)
/// Duration: 3 s, ease-in-out, infinite.
class NakhlahMascot extends StatefulWidget {
  const NakhlahMascot({
    super.key,
    this.size = 128,
    this.animate = true,
    this.mascotType = MascotType.defaultMascot,
  });

  /// Width & height of the mascot (square).
  final double size;

  /// Whether the float animation plays.
  final bool animate;

  /// Which mascot SVG to show.
  final MascotType mascotType;

  @override
  State<NakhlahMascot> createState() => _NakhlahMascotState();
}

class _NakhlahMascotState extends State<NakhlahMascot>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _translateY;
  late final Animation<double> _rotate;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 3000),
    );

    // TranslateY: 0 → -12 → 0  (ease-in-out)
    _translateY = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween<double>(begin: 0, end: -12)
            .chain(CurveTween(curve: Curves.easeInOut)),
        weight: 50,
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: -12, end: 0)
            .chain(CurveTween(curve: Curves.easeInOut)),
        weight: 50,
      ),
    ]).animate(_controller);

    // Rotate: -3deg → 3deg → -3deg  (ease-in-out)
    _rotate = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween<double>(begin: -3, end: 3)
            .chain(CurveTween(curve: Curves.easeInOut)),
        weight: 50,
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: 3, end: -3)
            .chain(CurveTween(curve: Curves.easeInOut)),
        weight: 50,
      ),
    ]).animate(_controller);

    if (widget.animate) {
      _controller.repeat();
    }
  }

  @override
  void didUpdateWidget(covariant NakhlahMascot oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.animate && !_controller.isAnimating) {
      _controller.repeat();
    } else if (!widget.animate && _controller.isAnimating) {
      _controller.stop();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final mascot = SvgPicture.asset(
      widget.mascotType.assetPath,
      width: widget.size,
      height: widget.size * 1.3, // viewBox is 80×104 → aspect ≈ 1.3
      fit: BoxFit.contain,
    );

    if (!widget.animate) return mascot;

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final deg = _rotate.value;
        final rad = deg * math.pi / 180;
        return Transform.translate(
          offset: Offset(0, _translateY.value),
          child: Transform.rotate(angle: rad, child: child),
        );
      },
      child: mascot,
    );
  }
}
