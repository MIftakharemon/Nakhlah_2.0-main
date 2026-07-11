import 'dart:math' as math;
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';

import '../../common/app_motion.dart';
import '../../common/empty_state.dart';
import '../../common/loading_state.dart';
import '../../constants/app_theme.dart';
import '../../constants/app_colors.dart';
import '../../controllers/app_controller.dart';
import '../../controllers/content_controller.dart';
import '../../controllers/gamification_controller.dart';
import '../../controllers/profile_controller.dart';
import '../../models/models.dart';
import '../../routes/app_routes.dart';
import '../../widgets/nakhlah_icons.dart';
import '../exercises/exercise_view.dart';
import '../../constants/dark_mode_colors.dart';

const _kLastInteractedNodeIdKey = 'nakhlah:lastInteractedNodeId';

class HomeView extends StatefulWidget {
  const HomeView({super.key});

  @override
  State<HomeView> createState() => _HomeViewState();
}

class _HomeViewState extends State<HomeView> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      Get.find<ProfileController>().load();
      Get.find<ContentController>().loadJourney();
      Get.find<GamificationController>().load();
    });
  }

  @override
  Widget build(BuildContext context) {
    final profile = Get.find<ProfileController>();
    final content = Get.find<ContentController>();
    final gamification = Get.find<GamificationController>();

    return Scaffold(
      backgroundColor: DarkModeColors.of(context).scaffoldBackground,
      body: RefreshIndicator(
        color: const Color(0xFF7D49DF),
        onRefresh: () async {
          await profile.load();
          await gamification.load();
          await content.loadJourney();
        },
        child: LayoutBuilder(
          builder: (context, constraints) {
            final isDesktop = constraints.maxWidth >= 1024;

            if (isDesktop) {
              return _DesktopLayout(
                content: content,
                profile: profile,
                gamification: gamification,
              );
            }

            return _MobileLayout(
              content: content,
              profile: profile,
              gamification: gamification,
            );
          },
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Desktop two-column layout (matches web: main content + sticky sidebar)
// ---------------------------------------------------------------------------
class _DesktopLayout extends StatelessWidget {
  const _DesktopLayout({
    required this.content,
    required this.profile,
    required this.gamification,
  });

  final ContentController content;
  final ProfileController profile;
  final GamificationController gamification;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 720),
              child: _MainContent(
                content: content,
                profile: profile,
                gamification: gamification,
              ),
            ),
          ),
        ),
        SizedBox(
          width: 320,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(0, 24, 24, 24),
            child: _DesktopSidebar(
              gamification: gamification,
              profile: profile,
            ),
          ),
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Desktop sidebar
// ---------------------------------------------------------------------------
class _DesktopSidebar extends StatelessWidget {
  const _DesktopSidebar({
    required this.gamification,
    required this.profile,
  });

  final GamificationController gamification;
  final ProfileController profile;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: EdgeInsets.zero,
      child: Column(
        children: [
          _GlassProfileSectionCard(controller: profile),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Mobile single-column layout
// ---------------------------------------------------------------------------
class _MobileLayout extends StatelessWidget {
  const _MobileLayout({
    required this.content,
    required this.profile,
    required this.gamification,
  });

  final ContentController content;
  final ProfileController profile;
  final GamificationController gamification;

  @override
  Widget build(BuildContext context) {
    return _MainContent(
      content: content,
      profile: profile,
      gamification: gamification,
    );
  }
}

// ---------------------------------------------------------------------------
// Main Content (shared between mobile and desktop)
// ---------------------------------------------------------------------------
class _MainContent extends StatelessWidget {
  const _MainContent({
    required this.content,
    required this.profile,
    required this.gamification,
  });

  final ContentController content;
  final ProfileController profile;
  final GamificationController gamification;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: EdgeInsets.fromLTRB(0.5, MediaQuery.of(context).padding.top + 4, 0.5, 0.1),
          child: Obx(() => _GlassStatsBar(
            streak: gamification.streak.value.currentStreak,
            dates: gamification.stock.value.dateStock,
            palms: gamification.stock.value.palmStock,
            gamification: gamification,
          )),
        ),
        Expanded(
          child: Obx(() {
            // Track profile changes so Obx rebuilds when profile loads
            final _ = profile.profile.value?.currentProgress;

            if (content.loading.value && content.levels.isEmpty) {
              return const Padding(
                padding: EdgeInsets.only(top: 96),
                child: LoadingState(message: 'Loading your journey...'),
              );
            }

            if (content.levels.isEmpty) {
              return const Padding(
                padding: EdgeInsets.all(24),
                child: EmptyState(
                  title: 'No journey found',
                  subtitle: 'Pull down to refresh.',
                ),
              );
            }

            return _LearnDashboard(
              levels: content.levels,
              profile: profile,
              gamification: gamification,
            );
          }),
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Learn Dashboard
// ---------------------------------------------------------------------------
class _LearnDashboard extends StatefulWidget {
  const _LearnDashboard({
    required this.levels,
    required this.profile,
    required this.gamification,
  });

  final List<JourneyLevel> levels;
  final ProfileController profile;
  final GamificationController gamification;

  @override
  State<_LearnDashboard> createState() => _LearnDashboardState();
}

class _LearnDashboardState extends State<_LearnDashboard> {
  final ScrollController _scrollController = ScrollController();
  final ValueNotifier<double> _scrollProgress = ValueNotifier(0.0);
  bool _hasScrolledToResume = false;
  final Map<String, GlobalKey> _nodeKeys = {};

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _scrollToResumePosition();
    });
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    _scrollProgress.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    final maxScroll = _scrollController.position.maxScrollExtent;
    if (maxScroll <= 0) return;
    final progress = (_scrollController.offset / maxScroll).clamp(0.0, 1.0);
    _scrollProgress.value = progress;
  }

  @override
  void didUpdateWidget(covariant _LearnDashboard oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Re-scroll when profile data just arrived
    if (!_hasScrolledToResume) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _scrollToResumePosition();
      });
    } else if (widget.profile.profile.value != null &&
        oldWidget.profile.profile.value == null) {
      _hasScrolledToResume = false;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _scrollToResumePosition();
      });
    }
  }

  void _scrollToResumePosition() {
    if (_hasScrolledToResume) return;
    if (widget.levels.isEmpty) return;
    // Don't scroll until profile data is available
    if (widget.profile.profile.value == null) return;

    final flat = _buildJourneyView(
      widget.levels,
      widget.profile.profile.value?.currentProgress,
    );
    if (flat.nodes.isEmpty) return;

    String? targetId;

    final currentNode = flat.nodes.cast<_PathNodeData?>().firstWhere(
          (n) => n!.isCurrent,
          orElse: () => null,
        );
    if (currentNode != null) targetId = currentNode.apiId;

    if (targetId == null) {
      final box = GetStorage();
      final storedId = box.read<String>(_kLastInteractedNodeIdKey);
      if (storedId != null && flat.nodes.any((n) => n.apiId == storedId)) {
        targetId = storedId;
      }
    }

    if (targetId == null) {
      final firstUnlocked = flat.nodes.cast<_PathNodeData?>().firstWhere(
            (n) => !n!.isLocked,
            orElse: () => null,
          );
      if (firstUnlocked != null) targetId = firstUnlocked.apiId;
    }

    if (targetId == null) return;

    _hasScrolledToResume = true;
    _scrollToNodeId(targetId, retries: 5);
  }

  void _scrollToNodeId(String nodeId, {int retries = 5}) {
    final key = _nodeKeys[nodeId];
    if (key == null) {
      if (retries > 1) {
        Future.delayed(const Duration(milliseconds: 200), () {
          if (mounted) _scrollToNodeId(nodeId, retries: retries - 1);
        });
      }
      return;
    }

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final nodeContext = key.currentContext;
      if (nodeContext != null) {
        Scrollable.ensureVisible(
          nodeContext,
          duration: const Duration(milliseconds: 400),
          curve: Curves.easeInOut,
          alignment: 0.5,
        );
      } else if (retries > 1) {
        Future.delayed(const Duration(milliseconds: 200), () {
          if (mounted) _scrollToNodeId(nodeId, retries: retries - 1);
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final flat = _buildJourneyView(
      widget.levels,
      widget.profile.profile.value?.currentProgress,
    );

    for (final node in flat.nodes) {
      _nodeKeys.putIfAbsent(node.apiId, () => GlobalKey());
    }

    final bg = DarkModeColors.of(context).cardBackground;
    return Stack(
      children: [
        ColoredBox(color: bg),
        // Scroll content — never rebuilds from scroll
        Column(
          children: [
            Expanded(
              child: CustomScrollView(
                controller: _scrollController,
                physics: const AlwaysScrollableScrollPhysics(),
                slivers: [
                  const SliverToBoxAdapter(
                    child: _SectionUnlockerPlaceholder(),
                  ),
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                      child: _ZigzagPath(
                        sections: flat.sections,
                        nodes: flat.nodes,
                        nodeKeys: _nodeKeys,
                      ),
                    ),
                  ),
                  SliverToBoxAdapter(
                    // child: Padding(
                    //   padding: const EdgeInsets.fromLTRB(16, 8, 16, 110),
                    //   child: Column(
                    //     children: [
                    //       _GlassProfileSectionCard(controller: widget.profile),
                    //     ],
                    //   ),
                    // ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  LinearGradient _buildGradient(double progress) {
    // Desert (orange/gold) → Amber → Teal → Midnight blue
    // Matches web: [0, 0.3, 0.6, 1] stops
    if (progress < 0.3) {
      final t = progress / 0.3;
      return LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          _lerpColor(const Color(0xFFFF8C42), const Color(0xFFE8853E), t),
          _lerpColor(const Color(0xFFF5A623), const Color(0xFFD47835), t),
          _lerpColor(const Color(0xFFE8853E), const Color(0xFFB85C2B), t),
        ],
      );
    } else if (progress < 0.6) {
      final t = (progress - 0.3) / 0.3;
      return LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          _lerpColor(const Color(0xFFE8853E), const Color(0xFF4A90A4), t),
          _lerpColor(const Color(0xFFD47835), const Color(0xFF2D5A6B), t),
          _lerpColor(const Color(0xFFB85C2B), const Color(0xFF1A3A4A), t),
        ],
      );
    } else {
      final t = ((progress - 0.6) / 0.4).clamp(0.0, 1.0);
      return LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          _lerpColor(const Color(0xFF4A90A4), const Color(0xFF1A3A4A), t),
          _lerpColor(const Color(0xFF2D5A6B), const Color(0xFF0D2832), t),
          _lerpColor(const Color(0xFF1A3A4A), const Color(0xFF051A20), t),
        ],
      );
    }
  }

  Color _lerpColor(Color a, Color b, double t) {
    return Color.lerp(a, b, t)!;
  }
}

// ---------------------------------------------------------------------------
// Section Unlocker Placeholder
// ---------------------------------------------------------------------------
class _SectionUnlockerPlaceholder extends StatelessWidget {
  const _SectionUnlockerPlaceholder();

  @override
  Widget build(BuildContext context) {
    final dc = DarkModeColors.of(context);
    return Center(
      child: Container(
        margin: const EdgeInsets.only(bottom: 0),
        padding: const EdgeInsets.all(24),
        constraints: const BoxConstraints(maxWidth: 400),
        decoration: BoxDecoration(
          color: dc.cardBackground,
          borderRadius: BorderRadius.circular(12),
        ),
        child: CustomPaint(
          painter: _DashedBorderPainter(
            color: dc.border,
            strokeWidth: 2,
            dashLength: 8,
            gapLength: 0,
            borderRadius: 12,
          ),
          child: Column(
            children: [
              const SizedBox(height: 16),
              Icon(
                Icons.lock_outline_rounded,
                color: dc.textSecondary,
                size: 30,
              ),
              const SizedBox(height: 12),
              Text(
                'Next Section Locked',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: dc.textPrimary,
                ),
              ),
              const SizedBox(height: 12),
              Padding(
                padding: const EdgeInsets.all(12.0),
                child: Text(
                  'Complete the current section to unlock the next one.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    color: dc.textSecondary,
                  ),
                ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}

class _DashedBorderPainter extends CustomPainter {
  _DashedBorderPainter({
    required this.color,
    this.strokeWidth = 2,
    this.dashLength = 8,
    this.gapLength = 5,
    this.borderRadius = 12,
  });

  final Color color;
  final double strokeWidth;
  final double dashLength;
  final double gapLength;
  final double borderRadius;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke;

    final rrect = RRect.fromRectAndRadius(
      Offset.zero & size,
      Radius.circular(borderRadius),
    );
    final path = Path()..addRRect(rrect);
    final metrics = path.computeMetrics().first;
    final totalLength = metrics.length;

    double distance = 0;
    while (distance < totalLength) {
      final start = metrics.getTangentForOffset(distance)!.position;
      final end = distance + dashLength <= totalLength
          ? metrics.getTangentForOffset(distance + dashLength)!.position
          : metrics.getTangentForOffset(totalLength)!.position;
      canvas.drawLine(start, end, paint);
      distance += dashLength + gapLength;
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// ---------------------------------------------------------------------------
// Glass-morphism Stats Bar (matches web bg-white/30 backdrop-blur-md)
// ---------------------------------------------------------------------------
class _GlassStatsBar extends StatelessWidget {
  const _GlassStatsBar({
    required this.streak,
    required this.dates,
    required this.palms,
    required this.gamification,
  });

  final int streak;
  final int dates;
  final int palms;
  final GamificationController gamification;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(14),
      child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF7D49DF), Color(0xFF5B2CB0)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(14),
            boxShadow: const [
              BoxShadow(
                color: Color(0x337D49DF),
                blurRadius: 12,
                offset: Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _HeaderIconValue(
                icon: ActiveStreakIcon(size: 34),
                value: streak,
                onTap: () => _showStreakPopup(context, streak, gamification),
              ),
              _HeaderIconValue(
                icon: DatesIcon(size: 34),
                value: dates,
                onTap: () => _showDatesPopup(context, dates),
              ),
              _HeaderIconValue(
                icon: PalmTreeIcon(size: 34),
                value: palms,
                onTap: () => _showPalmRefillDialog(context, gamification),
              ),
            ],
          ),
        ),
    );
  }

  void _showStreakPopup(
      BuildContext context, int streakCount, GamificationController ctrl) {
    final streakDates = ctrl.streak.value.streakDates;
    final activities = <String, bool>{};
    for (final entry in streakDates) {
      if (entry.status == 'completed') {
        activities[entry.date] = true;
      }
    }

    final today = DateTime.now();
    final days = List.generate(30, (i) {
      return DateTime(today.year, today.month, today.day - (29 - i));
    });

    String dateKey(DateTime d) =>
        '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

    final isToday = DateTime(today.year, today.month, today.day);

    final streakMessage = streakCount > 0
        ? "You're on a $streakCount-day streak."
        : 'Do a lesson today to start a new streak!';

    Get.dialog(
      Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '$streakCount day${streakCount == 1 ? '' : 's'} streak',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                streakMessage,
                style: const TextStyle(
                  fontSize: 13,
                ),
              ),
              const SizedBox(height: 16),
              // Day headers
              GridView.count(
                crossAxisCount: 7,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 6,
                crossAxisSpacing: 6,
                childAspectRatio: 1,
                children: [
                  for (final day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
                    Center(
                      child: Text(
                        day,
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 6),
              // Calendar days grid
              GridView.count(
                crossAxisCount: 7,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 6,
                crossAxisSpacing: 6,
                childAspectRatio: 1,
                children: days.map((date) {
                  final key = dateKey(date);
                  final hasActivity = activities[key] == true;
                  final isDateToday = date == isToday;

                  final bgColor = hasActivity
                      ? null
                      : isDateToday
                          ? null
                          : const Color(0xFFF0F0F0);

                  return Container(
                    decoration: BoxDecoration(
                      color: bgColor,
                      gradient: hasActivity
                          ? const LinearGradient(
                              colors: [Color(0xFFFF9800), Color(0xFFE65100)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            )
                          : null,
                      borderRadius: BorderRadius.circular(8),
                      border: isDateToday && !hasActivity
                          ? Border.all(color: const Color(0xFFFF9800), width: 2)
                          : null,
                    ),
                    child: Center(
                      child: Text(
                        '${date.day}',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: hasActivity
                              ? Colors.white
                              : null,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 12),
              // Legend
              Row(
                children: [
                  Container(
                    width: 12,
                    height: 12,
                    decoration: BoxDecoration(
                      color: const Color(0xFFF0F0F0),
                      borderRadius: BorderRadius.circular(3),
                    ),
                  ),
                  const SizedBox(width: 4),
                  const Text(
                    'No activity',
                    style: TextStyle(fontSize: 11),
                  ),
                  const SizedBox(width: 16),
                  Container(
                    width: 12,
                    height: 12,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFFFF9800), Color(0xFFE65100)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(3),
                    ),
                  ),
                  const SizedBox(width: 4),
                  const Text(
                    'Activity',
                    style: TextStyle(fontSize: 11),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showDatesPopup(BuildContext context, int datesCount) {
    Get.dialog(
      Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const NakhlahTreasureChestIcon(size: 96),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Dates',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'You have $datesCount dates',
                          style: const TextStyle(
                            fontSize: 13,
                          ),
                        ),
                        const SizedBox(height: 8),
                        SizedBox(
                          height: 36,
                          child: ElevatedButton(
                            onPressed: () {
                              Get.back();
                              Get.find<AppController>().setTab(2);
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF7D49DF),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 14),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                            child: const Text(
                              'Go To Shop',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFF7D49DF).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Daily Reward',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    SizedBox(height: 2),
                    Text(
                      'Complete a lesson today to earn extra dates!',
                      style: TextStyle(
                        fontSize: 12,
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

  void _showPalmRefillDialog(
    BuildContext context,
    GamificationController ctrl,
  ) {
    final currentPalms = ctrl.stock.value.palmStock;
    const maxPalms = 5;
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Palm Trees',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w900,
                  color: Theme.of(ctx).colorScheme.onSurface,
                ),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(maxPalms, (i) {
                  final active = i < currentPalms;
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 3),
                    child: Opacity(
                      opacity: active ? 1.0 : 0.3,
                      child: const PalmTreeIcon(size: 28),
                    ),
                  );
                }),
              ),
              const SizedBox(height: 8),
              Text(
                '$currentPalms of $maxPalms remaining',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: Theme.of(ctx).colorScheme.onSurface.withValues(alpha: 0.6),
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: currentPalms >= maxPalms
                      ? null
                      : () async {
                          Navigator.pop(ctx);
                          await ctrl.refillPalm();
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF7D49DF),
                    foregroundColor: Colors.white,
                    disabledBackgroundColor: const Color(0xFFD0D0D0),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: const Text(
                    'Refill Palm Trees',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: Text(
                  'Close',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: Theme.of(ctx).colorScheme.onSurface.withValues(alpha: 0.6),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _HeaderIconValue extends StatelessWidget {
  const _HeaderIconValue({required this.icon, required this.value, this.onTap});

  final Widget icon;
  final int value;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final dc = DarkModeColors.of(context);
    return PressableScale(
      scale: .94,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          color: Colors.transparent,
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
          child: Row(
            children: [
              icon,
              const SizedBox(width: 7),
              Text(
                '$value',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  height: 1,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// ZigzagPath - matches web flex-col-reverse exactly
//
// Web structure:
//   <div className="flex flex-col-reverse">
//     levels.map(level => ...)
//   </div>
//
// levels array = [Level1, Level2, Level3] (ascending)
// flex-col-reverse renders: Level3 at TOP, Level1 at BOTTOM
//
// Flutter Column renders top-to-bottom, so we reverse the array
// to get the same visual: highest at top, Level1 at bottom.
// ---------------------------------------------------------------------------
class _ZigzagPath extends StatelessWidget {
  const _ZigzagPath({
    required this.sections,
    required this.nodes,
    required this.nodeKeys,
  });

  final List<_PathSection> sections;
  final List<_PathNodeData> nodes;
  final Map<String, GlobalKey> nodeKeys;

  @override
  Widget build(BuildContext context) {
    if (nodes.isEmpty) return const SizedBox.shrink();

    final groupedNodes = <String, List<_PathNodeData>>{};
    for (final node in nodes) {
      groupedNodes.putIfAbsent(node.sectionId, () => []).add(node);
    }

    // Web levels array is ascending: [Level1, Level2, Level3]
    // flex-col-reverse puts Level1 at bottom, Level3 at top
    // Flutter Column is top-to-bottom, so we use ascending order:
    // Level1 (first) at top, Level3 (last) at bottom — WRONG!
    //
    // Actually: web flex-col-reverse = FIRST item at BOTTOM
    // So Level1 (first in array) at BOTTOM, Level3 (last) at TOP
    // Flutter Column = FIRST item at TOP
    // So we need DESCENDING order: [Level3, Level2, Level1]
    // This puts Level3 at TOP, Level1 at BOTTOM — matches web!
    final displaySections = sections.toList()
      ..sort((a, b) {
        final cmp = b.levelOrder.compareTo(a.levelOrder);
        if (cmp != 0) return cmp;
        return b.unitOrder.compareTo(a.unitOrder);
      });

    return Column(
      children: [
        for (var sectionIndex = 0;
            sectionIndex < displaySections.length;
            sectionIndex++)
          _SectionPath(
            section: displaySections[sectionIndex],
            nodes: groupedNodes[displaySections[sectionIndex].id] ?? [],
            allNodes: nodes,
            sectionIndex: sectionIndex,
            nodeKeys: nodeKeys,
          ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Section Path - matches web flex-col-reverse exactly
//
// Web structure per level:
//   <div className="flex flex-col-reverse">
//     <GateBanner />        ← first child → BOTTOM (with flex-col-reverse)
//     <div className="flex flex-col-reverse">
//       levelLessons.map()  ← second child → TOP
//     </div>
//   </div>
//
// Inner flex-col-reverse: first lesson at BOTTOM, last at TOP
//
// Flutter Column is top-to-bottom, so:
//   Children = [reversed lessons (highest first), GateBanner (last = bottom)]
// ---------------------------------------------------------------------------
class _SectionPath extends StatelessWidget {
  const _SectionPath({
    required this.section,
    required this.nodes,
    required this.allNodes,
    required this.sectionIndex,
    required this.nodeKeys,
  });

  final _PathSection section;
  final List<_PathNodeData> nodes;
  final List<_PathNodeData> allNodes;
  final int sectionIndex;
  final Map<String, GlobalKey> nodeKeys;

  static const _lessonRowHeight = 112.0;

  @override
  Widget build(BuildContext context) {
    if (nodes.isEmpty) return const SizedBox.shrink();

    final firstCurrent = nodes.any((n) => n.isCurrent);

    // Web inner flex-col-reverse: first task at BOTTOM, last at TOP
    // Flutter Column: first child at TOP, last at BOTTOM
    // So reverse the nodes: highest taskOrder first, taskOrder 1 last
    final displayNodes = nodes.toList()
      ..sort((a, b) => b.taskOrder.compareTo(a.taskOrder));

    return Column(
      children: [
        // Reversed lessons: highest taskOrder at top, task 1 near bottom
        LayoutBuilder(
          builder: (context, constraints) {
            return Stack(
              clipBehavior: Clip.none,
              children: [
                Column(
                  children: [
                    for (var index = 0; index < displayNodes.length; index++)
                      SizedBox(
                        height: _lessonRowHeight,
                        width: double.infinity,
                        child: Stack(
                          clipBehavior: Clip.none,
                          children: [
                            _LessonNodePosition(
                              node: displayNodes[index],
                              globalIndex: allNodes.indexWhere(
                                (n) => n.id == displayNodes[index].id,
                              ),
                              localIndex: index,
                              width: constraints.maxWidth,
                              nodeKey: nodeKeys[displayNodes[index].apiId],
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ],
            );
          },
        ),
        // Gate Banner at bottom (matches web: first child in flex-col-reverse → bottom)
        SizedBox(height: firstCurrent ? 12 : 8),
        _GateBanner(section: section, index: sectionIndex),
        SizedBox(height: firstCurrent ? 34 : 16),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Gate Banner (matches web GateBanner exactly)
// web: <img src={gateSrc} /> + <span class="text-white font-bold text-sm drop-shadow-md">
// ---------------------------------------------------------------------------
class _GateBanner extends StatelessWidget {
  const _GateBanner({required this.section, required this.index});

  final _PathSection section;
  final int index;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SizedBox(
        width: 200,
        child: Stack(
          alignment: Alignment.center,
          children: [
            SvgPicture.asset(
              'assets/nakhlah_web/icons/gate.svg',
              width: 200,
              fit: BoxFit.contain,
            ),
            Positioned(
              top: 32 * 200 / 280,
              left: 200 * 0.20,
              right: 200 * 0.20,
              child: Center(
                child: Text(
                  section.name,
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    height: 4.7,
                    shadows: [
                      Shadow(
                        color: Color(0x66000000),
                        offset: Offset(0, 2),
                        blurRadius: 4,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Lesson Node Position (sine-wave positioning)
// ---------------------------------------------------------------------------
class _LessonNodePosition extends StatelessWidget {
  const _LessonNodePosition({
    required this.node,
    required this.globalIndex,
    required this.localIndex,
    required this.width,
    this.nodeKey,
  });

  final _PathNodeData node;
  final int globalIndex;
  final int localIndex;
  final double width;
  final GlobalKey? nodeKey;

  @override
  Widget build(BuildContext context) {
    final index = globalIndex < 0 ? localIndex : globalIndex;
    final leftPercent = 50 + math.sin(index * .8) * 25;
    final x = width * leftPercent / 100;

    return Positioned(
      left: x - 50,
      top: 0,
      child: PageEnter(
        delay: Duration(milliseconds: 135 * localIndex),
        child: SizedBox(
          key: nodeKey,
          width: 100,
          height: 112,
          child: Stack(
            clipBehavior: Clip.none,
            alignment: Alignment.center,
            children: [
              Positioned(top: 16, left: 0, child: _SvgNode(node: node)),
              if (node.isCurrent)
                const Positioned(
                  top: -26,
                  left: 0,
                  right: 0,
                  child: Center(child: _StartSpeechBubble()),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// SVG Node
// ---------------------------------------------------------------------------
// OLD STONE VERSION (kept for reference — next version may reuse):
//
// class _SvgNode extends StatelessWidget {
//   const _SvgNode({required this.node});
//   final _PathNodeData node;
//   @override
//   Widget build(BuildContext context) {
//     final isTrophy = node.type == _PathNodeType.trophy;
//     String assetPath;
//     if (isTrophy) {
//       assetPath = 'assets/nakhlah_web/icons/mystery_box_locked.svg';
//     } else if (node.isLocked) {
//       assetPath = 'assets/nakhlah_web/icons/Task_locked.svg';
//     } else {
//       assetPath = 'assets/nakhlah_web/icons/Task_unlocked.svg';
//     }
//     return GestureDetector(
//       onTap: node.isLocked ? null : () {
//         final box = GetStorage();
//         box.write(_kLastInteractedNodeIdKey, node.apiId);
//         if (isTrophy) {
//           _showGiftBoxDialog(context, node.apiId, isCompleted: node.isCompleted);
//         } else {
//           _showLessonChooserDialog(context, node.apiId);
//         }
//       },
//       child: PressableScale(
//         scale: node.isLocked ? 1 : .91,
//         child: SizedBox(
//           width: isTrophy ? 80 : 90,
//           height: isTrophy ? 80 : 90,
//           child: SvgPicture.asset(assetPath, fit: BoxFit.contain),
//         ),
//       ),
//     );
//   }
// }
// ---------------------------------------------------------------------------
class _SvgNode extends StatelessWidget {
  const _SvgNode({required this.node});

  final _PathNodeData node;

  static const _starSvg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="#ffffff" d="M29.889 12.472a2.013 2.013 0 0 0-1.6-1.366l-7.187-1.103-3.221-6.834a1.984 1.984 0 0 0-1.807-1.168c-.778 0-1.471.448-1.807 1.166l-3.222 6.837-7.187 1.103a2.016 2.016 0 0 0-1.6 1.366 2.09 2.09 0 0 0 .477 2.13l5.23 5.382-1.236 7.612c-.13.802.194 1.584.847 2.043a1.961 1.961 0 0 0 2.085.111l6.396-3.568 6.431 3.568a1.95 1.95 0 0 0 2.084-.111 2.066 2.066 0 0 0 .847-2.042l-1.236-7.612 5.23-5.382a2.09 2.09 0 0 0 .477-2.13z"/></svg>''';

  @override
  Widget build(BuildContext context) {
    final isTrophy = node.type == _PathNodeType.trophy;

    if (isTrophy) {
      return GestureDetector(
        onTap: node.isLocked
            ? null
            : () {
                final box = GetStorage();
                box.write(_kLastInteractedNodeIdKey, node.apiId);
                _showGiftBoxDialog(context, node.apiId, isCompleted: node.isCompleted);
              },
        child: PressableScale(
          scale: node.isLocked ? 1 : .91,
          child: SizedBox(
            width: 80,
            height: 80,
            child: SvgPicture.asset(
              'assets/nakhlah_web/icons/mystery_box_locked.svg',
              fit: BoxFit.contain,
            ),
          ),
        ),
      );
    }

    Color borderColor, bgColor;
    if (node.isCompleted) {
      borderColor = const Color(0xFFC9A800);
      bgColor = const Color(0xFFEAC931);
    } else if (node.isLocked) {
      borderColor = const Color(0xFF8A8F99);
      bgColor = const Color(0xFFB4B9C2);
    } else {
      borderColor = const Color(0xFF6225E0);
      bgColor = const Color(0xFF7C3AED);
    }

    return GestureDetector(
      onTap: node.isLocked
          ? null
          : () {
              final box = GetStorage();
              box.write(_kLastInteractedNodeIdKey, node.apiId);
              _showLessonChooserDialog(context, node.apiId);
            },
      child: PressableScale(
        scale: node.isLocked ? 1 : .91,
        child: Container(
          width: 76,
          height: 76,
          decoration: BoxDecoration(
            color: borderColor,
            shape: BoxShape.circle,
          ),
          padding: const EdgeInsets.all(4),
          child: Container(
            decoration: BoxDecoration(
              color: bgColor,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: node.isLocked
                  ? const Icon(Icons.lock_rounded, color: Colors.white, size: 30)
                  : SvgPicture.string(
                      _starSvg,
                      width: 42,
                      height: 42,
                    ),
            ),
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Start Speech Bubble (matches web: white bg, accent border, tail)
// ---------------------------------------------------------------------------
class _StartSpeechBubble extends StatelessWidget {
  const _StartSpeechBubble();

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: _BubblePainter(),
      child: const Padding(
        padding: EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        child: Text(
          'START!',
          style: TextStyle(
            color: _WebColors.accent,
            fontSize: 12,
            fontWeight: FontWeight.w900,
            letterSpacing: .9,
          ),
        ),
      ),
    );
  }
}

class _BubblePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;
    final r = 20.0;
    final borderW = 2.0;
    final tailW = 7.0;
    final tailH = 7.0;

    // Full speech-bubble path: rounded rect + triangular tail
    final bubble = Path()
      ..moveTo(r, 0)
      ..lineTo(w - r, 0)
      ..quadraticBezierTo(w, 0, w, r)
      ..lineTo(w, h - r)
      ..quadraticBezierTo(w, h, w - r, h)
      ..lineTo(w / 2 + tailW, h)
      ..lineTo(w / 2, h + tailH)
      ..lineTo(w / 2 - tailW, h)
      ..lineTo(r, h)
      ..quadraticBezierTo(0, h, 0, h - r)
      ..lineTo(0, r)
      ..quadraticBezierTo(0, 0, r, 0)
      ..close();

    // White fill
    canvas.drawPath(bubble, Paint()..color = Colors.white);

    // Purple border
    canvas.drawPath(
      bubble,
      Paint()
        ..color = _WebColors.accent
        ..style = PaintingStyle.stroke
        ..strokeWidth = borderW
        ..strokeJoin = StrokeJoin.round,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// ---------------------------------------------------------------------------
// Glass-morphism Profile Section Card
// ---------------------------------------------------------------------------
class _GlassProfileSectionCard extends StatelessWidget {
  const _GlassProfileSectionCard({required this.controller});

  final ProfileController controller;

  @override
  Widget build(BuildContext context) {
    final dc = DarkModeColors.of(context);
    return _GlassCard(
      child: Obx(() {
        final profile = controller.profile.value;
        final imageUrl = profile?.profilePicture?.absoluteUrl;
        return Row(
          children: [
            CircleAvatar(
              radius: 28,
              backgroundColor: _WebColors.primary,
              backgroundImage:
                  imageUrl == null ? null : NetworkImage(imageUrl),
              child: imageUrl == null
                  ? const Icon(
                      Icons.person_rounded,
                      color: _WebColors.primaryForeground,
                      size: 30,
                    )
                  : null,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    profile?.fullName ?? 'Nakhlah Learner',
                    style: TextStyle(
                      fontSize: 17,
                      color: dc.textPrimary,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${profile?.onboardInfo.goalTime ?? 0} min daily goal',
                    style: TextStyle(
                      color: dc.textSecondary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.chevron_right_rounded,
              color: dc.textSecondary,
            ),
          ],
        );
      }),
    );
  }
}

// ---------------------------------------------------------------------------
// Glass Card (reusable glass-morphism card)
// ---------------------------------------------------------------------------
class _GlassCard extends StatelessWidget {
  const _GlassCard({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: BackdropFilter(
        filter: ui.ImageFilter.blur(sigmaX: 12, sigmaY: 12),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0x4DFFFFFF), // bg-white/30
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: const Color(0x66FFFFFF), // border-white/40
            ),
            boxShadow: const [
              BoxShadow(
                color: Color(0x14000000),
                blurRadius: 8,
                offset: Offset(0, 2),
              ),
            ],
          ),
          child: child,
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Gift Box Dialog
// ---------------------------------------------------------------------------
void _showGiftBoxDialog(BuildContext context, String taskId, {bool isCompleted = false}) {
  showDialog(
    context: context,
    barrierDismissible: true,
    barrierColor: Colors.black54,
    builder: (ctx) => _GiftBoxDialog(taskId: taskId, isCompleted: isCompleted),
  );
}

class _GiftBoxDialog extends StatefulWidget {
  const _GiftBoxDialog({required this.taskId, this.isCompleted = false});
  final String taskId;
  final bool isCompleted;

  @override
  State<_GiftBoxDialog> createState() => _GiftBoxDialogState();
}

class _GiftBoxDialogState extends State<_GiftBoxDialog>
    with SingleTickerProviderStateMixin {
  bool _isClaiming = false;
  bool _hasClaimed = false;
  bool _isGiftAlreadyOpened = false;
  String? _loadError;

  int _datesReceived = 0;
  int _injazReceived = 0;
  List<String> _badgesAdded = [];

  late AnimationController _bounceController;
  late Animation<double> _bounceAnimation;

  @override
  void initState() {
    super.initState();
    _isGiftAlreadyOpened = widget.isCompleted;
    _hasClaimed = widget.isCompleted;

    _bounceController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    );
    _bounceAnimation = Tween<double>(begin: 0, end: -10).animate(
      CurvedAnimation(parent: _bounceController, curve: Curves.easeInOut),
    );
    _bounceController.repeat(reverse: true);

    _checkGiftStatus();
  }

  @override
  void dispose() {
    _bounceController.dispose();
    super.dispose();
  }

  void _checkGiftStatus() {
    try {
      final profile = Get.find<ProfileController>().profile.value;
      if (profile != null && profile.hasOpenedGiftBox(widget.taskId)) {
        setState(() {
          _isGiftAlreadyOpened = true;
          _hasClaimed = true;
        });
      }
    } catch (_) {}
  }

  Future<void> _claimGift() async {
    if (_isClaiming || _hasClaimed || _isGiftAlreadyOpened) return;

    setState(() {
      _isClaiming = true;
      _hasClaimed = true;
    });

    try {
      final content = Get.find<ContentController>();
      final result = await content.service.giftBox(widget.taskId);

      if (result == null) throw Exception('Failed to claim gift box');

      final data = result is Map ? result : <String, dynamic>{};
      setState(() {
        _datesReceived = _parseReward(data, ['datesReceived', 'dateReceived']);
        _injazReceived = _parseReward(data, ['injazReceived', 'InjazReceived']);
        final badges = data['badges'];
        if (badges is Map && badges['added'] is List) {
          _badgesAdded = (badges['added'] as List).map((e) => '$e').toList();
        }
      });

      // Make learner progress for first lesson in this task
      try {
        final lessons = await content.service.lessonsByTask(widget.taskId);
        if (lessons.isNotEmpty) {
          await content.service.makeLearnerProgress(lessons.first.id);
        }
      } catch (_) {}

      // Refresh profile
      await Get.find<ProfileController>().load();

      // Auto close after 2.5 seconds
      Future.delayed(const Duration(milliseconds: 2500), () {
        if (mounted) Navigator.of(context).pop();
      });
    } catch (e) {
      final msg = e.toString();
      if (msg.toLowerCase().contains('gift box already opened')) {
        setState(() {
          _isGiftAlreadyOpened = true;
          _hasClaimed = true;
          _loadError = null;
        });
      } else {
        setState(() {
          _loadError = 'Failed to claim gift. Please try again.';
          _hasClaimed = false;
        });
      }
    } finally {
      setState(() => _isClaiming = false);
    }
  }

  int _parseReward(Map data, List<String> keys) {
    for (final key in keys) {
      final v = data[key];
      if (v is int) return v;
      if (v is String) return int.tryParse(v) ?? 0;
      if (v is num) return v.toInt();
    }
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final String title;
    if (_isGiftAlreadyOpened) {
      title = 'Gift Already Claimed';
    } else if (_hasClaimed) {
      title = 'Gift Claimed!';
    } else {
      title = 'Mystery Gift Box';
    }

    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 400),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: const Color(0xFF7C3AED).withValues(alpha: 0.3), width: 2),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.15),
              blurRadius: 20,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 16),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF7D49DF), Color(0xFF5B2CB0)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.5,
                    ),
                  ),
                  Positioned(
                    right: 12,
                    top: 0,
                    bottom: 0,
                    child: GestureDetector(
                      onTap: () => Navigator.of(context).pop(),
                      child: const Icon(
                        Icons.close,
                        color: Colors.white70,
                        size: 22,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Content
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Error banner
                  if (_loadError != null)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(10),
                      margin: const EdgeInsets.only(bottom: 16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEE2E2),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        _loadError!,
                        style: const TextStyle(
                          color: Color(0xFFDC2626),
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),

                  // Treasure Chest
                  GestureDetector(
                    onTap: _claimGift,
                    child: AnimatedBuilder(
                      animation: _bounceAnimation,
                      builder: (context, child) {
                        final showBounce = !_hasClaimed && !_isGiftAlreadyOpened;
                        return Transform.translate(
                          offset: Offset(0, showBounce ? _bounceAnimation.value : 0),
                          child: child,
                        );
                      },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 400),
                        width: 160,
                        height: 160,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: _isGiftAlreadyOpened
                              ? const Color(0xFFE5E7EB)
                              : _hasClaimed
                                  ? const Color(0xFFFEF3C7)
                                  : const Color(0xFFF3E8FF),
                          boxShadow: _hasClaimed && !_isGiftAlreadyOpened
                              ? [
                                  BoxShadow(
                                    color: const Color(0xFFFBBF24).withValues(alpha: 0.4),
                                    blurRadius: 30,
                                    spreadRadius: 5,
                                  ),
                                ]
                              : [],
                        ),
                        child: Center(
                          child: NakhlahTreasureChestIcon(
                            size: _hasClaimed && !_isGiftAlreadyOpened ? 120 : 100,
                          ),
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Title text
                  Text(
                    _isGiftAlreadyOpened
                        ? 'Already opened!'
                        : _hasClaimed
                            ? 'Awesome!'
                            : 'You found a gift!',
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF1F2937),
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _isGiftAlreadyOpened
                        ? 'You already collected this gift earlier.'
                        : _hasClaimed
                            ? 'Your rewards have been added to your account.'
                            : 'Tap the chest to claim your rewards.',
                    style: const TextStyle(
                      fontSize: 14,
                      color: Color(0xFF6B7280),
                      fontWeight: FontWeight.w600,
                    ),
                    textAlign: TextAlign.center,
                  ),

                  // Rewards display
                  if (_hasClaimed && !_isGiftAlreadyOpened &&
                      (_injazReceived > 0 || _datesReceived > 0 || _badgesAdded.isNotEmpty))
                    Padding(
                      padding: const EdgeInsets.only(top: 24),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (_injazReceived > 0)
                            _RewardItem(
                              text: '+$_injazReceived Injaz',
                              color: const Color(0xFFF59E0B),
                            ),
                          if (_datesReceived > 0)
                            _RewardItem(
                              text: '+$_datesReceived Dates',
                              color: const Color(0xFF0EA5E9),
                            ),
                          if (_badgesAdded.isNotEmpty)
                            _RewardItem(
                              text: '+${_badgesAdded.length} Badge${_badgesAdded.length > 1 ? 's' : ''} Earned',
                              color: const Color(0xFF10B981),
                            ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RewardItem extends StatelessWidget {
  const _RewardItem({required this.text, required this.color});
  final String text;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 22,
          fontWeight: FontWeight.w900,
          color: color,
        ),
        textAlign: TextAlign.center,
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Lesson chooser dialog (preserved exactly from original)
// ---------------------------------------------------------------------------
void _showLessonChooserDialog(BuildContext context, String taskId) {
  final content = Get.find<ContentController>();
  final profileCtrl = Get.find<ProfileController>();
  content.loadLessons(taskId);
  profileCtrl.load();

  showDialog(
    context: context,
    barrierDismissible: true,
    barrierColor: Colors.black54,
    builder: (ctx) {
      return Dialog(
      backgroundColor: Colors.white,
        insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 40),
        child: Container(
          constraints: const BoxConstraints(maxWidth: 420, maxHeight: 580),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surface,
            borderRadius: BorderRadius.circular(24),
          ),
          clipBehavior: Clip.antiAlias,
          child: Obx(() {
            final lessons = [...content.lessons]
              ..sort((a, b) => a.lessonOrder.compareTo(b.lessonOrder));
            final profile = Get.find<ProfileController>().profile.value;
            final progress = profile?.currentProgress;

            final allCompleted = lessons.isNotEmpty &&
                lessons.every((l) => _isLessonCompleted(l, progress));

            final headerSubtitle =
                allCompleted ? 'All lessons unlocked' : 'Start learning';
            final footerText = allCompleted
                ? 'ALL CONTENT IS AVAILABLE TO PRACTICE'
                : 'SELECT AN AVAILABLE BLOCK TO BEGIN';

            return Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.fromLTRB(24, 20, 16, 18),
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Color(0xFF7D49DF), Color(0xFF5B2CB0)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            const Text(
                              'Choose a Lesson',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 20,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              headerSubtitle,
                              style: const TextStyle(
                                color: Colors.white70,
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Material(
                        color: Colors.white.withValues(alpha: .18),
                        shape: const CircleBorder(),
                        clipBehavior: Clip.antiAlias,
                        child: InkWell(
                          onTap: () => Navigator.of(ctx).pop(),
                          child: const SizedBox(
                            width: 36,
                            height: 36,
                            child: Icon(
                              Icons.close_rounded,
                              color: Colors.white,
                              size: 22,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                if (content.loading.value && lessons.isEmpty)
                  const Padding(
                    padding: EdgeInsets.all(48),
                    child: Center(
                      child: CircularProgressIndicator(
                        color: Color(0xFF7D49DF),
                        strokeWidth: 3,
                      ),
                    ),
                  )
                else if (lessons.isEmpty)
                  Padding(
                    padding: const EdgeInsets.all(32),
                    child: Center(
                      child: Text(
                        'No lessons available yet.',
                        style: TextStyle(
                          color: Theme.of(ctx).colorScheme.onSurface.withValues(alpha: 0.6),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  )
                else ...[
                  Flexible(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                      child: GridView.builder(
                        shrinkWrap: true,
                        physics: const AlwaysScrollableScrollPhysics(),
                        gridDelegate:
                            const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          mainAxisSpacing: 12,
                          crossAxisSpacing: 12,
                          childAspectRatio: 0.95,
                        ),
                        itemCount: lessons.length,
                        itemBuilder: (_, i) {
                          final lesson = lessons[i];
                          final completed =
                              _isLessonCompleted(lesson, progress);
                          final available = _isLessonAvailable(
                            lesson,
                            i,
                            lessons,
                            progress,
                          );
                          return _LessonDialogCard(
                            lesson: lesson,
                            completed: completed,
                            locked: !available,
                            taskId: taskId,
                          );
                        },
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(24, 4, 24, 16),
                    child: Text(
                      footerText,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Theme.of(ctx).colorScheme.onSurface.withValues(alpha: 0.6),
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        letterSpacing: .6,
                      ),
                    ),
                  ),
                ],
              ],
            );
          }),
        ),
      );
    },
  );
}

bool _isLessonCompleted(LessonModel lesson, ProgressModel? progress) {
  if (progress == null) return lesson.active;
  final sameTask =
      lesson.levelOrder == progress.levelOrder &&
      lesson.unitOrder == progress.unitOrder &&
      lesson.taskOrder == progress.taskOrder;
  if (sameTask) return lesson.lessonOrder < progress.lessonOrder;
  return lesson.levelOrder < progress.levelOrder ||
      (lesson.levelOrder == progress.levelOrder &&
          lesson.unitOrder < progress.unitOrder) ||
      (lesson.levelOrder == progress.levelOrder &&
          lesson.unitOrder == progress.unitOrder &&
          lesson.taskOrder < progress.taskOrder);
}

bool _isLessonAvailable(
  LessonModel lesson,
  int index,
  List<LessonModel> sortedLessons,
  ProgressModel? progress,
) {
  if (lesson.active) return true;
  if (index == 0) return true;
  for (var i = 0; i < index; i++) {
    if (!_isLessonCompleted(sortedLessons[i], progress)) {
      return false;
    }
  }
  return true;
}

void _showNoPalmDialog(BuildContext context) {
  showDialog(
    context: context,
    builder: (ctx) => Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('\u{1F4A7}', style: TextStyle(fontSize: 64)),
            const SizedBox(height: 20),
            const Text(
              'No Palm Trees left for this lesson',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'Take a short break, refill your Palm Trees, and come back ready to continue the journey.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppColors.textSecondary,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: AppTheme.buttonHeight,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(ctx),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.accent,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius:
                        BorderRadius.circular(AppTheme.buttonRadius),
                  ),
                ),
                child: const Text('Back',
                    style: TextStyle(
                        fontSize: 16, fontWeight: FontWeight.w900)),
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              height: AppTheme.buttonHeight,
              child: OutlinedButton(
                onPressed: () async {
                  Navigator.pop(ctx);
                  final gamCtrl = Get.find<GamificationController>();
                  await gamCtrl.refillPalm();
                },
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.optionBorderDefault),
                  shape: RoundedRectangleBorder(
                    borderRadius:
                        BorderRadius.circular(AppTheme.buttonRadius),
                  ),
                ),
                child: const Text('Refill Palm Trees',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                    )),
              ),
            ),
          ],
        ),
      ),
    ),
  );
}

class _LessonDialogCard extends StatelessWidget {
  const _LessonDialogCard({
    required this.lesson,
    required this.completed,
    required this.locked,
    required this.taskId,
  });

  final LessonModel lesson;
  final bool completed;
  final bool locked;
  final String taskId;

  @override
  Widget build(BuildContext context) {
    final lessonTitle = lesson.title.trim().isNotEmpty
        ? lesson.title
        : lesson.isExam
            ? 'Test ${lesson.lessonOrder.toString().padLeft(2, '0')}'
            : 'Lesson ${lesson.lessonOrder.toString().padLeft(2, '0')}';

    return PressableScale(
      scale: locked ? 1.0 : .95,
      child: GestureDetector(
        onTap: locked
            ? null
            : () {
                final gamCtrl = Get.find<GamificationController>();
                if (gamCtrl.stock.value.palmStock <= 0) {
                  _showNoPalmDialog(context);
                  return;
                }
                Navigator.of(context).pop();
                Get.toNamed(
                  Routes.exercise,
                  arguments: LessonEngineArgs(
                    lessonId: lesson.id,
                    taskId: taskId,
                    isExamLesson: lesson.isExam,
                  ),
                );
              },
        child: Container(
          decoration: BoxDecoration(
            color: locked ? _WebColors.muted : Colors.transparent,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: locked ? _WebColors.border : const Color(0xFFE8D9F8),
              width: 3,
            ),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Stack(
                clipBehavior: Clip.none,
                children: [
                  SizedBox(
                    width: 95,
                    height: 95,
                    child: locked
                        ? ColorFiltered(
                            colorFilter: const ColorFilter.matrix([
                              0.2126, 0.7152, 0.0722, 0, 0,
                              0.2126, 0.7152, 0.0722, 0, 0,
                              0.2126, 0.7152, 0.0722, 0, 0,
                              0, 0, 0, 1, 0,
                            ]),
                            child: SvgPicture.asset(
                              'assets/nakhlah_design/book_svg.svg',
                              fit: BoxFit.contain,
                            ),
                          )
                        : SvgPicture.asset(
                            'assets/nakhlah_design/book_svg.svg',
                            fit: BoxFit.contain,
                          ),
                  ),
                  if (completed)
                    Positioned(
                      top: -10,
                      right: -20,
                      child: Container(
                        width: 20,
                        height: 20,
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F8F1),
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: Colors.green.shade200,
                            width: 2,
                          ),
                        ),
                        child: Icon(
                          Icons.check_rounded,
                          color: Colors.green.shade200,
                          size: 14,
                        ),
                      ),
                    ),
                  if (locked)
                    Positioned(
                      top: -10,
                      right: -20,
                      child: Container(
                        width: 24,
                        height: 24,
                        decoration: BoxDecoration(
                          color: const Color(0xFFF3F4F6),
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: _WebColors.border,
                            width: 2,
                          ),
                        ),
                        child: Icon(
                          Icons.lock_rounded,
                          color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6),
                          size: 12,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 10),
              Text(
                lessonTitle,
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: locked
                      ? Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6)
                      : Theme.of(context).colorScheme.onSurface,
                  height: 1.25,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Journey view builder
// ---------------------------------------------------------------------------
_JourneyFlat _buildJourneyView(
  List<JourneyLevel> journeyLevels,
  ProgressModel? progress,
) {
  final sections = <_PathSection>[];
  final nodes = <_PathNodeData>[];
  final levels = [...journeyLevels]
    ..sort((a, b) => a.levelOrder.compareTo(b.levelOrder));
  final levelOrder = progress?.levelOrder;
  final unitOrder = progress?.unitOrder;
  final taskOrder = progress?.taskOrder;
  final hasProgress =
      levelOrder != null && unitOrder != null && taskOrder != null;

  for (final level in levels) {
    final units = [...level.units]
      ..sort((a, b) => a.unitOrder.compareTo(b.unitOrder));
    for (final unit in units) {
      final sectionId = '${level.id}-${unit.id}';
      final isEarlierLevel = hasProgress && level.levelOrder < levelOrder;
      final isCurrentLevel = hasProgress && level.levelOrder == levelOrder;
      final isEarlierUnitInCurrentLevel =
          hasProgress && isCurrentLevel && unit.unitOrder < unitOrder;
      final isEarlierUnit = isEarlierLevel || isEarlierUnitInCurrentLevel;
      final isCurrentUnit =
          hasProgress && isCurrentLevel && unit.unitOrder == unitOrder;
      final unitUnlocked =
          !hasProgress ||
          isEarlierUnit ||
          isCurrentUnit ||
          unit.active ||
          level.active;
      final unitLocked = !unitUnlocked;

      sections.add(
        _PathSection(
          id: sectionId,
          name: unit.title,
          unitOrder: unit.unitOrder,
          levelOrder: level.levelOrder,
          levelName: level.title,
          colorIndex: level.levelOrder,
        ),
      );

      final tasks = [...unit.tasks]
        ..sort((a, b) => a.taskOrder.compareTo(b.taskOrder));
      final lastActiveIndex = tasks.lastIndexWhere((task) => task.active);
      for (var index = 0; index < tasks.length; index++) {
        final task = tasks[index];
        final hasTaskProgress = lastActiveIndex >= 0;
        final isEarlierTaskInCurrentUnit =
            hasProgress && isCurrentUnit && task.taskOrder < taskOrder;
        final isCurrentTask =
            hasProgress && isCurrentUnit && task.taskOrder == taskOrder;
        var isCompleted =
            (hasProgress && (isEarlierUnit || isEarlierTaskInCurrentUnit)) ||
            (!hasProgress && hasTaskProgress && index < lastActiveIndex);
        var isCurrent =
            (hasProgress && isCurrentTask) ||
            (!hasProgress && hasTaskProgress && index == lastActiveIndex);

        if (!hasProgress && !hasTaskProgress && !unitLocked && index == 0) {
          isCurrent = true;
        }
        if (task.active && !isCurrent) isCompleted = true;
        var isLocked =
            unitLocked || (!task.active && !isCurrent && !isCompleted);
        if (unitLocked) {
          isCurrent = false;
          isCompleted = false;
          isLocked = true;
        }

        nodes.add(
          _PathNodeData(
            id: '$sectionId-${task.id}',
            apiId: task.id,
            type: task.giftBox ? _PathNodeType.trophy : _PathNodeType.lesson,
            title: task.title,
            sectionId: sectionId,
            isCompleted: isCompleted,
            isCurrent: isCurrent,
            isLocked: isLocked,
            level: unit.unitOrder,
            taskOrder: task.taskOrder,
          ),
        );
      }
    }
  }

  if (nodes.isNotEmpty && !nodes.any((n) => n.isCurrent || !n.isLocked)) {
    nodes[0] = nodes[0].copyWith(isCurrent: true, isLocked: false);
  }

  return _JourneyFlat(sections: sections, nodes: nodes);
}

// ---------------------------------------------------------------------------
// Data models
// ---------------------------------------------------------------------------
class _JourneyFlat {
  _JourneyFlat({required this.sections, required this.nodes});
  final List<_PathSection> sections;
  final List<_PathNodeData> nodes;
}

class _PathSection {
  _PathSection({
    required this.id,
    required this.name,
    required this.unitOrder,
    required this.levelOrder,
    required this.levelName,
    required this.colorIndex,
  });
  final String id;
  final String name;
  final int unitOrder;
  final int levelOrder;
  final String levelName;
  final int colorIndex;
}

enum _PathNodeType { lesson, trophy }

class _PathNodeData {
  _PathNodeData({
    required this.id,
    required this.apiId,
    required this.type,
    required this.title,
    required this.sectionId,
    required this.isCompleted,
    required this.isCurrent,
    required this.isLocked,
    required this.level,
    required this.taskOrder,
  });
  final String id;
  final String apiId;
  final _PathNodeType type;
  final String title;
  final String sectionId;
  final bool isCompleted;
  final bool isCurrent;
  final bool isLocked;
  final int level;
  final int taskOrder;

  _PathNodeData copyWith({bool? isCurrent, bool? isLocked}) => _PathNodeData(
    id: id,
    apiId: apiId,
    type: type,
    title: title,
    sectionId: sectionId,
    isCompleted: isCompleted,
    isCurrent: isCurrent ?? this.isCurrent,
    isLocked: isLocked ?? this.isLocked,
    level: level,
    taskOrder: taskOrder,
  );
}

// ---------------------------------------------------------------------------
// Color system (exact values from web globals.css CSS variables)
// ---------------------------------------------------------------------------
class _WebColors {
  const _WebColors._();

  // --primary: 42 55% 78% = #E5D09F
  static const primary = Color(0xFFE5D09F);
  // --primary-foreground: 30 40% 20% = #47331F
  static const primaryForeground = Color(0xFF47331F);
  // --accent: 263 70% 58% = #7D49DF
  static const accent = Color(0xFF7D49DF);
  // --foreground: 30 25% 15% = #30261D
  static const foreground = Color(0xFF30261D);
  // --card: 40 40% 98% = #FCFAF6
  static const card = Color(0xFFFCFAF6);
  // --muted: 40 20% 90% = #EAE5DB
  static const muted = Color(0xFFEAE5DB);
  // --muted-foreground: 30 15% 45% = #846F61
  static const mutedForeground = Color(0xFF846F61);
  // --border: 40 25% 85% = #E2D8C9
  static const border = Color(0xFFE2D8C9);
}
