import 'dart:async';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:shimmer/shimmer.dart';
import 'package:just_audio/just_audio.dart';

import '../../common/app_snackbar.dart';
import '../../constants/app_colors.dart';
import '../../constants/app_theme.dart';
import '../../controllers/gamification_controller.dart';
import '../../models/lesson_question_model.dart';
import '../../services/api_service.dart';
import '../../services/content_service.dart';
import 'lesson_result_view.dart';

const _lessonMaxWidth = 430.0;
const _maxPalmTrees = 5;

// ── Arabic diacritics helpers ───────────────────────────────────────────────

String _stripArabicDiacritics(String value) {
  return value.replaceAll(RegExp(r'[\u064B-\u065F\u0670]'), '');
}

bool _hasArabicDiacritics(String value) {
  return RegExp(r'[\u064B-\u065F\u0670]').hasMatch(value);
}

const _diacriticsFallbackByBaseWord = <String, String>{
  'اسمي': 'اِسْمِي',
  'العربية': 'الْعَرَبِيَّة',
  'مرحبا': 'مَرْحَبًا',
  'شكرا': 'شُكْرًا',
  'سلام': 'سَلَام',
  'كتاب': 'كِتَاب',
  'قلم': 'قَلَم',
  'بيت': 'بَيْت',
  'ولد': 'وَلَد',
  'بنت': 'بِنْت',
  'ماء': 'مَاء',
  'نور': 'نُور',
  'حب': 'حُبّ',
  'خير': 'خَيْر',
  'طول': 'طَوِيل',
  'جديد': 'جَدِيد',
  'قديم': 'قَدِيم',
  'كبير': 'كَبِير',
  'صغير': 'صَغِير',
  'جميل': 'جَمِيل',
};

String _applyDiacriticsFallback(String value) {
  final normalized = value.toString();
  final base = _stripArabicDiacritics(normalized).replaceAll(RegExp(r'\s+'), '').trim();
  return _diacriticsFallbackByBaseWord[base] ?? normalized;
}

String _buildDiacritizedPreview(String targetWord, String selectedWord) {
  if (targetWord.isEmpty || selectedWord.isEmpty) return selectedWord;

  final targetBase = _stripArabicDiacritics(targetWord).replaceAll(RegExp(r'\s+'), '');
  final selectedBase = _stripArabicDiacritics(selectedWord).replaceAll(RegExp(r'\s+'), '');

  if (!targetBase.startsWith(selectedBase)) return selectedWord;

  int consumedBaseChars = 0;
  final preview = StringBuffer();
  final selectedBaseLength = selectedBase.length;

  for (final char in targetWord.runes) {
    final isDiacritic = (char >= 0x064B && char <= 0x065F) || char == 0x0670;
    final isWhitespace = char <= 0x0020;

    if (isDiacritic) {
      if (consumedBaseChars > 0 && consumedBaseChars <= selectedBaseLength) {
        preview.writeCharCode(char);
      }
      continue;
    }

    if (isWhitespace) {
      if (consumedBaseChars > 0 && consumedBaseChars < selectedBaseLength) {
        preview.writeCharCode(char);
      }
      continue;
    }

    if (consumedBaseChars >= selectedBaseLength) break;

    preview.writeCharCode(char);
    consumedBaseChars++;
  }

  return preview.isEmpty ? selectedWord : preview.toString();
}

class LessonEngineArgs {
  const LessonEngineArgs({
    required this.lessonId,
    this.taskId,
    this.isExamLesson = false,
  });

  final String lessonId;
  final String? taskId;
  final bool isExamLesson;
}

class ExerciseView extends StatefulWidget {
  const ExerciseView({super.key});

  @override
  State<ExerciseView> createState() => _ExerciseViewState();
}

