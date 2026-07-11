import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_sign_in/google_sign_in.dart';

import '../../common/app_snackbar.dart';
import '../../common/nakhlah_intro_widgets.dart';
import '../../constants/app_colors.dart';
import '../../common/app_motion.dart';
import '../../controllers/auth_controller.dart';
import '../../routes/app_routes.dart';
import 'dart:math' as math;

class LoginView extends StatefulWidget {
  const LoginView({super.key});

  @override
  State<LoginView> createState() => _LoginViewState();
}

class _LoginViewState extends State<LoginView> {
  final email = TextEditingController();
  final pass = TextEditingController();
  bool _obscure = true;
  bool _rememberMe = false;

  @override
  void dispose() {
    email.dispose();
    pass.dispose();
    super.dispose();
  }

  Future<void> _signInWithGoogle(AuthController c) async {
    try {
      final account = await GoogleSignIn(scopes: ['email', 'profile']).signIn();
      if (account == null) return;

      final auth = await account.authentication;
      await c.googleLogin(
        email: account.email,
        idToken: auth.idToken,
        accessToken: auth.accessToken,
        name: account.displayName,
        photoUrl: account.photoUrl,
      );
    } catch (e) {
      AppSnackbar.error('Google sign-in failed: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = Get.find<AuthController>();

    return IntroScaffold(
      showBack: true,
      showWordmark: false,
      child: SingleChildScrollView(
        padding: const EdgeInsets.only(top: 8, bottom: 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // ── logo ───────────────────────────────────
            const NakhlahWordmark(compact: false),
            const SizedBox(height: 20),

            // ── titles ─────────────────────────────────
            const IntroTitleBlock(
              title: 'Hello there \u{1F44B}',
              body:
                  'Welcome back! Please sign in to continue.',
              titleSize: 36,
            ),
            const SizedBox(height: 26),

            // ── form panel ─────────────────────────────
            PageEnter(
              delay: const Duration(milliseconds: 160),
              child: AuthPanel(
                children: [
                  IntroTextField(
                    controller: email,
                    label: 'Email Address',
                    icon: Icons.mail_outline_rounded,
                    keyboardType: TextInputType.emailAddress,
                  ),
                  const SizedBox(height: 14),
                  StatefulBuilder(
                    builder: (context, setSub) => IntroTextField(
                      controller: pass,
                      label: 'Password',
                      icon: Icons.lock_outline_rounded,
                      obscureText: true,
                      isObscured: _obscure,
                      onToggleObscure: () =>
                          setState(() => _obscure = !_obscure),
                    ),
                  ),
                  // Remember me + forgot password
                  Row(
                    children: [
                      SizedBox(
                        width: 24,
                        height: 24,
                        child: Checkbox(
                          value: _rememberMe,
                          onChanged: (v) =>
                              setState(() => _rememberMe = v ?? false),
                          activeColor: AppColors.accent,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(4),
                          ),
                          side: BorderSide(
                            color: AppColors.muted.withValues(alpha: .35),
                          ),
                          materialTapTargetSize:
                              MaterialTapTargetSize.shrinkWrap,
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'Remember me',
                        style: TextStyle(
                          color: AppColors.ink,
                          fontWeight: FontWeight.w600,
                          fontSize: 13,
                        ),
                      ),
                      const Spacer(),
                      TextButton(
                        onPressed: () => Get.toNamed(Routes.forgotPassword),
                        style: TextButton.styleFrom(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 4,
                            vertical: 2,
                          ),
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                        child: const Text(
                          'Forgot Password?',
                          style: TextStyle(
                            color: AppColors.accent,
                            fontWeight: FontWeight.w800,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Obx(
                    () => IntroPrimaryButton(
                      label: 'SIGN IN',
                      loading: c.loading.value,
                      onPressed: () => c.login(email.text.trim(), pass.text),
                    ),
                  ),
                  const SizedBox(height: 16),
                  // divider
                  Row(
                    children: [
                      Expanded(
                        child: Divider(
                          color: AppColors.muted.withValues(alpha: .20),
                        ),
                      ),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          child: Text(
                            'Or continue with',
                            style: TextStyle(
                            color: AppColors.muted.withValues(alpha: .60),
                            fontWeight: FontWeight.w700,
                            fontSize: 12,
                          ),
                        ),
                      ),
                      Expanded(
                        child: Divider(
                          color: AppColors.muted.withValues(alpha: .20),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Obx(
                    () => _SocialButton(
                      label: 'Continue with Google',
                      loading: c.loading.value,
                      onTap: c.loading.value
                          ? null
                          : () => _signInWithGoogle(c),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 22),

            // ── sign up link ───────────────────────────
            TextButton(
              onPressed: () => Get.offNamed(Routes.getStarted),
              child: const Text.rich(
                TextSpan(
                  text: 'Don\'t have an account? ',
                  style: TextStyle(
                    color: AppColors.muted,
                    fontWeight: FontWeight.w700,
                  ),
                  children: [
                    TextSpan(
                      text: 'Sign Up',
                      style: TextStyle(
                        color: AppColors.accent,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  Social button (Google etc.)
// ─────────────────────────────────────────────

class _SocialButton extends StatelessWidget {
  const _SocialButton({
    required this.label,
    required this.onTap,
    this.loading = false,
  });

  final String label;
  final VoidCallback? onTap;
  final bool loading;

  @override
  Widget build(BuildContext context) {
    return PressableScale(
      scale: .97,
      child: InkWell(
        onTap: loading ? null : onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          height: 52,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.muted.withValues(alpha: .22)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: .04),
                blurRadius: 6,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (loading)
                const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              else
                _GoogleIcon(size: 24),
              const SizedBox(width: 10),
              Text(
                label,
                style: const TextStyle(
                  color: AppColors.ink,
                  fontWeight: FontWeight.w800,
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  Google "G" icon (custom painted)
// ─────────────────────────────────────────────

class _GoogleIcon extends StatelessWidget {
  const _GoogleIcon({this.size = 24});
  final double size;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(painter: _GooglePainter()),
    );
  }
}

class _GooglePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2;
    final cy = size.height / 2;
    final r = size.width * 0.42;

    final bluePaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = size.width * 0.13
      ..strokeCap = StrokeCap.round
      ..color = const Color(0xFF4285F4);
    canvas.drawArc(
      Rect.fromCircle(center: Offset(cx, cy), radius: r),
      -math.pi / 2,
      math.pi / 2,
      false,
      bluePaint,
    );

    final greenPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = size.width * 0.13
      ..strokeCap = StrokeCap.round
      ..color = const Color(0xFF34A853);
    canvas.drawArc(
      Rect.fromCircle(center: Offset(cx, cy), radius: r),
      0,
      math.pi / 2,
      false,
      greenPaint,
    );

    final yellowPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = size.width * 0.13
      ..strokeCap = StrokeCap.round
      ..color = const Color(0xFFFBBC05);
    canvas.drawArc(
      Rect.fromCircle(center: Offset(cx, cy), radius: r),
      math.pi / 2,
      math.pi / 2,
      false,
      yellowPaint,
    );

    final redPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = size.width * 0.13
      ..strokeCap = StrokeCap.round
      ..color = const Color(0xFFEA4335);
    canvas.drawArc(
      Rect.fromCircle(center: Offset(cx, cy), radius: r),
      math.pi,
      math.pi / 2,
      false,
      redPaint,
    );

    final barPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = size.width * 0.13
      ..strokeCap = StrokeCap.round
      ..color = Colors.white;
    final barY = cy + r * 0.15;
    canvas.drawLine(
      Offset(cx - r * 0.7, barY),
      Offset(cx + r * 0.7, barY),
      barPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
