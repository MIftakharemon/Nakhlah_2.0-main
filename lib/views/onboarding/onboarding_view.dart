import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../common/nakhlah_mascot.dart';
import '../../routes/app_routes.dart';
import '../../services/storage_service.dart';

// ─── Entry point ────────────────────────────────────────────────────────────

class OnboardingView extends StatefulWidget {
  const OnboardingView({super.key});

  @override
  State<OnboardingView> createState() => _OnboardingViewState();
}

class _OnboardingViewState extends State<OnboardingView> {
  final _ctrl = PageController();
  int _page = 0;
  String _selectedLang = 'English';

  static const _langs = [
    _Lang('🇺🇸', 'English'),
    _Lang('🇨🇳', 'Mandarin'),
    _Lang('🇪🇸', 'Spanish'),
    _Lang('🇮🇳', 'Hindi'),
    _Lang('🇫🇷', 'French'),
  ];

  Future<void> _finish(String route) async {
    await Get.find<StorageService>().setOnboarded(true);
    Get.offAllNamed(route);
  }

  void _next() {
    if (_page == 0) {
      _ctrl.nextPage(
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeOutCubic,
      );
    } else {
      _finish(Routes.signup);
    }
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F7F4),
      body: PageView(
        controller: _ctrl,
        physics: const NeverScrollableScrollPhysics(),
        onPageChanged: (v) => setState(() => _page = v),
        children: [
          // ── Page 0: Landing ──────────────────────────────────────────
          _LandingPage(
            onGetStarted: _next,
            onLogin: () => _finish(Routes.login),
          ),
          // ── Page 1: Language selection ───────────────────────────────
          _LanguageSelectionPage(
            langs: _langs,
            selected: _selectedLang,
            onBack: () => _ctrl.previousPage(
              duration: const Duration(milliseconds: 350),
              curve: Curves.easeOutCubic,
            ),
            onChanged: (v) => setState(() => _selectedLang = v),
            onContinue: _next,
          ),
        ],
      ),
    );
  }
}

// ─── Data ────────────────────────────────────────────────────────────────────

class _Lang {
  const _Lang(this.flag, this.name);
  final String flag;
  final String name;
}

// ─── Colors ──────────────────────────────────────────────────────────────────

const _purple = Color(0xFF6C4FE0);
const _purpleLight = Color(0xFFEDE8FF);
const _purpleBorder = Color(0xFF7B5CE5);
const _textDark = Color(0xFF1A1A2E);
const _textGrey = Color(0xFF9E9EB0);

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 0 — Landing  (matches Image 1)
// ═══════════════════════════════════════════════════════════════════════════════

class _LandingPage extends StatelessWidget {
  const _LandingPage({required this.onGetStarted, required this.onLogin});

  final VoidCallback onGetStarted;
  final VoidCallback onLogin;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          children: [
            const Spacer(flex: 2),

            // ── Speech bubble ────────────────────────────────────────
            Align(
              alignment: Alignment.center,
              child: _SpeechBubble(text: "Hi there! I'm Fatima!"),
            ),
            const SizedBox(height: 12),

            // ── Mascot — matches web SVG ─────────────────────────
            const NakhlahMascot(size: 220, mascotType: MascotType.celebrating),

            const Spacer(flex: 2),

            // ── App name ─────────────────────────────────────────────
            Text(
              'Nakhlah',
              style: TextStyle(
                fontSize: 48,
                fontWeight: FontWeight.w900,
                color: _purple,
                letterSpacing: -1,
              ),
            ),
            const SizedBox(height: 12),

            // ── Tagline ──────────────────────────────────────────────
            const Text(
              "Learn Arabic whenever and wherever\nyou want. It's free and forever.",
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 17,
                color: _textGrey,
                fontWeight: FontWeight.w500,
                height: 1.5,
              ),
            ),

            const Spacer(flex: 3),

            // ── Buttons ──────────────────────────────────────────────
            _BigButton(label: 'GET STARTED', filled: true, onTap: onGetStarted),
            const SizedBox(height: 14),
            _BigButton(
              label: 'I ALREADY HAVE AN ACCOUNT',
              filled: false,
              onTap: onLogin,
            ),
            const SizedBox(height: 32),
          ],
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
              color: _textDark,
            ),
          ),
        ),
        // Tail
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
            foregroundColor: _purple,
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
          backgroundColor: _purple,
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

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 1 — Language Selection  (matches Image 2)
// ═══════════════════════════════════════════════════════════════════════════════

class _LanguageSelectionPage extends StatelessWidget {
  const _LanguageSelectionPage({
    required this.langs,
    required this.selected,
    required this.onBack,
    required this.onChanged,
    required this.onContinue,
  });

  final List<_Lang> langs;
  final String selected;
  final VoidCallback onBack;
  final ValueChanged<String> onChanged;
  final VoidCallback onContinue;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(
        children: [
          // ── Top bar ──────────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(8, 6, 16, 0),
            child: Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.arrow_back, color: _textDark),
                  onPressed: onBack,
                ),
                const SizedBox(width: 4),
                // Progress bar (2 segments, first filled)
                Expanded(child: _ProgressBar(filled: 1, total: 3)),
              ],
            ),
          ),

          // ── Mascot + bubble ──────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                const NakhlahMascot(size: 72, animate: false),
                const SizedBox(width: 12),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 18,
                    vertical: 14,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(20),
                      topRight: Radius.circular(20),
                      bottomRight: Radius.circular(20),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: .08),
                        blurRadius: 14,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: const Text(
                    'What would you\nlike to learn?',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: _textDark,
                      height: 1.4,
                    ),
                  ),
                ),
              ],
            ),
          ),

          const Divider(height: 1, color: Color(0xFFEEEEEE)),

          // ── Language list ────────────────────────────────────────────
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              itemCount: langs.length,
              separatorBuilder: (context, index) => const SizedBox(height: 10),
              itemBuilder: (context, i) {
                final lang = langs[i];
                final isSelected = lang.name == selected;
                return _LangTile(
                  lang: lang,
                  selected: isSelected,
                  onTap: () => onChanged(lang.name),
                );
              },
            ),
          ),

          // ── Continue button ──────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
            child: _BigButton(
              label: 'Continue',
              filled: true,
              onTap: onContinue,
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Progress bar ────────────────────────────────────────────────────────────

class _ProgressBar extends StatelessWidget {
  const _ProgressBar({required this.filled, required this.total});
  final int filled;
  final int total;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(total, (i) {
        return Expanded(
          child: Container(
            margin: EdgeInsets.only(right: i < total - 1 ? 6 : 0),
            height: 7,
            decoration: BoxDecoration(
              color: i < filled ? _purple : const Color(0xFFE2E2E2),
              borderRadius: BorderRadius.circular(99),
            ),
          ),
        );
      }),
    );
  }
}

// ─── Language tile ───────────────────────────────────────────────────────────

class _LangTile extends StatelessWidget {
  const _LangTile({
    required this.lang,
    required this.selected,
    required this.onTap,
  });

  final _Lang lang;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: selected ? _purpleLight : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: selected ? _purpleBorder : const Color(0xFFEEEEEE),
            width: selected ? 2 : 1.2,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: selected ? .06 : .03),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            Text(lang.flag, style: const TextStyle(fontSize: 28)),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                lang.name,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: _textDark,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
