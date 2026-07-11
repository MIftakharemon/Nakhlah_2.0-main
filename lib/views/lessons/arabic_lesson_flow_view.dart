import 'dart:async';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:just_audio/just_audio.dart';

import '../../common/app_snackbar.dart';
import '../../common/nakhlah_mascot.dart';
import '../../constants/app_colors.dart';
import '../../constants/app_theme.dart';
import '../../controllers/content_controller.dart';
import '../../services/api_service.dart';

class ArabicLessonFlowView extends StatefulWidget {
  const ArabicLessonFlowView({super.key});

  @override
  State<ArabicLessonFlowView> createState() => _ArabicLessonFlowViewState();
}

class _ArabicLessonFlowViewState extends State<ArabicLessonFlowView> {
  int currentStepIndex = 0;
  int _elapsedSeconds = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    Get.find<ContentController>().resetLessonState();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _elapsedSeconds++);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String get _timerText {
    final minutes = (_elapsedSeconds ~/ 60).toString().padLeft(2, '0');
    final seconds = (_elapsedSeconds % 60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  void _goToStep(int stepIndex) {
    setState(() => currentStepIndex = stepIndex);
    final controller = Get.find<ContentController>();
    controller.currentStepIndex = stepIndex;
    controller.update();
  }

  void _goHome() {
    Get.find<ContentController>().resetLessonState();
    Get.until((route) => route.isFirst);
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      child: AnimatedSwitcher(
        duration: const Duration(milliseconds: 220),
        child: _buildCurrentStep(),
      ),
    );
  }

  Widget _buildCurrentStep() {
    switch (currentStepIndex) {
      case 0:
        return LessonLearnStepWidget(
          key: const ValueKey('learn_0'),
          badgeText: '01',
          arabicText: 'اَلسَّلَامُ عَلَيْكُمْ',
          englishText: 'Assalamu Alaykum',
          imagePath: _Assets.man,
          currentStepIndex: currentStepIndex,
          timerText: _timerText,
          onClose: _goHome,
          onContinue: () => _goToStep(1),
          onSkip: () => _goToStep(1),
        );
      case 1:
        return LessonMCQStepWidget(
          key: const ValueKey('mcq_1'),
          question:
              'What does the speaker say in response to As-salamu Alaykum?',
          options: const ['وعليكم السلام', 'السلام عليكم', 'اسمي', 'كيف حالك؟'],
          correctIndex: 0,
          imagePath: _Assets.man,
          currentStepIndex: currentStepIndex,
          timerText: _timerText,
          onClose: _goHome,
          onContinue: () => _goToStep(2),
          onSkip: () => _goToStep(2),
        );
      case 2:
        return LessonMCQStepWidget(
          key: const ValueKey('mcq_2'),
          question:
              'What does the speaker say in response to As-salamu Alaykum?',
          options: const ['وعليكم السلام', 'السلام عليكم', 'اسمي', 'كيف حالك؟'],
          correctIndex: 0,
          imagePath: _Assets.man,
          currentStepIndex: currentStepIndex,
          timerText: _timerText,
          onClose: _goHome,
          onContinue: () => _goToStep(3),
          onSkip: () => _goToStep(3),
        );
      case 3:
        return LessonLearnStepWidget(
          key: const ValueKey('learn_3'),
          useSpeakerBadge: true,
          arabicText: 'اِسْمِي',
          englishText: 'My name is',
          imagePath: _Assets.manWoman,
          currentStepIndex: currentStepIndex,
          timerText: _timerText,
          onClose: _goHome,
          onContinue: () => _goToStep(4),
          onSkip: () => _goToStep(4),
        );
      case 4:
        return LessonMCQStepWidget(
          key: const ValueKey('mcq_4'),
          question: 'What does the speaker say?',
          options: const [
            'How are you?',
            'My name is Muhammad',
            'I am fine',
            'Hello',
          ],
          correctIndex: 1,
          imagePath: _Assets.manWoman,
          currentStepIndex: currentStepIndex,
          timerText: _timerText,
          onClose: _goHome,
          onContinue: () => _goToStep(5),
          onSkip: () => _goToStep(5),
        );
      case 5:
        return LessonMCQStepWidget(
          key: const ValueKey('mcq_5'),
          question: 'What does the speaker say?',
          options: const [
            'How are you?',
            'My name is Fatima',
            'I am fine',
            'Hello',
          ],
          correctIndex: 1,
          imagePath: _Assets.manWoman,
          currentStepIndex: currentStepIndex,
          timerText: _timerText,
          onClose: _goHome,
          onContinue: () => _goToStep(6),
          onSkip: () => _goToStep(6),
        );
      case 6:
        return LessonLearnStepWidget(
          key: const ValueKey('learn_6'),
          useSpeakerBadge: true,
          arabicText: 'كَيْفَ حَالُكَ؟',
          englishText: 'How are you? (addressing a male)',
          imagePath: _Assets.manWoman,
          currentStepIndex: currentStepIndex,
          timerText: _timerText,
          onClose: _goHome,
          onContinue: () => _goToStep(7),
          onSkip: () => _goToStep(7),
        );
      case 7:
        return LessonWriteStepWidget(
          key: const ValueKey('write_7'),
          currentStepIndex: currentStepIndex,
          timerText: _timerText,
          onClose: _goHome,
          onContinue: () => _goToStep(8),
        );
      case 8:
        return LessonMatchStepWidget(
          key: const ValueKey('match_8'),
          currentStepIndex: currentStepIndex,
          timerText: _timerText,
          onClose: _goHome,
          onCheckAnswer: () => _goToStep(10),
          onSkip: () => _goToStep(9),
        );
      case 9:
        return LessonMatchStepWidget(
          key: const ValueKey('match_9_all_matched'),
          currentStepIndex: currentStepIndex,
          timerText: _timerText,
          initiallyMatched: true,
          onClose: _goHome,
          onCheckAnswer: () => _goToStep(10),
          onSkip: () => _goToStep(10),
        );
      case 10:
        return LessonMatchResultStepWidget(
          key: const ValueKey('match_result_10'),
          currentStepIndex: currentStepIndex,
          timerText: _timerText,
          onClose: _goHome,
          onContinue: () => _goToStep(11),
        );
      case 11:
        return LessonCompleteStepWidget(
          key: const ValueKey('complete_11'),
          onContinue: () => _goToStep(12),
        );
      case 12:
        return DailyMissionStepWidget(
          key: const ValueKey('mission_12'),
          onContinue: _goHome,
        );
      default:
        return DailyMissionStepWidget(
          key: const ValueKey('mission_default'),
          onContinue: _goHome,
        );
    }
  }
}

