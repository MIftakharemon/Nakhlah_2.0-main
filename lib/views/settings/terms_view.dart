import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../common/lexical_renderer.dart';
import '../../constants/dark_mode_colors.dart';
import '../../common/loading_state.dart';
import '../../services/cms_service.dart';

class TermsView extends StatefulWidget {
  const TermsView({super.key});

  @override
  State<TermsView> createState() => _TermsViewState();
}

class _TermsViewState extends State<TermsView> {
  bool _loading = true;
  dynamic _content;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    try {
      final service = Get.find<CmsService>();
      final terms = await service.termsAndConditionsLexical();
      if (mounted) {
        setState(() {
          _content = terms;
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
                color: const Color(0xFFE3F2FD),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(
                Icons.description_outlined,
                color: Color(0xFF42A5F5),
                size: 18,
              ),
            ),
            const SizedBox(width: 12),
            Text(
              'Terms & Conditions',
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
          : _content == null
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
                    DefaultTextStyle(
                      style: TextStyle(
                        fontSize: 14,
                        height: 1.7,
                        color: dc.textSecondary,
                      ),
                      child: LexicalRenderer(
                        data: _content,
                        style: TextStyle(
                          fontSize: 14,
                          height: 1.7,
                          color: dc.textSecondary,
                        ),
                      ),
                    ),
                    const SizedBox(height: 32),
                  ],
                ),
    );
  }
}
