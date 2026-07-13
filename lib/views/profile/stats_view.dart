import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';

import '../../constants/app_colors.dart';
import '../../common/loading_state.dart';
import '../../common/responsive.dart';
import '../../controllers/gamification_controller.dart';
import '../../controllers/profile_controller.dart';

class StatsView extends StatefulWidget {
  const StatsView({super.key});

  @override
  State<StatsView> createState() => _StatsViewState();
}

class _StatsViewState extends State<StatsView> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      Get.find<ProfileController>().load();
      Get.find<GamificationController>().load();
    });
  }

  @override
  Widget build(BuildContext context) {
    final p = Get.find<ProfileController>();
    final g = Get.find<GamificationController>();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        leading: IconButton(
          onPressed: () => Get.back(),
          icon: const Icon(
            Icons.arrow_back_ios,
            color: AppColors.ink,
            size: 20,
          ),
        ),
        title: const Text(
          'Statistics',
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: AppColors.ink,
          ),
        ),
        centerTitle: false,
      ),
      body: PageShell(
        child: Obx(() {
          if (p.loading.value && p.profile.value == null) {
            return const LoadingState();
          }

          final stats = [
            _StatsCardData(
              icon: const Icon(Icons.local_fire_department, color: Color(0xFFEF4444), size: 20),
              value: '${g.streak.value.computedStreak}',
              label: 'Current Streak',
              subtitle: 'days in a row',
              color: const Color(0xFFEF4444),
              bgColor: const Color(0xFFFEE2E2),
            ),
            _StatsCardData(
              icon: const Icon(Icons.bolt, color: Color(0xFFF59E0B), size: 20),
              value: '${p.stock.value.injazStock}',
              label: 'Total XP',
              subtitle: 'experience points',
              color: const Color(0xFFF59E0B),
              bgColor: const Color(0xFFFFF7ED),
            ),
            _StatsCardData(
              icon: const Icon(Icons.menu_book, color: Color(0xFF10B981), size: 20),
              value: '${p.progress.value.lessonOrder}',
              label: 'Lessons Completed',
              subtitle: 'lessons finished',
              color: const Color(0xFF10B981),
              bgColor: const Color(0xFFDCFCE7),
            ),
            _StatsCardData(
              icon: SvgPicture.asset(
                'assets/nakhlah_design/Palm_Trees.svg',
                width: 20,
                height: 20,
              ),
              value: '${p.stock.value.palmStock}',
              label: 'Palm Trees',
              subtitle: 'lives remaining',
              color: AppColors.accent,
              bgColor: const Color(0xFFEDE9FE),
            ),
            _StatsCardData(
              icon: const Icon(Icons.circle, color: Color(0xFFF59E0B), size: 20),
              value: '${p.stock.value.dateStock}',
              label: 'Dates',
              subtitle: 'currency earned',
              color: const Color(0xFFF59E0B),
              bgColor: const Color(0xFFFFF7ED),
            ),
            _StatsCardData(
              icon: const Icon(Icons.emoji_events, color: Color(0xFF7C3AED), size: 20),
              value: '${g.achievements.where((a) => a.achieved).length}',
              label: 'Achievements',
              subtitle: 'badges unlocked',
              color: const Color(0xFF7C3AED),
              bgColor: const Color(0xFFEDE9FE),
            ),
            _StatsCardData(
              icon: const Icon(Icons.assignment_turned_in, color: Color(0xFF3B82F6), size: 20),
              value: '${p.progress.value.taskOrder}',
              label: 'Tasks Completed',
              subtitle: 'tasks finished',
              color: const Color(0xFF3B82F6),
              bgColor: const Color(0xFFDBEAFE),
            ),
            _StatsCardData(
              icon: const Icon(Icons.star, color: Color(0xFFEC4899), size: 20),
              value: '${p.progress.value.levelOrder}',
              label: 'Current Level',
              subtitle: 'level reached',
              color: const Color(0xFFEC4899),
              bgColor: const Color(0xFFFCE7F3),
            ),
          ];

          return ListView(
            padding: EdgeInsets.zero,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      AppColors.accent,
                      AppColors.accent.withValues(alpha: 0.85),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Column(
                  children: [
                    const Text(
                      'Your Learning Journey',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Keep going! Every lesson brings you closer to fluency.',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.white.withValues(alpha: 0.85),
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _buildSummaryItem(
                          '${g.streak.value.computedStreak}',
                          'Streak',
                        ),
                        Container(
                          width: 1,
                          height: 40,
                          color: Colors.white.withValues(alpha: 0.3),
                        ),
                        _buildSummaryItem(
                          '${p.stock.value.injazStock}',
                          'XP',
                        ),
                        Container(
                          width: 1,
                          height: 40,
                          color: Colors.white.withValues(alpha: 0.3),
                        ),
                        _buildSummaryItem(
                          '${p.progress.value.lessonOrder}',
                          'Lessons',
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                'Detailed Statistics',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.ink,
                ),
              ),
              const SizedBox(height: 16),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.3,
                ),
                itemCount: stats.length,
                itemBuilder: (context, index) {
                  final stat = stats[index];
                  return Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: stat.bgColor,
                            shape: BoxShape.circle,
                          ),
                          child: SizedBox(width: 20, height: 20, child: stat.icon),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          stat.value,
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: AppColors.ink,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          stat.label,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: Colors.grey.shade600,
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
              const SizedBox(height: 32),
            ],
          );
        }),
      ),
    );
  }

  Widget _buildSummaryItem(String value, String label) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 13,
            color: Colors.white.withValues(alpha: 0.8),
          ),
        ),
      ],
    );
  }
}

class _StatsCardData {
  final Widget icon;
  final String value;
  final String label;
  final String subtitle;
  final Color color;
  final Color bgColor;

  const _StatsCardData({
    required this.icon,
    required this.value,
    required this.label,
    required this.subtitle,
    required this.color,
    required this.bgColor,
  });
}
