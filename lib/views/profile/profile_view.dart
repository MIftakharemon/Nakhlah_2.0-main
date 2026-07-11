import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:share_plus/share_plus.dart';
import '../../common/app_button.dart';
import '../../common/app_motion.dart';
import '../../common/app_snackbar.dart';
import '../../common/loading_state.dart';
import '../../common/responsive.dart';
import '../../constants/app_colors.dart';
import '../../constants/dark_mode_colors.dart';
import '../../controllers/app_controller.dart';
import '../../controllers/auth_controller.dart';
import '../../controllers/gamification_controller.dart';
import '../../controllers/profile_controller.dart';
import '../../models/models.dart';
import '../../routes/app_routes.dart';
import '../../widgets/nakhlah_icons.dart';
import '../settings/settings_detail_view.dart';

class ProfileView extends StatefulWidget {
  const ProfileView({super.key});

  @override
  State<ProfileView> createState() => _ProfileViewState();
}

class _ProfileViewState extends State<ProfileView> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      Get.find<ProfileController>().load();
      Get.find<AuthController>().loadMe();
      Get.find<GamificationController>().load();
    });
  }

  @override
  Widget build(BuildContext context) {
    final dc = DarkModeColors.of(context);
    final p = Get.find<ProfileController>();

    return Scaffold(
      backgroundColor: dc.scaffoldBackground,
      body: PageShell(
        child: Obx(() {
          if (p.loading.value && p.profile.value == null) {
            return const LoadingState();
          }
          final items = _buildProfileItems(context);
          return ListView(
            padding: EdgeInsets.only(
              top: MediaQuery.of(context).padding.top + 16,
            ),
            children: [
              for (var i = 0; i < items.length; i++)
                PageEnter(
                  delay: Duration(milliseconds: 30 * i),
                  duration: const Duration(milliseconds: 280),
                  child: items[i],
                ),
            ],
          );
        }),
      ),
    );
  }

  List<Widget> _buildProfileItems(BuildContext context) {
    final p = Get.find<ProfileController>();
    final a = Get.find<AuthController>();
    final g = Get.find<GamificationController>();
    return [
      _buildAppBar(context),
      const SizedBox(height: 20),
      _buildProfileHeader(context, p, a),
      const SizedBox(height: 20),
      // _buildStatsRow(context, p, g), // COMMENTED: Palm Trees, Dates, Gems, Injaz cards removed (was below name)
      // const SizedBox(height: 16),     // COMMENTED: spacing for removed stats row
      _buildActionButtons(context),
      const SizedBox(height: 28),
      _buildStatisticsSection(context, p, g),
      const SizedBox(height: 20),
      // _buildXpChartSection(context), // COMMENTED: XP chart removed for now
      const SizedBox(height: 28),
      _buildAchievementsSection(context, g),
      const SizedBox(height: 24),
      _buildSubscriptionCard(context),
      const SizedBox(height: 24),
      _buildSettingsLinks(context),
      const SizedBox(height: 24),
      _buildLogoutButton(context, a),
      const SizedBox(height: 32),
    ];
  }

  Widget _buildAppBar(BuildContext context) {
    final dc = DarkModeColors.of(context);
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: AppColors.accent,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(
                Icons.person_outline,
                color: Colors.white,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            const Text(
              'Account',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        Row(
          children: [
            IconButton(
              onPressed: () {
                Get.toNamed(Routes.settings);
              },
              icon: Icon(Icons.settings_outlined, color: dc.iconPrimary),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildProfileHeader(
    BuildContext context,
    ProfileController p,
    AuthController a,
  ) {
    final dc = DarkModeColors.of(context);
    final imageUrl = p.profile.value?.profilePicture?.absoluteUrl;
    final name =
        p.profile.value?.fullName ??
        a.user.value?.name ??
        a.user.value?.email ??
        'Learner';
    final goalTime = p.profile.value?.onboardInfo.goalTime ?? 0;

    return Column(
      children: [
        Container(
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: dc.cardBackground, width: 4),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.08),
                blurRadius: 16,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: CircleAvatar(
            radius: 52,
            backgroundColor: const Color(0xFFF3E8FF),
            backgroundImage: imageUrl != null
                ? CachedNetworkImageProvider(imageUrl)
                : null,
            child: imageUrl == null
                ? const Icon(
                    Icons.person,
                    size: 52,
                    color: AppColors.accent,
                  )
                : null,
          ),
        ),
        const SizedBox(height: 16),
        Text(
          name,
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: dc.textPrimary,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          '$goalTime min daily goal',
          style: TextStyle(fontSize: 14, color: dc.textSecondary),
        ),
      ],
    );
  }

  // COMMENTED: Palm Trees, Dates, Gems, Injaz cards removed
  // To restore, uncomment this method and the call in _buildBodyItems
  // Widget _buildStatsRow(
  //   BuildContext context,
  //   ProfileController p,
  //   GamificationController g,
  // ) {
  //   final stats = [
  //     _GamificationStat(
  //       icon: SvgPicture.asset(
  //         'assets/nakhlah_design/Palm_Trees.svg',
  //         width: 22,
  //         height: 22,
  //       ),
  //       value: '${p.stock.value.palmStock}',
  //       label: 'Palm Trees',
  //       color: const Color(0xFF10B981),
  //     ),
  //     _GamificationStat(
  //       icon: const Icon(Icons.circle, color: Color(0xFFF59E0B), size: 22),
  //       value: '${p.stock.value.dateStock}',
  //       label: 'Dates',
  //       color: const Color(0xFFF59E0B),
  //     ),
  //     _GamificationStat(
  //       icon: const Icon(Icons.diamond, color: Color(0xFF7C3AED), size: 22),
  //       value: '${g.stock.value.injazStock}',
  //       label: 'Gems',
  //       color: const Color(0xFF7C3AED),
  //     ),
  //     _GamificationStat(
  //       icon: const Icon(Icons.star, color: Color(0xFF3B82F6), size: 22),
  //       value: '${p.stock.value.injazStock}',
  //       label: 'Injaz',
  //       color: const Color(0xFF3B82F6),
  //     ),
  //   ];
  //
  //   return Row(
  //     children: stats
  //         .map((s) => Expanded(child: _buildGamificationStatCard(s)))
  //         .toList(),
  //   );
  // }

  Widget _buildGamificationStatCard(_GamificationStat stat) {
    final dc = DarkModeColors.of(context);
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 4),
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
      decoration: BoxDecoration(
        color: dc.cardBackground,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: dc.border),
      ),
      child: Column(
        children: [
          SizedBox(width: 22, height: 22, child: stat.icon),
          const SizedBox(height: 6),
          Text(
            stat.value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: dc.textPrimary,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            stat.label,
            style: TextStyle(fontSize: 11, color: dc.textSecondary),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: ElevatedButton.icon(
            onPressed: () {
              Get.to(() => const SettingsDetailView(title: 'Personal Info'));
            },
            icon: const Icon(Icons.edit, size: 18),
            label: const Text('Edit Profile', overflow: TextOverflow.ellipsis),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.accent,
              foregroundColor: Colors.white,
              elevation: 0,
              padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(24),
              ),
              textStyle: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: ElevatedButton.icon(
            onPressed: () => _showShareProfileSheet(context),
            icon: const Icon(Icons.share, size: 18),
            label: const Text('Share', overflow: TextOverflow.ellipsis),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.transparent,
              foregroundColor: AppColors.accent,
              elevation: 0,
              side: const BorderSide(color: AppColors.accent, width: 1.5),
              padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(24),
              ),
              textStyle: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ),
      ],
    );
  }

  void _showShareProfileSheet(BuildContext context) {
    final profileUrl = 'https://app.nakhlah.net/profile';
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => _ShareProfileSheet(profileUrl: profileUrl),
    );
  }

  Widget _buildStatisticsSection(
    BuildContext context,
    ProfileController p,
    GamificationController g,
  ) {
    final dc = DarkModeColors.of(context);
    final dca = p.profile.value?.dailyChallengeActivity;
    final stock = p.stock.value;
    final profileStock = p.profile.value?.stock;
    final achievementsUnlocked = g.achievements.where((a) => a.achieved).length;
    final badgesEarned = profileStock?.badgesCount ?? stock.badgesCount;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              'Your Statistics',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: dc.textPrimary,
              ),
            ),
            const SizedBox(width: 8),
            SvgPicture.asset(
              'assets/nakhlah_web/icons/bar_chart.svg',
              width: 20,
              height: 20,
            ),
          ],
        ),
        const SizedBox(height: 4),
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 1.5,
          children: [
            _buildStatCard(
              context,
              const ActiveStreakIcon(size: 24),
              '${dca?.tasksCompleted ?? 0}',
              'Tasks Completed Today',
            ),
            _buildStatCard(
              context,
              SvgPicture.asset(
                'assets/nakhlah_web/icons/calendar.svg',
                width: 24,
                height: 24,
              ),
              '${dca?.lessonsCompleted ?? 0}',
              'Lessons Completed Today',
            ),
            _buildStatCard(
              context,
              SvgPicture.asset(
                'assets/nakhlah_web/icons/dates.svg',
                width: 24,
                height: 24,
              ),
              '${stock.dateStock}',
              'Total Dates',
            ),
            _buildStatCard(
              context,
              SvgPicture.asset(
                'assets/nakhlah_web/icons/star.svg',
                width: 24,
                height: 24,
              ),
              _formatNumber(stock.injazStock),
              'Total Injaz Gained',
            ),
            _buildStatCard(
              context,
              SvgPicture.asset(
                'assets/nakhlah_web/icons/bullseye.svg',
                width: 24,
                height: 24,
              ),
              '$achievementsUnlocked',
              'Achievements Unlocked',
            ),
            _buildStatCard(
              context,
              SvgPicture.asset(
                'assets/nakhlah_web/icons/medal.svg',
                width: 24,
                height: 24,
              ),
              '$badgesEarned',
              'Badges Earned',
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStatCard(
    BuildContext context,
    Widget icon,
    String value,
    String label,
  ) {
    final dc = DarkModeColors.of(context);
    return Container(
      decoration: BoxDecoration(
        color: dc.cardBackground,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: dc.border),
      ),
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          icon,
          const SizedBox(height: 6),
          Text(
            value,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: dc.textPrimary,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              color: dc.textSecondary,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  String _formatNumber(int value) {
    final str = value.toString();
    final buf = StringBuffer();
    for (var i = 0; i < str.length; i++) {
      if (i > 0 && (str.length - i) % 3 == 0) buf.write(',');
      buf.write(str[i]);
    }
    return buf.toString();
  }

  Widget _buildSubscriptionCard(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF7C3AED), Color(0xFF5B21B6)],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF7C3AED).withValues(alpha: 0.3),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Go Premium',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Unlock all lessons, remove ads & more',
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.white.withValues(alpha: 0.85),
                  ),
                ),
                const SizedBox(height: 14),
                ElevatedButton(
                  onPressed: () {
                    // OLD: Get.toNamed(Routes.premium);
                    Get.find<AppController>().setTab(2); // Navigate to Store tab
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: const Color(0xFF7C3AED),
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 10,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(24),
                    ),
                    textStyle: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  child: const Text('Upgrade Now'),
                ),
              ],
            ),
          ),
          const Icon(Icons.workspace_premium, color: Colors.white, size: 56),
        ],
      ),
    );
  }

  Widget _buildSettingsLinks(BuildContext context) {
    final dc = DarkModeColors.of(context);
    return Container(
      decoration: BoxDecoration(
        color: dc.cardBackground,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: dc.border),
      ),
      child: Column(
        children: [
          // _buildSettingsLinkItem(
          //   context: context,
          //   icon: Icons.bar_chart,
          //   iconBg: const Color(0xFFE3F2FD),
          //   iconColor: const Color(0xFF42A5F5),
          //   title: 'Stats',
          //   onTap: () => Get.toNamed(Routes.stats),
          // ),
          // const Divider(height: 1, indent: 56),
          _buildSettingsLinkItem(
            context: context,
            icon: Icons.help_outline,
            iconBg: const Color(0xFFE0F7FA),
            iconColor: const Color(0xFF26C6DA),
            title: 'FAQ',
            onTap: () => Get.toNamed(Routes.faq),
          ),
          const Divider(height: 1, indent: 56),
          _buildSettingsLinkItem(
            context: context,
            icon: Icons.description_outlined,
            iconBg: const Color(0xFFE8F5E9),
            iconColor: const Color(0xFF66BB6A),
            title: 'Terms & Conditions',
            onTap: () => Get.toNamed(Routes.terms),
          ),
          const Divider(height: 1, indent: 56),
          _buildSettingsLinkItem(
            context: context,
            icon: Icons.mail_outline,
            iconBg: const Color(0xFFFFF3E0),
            iconColor: const Color(0xFFFF9800),
            title: 'Contact Us',
            onTap: () => Get.toNamed(Routes.contact),
          ),
        ],
      ),
    );
  }

  Widget _buildSettingsLinkItem({
    required BuildContext context,
    required IconData icon,
    required Color iconBg,
    required Color iconColor,
    required String title,
    required VoidCallback onTap,
  }) {
    final dc = DarkModeColors.of(context);
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: iconBg,
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: iconColor, size: 18),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w500,
                  color: dc.textPrimary,
                ),
              ),
            ),
            Icon(Icons.chevron_right, color: dc.iconSecondary, size: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildXpChartSection(BuildContext context) {
    final dc = DarkModeColors.of(context);
    final weeklyData = [980, 340, 520, 680, 920, 640, 880];
    final totalXp = weeklyData.reduce((a, b) => a + b);

    return Container(
      decoration: BoxDecoration(
        color: dc.cardBackground,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: dc.border),
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Your XP this week',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                '$totalXp XP',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          SizedBox(
            height: 180,
            child: CustomPaint(
              size: const Size(double.infinity, 180),
              painter: _AreaChartPainter(
                data: weeklyData,
                labelColor: dc.textMuted,
                gridColor: dc.borderLight,
                dotColor: dc.cardBackground,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  'Mon',
                  style: TextStyle(fontSize: 12.0, color: dc.textMuted),
                  textAlign: TextAlign.center,
                ),
              ),
              Expanded(
                child: Text(
                  'Tue',
                  style: TextStyle(fontSize: 12.0, color: dc.textMuted),
                  textAlign: TextAlign.center,
                ),
              ),
              Expanded(
                child: Text(
                  'Wed',
                  style: TextStyle(fontSize: 12.0, color: dc.textMuted),
                  textAlign: TextAlign.center,
                ),
              ),
              Expanded(
                child: Text(
                  'Thu',
                  style: TextStyle(fontSize: 12.0, color: dc.textMuted),
                  textAlign: TextAlign.center,
                ),
              ),
              Expanded(
                child: Text(
                  'Fri',
                  style: TextStyle(fontSize: 12.0, color: dc.textMuted),
                  textAlign: TextAlign.center,
                ),
              ),
              Expanded(
                child: Text(
                  'Sat',
                  style: TextStyle(fontSize: 12.0, color: dc.textMuted),
                  textAlign: TextAlign.center,
                ),
              ),
              Expanded(
                child: Text(
                  'Sun',
                  style: TextStyle(fontSize: 12.0, color: dc.textMuted),
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAchievementsSection(
    BuildContext context,
    GamificationController g,
  ) {
    final dc = DarkModeColors.of(context);
    final achievements = g.achievements.take(3).toList();
    final achievedCount = g.achievements.where((a) => a.achieved).length;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              'Your Achievements',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: dc.textPrimary,
              ),
            ),
            const SizedBox(width: 8),
            const Text('🏆', style: TextStyle(fontSize: 18)),
          ],
        ),
        const SizedBox(height: 16),
        Container(
          decoration: BoxDecoration(
            color: dc.cardBackground,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: dc.border),
          ),
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '$achievedCount Achievements',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: dc.textPrimary,
                    ),
                  ),
                  const Icon(Icons.arrow_forward, color: AppColors.accent),
                ],
              ),
              const SizedBox(height: 16),
              const Divider(height: 1),
              if (achievements.isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 24),
                  child: Text(
                    'No achievements yet. Keep learning!',
                    style: TextStyle(color: dc.textMuted),
                  ),
                )
              else
                ...achievements.asMap().entries.map((entry) {
                  final index = entry.key;
                  final achievement = entry.value;
                  return Column(
                    children: [
                      if (index > 0) const Divider(height: 1),
                      _buildAchievementItem(achievement),
                    ],
                  );
                }),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildAchievementItem(AchievementModel achievement) {
    final dc = DarkModeColors.of(context);
    final target = achievement.unitOrder > 0 ? achievement.unitOrder : 10;
    final progress = target > 0 ? achievement.levelOrder / target : 0.0;
    final progressClamped = progress.clamp(0.0, 1.0);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Stack(
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: _getAchievementColor(achievement.id),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Center(
                  child: Icon(
                    _getAchievementIcon(achievement.id),
                    color: Colors.white,
                    size: 32,
                  ),
                ),
              ),
              Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 3),
                  decoration: BoxDecoration(
                    color: _getAchievementColor(
                      achievement.id,
                    ).withValues(alpha: 0.9),
                    borderRadius: const BorderRadius.only(
                      bottomLeft: Radius.circular(16),
                      bottomRight: Radius.circular(16),
                    ),
                  ),
                  child: Text(
                    'LEVEL ${achievement.levelOrder}',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  achievement.title,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: dc.textPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  achievement.achievementTitle,
                  style: TextStyle(fontSize: 13, color: dc.textSecondary),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: progressClamped,
                          backgroundColor: dc.border,
                          valueColor: const AlwaysStoppedAnimation(
                            AppColors.accent,
                          ),
                          minHeight: 8,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      '${achievement.levelOrder} / $target',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.accent,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLogoutButton(BuildContext context, AuthController a) {
    return AppButton(label: 'Log out', icon: Icons.logout, onPressed: a.logout);
  }

  Color _getAchievementColor(String id) {
    final colors = [
      const Color(0xFF7C3AED),
      const Color(0xFFEF4444),
      const Color(0xFF10B981),
      const Color(0xFFF59E0B),
      const Color(0xFF3B82F6),
    ];
    return colors[id.hashCode.abs() % colors.length];
  }

  IconData _getAchievementIcon(String id) {
    final icons = [
      Icons.emoji_events,
      Icons.psychology,
      Icons.military_tech,
      Icons.star,
      Icons.local_fire_department,
    ];
    return icons[id.hashCode.abs() % icons.length];
  }
}

