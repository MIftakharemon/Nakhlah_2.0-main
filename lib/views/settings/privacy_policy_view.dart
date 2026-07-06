import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../constants/dark_mode_colors.dart';
import '../../common/loading_state.dart';
import '../../services/cms_service.dart';

class PrivacyPolicyView extends StatefulWidget {
  const PrivacyPolicyView({super.key});

  @override
  State<PrivacyPolicyView> createState() => _PrivacyPolicyViewState();
}

class _PrivacyPolicyViewState extends State<PrivacyPolicyView> {
  bool _loading = true;
  String _content = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    try {
      final service = Get.find<CmsService>();
      final privacy = await service.privacyPolicy();
      if (mounted) {
        setState(() {
          _content = privacy;
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
        title: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: const Color(0xFFE8F5E9),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(
                Icons.privacy_tip_outlined,
                color: Color(0xFF66BB6A),
                size: 18,
              ),
            ),
            const SizedBox(width: 12),
            Text(
              'Privacy Policy',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: dc.textPrimary,
              ),
            ),
          ],
        ),
        centerTitle: false,
      ),
      body: _loading
          ? const LoadingState()
          : _content.isEmpty
              ? Center(
                  child: Text(
                    'No content available at the moment.',
                    style: TextStyle(color: dc.textMuted, fontSize: 14),
                  ),
                )
              : ListView(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  children: [
                    const SizedBox(height: 8),
                    Text(
                      _content,
                      style: TextStyle(
                        fontSize: 14,
                        height: 1.7,
                        color: dc.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 32),
                  ],
                ),
    );
  }
}
