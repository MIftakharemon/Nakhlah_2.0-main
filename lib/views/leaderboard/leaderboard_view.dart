import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:fl_chart/fl_chart.dart';

import '../../common/empty_state.dart';
import '../../common/loading_state.dart';
import '../../constants/app_colors.dart';
import '../../constants/dark_mode_colors.dart';
import '../../controllers/profile_controller.dart';
import '../../models/models.dart';

// ─── Gradient color palette (matches website LEADERBOARD_COLORS) ──────────────

const _gradients = [
  [Color(0xFFA855F7), Color(0xFFEC4899)], // purple-500 to pink-500
  [Color(0xFF10B981), Color(0xFF06B6D4)], // primary to accent
  [Color(0xFFF97316), Color(0xFFEF4444)], // orange-500 to red-500
  [Color(0xFF22C55E), Color(0xFF10B981)], // green-500 to emerald-500
  [Color(0xFF8B5CF6), Color(0xFFA855F7)], // violet-500 to purple-500
  [Color(0xFFF59E0B), Color(0xFFF97316)], // amber-500 to orange-500
  [Color(0xFF14B8A6), Color(0xFF06B6D4)], // teal-500 to cyan-500
  [Color(0xFFF43F5E), Color(0xFFEC4899)], // rose-500 to pink-500
];

