import 'dart:io';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:shimmer/shimmer.dart';

import '../../common/app_motion.dart';
import '../../common/nakhlah_intro_widgets.dart';
import '../../constants/app_colors.dart';
import '../../controllers/app_controller.dart';
import '../../controllers/auth_controller.dart';
import '../../controllers/profile_controller.dart';
import '../../models/models.dart';
import '../../routes/app_routes.dart';

const _totalSteps = 10;
const _pageTransitionDuration = Duration(milliseconds: 380);
const _pageTransitionCurve = Curves.easeOutCubic;

class OnboardingFormView extends StatefulWidget {
  const OnboardingFormView({super.key});

  @override
  State<OnboardingFormView> createState() => _OnboardingFormViewState();
}

class _OnboardingFormViewState extends State<OnboardingFormView> {
  final _pageController = PageController();
  int _step = 0;

  String _strengthId = '';
  String _goalTime = '';
  String _purposeId = '';
  String _countryId = '';
  String _sourceId = '';
  final List<String> _interestIds = [];
  String _fullName = '';
  String _contactNumber = '';
  File? _profilePicture;
  String _ageId = '';
  String _email = '';
  String _password = '';

  ProfileController get _profileCtrl => Get.find<ProfileController>();

  @override
  void initState() {
    super.initState();
    _profileCtrl.loadOnboardingOptions();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  bool get _canProceed {
    switch (_step) {
      case 0:
        return _strengthId.isNotEmpty;
      case 1:
        return _goalTime.isNotEmpty;
      case 2:
        return _purposeId.isNotEmpty;
      case 3:
        return _countryId.isNotEmpty;
      case 4:
        return _sourceId.isNotEmpty;
      case 5:
        return _interestIds.isNotEmpty;
      case 6:
        final digits = _contactNumber.replaceAll(RegExp(r'[^0-9]'), '');
        return _fullName.trim().length > 1 &&
            _contactNumber.trim().length > 1 &&
            digits.length <= 11;
      case 7:
        return _ageId.isNotEmpty;
      case 8:
        return true;
      default:
        return true;
    }
  }

  void _next() {
    if (_step < _totalSteps - 1) {
      _pageController.nextPage(
        duration: _pageTransitionDuration,
        curve: _pageTransitionCurve,
      );
    }
  }

  void _back() {
    if (_step > 0) {
      _pageController.previousPage(
        duration: _pageTransitionDuration,
        curve: _pageTransitionCurve,
      );
    }
  }

  OnboardingItem? _findItem(List<OnboardingItem> items, String id) {
    for (final item in items) {
      if (item.id == id) return item;
    }
    return null;
  }

  Future<void> _submit() async {
    // If the user entered email/password in the form (not already signed up),
    // register them first so we have an auth token for the profile POST.
    final authUser = Get.isRegistered<AuthController>()
        ? Get.find<AuthController>().user.value
        : null;
    final existingEmail = authUser?.email ?? '';

    if (existingEmail.isEmpty && _email.isNotEmpty && _password.isNotEmpty) {
      final signedUp = await Get.find<AuthController>().signUp(
        _email.trim(),
        _password,
      );
      if (!signedUp) return;
    }

    final opts = _profileCtrl.onboardingOptions.value;
    final strength = _findItem(opts?.languageStrength ?? [], _strengthId);
    final purpose = _findItem(opts?.purpose ?? [], _purposeId);
    final country = _findItem(opts?.country ?? [], _countryId);
    final source = _findItem(opts?.userSource ?? [], _sourceId);
    final age = _findItem(opts?.age ?? [], _ageId);

    final info = OnboardInfo(
      age: age?.title ?? _ageId,
      country: country?.title ?? _countryId,
      purpose: purpose?.title ?? '',
      goalTime: int.tryParse(_goalTime) ?? 10,
      userSource: (source?.title ?? _sourceId).toLowerCase(),
      languageStrength: strength?.title ?? _strengthId,
    );

    final created = await _profileCtrl.createOnboarding(
      info,
      fullName: _fullName.trim(),
      contactNumber: _contactNumber.trim(),
    );

    if (created) {
      Get.offAllNamed(Routes.shell);
      Get.find<AppController>().setTab(0);
    }
  }

  @override
  Widget build(BuildContext context) {
    return IntroScaffold(
      showBack: _step > 0,
      child: Column(
        children: [
          AnimatedOpacity(
            opacity: _step > 0 ? 1.0 : 0.0,
            duration: AppMotion.fast,
            child: Align(
              alignment: Alignment.centerLeft,
              child: TextButton.icon(
                onPressed: _step > 0 ? _back : null,
                icon: const Icon(Icons.arrow_back_rounded, size: 18),
                label: const Text('Back'),
                style: TextButton.styleFrom(
                  foregroundColor: AppColors.accent,
                  textStyle: const TextStyle(fontWeight: FontWeight.w900),
                  minimumSize: Size.zero,
                  padding: EdgeInsets.zero,
                ),
              ),
            ),
          ),
          const SizedBox(height: 4),
          _StepProgressBar(currentStep: _step, totalSteps: _totalSteps),
          const SizedBox(height: 4),
          Expanded(
            child: Obx(() {
              final opts = _profileCtrl.onboardingOptions.value;
              if (opts == null) {
                return const Center(
                  child: CircularProgressIndicator(color: AppColors.accent),
                );
              }
              return PageView(
                controller: _pageController,
                physics: const NeverScrollableScrollPhysics(),
                onPageChanged: (v) => setState(() => _step = v),
                children: [
                  _buildProficiencyStep(opts),
                  _buildGoalStep(opts),
                  _buildPurposeStep(opts),
                  _buildCountryStep(opts),
                  _buildSourceStep(opts),
                  _buildInterestsStep(opts),
                  _buildProfileInfoStep(),
                  _buildAgeStep(opts),
                  _buildAccountStep(),
                  _buildCompletionStep(),
                ],
              );
            }),
          ),
          _buildBottomBar(),
        ],
      ),
    );
  }

  Widget _buildBottomBar() {
    final isLast = _step == _totalSteps - 1;
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Obx(() {
        final loading = _profileCtrl.loading.value;
        return IntroPrimaryButton(
          label: isLast ? 'Start Learning' : 'Continue',
          icon: isLast ? Icons.rocket_launch_rounded : Icons.arrow_forward_rounded,
          loading: loading,
          onPressed: _canProceed
              ? () {
                  if (isLast) {
                    _submit();
                  } else {
                    _next();
                  }
                }
              : null,
        );
      }),
    );
  }

