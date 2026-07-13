import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../common/app_motion.dart';
import '../../common/nakhlah_intro_widgets.dart';
import '../../common/nakhlah_mascot.dart';
import '../../constants/app_colors.dart';
import '../../controllers/auth_controller.dart';
import '../../routes/app_routes.dart';

class ForgotPasswordView extends StatefulWidget {
  const ForgotPasswordView({super.key});

  @override
  State<ForgotPasswordView> createState() => _ForgotPasswordViewState();
}

class _ForgotPasswordViewState extends State<ForgotPasswordView> {
  final email = TextEditingController();
  bool _sent = false;

  @override
  void dispose() {
    email.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = Get.find<AuthController>();

    return IntroScaffold(
      showBack: true,
      child: SingleChildScrollView(
        padding: const EdgeInsets.only(top: 8, bottom: 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const NakhlahMascot(size: 140, mascotType: MascotType.sad),
            const SizedBox(height: 14),

            AnimatedSwitcher(
              duration: AppMotion.normal,
              child: _sent
                  ? _SuccessBlock(email: email.text)
                  : _FormBlock(
                      key: const ValueKey('form'),
                      email: email,
                      c: c,
                      onSent: () => setState(() => _sent = true),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  Form block
// ─────────────────────────────────────────────

class _FormBlock extends StatelessWidget {
  const _FormBlock({
    super.key,
    required this.email,
    required this.c,
    required this.onSent,
  });

  final TextEditingController email;
  final AuthController c;
  final VoidCallback onSent;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const IntroTitleBlock(
          title: 'Forgot\nPassword?',
          body:
              'No worries — enter your email and we\'ll send reset instructions right away.',
          titleSize: 34,
        ),
        const SizedBox(height: 28),
        PageEnter(
          delay: const Duration(milliseconds: 120),
          child: AuthPanel(
            children: [
              IntroTextField(
                controller: email,
                label: 'Email Address',
                icon: Icons.mail_outline_rounded,
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 20),
              Obx(
                () => IntroPrimaryButton(
                  label: 'Send Reset Link',
                  loading: c.loading.value,
                  icon: Icons.send_rounded,
                  onPressed: () async {
                    final sent = await c.forgotPassword(email.text.trim());
                    if (sent) {
                      Get.toNamed(Routes.otpVerification);
                    }
                  },
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────
//  Success state block
// ─────────────────────────────────────────────

class _SuccessBlock extends StatelessWidget {
  const _SuccessBlock({required this.email});
  final String email;

  @override
  Widget build(BuildContext context) {
    return PageEnter(
      key: const ValueKey('success'),
      child: Column(
        children: [
          // success icon
          Container(
            width: 90,
            height: 90,
            decoration: BoxDecoration(
              color: AppColors.accent.withValues(alpha: .10),
              shape: BoxShape.circle,
              border: Border.all(
                color: AppColors.accent.withValues(alpha: .18),
                width: 2,
              ),
            ),
            child: const Icon(
              Icons.mark_email_read_rounded,
              color: AppColors.accent,
              size: 44,
            ),
          ),
          const SizedBox(height: 22),
          Text(
            'Check Your Email',
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: AppColors.ink,
              fontSize: 28,
              fontWeight: FontWeight.w900,
              letterSpacing: -.8,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'We sent reset instructions to\n$email',
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: AppColors.muted,
              fontSize: 15,
              fontWeight: FontWeight.w600,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 28),
          // tip card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.accent.withValues(alpha: .05),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: AppColors.accent.withValues(alpha: .10)),
            ),
            child: const Row(
              children: [
                Icon(
                  Icons.info_outline_rounded,
                  color: AppColors.accent,
                  size: 20,
                ),
                SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Didn\'t receive it? Check spam or wait a few minutes before trying again.',
                    style: TextStyle(
                      color: AppColors.muted,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      height: 1.4,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          IntroPrimaryButton(
            label: 'Back to Sign In',
            icon: Icons.arrow_back_rounded,
            onPressed: Get.back,
          ),
        ],
      ),
    );
  }
}
