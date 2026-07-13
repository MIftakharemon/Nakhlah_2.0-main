import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../common/app_motion.dart';
import '../../common/nakhlah_mascot.dart';
import '../../constants/app_colors.dart';
import '../../routes/app_routes.dart';
import '../../services/storage_service.dart';

class GetStartedView extends StatelessWidget {
  const GetStartedView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F7F4),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 430),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: SingleChildScrollView(
                child: Column(
                  children: [
                    const SizedBox(height: 40),

                    // Speech bubble
                    PageEnter(
                      delay: const Duration(milliseconds: 200),
                      child: _SpeechBubble(text: "Hi there! I'm Fatima!"),
                    ),
                    const SizedBox(height: 16),

                    // Mascot — matches web SVG
                    const PageEnter(
                      delay: Duration(milliseconds: 300),
                      child: NakhlahMascot(size: 220, mascotType: MascotType.celebrating),
                    ),

                    const SizedBox(height: 40),

                    // App name — "Nakhlah" text in purple (matches web)
                    PageEnter(
                      delay: const Duration(milliseconds: 400),
                      child: Text(
                        'Nakhlah',
                        style: TextStyle(
                          fontSize: 48,
                          fontWeight: FontWeight.w900,
                          color: AppColors.accent,
                          letterSpacing: -1,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Tagline
                    const PageEnter(
                      delay: Duration(milliseconds: 500),
                      child: Text(
                        "Learn Arabic whenever and wherever\nyou want. It's free and forever.",
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 17,
                          color: AppColors.textSecondary,
                          fontWeight: FontWeight.w500,
                          height: 1.5,
                        ),
                      ),
                    ),

                    const SizedBox(height: 40),

                    // GET STARTED button
                    PageEnter(
                      delay: const Duration(milliseconds: 600),
                      child: _BigButton(
                        label: 'GET STARTED',
                        filled: true,
                        onTap: () async {
                          await Get.find<StorageService>().setOnboarded(true);
                          Get.offAllNamed(Routes.onboardingForm);
                        },
                      ),
                    ),
                    const SizedBox(height: 14),

                    // I ALREADY HAVE AN ACCOUNT
                    PageEnter(
                      delay: const Duration(milliseconds: 700),
                      child: _BigButton(
                        label: 'I ALREADY HAVE AN ACCOUNT',
                        filled: false,
                        onTap: () => Get.offAllNamed(Routes.login),
                      ),
                    ),
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ─── Speech bubble ───────────────────────────────────────────────────────────

class _SpeechBubble extends StatelessWidget {
  const _SpeechBubble({required this.text});
  final String text;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: .08),
                blurRadius: 20,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Text(
            text,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: AppColors.ink,
            ),
          ),
        ),
        CustomPaint(size: const Size(18, 10), painter: _BubbleTailPainter()),
      ],
    );
  }
}

class _BubbleTailPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = Colors.white;
    final path = Path()
      ..moveTo(0, 0)
      ..lineTo(size.width / 2, size.height)
      ..lineTo(size.width, 0)
      ..close();
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter _) => false;
}

// ─── Big button ──────────────────────────────────────────────────────────────

class _BigButton extends StatelessWidget {
  const _BigButton({
    required this.label,
    required this.filled,
    required this.onTap,
  });

  final String label;
  final bool filled;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    if (!filled) {
      // Text-only button (matches web "I ALREADY HAVE AN ACCOUNT")
      return SizedBox(
        width: double.infinity,
        height: 54,
        child: TextButton(
          onPressed: onTap,
          style: TextButton.styleFrom(
            foregroundColor: AppColors.accent,
          ),
          child: Text(
            label,
            style: const TextStyle(
              fontWeight: FontWeight.w900,
              fontSize: 13.5,
              letterSpacing: .4,
            ),
          ),
        ),
      );
    }
    return SizedBox(
      width: double.infinity,
      height: 54,
      child: ElevatedButton(
        onPressed: onTap,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.accent,
          foregroundColor: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(30),
          ),
        ),
        child: Text(
          label,
          style: const TextStyle(
            fontWeight: FontWeight.w900,
            fontSize: 15,
            letterSpacing: .6,
          ),
        ),
      ),
    );
  }
}
