import 'dart:math' as math;
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';

import '../../common/app_motion.dart';
import '../../controllers/app_controller.dart';
import '../../controllers/auth_controller.dart';
import '../../controllers/theme_controller.dart';
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
    final themeCtrl = Get.find<ThemeController>();
    final pages = [
      const HomeView(),
      const LeaderboardView(),
      const GamificationView(),
      const ProfileView(),
      const SizedBox.shrink(),
    ];

    return Obx(
      () => Scaffold(
        backgroundColor: Colors.transparent,
        body: Stack(
          children: [
            AnimatedSwitcher(
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
            // Floating theme toggle button — top-left, always visible
            Positioned(
              top: MediaQuery.of(context).padding.top + 60,
              left: 16,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: BackdropFilter(
                  filter: ui.ImageFilter.blur(sigmaX: 12, sigmaY: 12),
                  child: GestureDetector(
                    onTap: themeCtrl.toggleTheme,
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: themeCtrl.isDarkMode.value
                            ? const Color(0x33FFFFFF)
                            : const Color(0x4DFFFFFF),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: themeCtrl.isDarkMode.value
                              ? const Color(0x33FFFFFF)
                              : const Color(0x66FFFFFF),
                          width: 1,
                        ),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x14000000),
                            blurRadius: 8,
                            offset: Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Center(
                        child: themeCtrl.isDarkMode.value
                            ? const _SunIcon(size: 24)
                            : const _MoonIcon(size: 24),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
        bottomNavigationBar: ClipRRect(
          child: BackdropFilter(
            filter: ui.ImageFilter.blur(sigmaX: 30, sigmaY: 30),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
              decoration: BoxDecoration(
                color: themeCtrl.isDarkMode.value
                    ? const Color(0xCC0F1419)
                    : (c.tabIndex.value == 0
                        ? const Color(0xD9F5E6D0).withOpacity(0.85)
                        : Colors.white),
                border: Border(
                  top: BorderSide(
                    color: themeCtrl.isDarkMode.value
                        ? const Color(0xFF2C3544)
                        : (c.tabIndex.value == 0
                            ? const Color(0x33D4A574)
                            : const Color(0xFFE5E5E5)),
                    width: 1,
                  ),
                ),
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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isDark
              ? (isSelected
                  ? const Color(0xFF2C3544)
                  : const Color(0xFF1C2333))
              : (isSelected
                  ? const Color(0xFFFAF5FF)
                  : const Color(0xFFF5F5F5)),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected
                ? (isDark
                    ? const Color(0xFF8E4EF2).withValues(alpha: 0.3)
                    : const Color(0xFF7C3AED).withValues(alpha: 0.3))
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
                color: isDark
                    ? (isSelected
                        ? const Color(0xFF8E4EF2)
                        : const Color(0xFF9CA3AF))
                    : (isSelected
                        ? const Color(0xFF7C3AED)
                        : const Color(0xFF6B7280)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Sun Icon — custom SVG matching web_reference/components/nakhlah/ThemeToggle.jsx
// ---------------------------------------------------------------------------
class _SunIcon extends StatelessWidget {
  const _SunIcon({required this.size});
  final double size;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _SunIconPainter(),
      ),
    );
  }
}

class _SunIconPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2;
    final cy = size.height / 2;
    final radius = size.width * 0.22;

    // Yellow circle (moon face)
    final circlePaint = Paint()..color = const Color(0xFFFDF5A9);
    canvas.drawCircle(Offset(cx, cy), radius, circlePaint);

    // Dark crescent cutout
    final darkPaint = Paint()..color = const Color(0xFF1F212B);
    canvas.drawCircle(Offset(cx + radius * 0.5, cy - radius * 0.15), radius * 0.72, darkPaint);

    // Re-draw yellow circle to create crescent
    final yellowPaint = Paint()..color = const Color(0xFFFDF5A9);
    canvas.drawCircle(Offset(cx, cy), radius, yellowPaint);

    // Dark crescent overlay
    canvas.drawCircle(Offset(cx + radius * 0.48, cy - radius * 0.12), radius * 0.7, darkPaint);

    // Sun rays (8 lines)
    final rayPaint = Paint()
      ..color = const Color(0xFF1F212B)
      ..strokeWidth = size.width * 0.04
      ..strokeCap = StrokeCap.round;

    final outerR = radius * 1.6;
    final innerR = radius * 1.25;

    for (var i = 0; i < 8; i++) {
      final angle = i * math.pi / 4;
      final p1 = Offset(cx + innerR * math.cos(angle), cy + innerR * math.sin(angle));
      final p2 = Offset(cx + outerR * math.cos(angle), cy + outerR * math.sin(angle));
      canvas.drawLine(p1, p2, rayPaint);
    }

    // Diagonal rays
    for (var i = 0; i < 8; i++) {
      final angle = i * math.pi / 4 + math.pi / 8;
      final p1 = Offset(cx + innerR * 0.95 * math.cos(angle), cy + innerR * 0.95 * math.sin(angle));
      final p2 = Offset(cx + outerR * 0.85 * math.cos(angle), cy + outerR * 0.85 * math.sin(angle));
      canvas.drawLine(p1, p2, rayPaint..strokeWidth = size.width * 0.03);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// ---------------------------------------------------------------------------
// Moon Icon — crescent moon matching web (icons8 crescent-moon.png style)
// ---------------------------------------------------------------------------
class _MoonIcon extends StatelessWidget {
  const _MoonIcon({required this.size});
  final double size;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _MoonIconPainter(),
      ),
    );
  }
}

class _MoonIconPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2;
    final cy = size.height / 2;
    final radius = size.width * 0.4;

    // Full circle
    final moonPath = Path()..addOval(Rect.fromCircle(center: Offset(cx, cy), radius: radius));

    // Cutout circle (offset to right-top to create crescent)
    final cutPath = Path()..addOval(Rect.fromCircle(
      center: Offset(cx + radius * 0.45, cy - radius * 0.15),
      radius: radius * 0.78,
    ));

    // Crescent = moon minus cutout
    final crescent = Path.combine(PathOperation.difference, moonPath, cutPath);

    final crescentPaint = Paint()..color = const Color(0xFFF5D76E);
    canvas.drawPath(crescent, crescentPaint);

    // Small stars
    final starPaint = Paint()..color = const Color(0xFFF5D76E);
    canvas.drawCircle(Offset(cx + radius * 0.95, cy - radius * 0.55), size.width * 0.03, starPaint);
    canvas.drawCircle(Offset(cx + radius * 0.7, cy - radius * 0.85), size.width * 0.022, starPaint);
    canvas.drawCircle(Offset(cx + radius * 1.15, cy - radius * 0.2), size.width * 0.018, starPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