class _Assets {
  static const man = 'assets/nakhlah_web/assalamu_alaykum.webp';
  static const manWoman = 'assets/nakhlah_web/my_name.webp';
  // mascot now uses NakhlahMascot widget
}

String? _audioUrlForLessonStep(int stepIndex) {
  if (!Get.isRegistered<ContentController>()) return null;

  final controller = Get.find<ContentController>();
  if (stepIndex >= 0 && stepIndex < controller.questions.length) {
    final questionAudioUrl = controller.questions[stepIndex].audioUrl;
    if (questionAudioUrl != null && questionAudioUrl.trim().isNotEmpty) {
      return questionAudioUrl;
    }
  }

  final lessonAudioUrl = controller.currentLesson?.audioUrl;
  return lessonAudioUrl != null && lessonAudioUrl.trim().isNotEmpty
      ? lessonAudioUrl
      : null;
}

class LessonLearnStepWidget extends StatelessWidget {
  const LessonLearnStepWidget({
    super.key,
    required this.arabicText,
    required this.englishText,
    required this.imagePath,
    required this.currentStepIndex,
    required this.timerText,
    required this.onClose,
    required this.onContinue,
    required this.onSkip,
    this.badgeText = '01',
    this.useSpeakerBadge = false,
  });

  final String arabicText;
  final String englishText;
  final String imagePath;
  final int currentStepIndex;
  final String timerText;
  final VoidCallback onClose;
  final VoidCallback onContinue;
  final VoidCallback onSkip;
  final String badgeText;
  final bool useSpeakerBadge;