  // ── Step 0: Proficiency ──────────────────────────────────────

  Widget _buildProficiencyStep(OnboardingOptions opts) {
    return _SelectionStep(
      title: opts.strengthsTitleTop.isNotEmpty
          ? opts.strengthsTitleTop
          : 'What is your Arabic\nproficiency level?',
      subtitle: 'We\'ll personalise lessons to match your level.',
      items: opts.languageStrength,
      selectedId: _strengthId,
      onSelect: (id) => setState(() => _strengthId = id),
    );
  }

  // ── Step 1: Goal ────────────────────────────────────────────

  Widget _buildGoalStep(OnboardingOptions opts) {
    return _GoalPickerStep(
      title: opts.goalTimeTopTitle.isNotEmpty
          ? opts.goalTimeTopTitle
          : 'Set your daily goal',
      subtitle: 'How much time can you dedicate each day?',
      items: opts.goal,
      selectedGoalTime: _goalTime,
      onSelect: (v) => setState(() => _goalTime = v),
    );
  }

  // ── Step 2: Purpose ─────────────────────────────────────────

  Widget _buildPurposeStep(OnboardingOptions opts) {
    return _SelectionStep(
      title: opts.purposeTitleTop.isNotEmpty
          ? opts.purposeTitleTop
          : 'What is your purpose\nfor learning Arabic?',
      subtitle: 'We\'ll tailor content to your motivation.',
      items: opts.purpose,
      selectedId: _purposeId,
      onSelect: (id) => setState(() => _purposeId = id),
    );
  }

