import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../common/lexical_renderer.dart';
import '../../constants/dark_mode_colors.dart';
import '../../common/loading_state.dart';
import '../../routes/app_routes.dart';
import '../../services/cms_service.dart';

class AboutView extends StatefulWidget {
  const AboutView({super.key});

  @override
  State<AboutView> createState() => _AboutViewState();
}

class _AboutViewState extends State<AboutView> {
  bool _loading = true;
  dynamic _aboutLexical;
  String _websiteUrl = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    try {
      final service = Get.find<CmsService>();
      final results = await Future.wait([
        service.aboutLexical(),
        service.aboutData(),
      ]);
      if (mounted) {
        setState(() {
          _aboutLexical = results[0];
          final data = results[1] as Map<String, dynamic>?;
          _websiteUrl = data?['websiteUrl']?.toString() ?? '';
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

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
          'About Nakhlah',
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: dc.textPrimary,
          ),
        ),
        centerTitle: false,
      ),
      body: _loading
          ? const LoadingState()
          : ListView(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                const SizedBox(height: 16),
                Center(
                  child: SvgPicture.asset(
                    'assets/nakhlah_web/mascot.svg',
                    width: 120,
                    height: 120,
                  ),
                ),
                const SizedBox(height: 16),
                Center(
                  child: Text(
                    'Nakhlah v2.0.0',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: dc.textPrimary,
                    ),
                  ),
                ),
                const SizedBox(height: 6),
                Center(
                  child: Text(
                    'Learn Arabic with fun and ease',
                    style: TextStyle(
                      fontSize: 14,
                      color: dc.textSecondary,
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                if (_aboutLexical != null)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: dc.cardBackground,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: dc.border),
                    ),
                    child: DefaultTextStyle(
                      style: TextStyle(
                        fontSize: 14,
                        height: 1.6,
                        color: dc.textSecondary,
                      ),
                      child: LexicalRenderer(
                        data: _aboutLexical,
                        style: TextStyle(
                          fontSize: 14,
                          height: 1.6,
                          color: dc.textSecondary,
                        ),
                      ),
                    ),
                  ),
                const SizedBox(height: 24),
                _buildLinkItem(
                  dc: dc,
                  icon: Icons.description_outlined,
                  iconBg: const Color(0xFFE3F2FD),
                  iconColor: const Color(0xFF42A5F5),
                  title: 'Terms & Conditions',
                  onTap: () => Get.toNamed(Routes.terms),
                ),
                const SizedBox(height: 10),
                _buildLinkItem(
                  dc: dc,
                  icon: Icons.privacy_tip_outlined,
                  iconBg: const Color(0xFFE8F5E9),
                  iconColor: const Color(0xFF66BB6A),
                  title: 'Privacy Policy',
                  onTap: () => Get.toNamed(Routes.privacyPolicy),
                ),
                if (_websiteUrl.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  _buildLinkItem(
                    dc: dc,
                    icon: Icons.open_in_new,
                    iconBg: const Color(0xFFF3E5F5),
                    iconColor: const Color(0xFF9C27B0),
                    title: 'Visit Our Website',
                    onTap: () => _launchUrl(_websiteUrl),
                    isExternal: true,
                  ),
                ],
                const SizedBox(height: 32),
              ],
            ),
    );
  }

  Widget _buildLinkItem({
    required DarkModeColors dc,
    required IconData icon,
    required Color iconBg,
    required Color iconColor,
    required String title,
    required VoidCallback onTap,
    bool isExternal = false,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: dc.cardBackground,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: dc.border),
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: iconBg,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: iconColor, size: 20),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: dc.textPrimary,
                ),
              ),
            ),
            Icon(
              isExternal ? Icons.open_in_new : Icons.chevron_right,
              color: dc.iconSecondary,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }
}