  @override
  Widget build(BuildContext context) {
    return _LessonScaffold(
      currentStepIndex: currentStepIndex,
      timerText: timerText,
      onClose: onClose,
      scrollable: false,
      bottomActions: _BottomActions(
        primaryLabel: 'Continue',
        onPrimary: onContinue,
        onSkip: onSkip,
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final h = constraints.maxHeight;
          final imgH = (h * 0.38).clamp(80.0, 160.0);
          final gap = (h * 0.025).clamp(6.0, 14.0);
          return Column(
            children: [
              SizedBox(height: gap),
              _Badge(text: badgeText, useSpeakerIcon: useSpeakerBadge),
              SizedBox(height: gap),
              _StepLabel(
                label: 'Learn',
                audioUrl: _audioUrlForLessonStep(currentStepIndex),
              ),
              SizedBox(height: gap * 1.2),
              _CharacterImage(imagePath: imagePath, height: imgH),
              SizedBox(height: gap * 1.5),
              Text(
                arabicText,
                textAlign: TextAlign.center,
                textDirection: TextDirection.rtl,
                style: AppTheme.arabicTextStyle(fontSize: 28),
              ),
              SizedBox(height: gap * 0.7),
              Text(
                englishText,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class LessonMCQStepWidget extends StatefulWidget {
  const LessonMCQStepWidget({
    super.key,
    required this.question,
    required this.options,
    required this.correctIndex,
    required this.imagePath,
    required this.currentStepIndex,
    required this.timerText,
    required this.onClose,
    required this.onContinue,
    required this.onSkip,
  });

  final String question;
  final List<String> options;
  final int correctIndex;
  final String imagePath;
  final int currentStepIndex;
  final String timerText;
  final VoidCallback onClose;
  final VoidCallback onContinue;
  final VoidCallback onSkip;

  @override
  State<LessonMCQStepWidget> createState() => _LessonMCQStepWidgetState();
}

class _LessonMCQStepWidgetState extends State<LessonMCQStepWidget> {
  int? selectedIndex;
  bool checked = false;

  bool get isCorrect => selectedIndex == widget.correctIndex;

  void _checkAnswer() {
    if (selectedIndex == null) return;
    setState(() => checked = true);
  }

  @override
  Widget build(BuildContext context) {
    return _LessonScaffold(
      currentStepIndex: widget.currentStepIndex,
      timerText: widget.timerText,
      onClose: widget.onClose,
      scrollable: false,
      feedbackBanner: checked
          ? _FeedbackBanner(
              correct: isCorrect,
              text: isCorrect
                  ? 'Correct!'
                  : 'Correct answer: ${widget.options[widget.correctIndex]}',
            )
          : null,
      bottomActions: _BottomActions(
        primaryLabel: checked ? 'Continue' : 'Check Answer',
        primaryColor: checked && isCorrect
            ? AppColors.success
            : AppColors.accent,
        onPrimary: checked
            ? widget.onContinue
            : selectedIndex == null
            ? null
            : _checkAnswer,
        onSkip: checked ? null : widget.onSkip,
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final h = constraints.maxHeight;
          final imgH = (h * 0.28).clamp(65.0, 120.0);
          final gap = (h * 0.022).clamp(5.0, 12.0);
          final questionLines =
              (widget.question.length / 40).ceil().clamp(1, 3);
          final questionH = questionLines * 22.0;

          final usedAboveGrid = gap +
              52 +
              gap * 0.7 +
              20 +
              gap +
              questionH +
              gap * 0.8 +
              imgH +
              gap;
          final gridH = h - usedAboveGrid;
          final gridW = constraints.maxWidth;
          final cellW = (gridW - 10) / 2;
          final cellH = (gridH - 10) / 2;
          final aspectRatio = (cellW / cellH).clamp(1.5, 4.0);

          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              SizedBox(height: gap),
              const _Badge(text: '01'),
              SizedBox(height: gap * 0.7),
              _StepLabel(
                label: 'Question',
                audioUrl: _audioUrlForLessonStep(widget.currentStepIndex),
              ),
              SizedBox(height: gap),
              Text(
                widget.question,
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: h < 350 ? 15 : 18,
                  fontWeight: FontWeight.w900,
                  height: 1.2,
                ),
              ),
              SizedBox(height: gap * 0.8),
              _CharacterImage(imagePath: widget.imagePath, height: imgH),
              SizedBox(height: gap),
              Expanded(
                child: GridView.builder(
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 8,
                    crossAxisSpacing: 8,
                    childAspectRatio: aspectRatio,
                  ),
                  itemCount: widget.options.length,
                  itemBuilder: (context, index) => _McqOption(
                    text: widget.options[index],
                    selected: selectedIndex == index,
                    correct: checked && index == widget.correctIndex,
                    wrong: checked && selectedIndex == index && !isCorrect,
                    onTap: checked
                        ? null
                        : () => setState(() => selectedIndex = index),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class LessonWriteStepWidget extends StatefulWidget {
  const LessonWriteStepWidget({
    super.key,
    required this.currentStepIndex,
    required this.timerText,
    required this.onClose,
    required this.onContinue,
  });

  final int currentStepIndex;
  final String timerText;
  final VoidCallback onClose;
  final VoidCallback onContinue;

  @override
  State<LessonWriteStepWidget> createState() => _LessonWriteStepWidgetState();
}

class _LessonWriteStepWidgetState extends State<LessonWriteStepWidget> {
  final List<String> selected = [];
  final List<String> tiles = const ['ا', 'س', 'م', 'ي'];
  bool get complete => selected.join() == 'اسمي';

  @override
  Widget build(BuildContext context) {
    return _LessonScaffold(
      currentStepIndex: widget.currentStepIndex,
      timerText: widget.timerText,
      onClose: widget.onClose,
      feedbackBanner: complete
          ? const _FeedbackBanner(correct: true, text: 'Correct!')
          : null,
      bottomActions: _BottomActions(
        primaryLabel: 'Continue',
        primaryColor: AppColors.success,
        onPrimary: complete ? widget.onContinue : null,
        showSkip: false,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const SizedBox(height: 20),
          const Text(
            "Write 'My name is' in Arabic",
            textAlign: TextAlign.center,
            style: TextStyle(
              color: AppColors.textPrimary,
              fontSize: 23,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 28),
          Container(
            constraints: const BoxConstraints(minHeight: 82),
            padding: const EdgeInsets.all(16),
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: BorderRadius.circular(AppTheme.cardRadius),
              border: Border.all(color: AppColors.border),
            ),
            child: Text(
              selected.isEmpty ? '____' : selected.join(),
              textDirection: TextDirection.rtl,
              style: AppTheme.arabicTextStyle(fontSize: 36),
            ),
          ),
          const SizedBox(height: 28),
          Wrap(
            alignment: WrapAlignment.center,
            spacing: 12,
            runSpacing: 12,
            children: [
              for (final tile in tiles)
                _LetterTile(
                  text: tile,
                  used:
                      selected.where((e) => e == tile).length >=
                      tiles.where((e) => e == tile).length,
                  onTap: complete
                      ? null
                      : () => setState(() => selected.add(tile)),
                ),
            ],
          ),
          const SizedBox(height: 16),
          TextButton(
            onPressed: selected.isEmpty ? null : () => setState(selected.clear),
            child: const Text('Clear'),
          ),
        ],
      ),
    );
  }
}

class LessonMatchStepWidget extends StatefulWidget {
  const LessonMatchStepWidget({
    super.key,
    required this.currentStepIndex,
    required this.timerText,
    required this.onClose,
    required this.onCheckAnswer,
    required this.onSkip,
    this.initiallyMatched = false,
  });

  final int currentStepIndex;
  final String timerText;
  final VoidCallback onClose;
  final VoidCallback onCheckAnswer;
  final VoidCallback onSkip;
  final bool initiallyMatched;

  @override
  State<LessonMatchStepWidget> createState() => _LessonMatchStepWidgetState();
}

class _LessonMatchStepWidgetState extends State<LessonMatchStepWidget> {
  static const pairs = [
    ('السلام عليكم', 'Hello / Peace be upon you'),
    ('وعليكم السلام', 'And upon you be peace'),
    ('اسمي', 'My name is'),
    ('كيف حالك؟', 'How are you? (to a male)'),
    ('كيف حالك؟', 'How are you? (to a female)'),
  ];

  final englishItems = const [
    'Hello / Peace be upon you',
    'How are you? (to a female)',
    'How are you? (to a male)',
    'My name is',
    'And upon you be peace',
  ];

  int? selectedArabic;
  String? selectedEnglish;
  late final Set<int> matchedArabic;
  late final Set<String> matchedEnglish;

  @override
  void initState() {
    super.initState();
    matchedArabic = widget.initiallyMatched ? {0, 1, 2, 3, 4} : <int>{};
    matchedEnglish = widget.initiallyMatched
        ? pairs.map((e) => e.$2).toSet()
        : <String>{};
  }

  void _tapArabic(int index) {
    if (matchedArabic.contains(index)) return;
    setState(() => selectedArabic = index);
    _tryMatch();
  }

  void _tapEnglish(String english) {
    if (matchedEnglish.contains(english)) return;
    setState(() => selectedEnglish = english);
    _tryMatch();
  }

  void _tryMatch() {
    final arabicIndex = selectedArabic;
    final english = selectedEnglish;
    if (arabicIndex == null || english == null) return;
    if (pairs[arabicIndex].$2 == english) {
      setState(() {
        matchedArabic.add(arabicIndex);
        matchedEnglish.add(english);
        selectedArabic = null;
        selectedEnglish = null;
      });
    } else {
      setState(() {
        selectedArabic = null;
        selectedEnglish = null;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final count = matchedArabic.length;
    return _LessonScaffold(
      currentStepIndex: widget.currentStepIndex,
      timerText: widget.timerText,
      onClose: widget.onClose,
      bottomActions: _BottomActions(
        primaryLabel: 'Check Answer',
        onPrimary: count == 5 ? widget.onCheckAnswer : null,
        onSkip: widget.onSkip,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const SizedBox(height: 12),
          const Text(
            'Match Arabic & English',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: AppColors.textPrimary,
              fontSize: 24,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '$count of 5 pairs correctly matched',
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 15,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 18),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  children: [
                    for (var i = 0; i < pairs.length; i++)
                      _MatchItem(
                        text: pairs[i].$1,
                        arabic: true,
                        selected: selectedArabic == i,
                        matched: matchedArabic.contains(i),
                        onTap: () => _tapArabic(i),
                      ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  children: [
                    for (final english in englishItems)
                      _MatchItem(
                        text: english,
                        selected: selectedEnglish == english,
                        matched: matchedEnglish.contains(english),
                        onTap: () => _tapEnglish(english),
                      ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class LessonMatchResultStepWidget extends StatelessWidget {
  const LessonMatchResultStepWidget({
    super.key,
    required this.currentStepIndex,
    required this.timerText,
    required this.onClose,
    required this.onContinue,
  });

  final int currentStepIndex;
  final String timerText;
  final VoidCallback onClose;
  final VoidCallback onContinue;

  @override
  Widget build(BuildContext context) {
    return _LessonScaffold(
      currentStepIndex: currentStepIndex,
      timerText: timerText,
      onClose: onClose,
      feedbackBanner: const _FeedbackBanner(correct: true, text: 'Correct!'),
      bottomActions: _BottomActions(
        primaryLabel: 'Continue',
        primaryColor: AppColors.success,
        onPrimary: onContinue,
        showSkip: false,
      ),
      child: const _AllMatchedPreview(),
    );
  }
}

class LessonCompleteStepWidget extends StatelessWidget {
  const LessonCompleteStepWidget({super.key, required this.onContinue});

  final VoidCallback onContinue;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const Spacer(),
              const NakhlahMascot(size: 108, animate: false),
              const SizedBox(height: 18),
              const Text(
                'Lesson completed!',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: AppColors.accent,
                  fontSize: 32,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 22),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFEDD5),
                  borderRadius: BorderRadius.circular(AppTheme.cardRadius),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'Injaz Earned',
                      style: TextStyle(
                        color: Color(0xFF9A3412),
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    SizedBox(width: 12),
                    Text('⭐ 50', style: TextStyle(fontSize: 22)),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              const Row(
                children: [
                  Expanded(
                    child: _StatBox(label: 'Total Dates', value: '📅 0'),
                  ),
                  SizedBox(width: 10),
                  Expanded(
                    child: _StatBox(label: 'Time', value: '⏱ 03:49'),
                  ),
                  SizedBox(width: 10),
                  Expanded(
                    child: _StatBox(label: 'Accuracy', value: '🎯 100%'),
                  ),
                ],
              ),
              const Spacer(),
              _PrimaryButton(label: 'CONTINUE', onPressed: onContinue),
            ],
          ),
        ),
      ),
    );
  }
}

class DailyMissionStepWidget extends StatelessWidget {
  const DailyMissionStepWidget({super.key, required this.onContinue});

  final VoidCallback onContinue;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 28),
              const Text(
                'Daily mission updated!',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 28,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 28),
              const _MissionRow(
                icon: '⭐',
                title: 'Score High Points',
                status: 'in progress',
                complete: false,
              ),
              const _MissionRow(
                icon: '🌴',
                title: 'Complete-Lessons-Today',
                status: 'Completed',
                complete: true,
              ),
              const _MissionRow(
                icon: '🎯',
                title: 'Complete-Tasks',
                status: 'Completed',
                complete: true,
              ),
              const Spacer(),
              _PrimaryButton(label: 'CONTINUE', onPressed: onContinue),
            ],
          ),
        ),
      ),
    );
  }
}

class _LessonScaffold extends StatelessWidget {
  const _LessonScaffold({
    required this.currentStepIndex,
    required this.timerText,
    required this.onClose,
    required this.child,
    required this.bottomActions,
    this.feedbackBanner,
    this.scrollable = true,
  });

  final int currentStepIndex;
  final String timerText;
  final VoidCallback onClose;
  final Widget child;
  final Widget bottomActions;
  final Widget? feedbackBanner;
  final bool scrollable;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            _TopBar(
              currentStepIndex: currentStepIndex,
              timerText: timerText,
              onClose: onClose,
            ),
            Expanded(
              child: scrollable
                  ? SingleChildScrollView(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: child,
                    )
                  : Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: child,
                    ),
            ),
            ?feedbackBanner,
            bottomActions,
          ],
        ),
      ),
    );
  }
}

class _TopBar extends StatelessWidget {
  const _TopBar({
    required this.currentStepIndex,
    required this.timerText,
    required this.onClose,
  });

  final int currentStepIndex;
  final String timerText;
  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    final filled = ((currentStepIndex + 1) / 13 * 5).ceil().clamp(1, 5);
    return SizedBox(
      height: 72,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(8, 8, 12, 4),
        child: Row(
          children: [
            IconButton(
              onPressed: onClose,
              icon: const Icon(
                Icons.close_rounded,
                color: AppColors.textPrimary,
              ),
            ),
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Row(
                    children: [
                      for (var i = 0; i < 5; i++)
                        Expanded(
                          child: Container(
                            height: 8,
                            margin: const EdgeInsets.symmetric(horizontal: 2),
                            decoration: BoxDecoration(
                              color: i < filled
                                  ? AppColors.accent
                                  : AppColors.optionBorderDefault,
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    timerText,
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            const Icon(
              Icons.favorite_rounded,
              color: AppColors.wrongRed,
              size: 21,
            ),
            const SizedBox(width: 6),
            const Icon(Icons.flag_rounded, color: AppColors.accent, size: 21),
          ],
        ),
      ),
    );
  }
}

class _BottomActions extends StatelessWidget {
  const _BottomActions({
    required this.primaryLabel,
    required this.onPrimary,
    this.onSkip,
    this.primaryColor = AppColors.accent,
    this.showSkip = true,
  });

  final String primaryLabel;
  final VoidCallback? onPrimary;
  final VoidCallback? onSkip;
  final Color primaryColor;
  final bool showSkip;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: AppTheme.bottomActionPadding,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _PrimaryButton(
            label: primaryLabel,
            onPressed: onPrimary,
            color: primaryColor,
          ),
          if (showSkip && onSkip != null) ...[
            const SizedBox(height: 8),
            TextButton(
              onPressed: onSkip,
              child: const Text(
                'Skip',
                style: TextStyle(
                  decoration: TextDecoration.underline,
                  color: AppColors.textSecondary,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _PrimaryButton extends StatelessWidget {
  const _PrimaryButton({
    required this.label,
    required this.onPressed,
    this.color = AppColors.accent,
  });

  final String label;
  final VoidCallback? onPressed;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: AppTheme.buttonHeight,
      width: double.infinity,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: color,
          foregroundColor: Colors.white,
          disabledBackgroundColor: AppColors.buttonDisabled,
          disabledForegroundColor: AppColors.buttonDisabledText,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppTheme.buttonRadius),
          ),
        ),
        child: Text(
          label,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
        ),
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  const _Badge({required this.text, this.useSpeakerIcon = false});

  final String text;
  final bool useSpeakerIcon;

  @override
  Widget build(BuildContext context) {
    return CircleAvatar(
      radius: 26,
      backgroundColor: AppColors.accent,
      child: useSpeakerIcon
          ? const Icon(Icons.volume_up_rounded, color: Colors.white)
          : Text(
              text,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w900,
              ),
            ),
    );
  }
}

class _StepLabel extends StatefulWidget {
  const _StepLabel({required this.label, this.audioUrl});

  final String label;
  final String? audioUrl;

  @override
  State<_StepLabel> createState() => _StepLabelState();
}

class _StepLabelState extends State<_StepLabel> {
  late final AudioPlayer _player;
  bool _loading = false;

  bool get _hasAudio => widget.audioUrl?.trim().isNotEmpty == true;

  @override
  void initState() {
    super.initState();
    _player = AudioPlayer(useProxyForRequestHeaders: false);
  }

  @override
  void didUpdateWidget(covariant _StepLabel oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.audioUrl != widget.audioUrl) {
      _player.stop();
      _loading = false;
    }
  }

  @override
  void dispose() {
    _player.dispose();
    super.dispose();
  }

  Future<void> _playAudio() async {
    final url = widget.audioUrl?.trim();
    if (url == null || url.isEmpty || _loading) return;

    setState(() => _loading = true);
    try {
      await _player.stop();
      final headers = Get.isRegistered<ApiService>()
          ? await Get.find<ApiService>().authHeaders(accept: 'audio/*,*/*')
          : {'Accept': 'audio/*,*/*'};
      await _player.setUrl(
        url,
        headers: headers,
      );
      await _player.play();
    } catch (e) {
      AppSnackbar.error('Could not play lesson audio.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          widget.label,
          style: const TextStyle(
            color: AppColors.textSecondary,
            fontSize: 16,
            fontWeight: FontWeight.w900,
          ),
        ),
        if (_hasAudio) ...[
          const SizedBox(width: 6),
          InkWell(
            onTap: _playAudio,
            borderRadius: BorderRadius.circular(18),
            child: Padding(
              padding: const EdgeInsets.all(4),
              child: _loading
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(
                      Icons.volume_up_rounded,
                      color: AppColors.accent,
                      size: 20,
                    ),
            ),
          ),
        ],
      ],
    );
  }
}

class _CharacterImage extends StatelessWidget {
  const _CharacterImage({required this.imagePath, this.height = 190});

  final String imagePath;
  final double height;

  @override
  Widget build(BuildContext context) {
    final dpr = MediaQuery.of(context).devicePixelRatio;
    return Container(
      height: height,
      width: double.infinity,
      alignment: Alignment.center,
      child: Image.asset(
        imagePath,
        height: height,
        cacheHeight: (height * dpr).round(),
        fit: BoxFit.contain,
        errorBuilder: (_, error, stackTrace) => Icon(
          Icons.person_rounded,
          color: AppColors.accent.withValues(alpha: .35),
          size: height * .7,
        ),
      ),
    );
  }
}

class _McqOption extends StatelessWidget {
  const _McqOption({
    required this.text,
    required this.selected,
    required this.correct,
    required this.wrong,
    required this.onTap,
  });

  final String text;
  final bool selected;
  final bool correct;
  final bool wrong;
  final VoidCallback? onTap;

  bool get _isArabic => RegExp(r'[\u0600-\u06FF]').hasMatch(text);

  @override
  Widget build(BuildContext context) {
    final color = wrong
        ? AppColors.optionBgWrong
        : correct
        ? AppColors.optionBgCorrect
        : selected
        ? AppColors.optionBgSelected
        : AppColors.card;
    final border = wrong
        ? AppColors.optionBorderWrong
        : correct
        ? AppColors.optionBorderCorrect
        : selected
        ? AppColors.optionBorderSelected
        : AppColors.optionBorderDefault;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        alignment: Alignment.center,
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: color,
          border: Border.all(
            color: border,
            width: selected || correct || wrong ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          text,
          textAlign: TextAlign.center,
          textDirection: _isArabic ? TextDirection.rtl : TextDirection.ltr,
          style: TextStyle(
            color: AppColors.textPrimary,
            fontFamily: _isArabic ? AppTheme.arabicFontFamily : null,
            fontWeight: FontWeight.w900,
            fontSize: _isArabic ? 18 : 14,
          ),
        ),
      ),
    );
  }
}

class _LetterTile extends StatelessWidget {
  const _LetterTile({
    required this.text,
    required this.used,
    required this.onTap,
  });

  final String text;
  final bool used;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: used ? .35 : 1,
      child: InkWell(
        onTap: used ? null : onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          width: 62,
          height: 62,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: AppColors.card,
            border: Border.all(color: AppColors.optionBorderDefault),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            text,
            textDirection: TextDirection.rtl,
            style: AppTheme.arabicTextStyle(fontSize: 28),
          ),
        ),
      ),
    );
  }
}

