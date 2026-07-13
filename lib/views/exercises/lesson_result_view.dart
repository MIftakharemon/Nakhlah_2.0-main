import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';

import '../../common/nakhlah_mascot.dart';
import '../../constants/app_colors.dart';
import '../../constants/app_theme.dart';

class LessonResultData {
  const LessonResultData({
    this.lessonId = '',
    this.elapsedSeconds = 0,
    this.totalQuestions = 0,
    this.scoredQuestions = 0,
    this.correctAnswers = 0,
    this.injazEarned = 0,
    this.datesEarned = 0,
    this.palmTreesRemaining = 5,
    this.hasWrongAnswer = false,
  });

  final String lessonId;
  final int elapsedSeconds;
  final int totalQuestions;
  final int scoredQuestions;
  final int correctAnswers;
  final int injazEarned;
  final int datesEarned;
  final int palmTreesRemaining;
  final bool hasWrongAnswer;

  int get accuracyPercentage {
    if (scoredQuestions == 0) return 100;
    return ((correctAnswers / scoredQuestions) * 100).round().clamp(0, 100);
  }

  String get formattedTime {
    final minutes = (elapsedSeconds ~/ 60).toString().padLeft(2, '0');
    final seconds = (elapsedSeconds % 60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  bool get isPerfect => !hasWrongAnswer && scoredQuestions > 0;
}

class LessonResultView extends StatelessWidget {
  const LessonResultView({super.key});

  @override
  Widget build(BuildContext context) {
    final data = Get.arguments is LessonResultData
        ? Get.arguments as LessonResultData
        : const LessonResultData();

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const Spacer(),
              _buildMascot(),
              const SizedBox(height: 18),
              Text(
                data.isPerfect ? 'Perfect!' : 'Lesson completed!',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: data.isPerfect ? AppColors.success : AppColors.accent,
                  fontSize: 32,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 22),
              _buildInjazBanner(data),
              const SizedBox(height: 18),
              _buildStatsRow(data),
              const Spacer(),
              _buildContinueButton(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMascot() {
    return const NakhlahMascot(size: 108, animate: false);
  }

  Widget _buildInjazBanner(LessonResultData data) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFFFFEDD5),
        borderRadius: BorderRadius.circular(AppTheme.cardRadius),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text(
            'Injaz Earned',
            style: TextStyle(
              color: Color(0xFF9A3412),
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(width: 12),
          Text(
            '${data.injazEarned}',
            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900),
          ),
          const SizedBox(width: 4),
          const Text('⭐', style: TextStyle(fontSize: 20)),
        ],
      ),
    );
  }

  Widget _buildStatsRow(LessonResultData data) {
    return Row(
      children: [
        Expanded(
          child: _StatBox(
            label: 'Dates Earned',
            value: '${data.datesEarned}',
            icon: SvgPicture.asset(
              'assets/nakhlah_web/icons/dates.svg',
              width: 36,
              height: 36,
            ),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _StatBox(
            label: 'Time',
            value: data.formattedTime,
            icon: SvgPicture.asset(
              'assets/nakhlah_web/icons/noto_stopwatch.svg',
              width: 36,
              height: 36,
            ),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _StatBox(
            label: 'Accuracy',
            value: '${data.accuracyPercentage}%',
            icon: SvgPicture.asset(
              'assets/nakhlah_web/icons/bullseye.svg',
              width: 36,
              height: 36,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildContinueButton() {
    return SizedBox(
      height: AppTheme.buttonHeight,
      width: double.infinity,
      child: ElevatedButton(
        onPressed: () {
          Get.until((route) => route.isFirst);
        },
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: AppColors.accent,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppTheme.buttonRadius),
          ),
        ),
        child: const Text(
          'CONTINUE',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
        ),
      ),
    );
  }
}

class _StatBox extends StatelessWidget {
  const _StatBox({
    required this.label,
    required this.value,
    required this.icon,
  });

  final String label;
  final String value;
  final Widget icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 10),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(AppTheme.cardRadius),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          SizedBox(width: 40, height: 40, child: icon),
          const SizedBox(height: 8),
          Text(
            label,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 14,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: AppColors.textPrimary,
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}