  // ── Step 3: Country ─────────────────────────────────────────

  Widget _buildCountryStep(OnboardingOptions opts) {
    return _SelectionStep(
      title: opts.countryNameTop.isNotEmpty
          ? opts.countryNameTop
          : 'Where are you from?',
      subtitle: 'This helps us localise your experience.',
      items: opts.country,
      selectedId: _countryId,
      onSelect: (id) => setState(() => _countryId = id),
    );
  }

  // ── Step 4: Source ──────────────────────────────────────────

  Widget _buildSourceStep(OnboardingOptions opts) {
    return _SelectionStep(
      title: opts.sourceNameTop.isNotEmpty
          ? opts.sourceNameTop
          : 'How did you hear\nabout us?',
      subtitle: 'Your answer helps us reach more learners.',
      items: opts.userSource,
      selectedId: _sourceId,
      onSelect: (id) => setState(() => _sourceId = id),
    );
  }

  // ── Step 5: Interests ──────────────────────────────────────

  Widget _buildInterestsStep(OnboardingOptions opts) {
    return _MultiSelectStep(
      title: opts.interestTitleTop.isNotEmpty
          ? opts.interestTitleTop
          : 'What interests you?',
      subtitle: 'Pick topics you\'d like to explore. Select at least one.',
      items: opts.interests,
      selectedIds: _interestIds,
      onToggle: (id) {
        setState(() {
          if (_interestIds.contains(id)) {
            _interestIds.remove(id);
          } else {
            _interestIds.add(id);
          }
        });
      },
    );
  }

  // ── Step 6: Profile Info ───────────────────────────────────

  Widget _buildProfileInfoStep() {
    return _ProfileInfoStepContent(
      fullName: _fullName,
      contactNumber: _contactNumber,
      profilePicture: _profilePicture,
      onFullNameChanged: (v) => setState(() => _fullName = v),
      onContactChanged: (v) => setState(() => _contactNumber = v),
      onPictureChanged: (v) => setState(() => _profilePicture = v),
    );
  }

  // ── Step 7: Age ────────────────────────────────────────────

  Widget _buildAgeStep(OnboardingOptions opts) {
    return _SelectionStep(
      title: opts.ageTitleTop.isNotEmpty ? opts.ageTitleTop : 'How old are you?',
      subtitle: 'This helps us personalise your learning path.',
      items: opts.age,
      selectedId: _ageId,
      onSelect: (id) => setState(() => _ageId = id),
    );
  }

  // ── Step 8: Account ────────────────────────────────────────

  Widget _buildAccountStep() {
    final authUser = Get.isRegistered<AuthController>()
        ? Get.find<AuthController>().user.value
        : null;
    final existingEmail = authUser?.email ?? '';

    if (existingEmail.isNotEmpty) {
      return _AccountStepContent(
        email: existingEmail,
        password: '',
        isReadOnly: true,
        onEmailChanged: (_) {},
        onPasswordChanged: (_) {},
      );
    }

    return _AccountStepContent(
      email: _email,
      password: _password,
      isReadOnly: false,
      onEmailChanged: (v) => setState(() => _email = v),
      onPasswordChanged: (v) => setState(() => _password = v),
    );
  }

  // ── Step 9: Completion ─────────────────────────────────────