class _GamificationStat {
  final Widget icon;
  final String value;
  final String label;
  final Color color;
  const _GamificationStat({
    required this.icon,
    required this.value,
    required this.label,
    required this.color,
  });
}

class _ShareProfileSheet extends StatelessWidget {
  const _ShareProfileSheet({required this.profileUrl});

  final String profileUrl;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(24, 20, 24, 32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Share Profile',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                ),
              ),
              IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.close),
              ),
            ],
          ),
          const SizedBox(height: 20),
          const Text(
            'Share via',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _ShareOption(
                icon: Icons.chat_bubble,
                label: 'WhatsApp',
                color: const Color(0xFF25D366),
                onTap: () => _shareVia('whatsapp', context),
              ),
              _ShareOption(
                icon: Icons.email,
                label: 'Email',
                color: const Color(0xFF4285F4),
                onTap: () => _shareVia('email', context),
              ),
              _ShareOption(
                icon: Icons.chat,
                label: 'Twitter',
                color: const Color(0xFF1DA1F2),
                onTap: () => _shareVia('twitter', context),
              ),
              _ShareOption(
                icon: Icons.facebook,
                label: 'Facebook',
                color: const Color(0xFF1877F2),
                onTap: () => _shareVia('facebook', context),
              ),
            ],
          ),
          const SizedBox(height: 24),
          const Text(
            'Profile Link',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              border: Border.all(color: AppColors.border),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    profileUrl,
                    style: const TextStyle(
                      fontSize: 14,
                      color: AppColors.textPrimary,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () {
                SharePlus.instance.share(
                  ShareParams(text: profileUrl),
                );
                Navigator.pop(context);
                AppSnackbar.success('Profile link copied!');
              },
              icon: const Icon(Icons.copy, size: 18),
              label: const Text('Copy'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.accent,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24),
                ),
                textStyle: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _shareVia(String platform, BuildContext context) {
    final text = 'Check out my profile on Nakhlah! $profileUrl';
    SharePlus.instance.share(ShareParams(text: text));
    Navigator.pop(context);
  }
}