class _ExerciseViewState extends State<ExerciseView>
    with TickerProviderStateMixin {
  late final ContentService _contentService;

  List<LessonQuestion> _questions = [];
  bool _loading = true;
  String? _error;

  int _currentIndex = 0;
  int _palmTrees = _maxPalmTrees;
  int _maxPalmTreesForSession = _maxPalmTrees;
  int _elapsedSeconds = 0;
  Timer? _timer;

  int _correctAnswers = 0;
  bool _hasWrongAnswer = false;
  bool _questionAnswered = false;
  bool? _lastAnswerCorrect;
  final Set<int> _skippedIndices = {};
  bool _isRevisitingSkipped = false;

  String? _selectedOptionId;
  bool? _selectedTrueFalse;
  String? _selectedFillBlankId;
  String _selectedFillBlankText = '';

  final List<LessonAnswer> _selectedTokens = [];
  final Set<String> _usedTokenIds = {};

  String? _selectedLeftId;
  final Map<String, String> _matchedPairs = {};
  bool _pairPenaltyApplied = false;
  final List<_MatchItem> _shuffledRightItems = [];
  String? _wrongLeftId;
  String? _wrongRightId;

  late AnimationController _feedbackController;
  late Animation<double> _feedbackAnimation;

  late AudioPlayer _audioPlayer;
  late AudioPlayer _sfxPlayer;
  bool _audioLoading = false;

  LessonEngineArgs? _args;

  @override
  void initState() {
    super.initState();
    _feedbackController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    _feedbackAnimation = CurvedAnimation(
      parent: _feedbackController,
      curve: Curves.easeOutBack,
    );

    _audioPlayer = AudioPlayer(useProxyForRequestHeaders: false);
    _sfxPlayer = AudioPlayer();

    _contentService = Get.find<ContentService>();
    _args = Get.arguments is LessonEngineArgs
        ? Get.arguments as LessonEngineArgs
        : null;

    if (_args == null) {
      _error = 'No lesson specified';
      _loading = false;
    } else {
      _loadQuestions();
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _audioPlayer.dispose();
    _sfxPlayer.dispose();
    _feedbackController.dispose();
    Get.find<GamificationController>().load();
    super.dispose();
  }

  Future<void> _loadQuestions() async {
    try {
      setState(() {
        _loading = true;
        _error = null;
      });

      final args = _args!;
      List<LessonQuestion> questions;

      if (args.isExamLesson && args.taskId != null) {
        questions = await _contentService.fetchExamQuestions(args.taskId!);
      } else {
        questions = await _contentService.fetchLessonQuestions(args.lessonId);
      }

      if (questions.isEmpty) {
        setState(() {
          _error = 'No questions found for this lesson';
          _loading = false;
        });
        return;
      }

      setState(() {
        _questions = questions;
        _shuffleAllAnswers();
        _loading = false;
        _currentIndex = 0;
        final gamCtrl = Get.find<GamificationController>();
        final apiPalm = gamCtrl.stock.value.palmStock;
        _maxPalmTreesForSession = apiPalm;
        _palmTrees = _maxPalmTreesForSession;
        _correctAnswers = 0;
        _hasWrongAnswer = false;
      });

      _shuffleRightItems();
      _startTimer();
      _autoPlayAudio();
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  void _startTimer() {
    _timer?.cancel();
    _elapsedSeconds = 0;
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _elapsedSeconds++);
    });
  }

  String get _timerText {
    final minutes = (_elapsedSeconds ~/ 60).toString().padLeft(2, '0');
    final seconds = (_elapsedSeconds % 60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  LessonQuestion get _currentQuestion => _questions[_currentIndex];
  int get _totalQuestions => _questions.length;
  bool get _isLastQuestion => _currentIndex >= _totalQuestions - 1;
  int get _scoredQuestions => _questions.where((q) => q.isScored).length;

  double get _progress =>
      _totalQuestions > 0 ? (_currentIndex + 1) / _totalQuestions : 0;

  void _resetQuestionState() {
    _selectedOptionId = null;
    _selectedTrueFalse = null;
    _selectedFillBlankId = null;
    _selectedFillBlankText = '';
    _selectedTokens.clear();
    _usedTokenIds.clear();
    _selectedLeftId = null;
    _matchedPairs.clear();
    _pairPenaltyApplied = false;
    _questionAnswered = false;
    _lastAnswerCorrect = null;
    _wrongLeftId = null;
    _wrongRightId = null;
    _shuffleRightItems();
  }

  void _shuffleAllAnswers() {
    for (var i = 0; i < _questions.length; i++) {
      final q = _questions[i];
      if (q.isMcq || q.isTrueFalse || q.isFillBlank || q.isWordMaking || q.isSentenceMaking) {
        final shuffled = [...q.answers]..shuffle();
        _questions[i] = LessonQuestion(
          id: q.id,
          questionType: q.questionType,
          questionTitle: q.questionTitle,
          questionMedia: q.questionMedia,
          answers: shuffled,
          learnAnswer: q.learnAnswer,
          trueFalseAnswer: q.trueFalseAnswer,
        );
      }
    }
  }

  void _shuffleRightItems() {
    final q = _currentQuestion;
    _shuffledRightItems.clear();
    if (!q.isPairMatching) return;
    final pairs = q.answers;
    final items = pairs.asMap().entries.map((entry) {
      final index = entry.key;
      final pair = entry.value;
      return _MatchItem(
        id: 'right-$index-${pair.id}',
        text: pair.rightTitle.isNotEmpty ? pair.rightTitle : pair.title,
        matchKey: pair.id,
      );
    }).toList();
    items.shuffle();
    _shuffledRightItems.addAll(items);
  }

  bool get _hasAnswer {
    final q = _currentQuestion;
    if (q.isLearn) return true;
    if (q.isMcq) return _selectedOptionId != null;
    if (q.isTrueFalse) return _selectedTrueFalse != null;
    if (q.isFillBlank) return _selectedFillBlankId != null;
    if (q.isWordMaking || q.isSentenceMaking) return _selectedTokens.isNotEmpty;
    if (q.isPairMatching) return _matchedPairs.length == q.answers.length;
    return false;
  }

  bool _checkAnswer() {
    final q = _currentQuestion;
    if (q.isLearn) return true;
    if (q.isMcq) {
      final selected =
          q.answers.where((a) => a.id == _selectedOptionId).firstOrNull;
      return selected?.isCorrect == true;
    }
    if (q.isTrueFalse) return _selectedTrueFalse == q.trueFalseAnswer;
    if (q.isFillBlank) {
      final selected =
          q.answers.where((a) => a.id == _selectedFillBlankId).firstOrNull;
      return selected?.isCorrect == true;
    }
    if (q.isWordMaking || q.isSentenceMaking) {
      final sorted = q.sortedAnswers;
      if (_selectedTokens.length != sorted.length) return false;
      for (var i = 0; i < sorted.length; i++) {
        if (_selectedTokens[i].id != sorted[i].id) return false;
      }
      return true;
    }
    if (q.isPairMatching) return _matchedPairs.length == q.answers.length;
    return false;
  }

  void _handleCheck() {
    if (_questionAnswered) {
      _handleContinue();
      return;
    }

    final isCorrect = _checkAnswer();

    setState(() {
      _questionAnswered = true;
      _lastAnswerCorrect = isCorrect;
    });

    if (isCorrect) {
      _correctAnswers++;
      _skippedIndices.remove(_currentIndex);
      _feedbackController.forward(from: 0);
      _playSfx('assets/audio/correct.mp3');
    } else {
      _hasWrongAnswer = true;
      _palmTrees--;
      _feedbackController.forward(from: 0);
      _reportWrongAnswer();
      _playSfx('assets/audio/wrong.mp3');
      if (_palmTrees <= 0) {
        _showOutOfLivesDialog();
        return;
      }
    }
  }

  Future<void> _reportWrongAnswer() async {
    try {
      await _contentService.reportWrongAnswer();
    } catch (_) {}
  }

  Future<void> _completeLesson() async {
    _timer?.cancel();
    _playSfx('assets/audio/click.mp3');

    try {
      if (_hasWrongAnswer) {
        await _contentService.makeLearnerProgress(_args!.lessonId);
      } else {
        await _contentService.reportFullMarks(_args!.lessonId);
      }
    } catch (_) {}

    if (!mounted) return;

    final result = LessonResultData(
      lessonId: _args!.lessonId,
      elapsedSeconds: _elapsedSeconds,
      totalQuestions: _totalQuestions,
      scoredQuestions: _scoredQuestions,
      correctAnswers: _correctAnswers,
      injazEarned: _hasWrongAnswer ? 25 : 50,
      palmTreesRemaining: _palmTrees,
      hasWrongAnswer: _hasWrongAnswer,
    );

    Get.off(() => const LessonResultView(), arguments: result);
  }

  void _handleContinue() {
    // After answering wrong on current question (not in revisit mode)
    // → advance forward normally, don't jump to skipped yet
    if (_lastAnswerCorrect == false && !_isRevisitingSkipped) {
      if (_isLastQuestion) {
        // Reached end — now start revisiting skipped questions
        if (_skippedIndices.isNotEmpty) {
          _isRevisitingSkipped = true;
          final nextSkipped = _skippedIndices.first;
          _skippedIndices.remove(nextSkipped);
          setState(() {
            _currentIndex = nextSkipped;
            _resetQuestionState();
          });
          _autoPlayAudio();
          return;
        }
        _completeLesson();
        return;
      }
      setState(() {
        _currentIndex++;
        _resetQuestionState();
      });
      _autoPlayAudio();
      return;
    }

    // In revisit mode — jump to next skipped or complete
    if (_isRevisitingSkipped) {
      if (_skippedIndices.isNotEmpty) {
        final nextSkipped = _skippedIndices.first;
        _skippedIndices.remove(nextSkipped);
        setState(() {
          _currentIndex = nextSkipped;
          _resetQuestionState();
        });
        _autoPlayAudio();
        return;
      }
      _isRevisitingSkipped = false;
      _completeLesson();
      return;
    }

    // Normal flow — if last question, start revisit or complete
    if (_isLastQuestion) {
      if (_skippedIndices.isNotEmpty) {
        _isRevisitingSkipped = true;
        final nextSkipped = _skippedIndices.first;
        _skippedIndices.remove(nextSkipped);
        setState(() {
          _currentIndex = nextSkipped;
          _resetQuestionState();
        });
        _autoPlayAudio();
        return;
      }
      _completeLesson();
      return;
    }

    // Normal mid-lesson: advance to next question (ignore skipped for now)
    setState(() {
      _currentIndex++;
      _resetQuestionState();
    });
    _autoPlayAudio();
  }

  void _autoPlayAudio() {
    final url = _currentQuestion.audioUrl;
    if (url != null && url.trim().isNotEmpty) {
      _playAudio(url);
    }
  }

  Future<void> _playAudio(String url, {double speed = 1.0}) async {
    if (_audioLoading) return;
    setState(() => _audioLoading = true);
    try {
      await _audioPlayer.stop();
      final headers = Get.isRegistered<ApiService>()
          ? await Get.find<ApiService>().authHeaders(accept: 'audio/*,*/*')
          : {'Accept': 'audio/*,*/*'};
      await _audioPlayer.setUrl(url, headers: headers);
      _audioPlayer.setSpeed(speed);
      await _audioPlayer.play();
    } catch (e) {
      AppSnackbar.error('Could not play audio.');
    } finally {
      if (mounted) setState(() => _audioLoading = false);
    }
  }

  Future<void> _playSfx(String assetPath) async {
    try {
      await _sfxPlayer.stop();
      await _sfxPlayer.setAsset(assetPath);
      await _sfxPlayer.play();
    } catch (_) {}
  }

  void _handleBack() => _showLeavingDialog();

  void _showLeavingDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Leave lesson?',
            style: TextStyle(fontWeight: FontWeight.w900)),
        content:
        const Text('Your progress in this lesson will be lost.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Stay',
                style: TextStyle(fontWeight: FontWeight.w800)),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              Get.back();
            },
            child: const Text('Leave',
                style: TextStyle(
                    color: AppColors.wrongRed,
                    fontWeight: FontWeight.w800)),
          ),
        ],
      ),
    );
  }

  void _showOutOfLivesDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(height: 8),
              const Text(
                '\u{1F4A7}',
                style: TextStyle(fontSize: 64),
              ),
              const SizedBox(height: 20),
              const Text(
                'No Palm Trees left for this lesson',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textPrimary,
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
                  onPressed: () {
                    Navigator.pop(ctx);
                    Get.back();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.accent,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppTheme.buttonRadius),
                    ),
                  ),
                  child: const Text('Back to Home',
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
                    final newPalm = gamCtrl.stock.value.palmStock;
                    if (mounted) {
                      setState(() {
                        _maxPalmTreesForSession = newPalm;
                        _palmTrees = _maxPalmTreesForSession;
                      });
                    }
                  },
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.optionBorderDefault),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppTheme.buttonRadius),
                    ),
                  ),
                  child: const Text('Refill Palm Trees',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        color: AppColors.textPrimary,
                      )),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) _handleBack();
      },
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: SafeArea(
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: _lessonMaxWidth),
              child: _buildBody(),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBody() {
    if (_loading) {
      return const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(color: AppColors.accent),
            SizedBox(height: 16),
            Text('Loading lesson...',
                style: TextStyle(
                    color: AppColors.textSecondary,
                    fontWeight: FontWeight.w700)),
          ],
        ),
      );
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline_rounded,
                  size: 64, color: AppColors.wrongRed),
              const SizedBox(height: 16),
              Text(_error!,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 16,
                      fontWeight: FontWeight.w700)),
              const SizedBox(height: 24),
              SizedBox(
                height: AppTheme.buttonHeight,
                child: ElevatedButton(
                  onPressed: () => Get.back(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.accent,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                        borderRadius:
                        BorderRadius.circular(AppTheme.buttonRadius)),
                  ),
                  child: const Text('Go Back',
                      style: TextStyle(fontWeight: FontWeight.w900)),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Column(
      children: [
        _buildTopBar(),
        _buildDivider(),
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: _buildQuestionContent(),
          ),
        ),
        if (_questionAnswered) _buildFeedbackBanner(),
        _buildBottomActions(),
      ],
    );
  }

  // ─── TOP BAR (matches screenshot exactly) ──────────────────────────────
  Widget _buildTopBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(8, 8, 12, 4),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              // X close button
              IconButton(
                onPressed: _handleBack,
                icon: const Icon(Icons.close_rounded,
                    color: AppColors.textPrimary),
              ),
              const SizedBox(width: 4),
              // Palm trees in a pill container
              Container(
                padding:
                const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  border: Border.all(color: AppColors.optionBorderDefault),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: List.generate(5, (i) {
                    final active = i < _palmTrees;
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 1),
                      child: SvgPicture.asset(
                        'assets/nakhlah_design/Palm_Trees.svg',
                        width: 18,
                        height: 18,
                        colorFilter: ColorFilter.mode(
                          active
                              ? AppColors.palm
                              : AppColors.optionBorderDefault,
                          BlendMode.srcIn,
                        ),
                      ),
                    );
                  }),
                ),
              ),
              const Spacer(),
              // Timer badge
              Container(
                padding:
                const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  border: Border.all(color: AppColors.optionBorderDefault),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.access_time_rounded,
                        size: 14, color: AppColors.accent),
                    const SizedBox(width: 4),
                    Text(
                      _timerText,
                      style: const TextStyle(
                        color: AppColors.textPrimary,
                        fontSize: 13,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          // Progress bar in its own row below
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: _progress,
              minHeight: 10,
              backgroundColor: AppColors.optionBorderDefault,
              valueColor: const AlwaysStoppedAnimation<Color>(
                  AppColors.accent),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDivider() {
    return const Padding(
      padding: EdgeInsets.symmetric(vertical: 8),
      child: Divider(
        color: Color(0xFFE0E0E0),
        thickness: 1,
        height: 1,
      ),
    );
  }

  Widget _buildQuestionContent() {
    final q = _currentQuestion;
    switch (q.questionType) {
      case 'learn':
        return _buildLearnQuestion(q);
      case 'mcq':
        return _buildMcqQuestion(q);
      case 'true_false':
        return _buildTrueFalseQuestion(q);
      case 'fill_blank':
        return _buildFillBlankQuestion(q);
      case 'word_making':
      case 'sentence_making':
        return _buildTokenMakingQuestion(q);
      case 'pair_matching':
        return _buildPairMatchingQuestion(q);
      default:
        return _buildLearnQuestion(q);
    }
  }

  // ─── LEARN ──────────────────────────────────────────────────────────────
  Widget _buildLearnQuestion(LessonQuestion q) {
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 12),

          Center(child: _buildQuestionLabel('Learn')),
          const SizedBox(height: 8),
          if (q.imageUrl != null) ...[
            _buildImageCard(q.imageUrl!, size: 280),
            const SizedBox(height: 8),
          ],
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border, width: 1.5),
            ),
            child: Column(
              children: [
                if (q.cleanLearnAnswer.isNotEmpty)
                  Directionality(
                    textDirection: TextDirection.rtl,
                    child: Text(
                      q.cleanLearnAnswer,
                      textAlign: TextAlign.center,
                      style: AppTheme.arabicTextStyle(
                        fontSize: 24,
                        color: Colors.black,
                      ),
                    ),
                  ),
                if (q.questionTitle.isNotEmpty) ...[
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 8),
                    child: Divider(
                      color: Color(0xFFE0E0E0),
                      thickness: 1,
                      height: 1,
                    ),
                  ),
                  Directionality(
                    textDirection: TextDirection.rtl,
                    child: Text(
                      q.questionTitle,
                      textAlign: TextAlign.center,
                      style: AppTheme.arabicTextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                        color: AppColors.textSecondary,
                      )),
                    ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  // ─── MCQ ────────────────────────────────────────────────────────────────
  Widget _buildMcqQuestion(LessonQuestion q) {
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(child: _buildQuestionLabel('Question')),
          const SizedBox(height: 8),
          Text(
            q.questionTitle,
            textAlign: TextAlign.center,
            style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w900,
                color: AppColors.textPrimary,
                height: 1.25),
          ),
          if (q.imageUrl != null) ...[
            const SizedBox(height: 8),
            _buildImageCard(q.imageUrl!, size: 280),
          ],
          const SizedBox(height: 8),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 8,
              crossAxisSpacing: 8,
              childAspectRatio: 2.5,
            ),
            itemCount: q.answers.length,
            itemBuilder: (context, index) {
              final answer = q.answers[index];
              final isSelected = _selectedOptionId == answer.id;
              final isCorrectAnswer = answer.isCorrect == true;
              final showCorrect = _questionAnswered && isCorrectAnswer;
              final showWrong =
                  _questionAnswered && isSelected && !isCorrectAnswer;
              return _McqOption(
                text: answer.title,
                selected: isSelected,
                correct: showCorrect,
                wrong: showWrong,
                onTap: _questionAnswered
                    ? null
                    : () => setState(() => _selectedOptionId = answer.id),
              );
            },
          ),
        ],
      ),
    );
  }

  // ─── TRUE / FALSE ──────────────────────────────────────────────────────
  Widget _buildTrueFalseQuestion(LessonQuestion q) {
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(child: _buildQuestionLabel('Question')),
          const SizedBox(height: 8),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: BorderRadius.circular(AppTheme.cardRadius),
              border: Border.all(color: AppColors.border),
            ),
            child: Text(
              q.questionTitle,
              textAlign: TextAlign.center,
              style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textPrimary,
                  height: 1.25),
            ),
          ),
          if (q.imageUrl != null) ...[
            const SizedBox(height: 8),
            _buildImageCard(q.imageUrl!, size: 280),
          ],
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _TrueFalseButton(
                  label: 'True',
                  icon: Icons.check_rounded,
                  selected: _selectedTrueFalse == true,
                  correct: _questionAnswered && q.trueFalseAnswer == true,
                  wrong: _questionAnswered &&
                      _selectedTrueFalse == true &&
                      q.trueFalseAnswer != true,
                  onTap: _questionAnswered
                      ? null
                      : () => setState(() => _selectedTrueFalse = true),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _TrueFalseButton(
                  label: 'False',
                  icon: Icons.close_rounded,
                  selected: _selectedTrueFalse == false,
                  correct: _questionAnswered && q.trueFalseAnswer == false,
                  wrong: _questionAnswered &&
                      _selectedTrueFalse == false &&
                      q.trueFalseAnswer != false,
                  onTap: _questionAnswered
                      ? null
                      : () => setState(() => _selectedTrueFalse = false),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ─── FILL BLANK ────────────────────────────────────────────────────────

  _FillBlankParts _parseFillBlankQuestion(String title) {
    String instruction = '';
    var sentence = title.trim();

    final colonIndex = title.indexOf(':');
    if (colonIndex != -1) {
      instruction = title.substring(0, colonIndex + 1).trim();
      sentence = title.substring(colonIndex + 1).trim();
    } else {
      if (!_isArabicText(title)) {
        instruction = title;
        sentence = '';
      }
    }

    final blankPattern = RegExp(r'''(?:['"]?_+['"]?)|-{3,}|\.{3,}''');
    final match = blankPattern.firstMatch(sentence);

    if (match == null) {
      return _FillBlankParts(
        instruction: instruction,
        before: sentence,
        after: '',
        hasBlank: false,
      );
    }

    final raw = match[0]!.replaceAll(RegExp(r"""^['"]|['"]$"""), '');
    final displayBlank = RegExp(r'^_+$').hasMatch(raw) ? '' : raw;

    final before = sentence.substring(0, match.start).trim();
    final after = sentence.substring(match.end).trim();

    if (before.isEmpty) {
      return _FillBlankParts(
        instruction: instruction,
        before: after,
        after: '',
        hasBlank: true,
        blank: displayBlank,
      );
    }
    if (after.isEmpty) {
      return _FillBlankParts(
        instruction: instruction,
        before: before,
        after: '',
        hasBlank: true,
        blank: displayBlank,
      );
    }

    return _FillBlankParts(
      instruction: instruction,
      before: before,
      after: after,
      hasBlank: true,
      blank: displayBlank,
    );
  }

  Widget _buildFillBlankQuestion(LessonQuestion q) {
    final parts = _parseFillBlankQuestion(q.questionTitle);
    final isArabic = _isArabicText(q.questionTitle);

    return Padding(
      padding: const EdgeInsets.only(top: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Question label with audio buttons (outside card, like web)
          Center(child: _buildQuestionLabel('Fill in the blank')),
          const SizedBox(height: 16),

          // Card container (web: bg-card border border-border rounded-xl p-4 sm:p-6)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
            decoration: BoxDecoration(
              color: AppColors.card,
              border: Border.all(color: AppColors.border),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              children: [
                // English instruction (web: text-lg font-bold text-center mb-4)
                if (parts.instruction.isNotEmpty) ...[
                  Text(
                    parts.instruction,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                      fontFamily: isArabic ? AppTheme.arabicFontFamily : null,
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                // Arabic sentence + blank slot (web: text-xl font-bold text-center leading-relaxed)
                Directionality(
                  textDirection: TextDirection.rtl,
                  child: Wrap(
                    alignment: WrapAlignment.center,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    spacing: 10,
                    runSpacing: 8,
                    children: [
                      if (parts.before.isNotEmpty)
                        Text(
                          parts.before,
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                            height: 1.4,
                            fontFamily: AppTheme.arabicFontFamily,
                          ),
                        ),

                      // Blank slot (web: w-[140px] h-[1.35em] border-b-2 border-foreground/40)
                      Container(
                        width: 140,
                        height: 38,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          border: Border(
                            bottom: BorderSide(
                              color: AppColors.textPrimary.withValues(alpha: 0.4),
                              width: 2,
                            ),
                          ),
                        ),
                        child: AnimatedSwitcher(
                          duration: const Duration(milliseconds: 180),
                          switchInCurve: Curves.easeOut,
                          switchOutCurve: Curves.easeIn,
                          transitionBuilder: (child, animation) {
                            return FadeTransition(
                              opacity: animation,
                              child: SlideTransition(
                                position: Tween<Offset>(
                                  begin: const Offset(0, 0.3),
                                  end: Offset.zero,
                                ).animate(animation),
                                child: child,
                              ),
                            );
                          },
                          child: _selectedFillBlankText.isNotEmpty
                              ? Text(
                                  _selectedFillBlankText,
                                  key: ValueKey(_selectedFillBlankText),
                                  textAlign: TextAlign.center,
                                  overflow: TextOverflow.ellipsis,
                                  maxLines: 1,
                                  style: TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.textPrimary,
                                    fontFamily: AppTheme.arabicFontFamily,
                                  ),
                                )
                              : Text(
                                  '',
                                  key: const ValueKey('blank'),
                                  style: TextStyle(
                                    fontSize: 20,
                                    color: AppColors.textSecondary.withValues(alpha: 0.4),
                                  ),
                                ),
                        ),
                      ),

                      if (parts.after.isNotEmpty)
                        Text(
                          parts.after,
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                            height: 1.4,
                            fontFamily: AppTheme.arabicFontFamily,
                          ),
                        ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Options grid (web: grid grid-cols-2 gap-3 sm:gap-4)
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  childAspectRatio: 2.0,
                  children: List.generate(q.answers.length, (index) {
                    final answer = q.answers[index];
                    final isSelected = _selectedFillBlankId == answer.id;
                    final isCorrectAnswer = answer.isCorrect == true;
                    final showCorrect = _questionAnswered && isCorrectAnswer;
                    final showWrong = _questionAnswered && isSelected && !isCorrectAnswer;
                    return _FillBlankOption(
                      text: answer.title,
                      selected: isSelected,
                      correct: showCorrect,
                      wrong: showWrong,
                      index: index,
                      onTap: _questionAnswered
                          ? null
                          : () => setState(() {
                                _selectedFillBlankId = answer.id;
                                _selectedFillBlankText = answer.title;
                              }),
                    );
                  }),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ─── WORD / SENTENCE MAKING ────────────────────────────────────────────
  Widget _buildTokenMakingQuestion(LessonQuestion q) {
    final sorted = q.answers;
    final isSentence = q.questionType == 'sentence_making';

    // Build diacritized preview for word_making
    final selectedWord = _selectedTokens.map((t) => t.title).join('');
    String previewWord = selectedWord;
    if (!isSentence && selectedWord.isNotEmpty) {
      final orderedTokens = q.sortedAnswers.map((a) => a.title).join('');
      final candidates = [
        q.cleanLearnAnswer,
        q.correctAnswer?.title ?? '',
        orderedTokens,
      ];
      final targetWord = candidates.firstWhere(
        (c) => c.trim().isNotEmpty,
        orElse: () => '',
      );
      final fallbackTargetWord = _applyDiacriticsFallback(
        targetWord.isNotEmpty ? targetWord : orderedTokens,
      );
      String bestTarget;
      if (targetWord.isEmpty) {
        bestTarget = fallbackTargetWord;
      } else if (!_hasArabicDiacritics(targetWord)) {
        bestTarget = fallbackTargetWord;
      } else {
        bestTarget = targetWord;
      }
      if (bestTarget.isNotEmpty) {
        previewWord = _buildDiacritizedPreview(bestTarget, selectedWord);
      }
    }

    return Padding(
      padding: const EdgeInsets.only(top: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildQuestionLabel(
              isSentence ? 'Arrange the words' : 'Build the word'),
          const SizedBox(height: 18),
          Text(q.questionTitle,
              textAlign: TextAlign.center,
              style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textPrimary)),
          const SizedBox(height: 24),
          Container(
            width: double.infinity,
            constraints: const BoxConstraints(minHeight: 100),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: BorderRadius.circular(AppTheme.cardRadius),
              border: Border.all(
                color: _questionAnswered
                    ? (_lastAnswerCorrect == true
                        ? AppColors.correctGreen
                        : AppColors.wrongRed)
                    : AppColors.accent,
                width: 1.5,
              ),
            ),
            child: isSentence
                ? _buildSentenceSelectedArea()
                : _buildWordSelectedArea(previewWord),
          ),
          const SizedBox(height: 28),
          Center(
            child: Directionality(
              textDirection: TextDirection.rtl,
              child: Wrap(
                spacing: 10,
                runSpacing: 10,
                alignment: WrapAlignment.center,
                children: [
                  for (final answer in sorted)
                    _LetterTile(
                      label: answer.title,
                      active: !_usedTokenIds.contains(answer.id),
                      onTap: _questionAnswered ||
                              _usedTokenIds.contains(answer.id)
                          ? null
                          : () => _addToken(answer),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWordSelectedArea(String previewWord) {
    if (_selectedTokens.isEmpty) {
      return const SizedBox(
        height: 80,
        child: Center(
          child: Directionality(
            textDirection: TextDirection.rtl,
            child: Text('',
                style: TextStyle(fontSize: 32, color: AppColors.textSecondary)),
          ),
        ),
      );
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Large connected word preview
        Directionality(
          textDirection: TextDirection.rtl,
          child: SizedBox(
            height: 52,
            child: Center(
              child: Text(
                previewWord,
                style: AppTheme.arabicTextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: 8),
        // Small token chips - centered
        Center(
          child: Directionality(
            textDirection: TextDirection.rtl,
            child: Wrap(
              spacing: 6,
              runSpacing: 6,
              alignment: WrapAlignment.center,
              children: [
                for (int i = 0; i < _selectedTokens.length; i++)
                  GestureDetector(
                    onTap:
                        _questionAnswered ? null : () => _removeToken(i),
                    child: Container(
                      padding:
                          const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppColors.accent.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                            color: AppColors.accent.withValues(alpha: 0.3)),
                      ),
                      child: Text(
                        _selectedTokens[i].title,
                        style: AppTheme.arabicTextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSentenceSelectedArea() {
    if (_selectedTokens.isEmpty) {
      return const SizedBox(
        height: 80,
        child: Center(
          child: Directionality(
            textDirection: TextDirection.rtl,
            child: Text('',
                style: TextStyle(fontSize: 32, color: AppColors.textSecondary)),
          ),
        ),
      );
    }

    return Directionality(
      textDirection: TextDirection.rtl,
      child: Wrap(
        spacing: 8,
        runSpacing: 8,
        alignment: WrapAlignment.center,
        children: [
          for (var i = 0; i < _selectedTokens.length; i++)
            GestureDetector(
              onTap: _questionAnswered ? null : () => _removeToken(i),
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  color: AppColors.accent,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  _selectedTokens[i].title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  void _addToken(LessonAnswer answer) {
    setState(() {
      _usedTokenIds.add(answer.id);
      _selectedTokens.add(answer);
    });
  }

  void _removeToken(int index) {
    setState(() {
      final removed = _selectedTokens.removeAt(index);
      _usedTokenIds.remove(removed.id);
    });
  }

  // ─── PAIR MATCHING ─────────────────────────────────────────────────────
  Widget _buildPairMatchingQuestion(LessonQuestion q) {
    final pairs = q.answers;
    final leftItems = pairs.asMap().entries.map((entry) {
      final index = entry.key;
      final pair = entry.value;
      return _MatchItem(
        id: 'left-$index-${pair.id}',
        text: pair.leftTitle.isNotEmpty ? pair.leftTitle : pair.title,
        matchKey: pair.id,
      );
    }).toList();

    return Padding(
      padding: const EdgeInsets.only(top: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildQuestionLabel('Match the pairs'),
          const SizedBox(height: 18),
          Text(
            'Match Arabic & English',
            textAlign: TextAlign.center,
            style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w900,
                color: AppColors.textPrimary),
          ),
          const SizedBox(height: 8),
          Text(
            '${_matchedPairs.length} of ${q.answers.length} pairs correctly matched',
            textAlign: TextAlign.center,
            style: const TextStyle(
                color: AppColors.textSecondary,
                fontSize: 15,
                fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 18),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  children: leftItems.map((item) {
                    final isMatched =
                    _matchedPairs.containsKey(item.matchKey);
                    final isSelected = _selectedLeftId == item.id;
                    return _MatchTile(
                      label: item.text,
                      rtl: _isArabicText(item.text),
                      selected: isSelected,
                      matched: isMatched,
                      wrong: _wrongLeftId == item.id,
                      onTap: isMatched || _questionAnswered
                          ? null
                          : () =>
                          setState(() => _selectedLeftId = item.id),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  children: _shuffledRightItems.map((item) {
                    final isMatched =
                    _matchedPairs.containsValue(item.matchKey);
                    return _MatchTile(
                      label: item.text,
                      matched: isMatched,
                      wrong: _wrongRightId == item.id,
                      onTap: isMatched || _questionAnswered
                          ? null
                          : () => _tryMatchPair(item),
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _tryMatchPair(_MatchItem rightItem) {
    final selectedId = _selectedLeftId;
    if (selectedId == null) return;

    final question = _currentQuestion;
    final leftIndex = question.answers
        .asMap()
        .entries
        .where((entry) =>
    'left-${entry.key}-${entry.value.id}' == selectedId)
        .map((entry) => entry.key)
        .firstOrNull;

    if (leftIndex == null) return;

    final leftAnswer = question.answers[leftIndex];
    final leftMatchKey = leftAnswer.id;

    if (leftMatchKey == rightItem.matchKey) {
      setState(() {
        _matchedPairs[leftMatchKey] = rightItem.matchKey;
        _selectedLeftId = null;
      });
      _playSfx('assets/audio/correct.mp3');
      if (_matchedPairs.length == question.answers.length) {
        setState(() {
          _questionAnswered = true;
          _lastAnswerCorrect = true;
          _correctAnswers++;
          _skippedIndices.remove(_currentIndex);
        });
        _feedbackController.forward(from: 0);
      }
    } else {
      if (!_pairPenaltyApplied) {
        _pairPenaltyApplied = true;
        _hasWrongAnswer = true;
        _palmTrees--;
        _reportWrongAnswer();
        _playSfx('assets/audio/wrong.mp3');
        if (_palmTrees <= 0) {
          _showOutOfLivesDialog();
          return;
        }
      }
      setState(() {
        _wrongLeftId = selectedId;
        _wrongRightId = rightItem.id;
      });
      Future.delayed(const Duration(seconds: 1), () {
        if (mounted) {
          setState(() {
            _wrongLeftId = null;
            _wrongRightId = null;
          });
        }
      });
      setState(() => _selectedLeftId = null);
    }
  }

  // ─── SHARED WIDGETS ────────────────────────────────────────────────────

  // Question label with audio buttons matching the screenshot layout:
  // [filled purple circle speaker] [grey circle turtle] Learn
  Widget _buildQuestionLabel(String label) {
    final audioUrl = _currentQuestion.audioUrl;
    final hasAudio = audioUrl != null && audioUrl.trim().isNotEmpty;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (hasAudio) ...[
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Normal speed - filled purple circle
              GestureDetector(
                onTap: _audioLoading ? null : () => _playAudio(audioUrl),
                child: Container(
                  width: 44,
                  height: 44,
                  decoration: const BoxDecoration(
                    color: AppColors.accent,
                    shape: BoxShape.circle,
                  ),
                  child: _audioLoading
                      ? const Padding(
                    padding: EdgeInsets.all(10),
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: Colors.white),
                  )
                      : FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Padding(
                      padding: const EdgeInsets.all(11),
                      child: SvgPicture.asset(
                        'assets/nakhlah_web/icons/volume_icon.svg',
                        colorFilter: const ColorFilter.mode(Colors.white, BlendMode.srcIn),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              // Slow speed - grey circle with turtle icon
              GestureDetector(
                onTap: _audioLoading
                    ? null
                    : () => _playAudio(audioUrl, speed: 0.6),
                child: Container(
                  width: 44,
                  height: 44,
                  decoration: const BoxDecoration(
                    color: AppColors.optionBorderDefault,
                    shape: BoxShape.circle,
                  ),
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Padding(
                      padding: const EdgeInsets.all(11),
                      child: SvgPicture.asset(
                        'assets/nakhlah_web/icons/turtle_icon.svg',
                        colorFilter: const ColorFilter.mode(AppColors.textPrimary, BlendMode.srcIn),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
        ],
        Text(
          label,
          style: const TextStyle(
            color: AppColors.textDark,
            fontSize: 17,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }

  Widget _buildImageCard(String imageUrl, {double size = 280}) {
    return Center(
      child: SizedBox(
        width: size,
        height: size,
        child: Container(
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border, width: 6),
          ),
          clipBehavior: Clip.antiAlias,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: CachedNetworkImage(
              imageUrl: imageUrl,
              fit: BoxFit.cover,
              memCacheWidth: (size * 2).toInt(),
              fadeInDuration: const Duration(milliseconds: 200),
              fadeOutDuration: const Duration(milliseconds: 100),
              placeholder: (_, __) => Shimmer.fromColors(
                baseColor: AppColors.optionBorderDefault,
                highlightColor: AppColors.card,
                child: Container(
                  color: AppColors.card,
                ),
              ),
              errorWidget: (_, a, b) => const Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Icon(Icons.image_rounded, size: 56, color: AppColors.accent),
                  SizedBox(height: 12),
                  Text('Image',
                      style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textSecondary)),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildFeedbackBanner() {
    final isCorrect = _lastAnswerCorrect == true;
    final q = _currentQuestion;

    String feedbackText;
    if (isCorrect) {
      feedbackText = 'Correct!';
    } else if (q.isMcq || q.isFillBlank) {
      final correct = q.correctAnswer;
      feedbackText =
      correct != null ? 'Correct answer: ${correct.title}' : 'Incorrect';
    } else if (q.isTrueFalse) {
      feedbackText = q.trueFalseAnswer == true ? 'True' : 'False';
    } else {
      feedbackText = 'Incorrect';
    }

    return AnimatedBuilder(
      animation: _feedbackAnimation,
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(0, (1 - _feedbackAnimation.value) * 20),
          child: Opacity(
            opacity: _feedbackAnimation.value.clamp(0.0, 1.0),
            child: child,
          ),
        );
      },
      child: Container(
        width: double.infinity,
        margin: const EdgeInsets.fromLTRB(16, 8, 16, 0),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color:
          isCorrect ? AppColors.optionBgCorrect : AppColors.optionBgWrong,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isCorrect
                ? AppColors.optionBorderCorrect
                : AppColors.optionBorderWrong,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SvgPicture.asset(
              isCorrect
                  ? 'assets/nakhlah_web/icons/Correct_answer.svg'
                  : 'assets/nakhlah_web/icons/Wrong_answer.svg',
              width: 28,
              height: 28,
            ),
            const SizedBox(width: 8),
            Flexible(
              child: Text(
                feedbackText,
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: isCorrect ? AppColors.success : AppColors.error,
                  fontSize: 16,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomActions() {
    final q = _currentQuestion;
    final canCheck = _hasAnswer && !_questionAnswered;

    String buttonLabel;
    Color buttonColor;
    VoidCallback? onPressed;

    if (q.isLearn) {
      buttonLabel = 'Continue';
      buttonColor = AppColors.accent;
      onPressed = _handleContinue;
    } else if (_questionAnswered) {
      buttonLabel = 'Continue';
      buttonColor = _lastAnswerCorrect == true
          ? AppColors.success
          : AppColors.accent;
      onPressed = _handleContinue;
    } else {
      buttonLabel = 'Check Answer';
      buttonColor = AppColors.accent;
      onPressed = canCheck ? _handleCheck : null;
    }

    return Padding(
      padding: AppTheme.bottomActionPadding,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Divider(
            color: Color(0xFFE0E0E0),
            thickness: 1,
            height: 1,
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              TextButton(
                onPressed: () {
                  if (!_questionAnswered) {
                    if (!_currentQuestion.isLearn) {
                      _skippedIndices.add(_currentIndex);
                    }
                    _hasWrongAnswer = true;
                  }
                  if (_isLastQuestion) {
                    if (_skippedIndices.isNotEmpty) {
                      _isRevisitingSkipped = true;
                      final nextSkipped = _skippedIndices.first;
                      _skippedIndices.remove(nextSkipped);
                      setState(() {
                        _currentIndex = nextSkipped;
                        _resetQuestionState();
                      });
                      _autoPlayAudio();
                    } else {
                      _completeLesson();
                    }
                  } else {
                    setState(() {
                      _currentIndex++;
                      _resetQuestionState();
                    });
                    _autoPlayAudio();
                  }
                },
                child: const Text('Skip',
                    style: TextStyle(
                        decoration: TextDecoration.underline,
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w800)),
              ),
              const Spacer(),
              SizedBox(
                height: AppTheme.buttonHeight,
                width: 200,
                child: ElevatedButton(
                  onPressed: onPressed,
                  style: ElevatedButton.styleFrom(
                    elevation: 0,
                    backgroundColor: buttonColor,
                    foregroundColor: Colors.white,
                    disabledBackgroundColor: AppColors.buttonDisabled,
                    disabledForegroundColor: AppColors.buttonDisabledText,
                    shape: RoundedRectangleBorder(
                      borderRadius:
                      BorderRadius.circular(AppTheme.buttonRadius),
                    ),
                  ),
                  child: Text(buttonLabel,
                      style: const TextStyle(
                          fontSize: 16, fontWeight: FontWeight.w900)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  bool _isArabicText(String text) =>
      RegExp(r'[\u0600-\u06FF]').hasMatch(text);
}

// ─── PRIVATE WIDGETS ────────────────────────────────────────────────────

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
              color: border, width: selected || correct || wrong ? 2 : 1),
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

class _TrueFalseButton extends StatelessWidget {
  const _TrueFalseButton({
    required this.label,
    required this.icon,
    required this.selected,
    required this.correct,
    required this.wrong,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final bool selected;
  final bool correct;
  final bool wrong;
  final VoidCallback? onTap;

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
      borderRadius: BorderRadius.circular(16),
      child: Container(
        height: 72,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: color,
          border: Border.all(
              color: border, width: selected || correct || wrong ? 2 : 1),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon,
                color: wrong
                    ? AppColors.wrongRed
                    : correct
                    ? AppColors.correctGreen
                    : selected
                    ? AppColors.accent
                    : AppColors.textPrimary,
                size: 24),
            const SizedBox(width: 8),
            Text(label,
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    color: wrong
                        ? AppColors.wrongRed
                        : correct
                        ? AppColors.correctGreen
                        : selected
                        ? AppColors.accent
                        : AppColors.textPrimary)),
          ],
        ),
      ),
    );
  }
}

class _LetterTile extends StatelessWidget {
  const _LetterTile(
      {required this.label, required this.active, this.onTap});

  final String label;
  final bool active;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: active ? 1 : .28,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          width: 58,
          height: 58,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border),
          ),
          child: Text(label,
              style: AppTheme.arabicTextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textPrimary)),
        ),
      ),
    );
  }
}

class _MatchItem {
  const _MatchItem(
      {required this.id, required this.text, required this.matchKey});
  final String id;
  final String text;
  final String matchKey;
}

class _MatchTile extends StatelessWidget {
  const _MatchTile({
    required this.label,
    this.rtl = false,
    this.selected = false,
    this.matched = false,
    this.wrong = false,
    this.onTap,
  });

  final String label;
  final bool rtl;
  final bool selected;
  final bool matched;
  final bool wrong;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final color = wrong
        ? const Color(0xFFFFEBEB)
        : matched
        ? AppColors.optionBgCorrect
        : selected
        ? AppColors.optionBgSelected
        : AppColors.card;
    final foreground = wrong
        ? AppColors.wrongRed
        : selected
        ? Colors.white
        : AppColors.textPrimary;

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Container(
          width: double.infinity,
          constraints: const BoxConstraints(minHeight: 58),
          alignment: Alignment.center,
          padding:
          const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(
              color: wrong
                  ? AppColors.wrongRed
                  : matched
                  ? AppColors.optionBorderCorrect
                  : selected
                  ? AppColors.optionBorderSelected
                  : AppColors.optionBorderDefault,
              width: wrong || selected || matched ? 2 : 1,
            ),
          ),
          child: Directionality(
            textDirection: rtl ? TextDirection.rtl : TextDirection.ltr,
            child: Text(
              label,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: rtl ? 18 : 14,
                fontWeight: FontWeight.w800,
                color: foreground,
                fontFamily: rtl ? AppTheme.arabicFontFamily : null,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _FillBlankParts {
  const _FillBlankParts({
    required this.instruction,
    required this.before,
    required this.after,
    this.hasBlank = false,
    this.blank = '',
  });

  final String instruction;
  final String before;
  final String after;
  final bool hasBlank;
  final String blank;
}

class _FillBlankOption extends StatelessWidget {
  const _FillBlankOption({
    required this.text,
    required this.selected,
    required this.correct,
    required this.wrong,
    required this.index,
    required this.onTap,
  });

  final String text;
  final bool selected;
  final bool correct;
  final bool wrong;
  final int index;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final color = wrong
        ? AppColors.optionBgWrong
        : correct
            ? AppColors.optionBgCorrect
            : selected
                ? AppColors.accent.withValues(alpha: 0.1)
                : AppColors.card;
    final border = wrong
        ? AppColors.optionBorderWrong
        : correct
            ? AppColors.optionBorderCorrect
            : selected
                ? AppColors.accent
                : AppColors.border;

    return AnimatedOpacity(
      opacity: 1.0,
      duration: Duration(milliseconds: 300 + (index * 100)),
      child: AnimatedSlide(
        offset: Offset.zero,
        duration: Duration(milliseconds: 300 + (index * 100)),
        curve: Curves.easeOut,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            constraints: const BoxConstraints(minHeight: 80),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: color,
              border: Border.all(
                color: border,
                width: selected || correct || wrong ? 2 : 1,
              ),
              borderRadius: BorderRadius.circular(12),
              boxShadow: selected
                  ? [
                      BoxShadow(
                        color: AppColors.accent.withValues(alpha: 0.15),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ]
                  : null,
            ),
            child: Center(
              child: Text(
                text,
                textAlign: TextAlign.center,
                textDirection: TextDirection.rtl,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: wrong
                      ? AppColors.optionBorderWrong
                      : correct
                          ? AppColors.optionBorderCorrect
                          : AppColors.textPrimary,
                  fontFamily: AppTheme.arabicFontFamily,
                  height: 1.3,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}