List<Color> _gradientFor(int index) {
  return _gradients[index % _gradients.length];
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN LEADERBOARD VIEW
// ═══════════════════════════════════════════════════════════════════════════════

class LeaderboardView extends StatefulWidget {
  const LeaderboardView({super.key});

  @override
  State<LeaderboardView> createState() => _LeaderboardViewState();
}

class _LeaderboardViewState extends State<LeaderboardView> {
  final ProfileController controller = Get.find<ProfileController>();
  bool _showProfile = false;
  LeaderboardEntryModel? _selectedUser;

  @override
  void initState() {
    super.initState();
    controller.loadLeaderboard();
  }

  void _viewProfile(LeaderboardEntryModel user) {
    setState(() {
      _selectedUser = user;
      _showProfile = true;
    });
  }

  void _backToLeaderboard() {
    setState(() {
      _showProfile = false;
      _selectedUser = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 300),
      child: _showProfile && _selectedUser != null
          ? UserProfilePage(
              key: const ValueKey('profile'),
              user: _selectedUser!,
              onBack: _backToLeaderboard,
            )
          : _LeaderboardList(
              key: const ValueKey('list'),
              controller: controller,
              onViewProfile: _viewProfile,
            ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LEADERBOARD LIST
// ═══════════════════════════════════════════════════════════════════════════════

class _LeaderboardList extends StatelessWidget {
  const _LeaderboardList({
    super.key,
    required this.controller,
    required this.onViewProfile,
  });

  final ProfileController controller;
  final void Function(LeaderboardEntryModel) onViewProfile;

  @override
  Widget build(BuildContext context) {
    final dc = DarkModeColors.of(context);
    return Scaffold(
      backgroundColor: dc.cardBackground,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Header ─────────────────────────────────────────────
              Row(
                children: [
                   Text(
                    'Leaderboard',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.w900,
                          color: dc.textPrimary,
                          fontSize: 28,
                        ),
                  ),
                  const SizedBox(width: 10),
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: dc.surfaceBackground,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(
                      Icons.emoji_events_rounded,
                      color: AppColors.date,
                      size: 22,
                    ),
                  ),
                  const Spacer(),
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: IconButton(
                      onPressed: () {},
                      icon: Icon(
                        Icons.search_rounded,
                        color: AppColors.muted,
                        size: 22,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),

              // ── Top 3 Podium ──────────────────────────────────────
              Obx(() {
                final entries = controller.leaderboard.toList();
                if (controller.loading.value && entries.isEmpty) {
                  return const Padding(
                    padding: EdgeInsets.symmetric(vertical: 60),
                    child: LoadingState(message: 'Loading leaderboard...'),
                  );
                }
                if (entries.isEmpty) {
                  return const Padding(
                    padding: EdgeInsets.symmetric(vertical: 60),
                    child: EmptyState(
                      icon: Icons.leaderboard_rounded,
                      title: 'No leaderboard data yet',
                      subtitle: 'Rankings will appear after learners earn Injaz.',
                    ),
                  );
                }

                final topThree = entries.take(3).toList();
                final remaining = entries.skip(3).toList();

                return Column(
                  children: [
                    if (topThree.length >= 3)
                      _Podium(
                        entries: topThree,
                        onTap: onViewProfile,
                      ),
                    const SizedBox(height: 24),

                    // ── Remaining list ──────────────────────────────
                    ...remaining.asMap().entries.map((e) {
                      final index = e.key;
                      final entry = e.value;
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: _LeaderboardRow(
                          entry: entry,
                          colorIndex: index + 3,
                          onTap: () => onViewProfile(entry),
                        ),
                      );
                    }),
                    const SizedBox(height: 20),
                  ],
                );
              }),
            ],
          ),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PODIUM — horizontal layout matching website (2nd | 1st | 3rd)
// ═══════════════════════════════════════════════════════════════════════════════

class _Podium extends StatelessWidget {
  const _Podium({required this.entries, required this.onTap});

  final List<LeaderboardEntryModel> entries;
  final void Function(LeaderboardEntryModel) onTap;

  @override
  Widget build(BuildContext context) {
    final second = entries[1];
    final first = entries[0];
    final third = entries[2];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          // ── 2nd Place ──────────────────────────────────────────
          Expanded(
            child: GestureDetector(
              onTap: () => onTap(second),
              child: Column(
                children: [
                  _PodiumAvatar(entry: second, size: 72, colorIndex: 1),
                  const SizedBox(height: 8),
                  _NameCard(entry: second),
                  const SizedBox(height: 8),
                  _PodiumBlock(place: 2, height: 88, color: Colors.grey.shade300),
                ],
              ),
            ),
          ),
          const SizedBox(width: 12),

          // ── 1st Place (elevated) ───────────────────────────────
          Expanded(
            child: GestureDetector(
              onTap: () => onTap(first),
              child: Column(
                children: [
                  _PodiumAvatar(entry: first, size: 88, colorIndex: 0),
                  const SizedBox(height: 8),
                  _NameCard(entry: first, large: true),
                  const SizedBox(height: 8),
                  _PodiumBlock(place: 1, height: 120, color: const Color(0xFF8B5CF6)),
                ],
              ),
            ),
          ),
          const SizedBox(width: 12),

          // ── 3rd Place ──────────────────────────────────────────
          Expanded(
            child: GestureDetector(
              onTap: () => onTap(third),
              child: Column(
                children: [
                  _PodiumAvatar(entry: third, size: 72, colorIndex: 2),
                  const SizedBox(height: 8),
                  _NameCard(entry: third),
                  const SizedBox(height: 8),
                  _PodiumBlock(place: 3, height: 68, color: const Color(0xFFD97706)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _PodiumAvatar extends StatelessWidget {
  const _PodiumAvatar({
    required this.entry,
    required this.size,
    required this.colorIndex,
  });

  final LeaderboardEntryModel entry;
  final double size;
  final int colorIndex;

  @override
  Widget build(BuildContext context) {
    final colors = _gradientFor(colorIndex);
    final imageUrl = entry.absolutePictureUrl;

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: colors,
        ),
        border: Border.all(color: Colors.white, width: 4),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: .12),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: ClipOval(
        child: imageUrl != null && imageUrl.isNotEmpty
            ? Image.network(
                imageUrl,
                fit: BoxFit.cover,
                errorBuilder: (_, a, b) => _initials(entry, size),
              )
            : _initials(entry, size),
      ),
    );
  }

  Widget _initials(LeaderboardEntryModel entry, double size) {
    return Center(
      child: Text(
        entry.initials,
        style: TextStyle(
          color: Colors.white,
          fontSize: size * 0.32,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}

class _NameCard extends StatelessWidget {
  const _NameCard({required this.entry, this.large = false});

  final LeaderboardEntryModel entry;
  final bool large;

  @override
  Widget build(BuildContext context) {
    final dc = DarkModeColors.of(context);
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(
        horizontal: large ? 14 : 10,
        vertical: large ? 12 : 10,
      ),
      decoration: BoxDecoration(
        color: dc.cardBackground,
        borderRadius: BorderRadius.circular(16),
        border: large
            ? Border.all(color: const Color(0xFF8B5CF6).withValues(alpha: .2), width: 1.5)
            : null,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: .06),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            entry.fullName,
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: large ? 14 : 12,
              color: dc.textPrimary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '${entry.injazCount} Injaz',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: const Color(0xFF8B5CF6),
              fontWeight: FontWeight.w800,
              fontSize: large ? 18 : 14,
            ),
          ),
        ],
      ),
    );
  }
}

class _PodiumBlock extends StatelessWidget {
  const _PodiumBlock({
    required this.place,
    required this.height,
    required this.color,
  });

  final int place;
  final double height;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      width: double.infinity,
      decoration: BoxDecoration(
        color: color,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
        boxShadow: [
          BoxShadow(
            color: color.withValues(alpha: .3),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Center(
        child: Text(
          '$place',
          style: TextStyle(
            fontSize: place == 1 ? 40 : 32,
            color: Colors.white.withValues(alpha: .85),
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LEADERBOARD ROW — for entries after top 3
// ═══════════════════════════════════════════════════════════════════════════════

class _LeaderboardRow extends StatelessWidget {
  const _LeaderboardRow({
    required this.entry,
    required this.colorIndex,
    required this.onTap,
  });

  final LeaderboardEntryModel entry;
  final int colorIndex;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final dc = DarkModeColors.of(context);
    final colors = _gradientFor(colorIndex);
    final imageUrl = entry.absolutePictureUrl;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            color: dc.cardBackground,
            borderRadius: BorderRadius.circular(20),
            border: entry.isCurrentUser
                ? Border.all(color: const Color(0xFF8B5CF6), width: 2)
                : Border.all(color: dc.border),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: .04),
                blurRadius: 10,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            children: [
              // Rank
              SizedBox(
                width: 28,
                child: Text(
                  '${entry.rank}',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: dc.textMuted,
                  ),
                ),
              ),
              const SizedBox(width: 12),

              // Avatar
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: colors,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: colors[0].withValues(alpha: .3),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: ClipOval(
                  child: imageUrl != null && imageUrl.isNotEmpty
                      ? Image.network(imageUrl, fit: BoxFit.cover,
                          errorBuilder: (_, a, b) =>
                              Center(child: Text(entry.initials,
                                style: const TextStyle(color: Colors.white,
                                  fontWeight: FontWeight.w700, fontSize: 16))))
                      : Center(
                          child: Text(
                            entry.initials,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                              fontSize: 16,
                            ),
                          ),
                        ),
                ),
              ),
              const SizedBox(width: 14),

              // Name + Injaz
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      entry.fullName,
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: entry.isCurrentUser
                            ? const Color(0xFF8B5CF6)
                            : dc.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${entry.injazCount} Injaz',
                      style: TextStyle(fontSize: 13, color: dc.textMuted),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// USER PROFILE PAGE — full page matching website UserProfile.jsx
// ═══════════════════════════════════════════════════════════════════════════════

class UserProfilePage extends StatelessWidget {
  const UserProfilePage({
    super.key,
    required this.user,
    required this.onBack,
  });

  final LeaderboardEntryModel user;
  final VoidCallback onBack;

  @override
  Widget build(BuildContext context) {
    final dc = DarkModeColors.of(context);
    final colors = _gradientFor(user.rank - 1);

    // Weekly activity mock data (matches website)
    final injazData = [
      _DayInjaz('Mon', 650),
      _DayInjaz('Tue', 780),
      _DayInjaz('Wed', 920),
      _DayInjaz('Thu', 850),
      _DayInjaz('Fri', 890),
      _DayInjaz('Sat', 1020),
      _DayInjaz('Sun', user.injazCount),
    ];

    return Scaffold(
      backgroundColor: dc.cardBackground,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
          child: Column(
            children: [
              // ── Back button ────────────────────────────────────
              Align(
                alignment: Alignment.centerLeft,
                child: GestureDetector(
                  onTap: onBack,
                  child: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(
                      Icons.chevron_left_rounded,
                      color: AppColors.ink,
                      size: 28,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // ── Profile Card ───────────────────────────────────
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: dc.cardBackground,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: dc.border),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: .05),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    // Avatar with rank badge
                    Stack(
                      clipBehavior: Clip.none,
                      children: [
                        Container(
                          width: 100,
                          height: 100,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: colors,
                            ),
                            border: Border.all(color: Colors.white, width: 4),
                          ),
                          child: ClipOval(
                            child: user.absolutePictureUrl != null &&
                                    user.absolutePictureUrl!.isNotEmpty
                                ? Image.network(
                                    user.absolutePictureUrl!,
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, a, b) =>
                                        _profileInitials(user, 100),
                                  )
                                : _profileInitials(user, 100),
                          ),
                        ),
                        Positioned(
                          bottom: -6,
                          right: -6,
                          child: Container(
                            width: 36,
                            height: 36,
                            decoration: BoxDecoration(
                              color: const Color(0xFF8B5CF6),
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 3),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: .15),
                                  blurRadius: 8,
                                ),
                              ],
                            ),
                            child: Center(
                              child: Text(
                                '${user.rank}',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w900,
                                  fontSize: 14,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Name
                    Text(
                      user.fullName,
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: dc.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 6),

                    // Email
                    if (user.email != null && user.email!.isNotEmpty)
                      Text(
                        user.email!,
                        style: TextStyle(
                          fontSize: 14,
                          color: dc.textMuted,
                        ),
                      ),
                    const SizedBox(height: 20),

                    // Stats row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _ProfileStat(value: '${user.injazCount}', label: 'lifetime Injaz'),
                        _ProfileStat(value: '#${user.rank}', label: 'rank'),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Follow + Message buttons
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () {},
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF8B5CF6),
                              foregroundColor: Colors.white,
                              minimumSize: const Size.fromHeight(48),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                              elevation: 0,
                            ),
                            child: const Text(
                              'Follow',
                              style: TextStyle(
                                fontWeight: FontWeight.w700,
                                fontSize: 15,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () {},
                            style: OutlinedButton.styleFrom(
                              minimumSize: const Size.fromHeight(48),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                              side: BorderSide(
                                color: Colors.grey.shade300,
                                width: 2,
                              ),
                            ),
                            child: Text(
                              'Message',
                              style: TextStyle(
                                fontWeight: FontWeight.w700,
                                fontSize: 15,
                                color: dc.textPrimary,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // ── Weekly Activity Chart ──────────────────────────
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: dc.cardBackground,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: dc.border),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: .05),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Weekly Activity',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${user.injazCount} Injaz',
                      style: const TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF8B5CF6),
                      ),
                    ),
                    const SizedBox(height: 20),
                    SizedBox(
                      height: 200,
                      child: LineChart(
                        LineChartData(
                          gridData: const FlGridData(show: false),
                          titlesData: FlTitlesData(
                            leftTitles: const AxisTitles(
                              sideTitles: SideTitles(showTitles: false),
                            ),
                            rightTitles: const AxisTitles(
                              sideTitles: SideTitles(showTitles: false),
                            ),
                            topTitles: const AxisTitles(
                              sideTitles: SideTitles(showTitles: false),
                            ),
                            bottomTitles: AxisTitles(
                              sideTitles: SideTitles(
                                showTitles: true,
                                reservedSize: 30,
                                getTitlesWidget: (value, meta) {
                                  final idx = value.toInt();
                                  if (idx >= 0 && idx < injazData.length) {
                                    return Padding(
                                      padding: const EdgeInsets.only(top: 8),
                                      child: Text(
                                        injazData[idx].day,
                                        style: TextStyle(
                                          color: dc.textMuted,
                                          fontSize: 12,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    );
                                  }
                                  return const SizedBox.shrink();
                                },
                              ),
                            ),
                          ),
                          borderData: FlBorderData(show: false),
                          lineBarsData: [
                            LineChartBarData(
                              spots: injazData
                                  .asMap()
                                  .entries
                                  .map((e) => FlSpot(
                                        e.key.toDouble(),
                                        e.value.injaz.toDouble(),
                                      ))
                                  .toList(),
                              isCurved: true,
                              gradient: const LinearGradient(
                                colors: [Color(0xFF8B5CF6), Color(0xFFEC4899)],
                              ),
                              barWidth: 4,
                              dotData: const FlDotData(show: false),
                              belowBarData: BarAreaData(
                                show: true,
                                gradient: LinearGradient(
                                  begin: Alignment.topCenter,
                                  end: Alignment.bottomCenter,
                                  colors: [
                                    const Color(0xFF8B5CF6).withValues(alpha: .15),
                                    const Color(0xFFEC4899).withValues(alpha: .02),
                                  ],
                                ),
                              ),
                            ),
                          ],
                          minY: 0,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _profileInitials(LeaderboardEntryModel entry, double size) {
    return Center(
      child: Text(
        entry.initials,
        style: TextStyle(
          color: Colors.white,
          fontSize: size * 0.3,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}

class _ProfileStat extends StatelessWidget {
  const _ProfileStat({required this.value, required this.label});

  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    final dc = DarkModeColors.of(context);
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w900,
            color: Color(0xFF8B5CF6),
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: dc.textMuted,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}

class _DayInjaz {
  const _DayInjaz(this.day, this.injaz);
  final String day;
  final int injaz;
}
