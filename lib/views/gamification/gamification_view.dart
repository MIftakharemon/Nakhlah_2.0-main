import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../common/app_motion.dart';
import '../../common/nakhlah_mascot.dart';
import '../../constants/app_colors.dart';
import '../../controllers/gamification_controller.dart';
import '../../constants/dark_mode_colors.dart';
import '../../routes/app_routes.dart';

class GamificationView extends StatefulWidget {
  const GamificationView({super.key});

  @override
  State<GamificationView> createState() => _GamificationViewState();
}

void _showStoreFeatureSheet(BuildContext context, _StoreFeature feature) {
  showModalBottomSheet<void>(
    context: context,
    backgroundColor: Colors.transparent,
    builder: (context) {
      final dc = DarkModeColors.of(context);
      return SafeArea(
        child: Container(
          margin: const EdgeInsets.all(16),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: dc.cardBackground,
            borderRadius: BorderRadius.circular(24),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 52,
                    height: 52,
                    decoration: BoxDecoration(
                      color: feature.iconBgColor,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Icon(
                      feature.icon,
                      color: feature.iconColor,
                      size: 26,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Text(
                      feature.title,
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: dc.textPrimary,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                feature.subtitle,
                style: TextStyle(
                  fontSize: 14,
                  height: 1.5,
                  color: dc.textSecondary,
                ),
              ),
              const SizedBox(height: 20),
              Container(
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    begin: Alignment.centerLeft,
                    end: Alignment.centerRight,
                    colors: [AppColors.premiumGradientStart, AppColors.premiumGradientEnd],
                  ),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => Navigator.of(context).pop(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      foregroundColor: Colors.white,
                      minimumSize: const Size.fromHeight(52),
                      shadowColor: Colors.transparent,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      elevation: 0,
                    ),
                    child: const Text(
                      'Got it',
                      style: TextStyle(fontWeight: FontWeight.w700),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    },
  );
}

class _GamificationViewState extends State<GamificationView> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) Get.find<GamificationController>().load();
    });
  }

  @override
  Widget build(BuildContext context) {
    final dc = DarkModeColors.of(context);
    return Scaffold(
      backgroundColor: dc.cardBackgroundAlt,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          children: [
            const SizedBox(height: 16),
            const PageEnter(child: _StoreHeader()),
            const SizedBox(height: 20),
            const PageEnter(
              delay: Duration(milliseconds: 100),
              child: _PremiumBanner(),
            ),
            const SizedBox(height: 24),
            PageEnter(
              delay: const Duration(milliseconds: 200),
              child: StaggeredList(
                gap: 12,
                children: _features
                    .map((f) => _FeatureCard(feature: f))
                    .toList(),
              ),
            ),
            const SizedBox(height: 12),
            const PageEnter(
              delay: Duration(milliseconds: 400),
              child: _BuyDatesCard(),
            ),
            const SizedBox(height: 24),
            const PageEnter(
              delay: Duration(milliseconds: 500),
              child: _GoPremiumButton(),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

class _StoreHeader extends StatelessWidget {
  const _StoreHeader();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(
          'Store',
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.bold,
            color: AppColors.ink,
          ),
        ),
        const SizedBox(width: 8),
        const Text('👑', style: TextStyle(fontSize: 24)),
      ],
    );
  }
}

class _PremiumBanner extends StatelessWidget {
  const _PremiumBanner();

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => Get.toNamed(Routes.premium),
        borderRadius: BorderRadius.circular(24),
        child: Ink(
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
              colors: [AppColors.premiumGradientStart, AppColors.premiumGradientEnd],
            ),
            borderRadius: BorderRadius.circular(24),
          ),
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const NakhlahMascot(size: 92, animate: false),
              const SizedBox(height: 16),
              const Text(
                'Get a better & super fast learning up to 5x',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  height: 1.3,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Unlock all premium channels and accelerate your learning journey with exclusive content',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.white70,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 14),
              const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Tap to view Premium',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                  SizedBox(width: 4),
                  Icon(Icons.arrow_forward, color: Colors.white, size: 16),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _BuyDatesCard extends StatelessWidget {
  const _BuyDatesCard();

  @override
  Widget build(BuildContext context) {
    return PressableScale(
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => Get.toNamed(Routes.purchaseDates),
          borderRadius: BorderRadius.circular(20),
          child: Ink(
            decoration: BoxDecoration(
              color: const Color(0xFFF3E8FF),
              borderRadius: BorderRadius.circular(20),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
            child: Row(
              children: [
                const Text('💎', style: TextStyle(fontSize: 28)),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Want to buy more dates?',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppColors.ink,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Get dates to unlock lessons and boost your progress',
                        style: TextStyle(
                          fontSize: 13,
                          color: AppColors.muted,
                          height: 1.4,
                        ),
                      ),
                    ],
                  ),
                ),
                const Icon(Icons.chevron_right, color: Color(0xFF7C3AED)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _GoPremiumButton extends StatelessWidget {
  const _GoPremiumButton();

  @override
  Widget build(BuildContext context) {
    return PressableScale(
      child: Container(
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.centerLeft,
            end: Alignment.centerRight,
            colors: [AppColors.premiumGradientStart, AppColors.premiumGradientEnd],
          ),
          borderRadius: BorderRadius.circular(16),
        ),
        child: ElevatedButton(
          onPressed: () => Get.toNamed(Routes.premium),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.transparent,
            foregroundColor: Colors.white,
            shadowColor: Colors.transparent,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            elevation: 0,
          ),
          child: const Text(
            'Go Premium Now',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
          ),
        ),
      ),
    );
  }
}

class _StoreFeature {
  final IconData icon;
  final Color iconBgColor;
  final Color iconColor;
  final String title;
  final String subtitle;

  const _StoreFeature({
    required this.icon,
    required this.iconBgColor,
    required this.iconColor,
    required this.title,
    required this.subtitle,
  });
}

const _features = [
  _StoreFeature(
    icon: Icons.menu_book_outlined,
    iconBgColor: Color(0xFFEEF2FF),
    iconColor: Color(0xFF6366F1),
    title: 'Unlimited Dates',
    subtitle: 'Get unlimited dates to unlock premium content',
  ),
  _StoreFeature(
    icon: Icons.calendar_today_outlined,
    iconBgColor: Color(0xFFFFF7ED),
    iconColor: Color(0xFFF97316),
    title: 'Lessons Reminder',
    subtitle: 'Get daily lesson reminders to keep on track of learning',
  ),
  _StoreFeature(
    icon: Icons.calendar_month_outlined,
    iconBgColor: Color(0xFFF0FDF4),
    iconColor: Color(0xFF22C55E),
    title: 'Learning Calendar',
    subtitle: 'Visualizing your streak, practicing and activities in calendar',
  ),
  _StoreFeature(
    icon: Icons.bolt_outlined,
    iconBgColor: Color(0xFFFEFCE8),
    iconColor: Color(0xFFEAB308),
    title: 'Boost Your Injaz',
    subtitle: 'Unlock more Injaz from every single lesson finished',
  ),
  _StoreFeature(
    icon: Icons.book_outlined,
    iconBgColor: Color(0xFFF3E8FF),
    iconColor: Color(0xFFA855F7),
    title: 'Learning E-Book',
    subtitle: 'Unlock all e-books to boost your learning experience',
  ),
  _StoreFeature(
    icon: Icons.trending_up_outlined,
    iconBgColor: Color(0xFFFDF2F8),
    iconColor: Color(0xFFEC4899),
    title: 'Learn Better',
    subtitle: 'Get learning progress to improve your learning',
  ),
  _StoreFeature(
    icon: Icons.access_time_outlined,
    iconBgColor: Color(0xFFEEF2FF),
    iconColor: Color(0xFF6366F1),
    title: 'No Waiting Time',
    subtitle: 'Get your quiz result without any waiting time',
  ),
  _StoreFeature(
    icon: Icons.local_fire_department_outlined,
    iconBgColor: Color(0xFFFFF1F2),
    iconColor: Color(0xFFEF4444),
    title: 'Free and No ads',
    subtitle: 'Enjoy learning with no interruptions from ads',
  ),
];

class _FeatureCard extends StatelessWidget {
  final _StoreFeature feature;

  const _FeatureCard({required this.feature});

  @override
  Widget build(BuildContext context) {
    final dc = DarkModeColors.of(context);
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {
          if (feature.title == 'Unlimited Dates') {
            Get.toNamed(Routes.purchaseDates);
            return;
          }
          _showStoreFeatureSheet(context, feature);
        },
        borderRadius: BorderRadius.circular(20),
        child: Ink(
          decoration: BoxDecoration(
            color: dc.cardBackground,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.04),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: feature.iconBgColor,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(feature.icon, color: feature.iconColor, size: 24),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      feature.title,
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: dc.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      feature.subtitle,
                      style: TextStyle(
                        fontSize: 13,
                        color: dc.textSecondary,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              const Icon(Icons.chevron_right, color: AppColors.muted, size: 20),
            ],
          ),
        ),
      ),
    );
  }
}