class _MatchItem extends StatelessWidget {
  const _MatchItem({
    required this.text,
    required this.selected,
    required this.matched,
    required this.onTap,
    this.arabic = false,
  });

  final String text;
  final bool selected;
  final bool matched;
  final VoidCallback onTap;
  final bool arabic;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: InkWell(
        onTap: matched ? null : onTap,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          constraints: const BoxConstraints(minHeight: 58),
          alignment: Alignment.center,
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: matched
                ? AppColors.optionBgCorrect
                : selected
                ? AppColors.optionBgSelected
                : AppColors.card,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: matched
                  ? AppColors.optionBorderCorrect
                  : selected
                  ? AppColors.optionBorderSelected
                  : AppColors.optionBorderDefault,
              width: matched || selected ? 2 : 1,
            ),
          ),
          child: Text(
            text,
            textAlign: TextAlign.center,
            textDirection: arabic ? TextDirection.rtl : TextDirection.ltr,
            style: TextStyle(
              color: AppColors.textPrimary,
              fontFamily: arabic ? AppTheme.arabicFontFamily : null,
              fontSize: arabic ? 18 : 13,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
      ),
    );
  }
}

class _FeedbackBanner extends StatelessWidget {
  const _FeedbackBanner({required this.correct, required this.text});

  final bool correct;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.fromLTRB(16, 8, 16, 0),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: correct ? AppColors.optionBgCorrect : AppColors.optionBgWrong,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: correct
              ? AppColors.optionBorderCorrect
              : AppColors.optionBorderWrong,
        ),
      ),
      child: Text(
        text,
        textAlign: TextAlign.center,
        textDirection: RegExp(r'[\u0600-\u06FF]').hasMatch(text)
            ? TextDirection.rtl
            : TextDirection.ltr,
        style: TextStyle(
          color: correct ? AppColors.success : AppColors.error,
          fontSize: 16,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

class _AllMatchedPreview extends StatelessWidget {
  const _AllMatchedPreview();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: const [
        SizedBox(height: 12),
        Text(
          'Match Arabic & English',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: AppColors.textPrimary,
            fontSize: 24,
            fontWeight: FontWeight.w900,
          ),
        ),
        SizedBox(height: 8),
        Text(
          '5 of 5 pairs correctly matched',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: AppColors.textSecondary,
            fontSize: 15,
            fontWeight: FontWeight.w800,
          ),
        ),
        SizedBox(height: 18),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Column(
                children: [
                  _StaticMatchedItem(text: 'السلام عليكم', arabic: true),
                  _StaticMatchedItem(text: 'وعليكم السلام', arabic: true),
                  _StaticMatchedItem(text: 'اسمي', arabic: true),
                  _StaticMatchedItem(text: 'كيف حالك؟', arabic: true),
                  _StaticMatchedItem(text: 'كيف حالك؟', arabic: true),
                ],
              ),
            ),
            SizedBox(width: 12),
            Expanded(
              child: Column(
                children: [
                  _StaticMatchedItem(text: 'Hello / Peace be upon you'),
                  _StaticMatchedItem(text: 'How are you? (to a female)'),
                  _StaticMatchedItem(text: 'How are you? (to a male)'),
                  _StaticMatchedItem(text: 'My name is'),
                  _StaticMatchedItem(text: 'And upon you be peace'),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _StaticMatchedItem extends StatelessWidget {
  const _StaticMatchedItem({required this.text, this.arabic = false});

  final String text;
  final bool arabic;

  @override
  Widget build(BuildContext context) {
    return _MatchItem(
      text: text,
      arabic: arabic,
      selected: false,
      matched: true,
      onTap: () {},
    );
  }
}

class _StatBox extends StatelessWidget {
  const _StatBox({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 10),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(AppTheme.cardRadius),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Text(
            label,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 14,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            value,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: AppColors.textPrimary,
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}

class _MissionRow extends StatelessWidget {
  const _MissionRow({
    required this.icon,
    required this.title,
    required this.status,
    required this.complete,
  });

  final String icon;
  final String title;
  final String status;
  final bool complete;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(AppTheme.cardRadius),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Text(icon, style: const TextStyle(fontSize: 26)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  status,
                  style: TextStyle(
                    color: complete
                        ? AppColors.success
                        : AppColors.textSecondary,
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
          Icon(
            complete
                ? Icons.check_circle_rounded
                : Icons.radio_button_unchecked,
            color: complete ? AppColors.success : AppColors.buttonDisabledText,
          ),
        ],
      ),
    );
  }
}
