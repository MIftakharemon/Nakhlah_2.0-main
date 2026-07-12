import 'dart:io';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:shimmer/shimmer.dart';

import '../../common/app_motion.dart';
import '../../common/nakhlah_intro_widgets.dart';
import '../../common/nakhlah_mascot.dart';
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
        return true;
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
    } else {
      Get.offAllNamed(Routes.getStarted);
    }
  }

  OnboardingItem? _findItem(List<OnboardingItem> items, String id) {
    for (final item in items) {
      if (item.id == id) return item;
    }
    return null;
  }

  Future<void> _submit() async {
    print('[ONBOARDING] _submit called');
    print('[ONBOARDING] email: $_email');
    print('[ONBOARDING] fullName: $_fullName');
    print('[ONBOARDING] contactNumber: $_contactNumber');
    print('[ONBOARDING] profilePicture: ${_profilePicture?.path}');
    print('[ONBOARDING] strengthId: $_strengthId');
    print('[ONBOARDING] goalTime: $_goalTime');
    print('[ONBOARDING] purposeId: $_purposeId');
    print('[ONBOARDING] countryId: $_countryId');
    print('[ONBOARDING] sourceId: $_sourceId');
    print('[ONBOARDING] ageId: $_ageId');

    // If the user entered email/password in the form (not already signed up),
    // register them first so we have an auth token for the profile POST.
    final authUser = Get.isRegistered<AuthController>()
        ? Get.find<AuthController>().user.value
        : null;
    final existingEmail = authUser?.email ?? '';

    if (existingEmail.isEmpty && _email.isNotEmpty && _password.isNotEmpty) {
      print('[ONBOARDING] Registering user...');
      final signedUp = await Get.find<AuthController>().signUp(
        _email.trim(),
        _password,
        navigateToOnboarding: false,
      );
      print('[ONBOARDING] signUp result: $signedUp');
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

    print('[ONBOARDING] Creating onboarding profile...');
    final created = await _profileCtrl.createOnboarding(
      info,
      fullName: _fullName.trim(),
      contactNumber: _contactNumber.trim(),
    );
    print('[ONBOARDING] createOnboarding result: $created');

    if (created && _profilePicture != null) {
      print('[ONBOARDING] Uploading profile picture...');
      await _profileCtrl.updateProfile(
        fullName: _fullName.trim().isNotEmpty ? _fullName.trim() : null,
        contactNumber: _contactNumber.trim().isNotEmpty ? _contactNumber.trim() : null,
        onboardInfo: info,
        picture: _profilePicture,
      );
    }

    if (created) {
      print('[ONBOARDING] Navigating to shell...');
      Get.offAllNamed(Routes.shell);
      Get.find<AppController>().setTab(0);
    }
  }

  @override
  Widget build(BuildContext context) {
    return IntroScaffold(
      showBack: false,
      showWordmark: false,
      child: Column(
        children: [
          Align(
            alignment: Alignment.centerLeft,
            child: TextButton.icon(
              onPressed: _back,
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
    if (isLast) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Obx(() {
        final loading = _profileCtrl.loading.value;
        if (_step == 6) {
          return Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              IntroPrimaryButton(
                label: 'Continue',
                icon: Icons.arrow_forward_rounded,
                loading: loading,
                onPressed: _canProceed ? () => _next() : null,
              ),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () => _next(),
                child: Text(
                  'Skip for now',
                  style: TextStyle(
                    color: AppColors.muted,
                    fontWeight: FontWeight.w700,
                    fontSize: 14,
                  ),
                ),
              ),
            ],
          );
        }
        return IntroPrimaryButton(
          label: 'Continue',
          icon: Icons.arrow_forward_rounded,
          loading: loading,
          onPressed: _canProceed ? () => _next() : null,
        );
      }),
    );
  }

  // ── Step 0: Proficiency ──────────────────────────────────────

  Widget _buildProficiencyStep(OnboardingOptions opts) {
    final items = List<OnboardingItem>.from(opts.languageStrength);
    if (items.length >= 2) {
      final temp = items[0];
      items[0] = items[1];
      items[1] = temp;
    }
    return _SelectionStep(
      title: opts.strengthsTitleTop.isNotEmpty
          ? opts.strengthsTitleTop
          : 'What is your Arabic\nproficiency level?',
      subtitle: 'We\'ll personalise lessons to match your level.',
      items: items,
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
      subtitle: 'Select your age range',
      items: opts.age,
      selectedId: _ageId,
      onSelect: (id) => setState(() => _ageId = id),
      hideImages: true,
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
      child: Center(
        child: Container(
          width: double.infinity,
          margin: const EdgeInsets.symmetric(horizontal: 8),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: AppColors.accent.withValues(alpha: .15),
              width: 1.2,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: .04),
                blurRadius: 16,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const NakhlahMascot(size: 160),
              const SizedBox(height: 28),
              const Text(
                'You\'re ready',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 30,
                  fontWeight: FontWeight.w900,
                  color: AppColors.ink,
                  height: 1.2,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                'Start your first lesson now \u2728',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: AppColors.muted,
                  fontSize: 15,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 28),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.accent,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    elevation: 0,
                  ),
                  child: const Text(
                    'Start Learning',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w800,
                    ),
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

// ─────────────────────────────────────────────────────────────
//  Mascot + Title header (shared across all onboarding steps)
// ─────────────────────────────────────────────────────────────

class _MascotTitleHeader extends StatelessWidget {
  const _MascotTitleHeader({
    required this.title,
    required this.subtitle,
  });

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const NakhlahMascot(size: 100),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w900,
                  color: AppColors.ink,
                  height: 1.15,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                subtitle,
                style: TextStyle(
                  color: AppColors.muted,
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ],
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
    this.hideImages = false,
  });

  final String title, subtitle;
  final List<OnboardingItem> items;
  final String selectedId;
  final ValueChanged<String> onSelect;
  final bool hideImages;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.only(top: 8, bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _MascotTitleHeader(
            title: title,
            subtitle: subtitle,
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
                  hideImage: hideImages,
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
    this.hideImage = false,
  });

  final OnboardingItem item;
  final bool isSelected;
  final VoidCallback onTap;
  final bool showMinDay;
  final bool isVertical;
  final bool hideImage;

  @override
  State<_OptionCard> createState() => _OptionCardState();
}

class _OptionCardState extends State<_OptionCard> {
  bool _imageReady = false;

  @override
  Widget build(BuildContext context) {
    final mediaUrl = widget.item.absoluteMediaUrl;
    final isSelected = widget.isSelected;

    final showIcon = !widget.hideImage;
    final iconWidget = showIcon && mediaUrl != null
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
        : showIcon
            ? _fallbackIcon(isSelected)
            : const SizedBox.shrink();

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
          _MascotTitleHeader(
            title: title,
            subtitle: subtitle,
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
          _MascotTitleHeader(
            title: title,
            subtitle: subtitle,
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const _MascotTitleHeader(
            title: 'Tell us about you',
            subtitle: 'Add your profile details before we continue',
          ),
          const SizedBox(height: 24),
          // Full Name Card
          _buildFieldCard(
            label: 'Full name (optional)',
            child: TextField(
              controller: _nameCtrl,
              decoration: InputDecoration(
                hintText: 'Your full name',
                hintStyle: TextStyle(color: AppColors.muted),
                border: InputBorder.none,
                contentPadding: EdgeInsets.symmetric(horizontal: 14),
              ),
              style: TextStyle(
                color: AppColors.ink,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          const SizedBox(height: 12),
          // Contact Number Card
          _buildFieldCard(
            label: 'Contact number (optional)',
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
              TextField(
                controller: _contactCtrl,
                keyboardType: TextInputType.phone,
                decoration: InputDecoration(
                  hintText: '0XXXXXXXXXX',
                  hintStyle: TextStyle(color: AppColors.muted),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(horizontal: 14),
                ),
                  style: TextStyle(
                    color: AppColors.ink,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                if (_contactInvalid)
                  Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Text(
                      'Invalid number',
                      style: TextStyle(
                        color: AppColors.wrongRed,
                        fontWeight: FontWeight.w600,
                        fontSize: 12,
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          // Profile Picture Card
          _buildFieldCard(
            label: 'Profile picture (optional)',
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    GestureDetector(
                      onTap: _pickImage,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: AppColors.accent.withValues(alpha: .30),
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.camera_alt_rounded,
                              color: AppColors.accent,
                              size: 18,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              'Choose image',
                              style: TextStyle(
                                color: AppColors.accent,
                                fontWeight: FontWeight.w700,
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        widget.profilePicture != null
                            ? widget.profilePicture!.path.split('/').last
                            : 'Max size: 300KB',
                        style: TextStyle(
                          color: widget.profilePicture != null
                              ? AppColors.ink
                              : AppColors.muted,
                          fontSize: 12,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ),
                  ],
                ),
                if (widget.profilePicture != null) ...[
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(10),
                        child: Image.file(
                          widget.profilePicture!,
                          width: 56,
                          height: 56,
                          fit: BoxFit.cover,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Row(
                        children: [
                          Icon(
                            Icons.check_circle,
                            color: AppColors.correctGreen,
                            size: 16,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'Ready to upload',
                            style: TextStyle(
                              color: AppColors.correctGreen,
                              fontWeight: FontWeight.w700,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFieldCard({required String label, required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppColors.accent.withValues(alpha: .15),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: .03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              color: AppColors.muted,
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          child,
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Mascot + Title row (matching web)
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const NakhlahMascot(size: 120),
              const SizedBox(width: 20),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Just a few\ndetails',
                      style: TextStyle(
                        fontSize: 30,
                        fontWeight: FontWeight.w900,
                        color: AppColors.ink,
                        height: 1.15,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'We\'ll use these to personalize your experience',
                      style: TextStyle(
                        color: AppColors.muted,
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 32),
          if (!widget.isReadOnly) ...[
            // Email card
            _buildFieldCard(
              label: 'Email',
              child: TextField(
                controller: _emailCtrl,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(
                  hintText: 'you@example.com',
                  hintStyle: TextStyle(color: AppColors.muted),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(horizontal: 14),
                ),
                style: TextStyle(
                  color: AppColors.ink,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            const SizedBox(height: 16),
            // Password card
            _buildFieldCard(
              label: 'Create a password',
              child: TextField(
                controller: _passCtrl,
                obscureText: _obscure,
                  decoration: InputDecoration(
                    hintText: 'Choose a secure password',
                    hintStyle: const TextStyle(color: AppColors.muted),
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(horizontal: 14),
                  suffixIcon: GestureDetector(
                    onTap: () => setState(() => _obscure = !_obscure),
                    child: Icon(
                      _obscure ? Icons.visibility_off_rounded : Icons.visibility_rounded,
                      color: AppColors.muted,
                      size: 20,
                    ),
                  ),
                ),
                style: TextStyle(
                  color: AppColors.ink,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            const SizedBox(height: 20),
            // Terms text
            RichText(
              text: TextSpan(
                style: TextStyle(
                  color: AppColors.muted,
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                ),
                children: [
                  const TextSpan(
                    text: 'By continuing you agree to our ',
                  ),
                  TextSpan(
                    text: 'Terms',
                    style: TextStyle(
                      color: AppColors.ink,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const TextSpan(
                    text: ' and ',
                  ),
                  TextSpan(
                    text: 'Privacy Policy',
                    style: TextStyle(
                      color: AppColors.ink,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const TextSpan(
                    text: '.',
                  ),
                ],
              ),
            ),
          ] else
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
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.email,
                            style: TextStyle(
                              color: AppColors.ink,
                              fontWeight: FontWeight.w700,
                              fontSize: 15,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Signed in',
                            style: TextStyle(
                              color: AppColors.muted,
                              fontSize: 12,
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

  Widget _buildFieldCard({required String label, required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppColors.accent.withValues(alpha: .15),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: .03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              color: AppColors.muted,
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          child,
        ],
      ),
    );
  }
}