class _ShareOption extends StatelessWidget {
  const _ShareOption({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: Colors.white, size: 28),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

class _AreaChartPainter extends CustomPainter {
  final List<int> data;
  final Color labelColor;
  final Color gridColor;
  final Color dotColor;
  const _AreaChartPainter({
    required this.data,
    required this.labelColor,
    required this.gridColor,
    required this.dotColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final maxValue = 1000.0;
    final labelWidth = 32.0;
    final padding = EdgeInsets.only(
      left: labelWidth,
      right: 8,
      top: 10,
      bottom: 10,
    );
    final chartWidth = size.width - padding.horizontal;
    final chartHeight = size.height - padding.vertical;

    final labelStyle = TextStyle(color: labelColor, fontSize: 11);

    for (int i = 0; i <= 5; i++) {
      final value = (maxValue / 5 * i).toInt();
      final y = padding.top + chartHeight - (chartHeight / 5 * i);

      final painter = TextPainter(
        text: TextSpan(text: '$value', style: labelStyle),
        textDirection: TextDirection.ltr,
        textAlign: TextAlign.right,
      )..layout(maxWidth: labelWidth - 4);
      painter.paint(
        canvas,
        Offset(labelWidth - painter.width - 4, y - painter.height / 2),
      );

      if (i > 0) {
        final gridPaint = Paint()
          ..color = gridColor
          ..strokeWidth = 1;
        canvas.drawLine(
          Offset(labelWidth, y),
          Offset(size.width - 8, y),
          gridPaint,
        );
      }
    }

    final points = <Offset>[];
    for (int i = 0; i < data.length; i++) {
      final x = padding.left + (chartWidth / (data.length - 1)) * i;
      final y = padding.top + chartHeight - (data[i] / maxValue * chartHeight);
      points.add(Offset(x, y));
    }

    final fillPath = Path();
    fillPath.moveTo(points.first.dx, padding.top + chartHeight);
    for (final point in points) {
      fillPath.lineTo(point.dx, point.dy);
    }
    fillPath.lineTo(points.last.dx, padding.top + chartHeight);
    fillPath.close();

    final fillPaint = Paint()
      ..shader = LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          AppColors.accent.withValues(alpha: 0.12),
          AppColors.accent.withValues(alpha: 0.01),
        ],
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height));
    canvas.drawPath(fillPath, fillPaint);

    final linePath = Path();
    linePath.moveTo(points.first.dx, points.first.dy);

    for (int i = 0; i < points.length - 1; i++) {
      final p0 = points[i];
      final p1 = points[i + 1];
      final cp1 = Offset((p0.dx + p1.dx) / 2, p0.dy);
      final cp2 = Offset((p0.dx + p1.dx) / 2, p1.dy);
      linePath.cubicTo(cp1.dx, cp1.dy, cp2.dx, cp2.dy, p1.dx, p1.dy);
    }

    final linePaint = Paint()
      ..color = AppColors.accent
      ..strokeWidth = 2.5
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;
    canvas.drawPath(linePath, linePaint);

    for (final point in points) {
      final pointPaint = Paint()
        ..color = dotColor
        ..style = PaintingStyle.fill;
      final pointBorderPaint = Paint()
        ..color = AppColors.accent
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2;
      canvas.drawCircle(point, 4, pointPaint);
      canvas.drawCircle(point, 4, pointBorderPaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