  Widget _buildCompletionStep() {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.only(top: 8, bottom: 20),
      child: Column(
        children: [
          const SizedBox(height: 20),
          Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [AppColors.premiumGradientStart, AppColors.premiumGradientEnd],
              ),
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: AppColors.accent.withValues(alpha: .30),
                  blurRadius: 24,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: const Icon(
              Icons.check_rounded,
              color: Colors.white,
              size: 56,
            ),
          ),
          const SizedBox(height: 28),
          const IntroTitleBlock(
            title: 'You\'re All Set!',
            body:
                'Your profile is ready. Tap below to start your Arabic learning journey with Nakhlah.',
            titleSize: 32,
            align: TextAlign.center,
          ),
          const SizedBox(height: 24),
          const IntroStatBadges(),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────
//  Progress bar
// ─────────────────────────────────────────────────────────────

class _StepProgressBar extends StatelessWidget {
  const _StepProgressBar({required this.currentStep, required this.totalSteps});

  final int currentStep;
  final int totalSteps;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: List.generate(totalSteps, (i) {
          final done = i < currentStep;
          final active = i == currentStep;
          return Expanded(
            child: Padding(
              padding: EdgeInsets.only(right: i < totalSteps - 1 ? 4 : 0),
              child: AnimatedContainer(
                duration: AppMotion.normal,
                height: 5,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(4),
                  color: done || active
                      ? AppColors.accent
                      : AppColors.accent.withValues(alpha: .15),
                ),
              ),
            ),
          );
        }),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────
//  Reusable single-select grid step
// ─────────────────────────────────────────────────────────────

class _SelectionStep extends StatelessWidget {
  const _SelectionStep({
    required this.title,
    required this.subtitle,
    required this.items,
    required this.selectedId,
    required this.onSelect,
  });

  final String title, subtitle;
  final List<OnboardingItem> items;
  final String selectedId;
  final ValueChanged<String> onSelect;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.only(top: 8, bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          IntroTitleBlock(
            title: title,
            body: subtitle,
            titleSize: 26,
            align: TextAlign.left,
          ),
          const SizedBox(height: 20),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: items.length,
            itemBuilder: (context, i) {
              final item = items[i];
              final isSelected = item.id == selectedId;
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _OptionCard(
                  item: item,
                  isSelected: isSelected,
                  onTap: () => onSelect(item.id),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _OptionCard extends StatefulWidget {
  const _OptionCard({
    required this.item,
    required this.isSelected,
    required this.onTap,
    this.showMinDay = false,
    this.isVertical = false,
  });

  final OnboardingItem item;
  final bool isSelected;
  final VoidCallback onTap;
  final bool showMinDay;
  final bool isVertical;

  @override
  State<_OptionCard> createState() => _OptionCardState();
}

class _OptionCardState extends State<_OptionCard> {
  bool _imageReady = false;

  @override
  Widget build(BuildContext context) {
    final mediaUrl = widget.item.absoluteMediaUrl;
    final isSelected = widget.isSelected;

    final iconWidget = mediaUrl != null
        ? ClipRRect(
            borderRadius: BorderRadius.circular(widget.isVertical ? 12 : 10),
            child: SizedBox(
              width: widget.isVertical ? 56 : 44,
              height: widget.isVertical ? 56 : 44,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  if (!_imageReady)
                    Positioned.fill(
                      child: Shimmer.fromColors(
                        baseColor: const Color(0xFFE8E0F0),
                        highlightColor: const Color(0xFFF8F4FC),
                        period: const Duration(milliseconds: 1200),
                        child: Container(
                          decoration: BoxDecoration(
                            color: const Color(0xFFF0ECF5),
                            borderRadius: BorderRadius.circular(widget.isVertical ? 12 : 10),
                          ),
                        ),
                      ),
                    ),
                  Positioned.fill(
                    child: CachedNetworkImage(
                      imageUrl: mediaUrl,
                      fit: BoxFit.contain,
                      memCacheWidth: widget.isVertical ? 112 : 88,
                      fadeInDuration: Duration.zero,
                      imageBuilder: (_, imageProvider) {
                        if (!_imageReady) {
                          WidgetsBinding.instance.addPostFrameCallback((_) {
                            if (mounted) setState(() => _imageReady = true);
                          });
                        }
                        return Image(image: imageProvider, fit: BoxFit.contain);
                      },
                      errorWidget: (_, __, ___) => _fallbackIcon(isSelected),
                    ),
                  ),
                ],
              ),
            ),
          )
        : _fallbackIcon(isSelected);

    final textWidget = Text(
      widget.showMinDay ? '${widget.item.title} min / day' : widget.item.title,
      textAlign: widget.isVertical ? TextAlign.center : TextAlign.left,
      maxLines: 2,
      overflow: TextOverflow.ellipsis,
      style: TextStyle(
        color: isSelected ? AppColors.accent : AppColors.ink,
        fontWeight: FontWeight.w800,
        fontSize: widget.isVertical ? 13 : 15,
      ),
    );

    final cardDecoration = BoxDecoration(
      color: isSelected ? AppColors.optionBgSelected : Colors.white,
      borderRadius: BorderRadius.circular(widget.isVertical ? 20 : 16),
      border: Border.all(
        color: isSelected ? AppColors.accent : AppColors.accent.withValues(alpha: .12),
        width: isSelected ? 2.5 : 1.2,
      ),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withValues(alpha: isSelected ? .08 : .04),
          blurRadius: isSelected ? 16 : 10,
          offset: const Offset(0, 4),
        ),
      ],
    );

    if (widget.isVertical) {
      return GestureDetector(
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: AppMotion.fast,
          curve: AppMotion.out,
          decoration: cardDecoration,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              iconWidget,
              const SizedBox(height: 10),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                child: textWidget,
              ),
            ],
          ),
        ),
      );
    }

    return GestureDetector(
      onTap: widget.onTap,
      child: AnimatedContainer(
        duration: AppMotion.fast,
        curve: AppMotion.out,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: cardDecoration,
        child: Row(
          children: [
            iconWidget,
            const SizedBox(width: 14),
            Expanded(child: textWidget),
            if (isSelected) ...[
              const SizedBox(width: 10),
              Container(
                width: 24,
                height: 24,
                decoration: const BoxDecoration(
                  color: AppColors.accent,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check, color: Colors.white, size: 16),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _fallbackIcon(bool isSelected) {
    return Container(
      width: 44,
      height: 44,
      decoration: BoxDecoration(
        color: isSelected
            ? AppColors.accent.withValues(alpha: .12)
            : AppColors.accent.withValues(alpha: .08),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Icon(
        Icons.auto_awesome_rounded,
        color: isSelected ? AppColors.accent : AppColors.accent,
        size: 22,
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────
//  Goal picker step (quick-pick chips + optional images)
// ─────────────────────────────────────────────────────────────

class _GoalPickerStep extends StatelessWidget {
  const _GoalPickerStep({
    required this.title,
    required this.subtitle,
    required this.items,
    required this.selectedGoalTime,
    required this.onSelect,
  });

  final String title, subtitle;
  final List<OnboardingItem> items;
  final String selectedGoalTime;
  final ValueChanged<String> onSelect;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.only(top: 8, bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          IntroTitleBlock(
            title: title,
            body: subtitle,
            titleSize: 26,
            align: TextAlign.left,
          ),
          const SizedBox(height: 20),
          if (items.isNotEmpty)
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 1.1,
              ),
              itemCount: items.length,
              itemBuilder: (context, i) {
                final item = items[i];
                final goalVal = item.goalTime?.toString() ?? item.title;
                final isSelected = goalVal == selectedGoalTime;
                return _OptionCard(
                  item: item,
                  isSelected: isSelected,
                  onTap: () => onSelect(goalVal),
                  showMinDay: true,
                  isVertical: true,
                );
              },
            )
          else
            _buildFallbackGoalChips(),
        ],
      ),
    );
  }

  Widget _buildFallbackGoalChips() {
    const options = [5, 10, 15, 20];
    return Row(
      children: options.map((min) {
        final isSelected = selectedGoalTime == '$min';
        return Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: GestureDetector(
              onTap: () => onSelect('$min'),
              child: AnimatedContainer(
                duration: AppMotion.fast,
                padding: const EdgeInsets.symmetric(vertical: 16),
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.accent : const Color(0xFFF5F0FA),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isSelected
                        ? AppColors.accent
                        : AppColors.accent.withValues(alpha: .12),
                    width: isSelected ? 2 : 1,
                  ),
                ),
                child: Column(
                  children: [
                    Text(
                      '$min',
                      style: TextStyle(
                        color: isSelected ? Colors.white : AppColors.ink,
                        fontWeight: FontWeight.w900,
                        fontSize: 22,
                      ),
                    ),
                    Text(
                      '$min min / day',
                      style: TextStyle(
                        color: isSelected
                            ? Colors.white.withValues(alpha: .80)
                            : AppColors.muted,
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}

// ─────────────────────────────────────────────────────────────
//  Multi-select step (interests)
// ─────────────────────────────────────────────────────────────

class _MultiSelectStep extends StatelessWidget {
  const _MultiSelectStep({
    required this.title,
    required this.subtitle,
    required this.items,
    required this.selectedIds,
    required this.onToggle,
  });

  final String title, subtitle;
  final List<OnboardingItem> items;
  final List<String> selectedIds;
  final ValueChanged<String> onToggle;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.only(top: 8, bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          IntroTitleBlock(
            title: title,
            body: subtitle,
            titleSize: 26,
            align: TextAlign.left,
          ),
          const SizedBox(height: 20),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: items.length,
            itemBuilder: (context, i) {
              final item = items[i];
              final isSelected = selectedIds.contains(item.id);
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _OptionCard(
                  item: item,
                  isSelected: isSelected,
                  onTap: () => onToggle(item.id),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────
//  Profile info step (name, contact, picture)
// ─────────────────────────────────────────────────────────────

class _ProfileInfoStepContent extends StatefulWidget {
  const _ProfileInfoStepContent({
    required this.fullName,
    required this.contactNumber,
    required this.profilePicture,
    required this.onFullNameChanged,
    required this.onContactChanged,
    required this.onPictureChanged,
  });

  final String fullName, contactNumber;
  final File? profilePicture;
  final ValueChanged<String> onFullNameChanged;
  final ValueChanged<String> onContactChanged;
  final ValueChanged<File?> onPictureChanged;

  @override
  State<_ProfileInfoStepContent> createState() =>
      _ProfileInfoStepContentState();
}

class _ProfileInfoStepContentState extends State<_ProfileInfoStepContent> {
  late final TextEditingController _nameCtrl;
  late final TextEditingController _contactCtrl;
  bool _contactInvalid = false;

  @override
  void initState() {
    super.initState();
    _nameCtrl = TextEditingController(text: widget.fullName);
    _contactCtrl = TextEditingController(text: widget.contactNumber);
    _nameCtrl.addListener(() => widget.onFullNameChanged(_nameCtrl.text));
    _contactCtrl.addListener(() {
      final digits = _contactCtrl.text.replaceAll(RegExp(r'[^0-9]'), '');
      _contactInvalid = digits.length > 11;
      widget.onContactChanged(_contactCtrl.text);
    });
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _contactCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 512,
      maxHeight: 512,
      imageQuality: 80,
    );
    if (picked != null) {
      widget.onPictureChanged(File(picked.path));
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.only(top: 8, bottom: 20),
      child: Column(
        children: [
          const IntroTitleBlock(
            title: 'Tell us\nabout yourself',
            body: 'Add your name and contact so we can personalise your experience.',
            titleSize: 26,
            align: TextAlign.left,
          ),
          const SizedBox(height: 20),
          GestureDetector(
            onTap: _pickImage,
            child: Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.accent.withValues(alpha: .08),
                border: Border.all(
                  color: AppColors.accent.withValues(alpha: .30),
                  width: 2,
                ),
              ),
              child: widget.profilePicture != null
                  ? ClipOval(
                      child: Image.file(
                        widget.profilePicture!,
                        fit: BoxFit.cover,
                        width: 100,
                        height: 100,
                      ),
                    )
                  : Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.camera_alt_rounded,
                          color: AppColors.accent,
                          size: 28,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Photo',
                          style: TextStyle(
                            color: AppColors.accent,
                            fontWeight: FontWeight.w700,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
            ),
          ),
          const SizedBox(height: 24),
          AuthPanel(
            children: [
              IntroTextField(
                controller: _nameCtrl,
                label: 'Full name',
                icon: Icons.person_rounded,
              ),
              const SizedBox(height: 14),
              IntroTextField(
                controller: _contactCtrl,
                label: 'Contact number',
                icon: Icons.phone_rounded,
                keyboardType: TextInputType.phone,
              ),
              if (_contactInvalid) ...[
                const SizedBox(height: 6),
                const Text(
                  'Invalid number',
                  style: TextStyle(
                    color: AppColors.wrongRed,
                    fontWeight: FontWeight.w700,
                    fontSize: 12,
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────
//  Account step (email + password, read-only if already signed up)
// ─────────────────────────────────────────────────────────────

class _AccountStepContent extends StatefulWidget {
  const _AccountStepContent({
    required this.email,
    required this.password,
    required this.isReadOnly,
    required this.onEmailChanged,
    required this.onPasswordChanged,
  });

  final String email, password;
  final bool isReadOnly;
  final ValueChanged<String> onEmailChanged;
  final ValueChanged<String> onPasswordChanged;

  @override
  State<_AccountStepContent> createState() => _AccountStepContentState();
}

class _AccountStepContentState extends State<_AccountStepContent> {
  late final TextEditingController _emailCtrl;
  late final TextEditingController _passCtrl;
  bool _obscure = true;

  @override
  void initState() {
    super.initState();
    _emailCtrl = TextEditingController(text: widget.email);
    _passCtrl = TextEditingController(text: widget.password);
    _emailCtrl.addListener(() => widget.onEmailChanged(_emailCtrl.text));
    _passCtrl.addListener(() => widget.onPasswordChanged(_passCtrl.text));
  }

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.only(top: 8, bottom: 20),
      child: Column(
        children: [
          IntroTitleBlock(
            title: 'Your account',
            body: widget.isReadOnly
                ? 'You\'re already signed in. Tap continue to finish setup.'
                : 'Create your account to save progress and compete on the leaderboard.',
            titleSize: 26,
            align: TextAlign.left,
          ),
          const SizedBox(height: 20),
          if (!widget.isReadOnly)
            AuthPanel(
              children: [
                IntroTextField(
                  controller: _emailCtrl,
                  label: 'Email address',
                  icon: Icons.email_rounded,
                  keyboardType: TextInputType.emailAddress,
                ),
                const SizedBox(height: 14),
                IntroTextField(
                  controller: _passCtrl,
                  label: 'Password',
                  icon: Icons.lock_rounded,
                  obscureText: _obscure,
                  isObscured: _obscure,
                  onToggleObscure: () => setState(() => _obscure = !_obscure),
                ),
              ],
            )
          else
            AuthPanel(
              children: [
                Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: AppColors.accent.withValues(alpha: .10),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Icon(
                        Icons.check_circle_rounded,
                        color: AppColors.accent,
                        size: 22,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Signed in as',
                            style: TextStyle(
                              color: AppColors.muted,
                              fontWeight: FontWeight.w600,
                              fontSize: 12,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            widget.email,
                            style: const TextStyle(
                              color: AppColors.ink,
                              fontWeight: FontWeight.w800,
                              fontSize: 15,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
        ],
      ),
    );
  }
}
