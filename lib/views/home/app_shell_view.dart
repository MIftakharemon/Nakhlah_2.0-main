import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';

import '../../common/app_motion.dart';
import '../../controllers/app_controller.dart';
import '../../controllers/auth_controller.dart';
// import '../challenges/challenges_view.dart';
import '../gamification/gamification_view.dart';
import '../home/home_view.dart';
import '../leaderboard/leaderboard_view.dart';
import '../profile/profile_view.dart';

class AppShellView extends StatelessWidget {
  const AppShellView({super.key});

  @override
  Widget build(BuildContext context) {
    final c = Get.find<AppController>();
    final pages = [
      const HomeView(),
      const LeaderboardView(),
      const GamificationView(),
      const ProfileView(),
      const SizedBox.shrink(),
    ];

    return Obx(
      () => Scaffold(
        body: AnimatedSwitcher(
          duration: AppMotion.normal,
          switchInCurve: AppMotion.out,
          switchOutCurve: AppMotion.inOut,
          transitionBuilder: (child, animation) {
            final slide = Tween<Offset>(
              begin: const Offset(.04, 0),
              end: Offset.zero,
            ).animate(animation);
            final scale = Tween<double>(begin: .985, end: 1).animate(animation);
            return FadeTransition(
              opacity: animation,
              child: SlideTransition(
                position: slide,
                child: ScaleTransition(scale: scale, child: child),
              ),
            );
          },
          child: KeyedSubtree(
            key: ValueKey(c.tabIndex.value),
            child: pages[c.tabIndex.value],
          ),
        ),
        bottomNavigationBar: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: const BoxDecoration(
            color: Colors.white,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _NavItem(
                iconPath: 'assets/nakhlah_web/icons/Home-Icon.127e8555.svg',
                label: 'Home',
                isSelected: c.tabIndex.value == 0,
                onTap: () => c.setTab(0),
              ),
              _NavItem(
                iconPath: 'assets/nakhlah_web/icons/LEADERBOARD.b7e283d4.svg',
                label: 'Leaderboard',
                isSelected: c.tabIndex.value == 1,
                onTap: () => c.setTab(1),
              ),
              _NavItem(
                iconPath: 'assets/nakhlah_web/icons/STORE.9b24d09f.svg',
                label: 'Store',
                isSelected: c.tabIndex.value == 2,
                onTap: () => c.setTab(2),
              ),
              _NavItem(
                iconPath: 'assets/nakhlah_web/icons/Profile.f8f9b305.svg',
                label: 'Profile',
                isSelected: c.tabIndex.value == 3,
                onTap: () => c.setTab(3),
              ),
              _NavItem(
                iconPath: 'assets/nakhlah_web/icons/logout.125f3808.svg',
                label: 'Logout',
                isSelected: false,
                onTap: _showLogoutDialog,
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showLogoutDialog() {
    Get.defaultDialog(
      title: 'Logout',
      middleText: 'Are you sure you want to logout?',
      textConfirm: 'Yes',
      textCancel: 'No',
      confirmTextColor: Colors.white,
      onConfirm: () {
        Get.back();
        Get.find<AuthController>().logout();
      },
    );
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.iconPath,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  final String iconPath;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected
              ? const Color(0xFFFAF5FF)
              : const Color(0xFFF5F5F5),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected
                ? const Color(0xFF7C3AED).withValues(alpha: 0.3)
                : Colors.transparent,
            width: 1,
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SvgPicture.asset(
              iconPath,
              width: 24,
              height: 24,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                color: isSelected
                    ? const Color(0xFF7C3AED)
                    : const Color(0xFF6B7280),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
