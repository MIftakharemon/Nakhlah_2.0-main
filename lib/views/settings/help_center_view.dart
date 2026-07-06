import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../constants/app_colors.dart';
import '../../constants/dark_mode_colors.dart';
import '../../common/lexical_renderer.dart';
import '../../common/loading_state.dart';
import '../../models/models.dart';
import '../../services/cms_service.dart';

class HelpCenterView extends StatefulWidget {
  const HelpCenterView({super.key});

  @override
  State<HelpCenterView> createState() => _HelpCenterViewState();
}

class _HelpCenterViewState extends State<HelpCenterView> {
  bool _loading = true;
  List<FaqModel> _faq = [];
  String _searchQuery = '';
  int _selectedTab = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    try {
      final service = Get.find<CmsService>();
      final faq = await service.helpFaq();
      if (mounted) {
        setState(() {
          _faq = faq;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  List<FaqModel> get _filteredFaq {
    if (_searchQuery.trim().isEmpty) return _faq;
    final q = _searchQuery.toLowerCase();
    return _faq
        .where(
          (f) =>
              f.question.toLowerCase().contains(q) ||
              f.answer.toLowerCase().contains(q),
        )
        .toList();
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
          'Help Center',
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: dc.textPrimary,
          ),
        ),
        centerTitle: false,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                _buildTab('FAQ', 0, dc),
                const SizedBox(width: 10),
                _buildTab('Learning Tips & Guides', 1, dc),
                const SizedBox(width: 10),
                _buildTab('Contact us', 2, dc),
              ],
            ),
          ),
          Expanded(
            child: _selectedTab == 0
                ? _buildFaqTab(dc)
                : _selectedTab == 1
                    ? _buildLearningTipsTab(dc)
                    : _buildContactTab(dc),
          ),
        ],
      ),
    );
  }

  Widget _buildTab(String label, int index, DarkModeColors dc) {
    final isActive = _selectedTab == index;
    return GestureDetector(
      onTap: () => setState(() => _selectedTab = index),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? AppColors.accent : dc.cardBackground,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: isActive ? Colors.white : dc.textSecondary,
          ),
        ),
      ),
    );
  }

  Widget _buildFaqTab(DarkModeColors dc) {
    if (_loading) return const LoadingState();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: [
          TextField(
            onChanged: (v) => setState(() => _searchQuery = v),
            style: TextStyle(color: dc.textPrimary),
            decoration: InputDecoration(
              hintText: 'Search FAQs...',
              hintStyle: TextStyle(color: dc.textMuted),
              prefixIcon: Icon(Icons.search, color: dc.iconSecondary),
              filled: true,
              fillColor: dc.cardBackground,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: dc.border),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: dc.border),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: AppColors.accent),
              ),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 12,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: _filteredFaq.isEmpty
                ? Center(
                    child: Text(
                      _searchQuery.isNotEmpty
                          ? 'No FAQs match your search.'
                          : 'No FAQs available at the moment.',
                      style: TextStyle(color: dc.textMuted, fontSize: 14),
                    ),
                  )
                : ListView.builder(
                    itemCount: _filteredFaq.length,
                    itemBuilder: (context, index) {
                      final faq = _filteredFaq[index];
                      return Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        decoration: BoxDecoration(
                          color: dc.cardBackground,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: dc.border),
                        ),
                        child: Theme(
                          data: Theme.of(context).copyWith(
                            dividerColor: Colors.transparent,
                          ),
                          child: ExpansionTile(
                            tilePadding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 4,
                            ),
                            childrenPadding: const EdgeInsets.fromLTRB(
                              16,
                              0,
                              16,
                              16,
                            ),
                            title: Text(
                              faq.question,
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w600,
                                color: dc.textPrimary,
                              ),
                            ),
                            iconColor: dc.iconSecondary,
                            children: [
                              Text(
                                faq.answer,
                                style: TextStyle(
                                  fontSize: 14,
                                  height: 1.5,
                                  color: dc.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildLearningTipsTab(DarkModeColors dc) {
    return const _LearningTipsContent();
  }

  Widget _buildContactTab(DarkModeColors dc) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: ListView(
        children: [
          const SizedBox(height: 8),
          _buildContactCard(
            dc: dc,
            icon: Icons.headphones,
            iconBg: const Color(0xFFE3F2FD),
            iconColor: const Color(0xFF42A5F5),
            title: 'Customer Service',
            onTap: () {},
          ),
          const SizedBox(height: 10),
          _buildContactCard(
            dc: dc,
            icon: Icons.chat,
            iconBg: const Color(0xFFE8F5E9),
            iconColor: const Color(0xFF66BB6A),
            title: 'WhatsApp',
            onTap: () => _launchUrl('https://wa.me/966500000000'),
          ),
          const SizedBox(height: 10),
          _buildContactCard(
            dc: dc,
            icon: Icons.language,
            iconBg: const Color(0xFFEDE7F6),
            iconColor: const Color(0xFF7E57C2),
            title: 'Website',
            onTap: () => _launchUrl('https://www.nakhlah.com'),
          ),
          const SizedBox(height: 10),
          _buildContactCard(
            dc: dc,
            icon: Icons.facebook,
            iconBg: const Color(0xFFE3F2FD),
            iconColor: const Color(0xFF1877F2),
            title: 'Facebook',
            onTap: () => _launchUrl('https://facebook.com/nakhlah'),
          ),
          const SizedBox(height: 10),
          _buildContactCard(
            dc: dc,
            icon: Icons.close,
            iconBg: const Color(0xFFE3F2FD),
            iconColor: const Color(0xFF1DA1F2),
            title: 'Twitter',
            onTap: () => _launchUrl('https://twitter.com/nakhlah_app'),
          ),
          const SizedBox(height: 10),
          _buildContactCard(
            dc: dc,
            icon: Icons.camera_alt,
            iconBg: const Color(0xFFFCE4EC),
            iconColor: const Color(0xFFE4405F),
            title: 'Instagram',
            onTap: () => _launchUrl('https://instagram.com/nakhlah_app'),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildContactCard({
    required DarkModeColors dc,
    required IconData icon,
    required Color iconBg,
    required Color iconColor,
    required String title,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: dc.cardBackground,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: dc.border),
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: iconBg,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: iconColor, size: 24),
            ),
            const SizedBox(width: 16),
            Text(
              title,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: dc.textPrimary,
              ),
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

class _LearningTipsContent extends StatefulWidget {
  const _LearningTipsContent();

  @override
  State<_LearningTipsContent> createState() => _LearningTipsContentState();
}

class _LearningTipsContentState extends State<_LearningTipsContent> {
  bool _loading = true;
  dynamic _guide;
  List<Map<String, dynamic>> _tips = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    try {
      final service = Get.find<CmsService>();
      final results = await Future.wait([
        service.helpGuideLexical(),
        service.helpLearningTips(),
      ]);
      if (mounted) {
        setState(() {
          _guide = results[0];
          _tips = results[1] as List<Map<String, dynamic>>;
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
    if (_loading) return const LoadingState();

    if (_guide == null && _tips.isEmpty) {
      return Center(
        child: Text(
          'No content available at the moment.',
          style: TextStyle(color: dc.textMuted, fontSize: 14),
        ),
      );
    }

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      children: [
        const SizedBox(height: 8),
        if (_guide != null) ...[
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: AppColors.accent.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.menu_book,
                  color: AppColors.accent,
                  size: 18,
                ),
              ),
              const SizedBox(width: 10),
              Text(
                'Guide',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: dc.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
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
                data: _guide,
                style: TextStyle(
                  fontSize: 14,
                  height: 1.6,
                  color: dc.textSecondary,
                ),
              ),
            ),
          ),
          const SizedBox(height: 24),
        ],
        if (_tips.isNotEmpty) ...[
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: const Color(0xFFF59E0B).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.lightbulb,
                  color: Color(0xFFF59E0B),
                  size: 18,
                ),
              ),
              const SizedBox(width: 10),
              Text(
                'Tips',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: dc.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ..._tips.asMap().entries.map((entry) {
            final index = entry.key;
            final tip = entry.value;
            return Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF8E1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFFFE082)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 24,
                    height: 24,
                    decoration: const BoxDecoration(
                      color: Color(0xFFF59E0B),
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Text(
                        '${index + 1}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      tip['tip']?.toString() ?? '',
                      style: TextStyle(
                        fontSize: 14,
                        height: 1.5,
                        color: dc.textPrimary,
                      ),
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
        const SizedBox(height: 24),
      ],
    );
  }
}
