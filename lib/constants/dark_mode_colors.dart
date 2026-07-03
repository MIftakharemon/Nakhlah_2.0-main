import 'package:flutter/material.dart';

/// Theme-aware color helper. Use via `DarkModeColors.of(context)`.
class DarkModeColors {
  const DarkModeColors._(this.brightness);
  final Brightness brightness;

  bool get isDark => brightness == Brightness.dark;

  static DarkModeColors of(BuildContext context) =>
      DarkModeColors._(Theme.of(context).brightness);

  // Backgrounds
  Color get scaffoldBackground =>
      isDark ? const Color(0xFF0F1419) : const Color(0xFFF5F0E8);
  Color get cardBackground =>
      isDark ? const Color(0xFF1C2333) : Colors.white;
  Color get cardBackgroundAlt =>
      isDark ? const Color(0xFF151C27) : const Color(0xFFFAF8F5);
  Color get surfaceBackground =>
      isDark ? const Color(0xFF1C2333) : const Color(0xFFF3F4F6);

  // Text
  Color get textPrimary =>
      isDark ? const Color(0xFFF5F5F5) : const Color(0xFF30261D);
  Color get textSecondary =>
      isDark ? const Color(0xFF9CA3AF) : const Color(0xFF846F61);
  Color get textMuted =>
      isDark ? const Color(0xFF6B7280) : const Color(0xFF9CA3AF);

  // Borders
  Color get border =>
      isDark ? const Color(0xFF2C3544) : const Color(0xFFE2D8C9);
  Color get borderLight =>
      isDark ? const Color(0xFF1F2937) : const Color(0xFFE5E7EB);

  // Icons
  Color get iconPrimary =>
      isDark ? const Color(0xFFF5F5F5) : const Color(0xFF30261D);
  Color get iconSecondary =>
      isDark ? const Color(0xFF9CA3AF) : const Color(0xFF6B7280);

  // Shadows
  Color get shadow =>
      isDark ? Colors.black.withValues(alpha: 0.3) : Colors.black.withValues(alpha: 0.08);

  // Specific components
  Color settingsIconBg(Color lightBg) =>
      isDark ? const Color(0xFF2C3544) : lightBg;

  // Badge backgrounds
  Color get completedBadgeBg =>
      isDark ? const Color(0xFF0D3320) : const Color(0xFFF1F8F1);
  Color get completedBadgeBorder =>
      isDark ? const Color(0xFF22C55E) : Colors.green.shade200;
  Color get lockedBadgeBg =>
      isDark ? const Color(0xFF1F2937) : const Color(0xFFF3F4F6);
}
