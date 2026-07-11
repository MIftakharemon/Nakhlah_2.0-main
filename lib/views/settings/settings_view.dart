import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../constants/app_colors.dart';
import '../../constants/dark_mode_colors.dart';
import '../../controllers/app_controller.dart';
import '../../controllers/theme_controller.dart';
import '../../routes/app_routes.dart';
import 'settings_detail_view.dart';

class SettingsView extends StatefulWidget {
  const SettingsView({super.key});

  @override
  State<SettingsView> createState() => _SettingsViewState();
}

class _SettingsViewState extends State<SettingsView> {
  @override
  Widget build(BuildContext context) {
    final dc = DarkModeColors.of(context);
    return Scaffold(
      backgroundColor: dc.scaffoldBackground,
      appBar: AppBar(
        backgroundColor: dc.scaffoldBackground,
        elevation: 0,
        leading: IconButton(
          onPressed: () => Get.back(),
          icon: Icon(Icons.arrow_back_ios, color: dc.iconPrimary, size: 20),
        ),
        title: Text(
          'Settings',
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: dc.textPrimary,
          ),
        ),
        centerTitle: false,
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        children: [
          _buildSettingItem(
            context: context,
            icon: Icons.person_outline,
            iconBgColor: const Color(0xFFFFF3E0),
            iconColor: const Color(0xFFFF9800),
            title: 'Personal Info',
            onTap: () => Get.to(
              () => const SettingsDetailView(title: 'Personal Info'),
            ),
          ),
          _buildSettingItem(
            context: context,
            icon: Icons.notifications_none_outlined,
            iconBgColor: const Color(0xFFFFEBEE),
            iconColor: const Color(0xFFEF5350),
            title: 'Notification',
            onTap: () => Get.to(
              () => const SettingsDetailView(title: 'Notification'),
            ),
          ),
          _buildSettingItem(
            context: context,
            icon: Icons.payment_outlined,
            iconBgColor: const Color(0xFFEDE7F6),
            iconColor: const Color(0xFF7E57C2),
            title: 'Payment',
            onTap: () {
              Get.back(); // close settings
              Get.find<AppController>().setTab(2); // navigate to Store tab
            },
          ),
          _buildSettingItem(
            context: context,
            icon: Icons.help_outline,
            iconBgColor: const Color(0xFFE0F7FA),
            iconColor: const Color(0xFF26C6DA),
            title: 'Help Center',
            onTap: () => Get.toNamed(Routes.helpCenter),
          ),
          _buildSettingItem(
            context: context,
            icon: Icons.info_outline,
            iconBgColor: const Color(0xFFEDE7F6),
            iconColor: const Color(0xFF7E57C2),
            title: 'About Nakhlah',
            onTap: () => Get.toNamed(Routes.about),
          ),
          _buildDarkModeToggle(context),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildDarkModeToggle(BuildContext context) {
    final themeCtrl = Get.find<ThemeController>();
    final dc = DarkModeColors.of(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: themeCtrl.toggleTheme,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            color: dc.cardBackground,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: const BoxDecoration(
                  color: Color(0xFFEDE7F6),
                  shape: BoxShape.circle,
                ),
                child: Obx(() => Icon(
                  themeCtrl.isDarkMode.value
                      ? Icons.dark_mode_rounded
                      : Icons.light_mode_rounded,
                  color: AppColors.accent,
                  size: 22,
                )),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Obx(() => Text(
                  themeCtrl.isDarkMode.value ? 'Dark Mode' : 'Light Mode',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: dc.textPrimary,
                  ),
                )),
              ),
              Obx(() => Switch(
                value: themeCtrl.isDarkMode.value,
                onChanged: (_) => themeCtrl.toggleTheme(),
                activeTrackColor: AppColors.accent.withValues(alpha: 0.4),
                activeThumbColor: AppColors.accent,
              )),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSettingItem({
    required BuildContext context,
    required IconData icon,
    required Color iconBgColor,
    required Color iconColor,
    required String title,
    required VoidCallback onTap,
  }) {
    final dc = DarkModeColors.of(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            color: dc.cardBackground,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: iconBgColor,
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: iconColor, size: 22),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: dc.textPrimary,
                  ),
                ),
              ),
              Icon(Icons.chevron_right, color: dc.iconSecondary, size: 22),
            ],
          ),
        ),
      ),
    );
  }
}
