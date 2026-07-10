import 'dart:io';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';

import '../../common/app_button.dart';
import '../../common/app_snackbar.dart';
import '../../common/responsive.dart';
import '../../constants/app_colors.dart';
import '../../constants/dark_mode_colors.dart';
import '../../controllers/auth_controller.dart';
import '../../controllers/profile_controller.dart';
import '../../models/models.dart';

class SettingsDetailView extends StatefulWidget {
  const SettingsDetailView({super.key, required this.title});

  final String title;

  @override
  State<SettingsDetailView> createState() => _SettingsDetailViewState();
}

class _SettingsDetailViewState extends State<SettingsDetailView> {
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _currentPassword = TextEditingController();
  final _newPassword = TextEditingController();
  final _dob = TextEditingController();

  File? _pickedFile;
  String _country = '';
  int _pictureVersion = 0;

  static const _countries = [
    'United States',
    'United Kingdom',
    'Canada',
    'Australia',
    'Bangladesh',
  ];

  List<String> get _allCountries {
    final list = List<String>.from(_countries);
    if (_country.isNotEmpty && !list.contains(_country)) {
      list.insert(0, _country);
    }
    return list;
  }

  @override
  void initState() {
    super.initState();
    final p = Get.find<ProfileController>();
    _name.text = p.profile.value?.fullName ?? '';
    _phone.text = p.profile.value?.contactNumber ?? '';
    _country = p.profile.value?.onboardInfo.country ?? '';
  }

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _currentPassword.dispose();
    _newPassword.dispose();
    _dob.dispose();
    super.dispose();
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
          widget.title,
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: dc.textPrimary,
          ),
        ),
        centerTitle: false,
      ),
      body: PageShell(animate: false, child: _body(context)),
    );
  }

  Widget _body(BuildContext context) {
    switch (widget.title) {
      case 'Personal Info':
        return _personalInfo();
      case 'Security':
        return _security();
      case 'Notification':
        return _switchList(
          items: const [
            _SettingSwitch(
              'Daily lesson reminders',
              'Get reminded to keep your streak alive.',
            ),
            _SettingSwitch(
              'Quest updates',
              'Know when daily quests reset or complete.',
            ),
            _SettingSwitch(
              'Leaderboard updates',
              'Receive rank and achievement updates.',
            ),
          ],
        );
      case 'Accessibility':
        return _switchList(
          items: const [
            _SettingSwitch('Reduce motion', 'Minimise decorative animations.'),
            _SettingSwitch(
              'Larger text',
              'Use larger labels in learning screens.',
            ),
            _SettingSwitch(
              'High contrast',
              'Improve contrast for lesson content.',
            ),
          ],
        );
      case 'General':
        return _infoList(const [
          _InfoRow(Icons.language_rounded, 'Language', 'English'),
          _InfoRow(Icons.school_rounded, 'Learning mode', 'Guided journey'),
          _InfoRow(Icons.cloud_done_rounded, 'API status', 'Connected'),
        ]);
      case 'Find Friends':
        return _findFriends();
      default:
        return _infoList([
          _InfoRow(Icons.settings_outlined, widget.title, 'Ready'),
        ]);
    }
  }

  Widget _personalInfo() {
    final p = Get.find<ProfileController>();
    final dc = DarkModeColors.of(context);
    final profile = p.profile.value;
    final email = Get.find<AuthController>().user.value?.email ?? profile?.email ?? '';

    String? imageUrl = profile?.profilePicture?.absoluteUrl;
    if (imageUrl != null && imageUrl.isNotEmpty && _pictureVersion > 0) {
      imageUrl = '$imageUrl?v=$_pictureVersion';
    }

    final nameWords =
        (profile?.fullName ?? '').trim().split(RegExp(r'\s+')).where((e) => e.isNotEmpty).toList();
    final initials =
        nameWords.isEmpty ? '?' : nameWords.take(2).map((e) => e[0].toUpperCase()).join();

    return Obx(
      () => ListView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        children: [
          const SizedBox(height: 8),
          Center(
            child: GestureDetector(
              onTap: _pickProfilePhoto,
              child: Stack(
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
                      backgroundImage: _pickedFile != null
                          ? FileImage(_pickedFile!)
                          : (imageUrl != null
                              ? CachedNetworkImageProvider(imageUrl)
                              : null),
                      child: (_pickedFile == null && imageUrl == null)
                          ? Text(
                              initials,
                              style: const TextStyle(
                                fontSize: 36,
                                fontWeight: FontWeight.bold,
                                color: AppColors.accent,
                              ),
                            )
                          : null,
                    ),
                  ),
                  Positioned(
                    bottom: 4,
                    right: 4,
                    child: Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: AppColors.accent,
                        shape: BoxShape.circle,
                        border: Border.all(color: dc.cardBackground, width: 2),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.1),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.camera_alt,
                        color: Colors.white,
                        size: 16,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 32),
          _buildLabel('Full Name', dc),
          const SizedBox(height: 8),
          _buildTextField(
            controller: _name,
            hint: 'Enter your full name',
            dc: dc,
          ),
          const SizedBox(height: 20),
          _buildLabel('Phone Number', dc),
          const SizedBox(height: 8),
          _buildTextField(
            controller: _phone,
            hint: 'Enter your phone number',
            keyboardType: TextInputType.phone,
            dc: dc,
          ),
          const SizedBox(height: 20),
          _buildLabel('Email', dc),
          const SizedBox(height: 8),
          _buildTextField(
            controller: TextEditingController(text: email),
            hint: 'Email',
            dc: dc,
            readOnly: true,
          ),
          const SizedBox(height: 20),
          _buildLabel('Date of Birth', dc),
          const SizedBox(height: 8),
          _buildTextField(
            controller: _dob,
            hint: 'Select date of birth',
            dc: dc,
            readOnly: true,
            suffixIcon: Icon(Icons.calendar_today_outlined, color: dc.iconSecondary, size: 20),
            onTap: _pickDate,
          ),
          const SizedBox(height: 20),
          _buildLabel('Country', dc),
          const SizedBox(height: 8),
          _buildCountryDropdown(dc),
          const SizedBox(height: 32),
          AppButton(
            label: 'Update Profile',
            loading: p.loading.value,
            onPressed: _updateProfile,
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildLabel(String text, DarkModeColors dc) {
    return Text(
      text,
      style: TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: dc.textSecondary,
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String hint,
    required DarkModeColors dc,
    TextInputType? keyboardType,
    bool readOnly = false,
    Widget? suffixIcon,
    VoidCallback? onTap,
  }) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      readOnly: readOnly,
      onTap: onTap,
      style: TextStyle(
        fontSize: 16,
        color: dc.textPrimary,
      ),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(color: dc.textMuted),
        suffixIcon: suffixIcon,
        filled: true,
        fillColor: dc.cardBackground,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: dc.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: dc.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.accent, width: 1.5),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
    );
  }

  Widget _buildCountryDropdown(DarkModeColors dc) {
    return Container(
      decoration: BoxDecoration(
        color: dc.cardBackground,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: dc.border),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: _country.isEmpty ? null : _country,
          hint: Text(
            'Select country',
            style: TextStyle(color: dc.textMuted, fontSize: 16),
          ),
          isExpanded: true,
          icon: Icon(Icons.keyboard_arrow_down, color: dc.iconSecondary),
          style: TextStyle(fontSize: 16, color: dc.textPrimary),
          items: _allCountries.map((c) {
            return DropdownMenuItem(value: c, child: Text(c));
          }).toList(),
          onChanged: (value) {
            if (value != null) setState(() => _country = value);
          },
        ),
      ),
    );
  }

  Future<void> _pickProfilePhoto() async {
    try {
      final picked = await ImagePicker().pickImage(
        source: ImageSource.gallery,
        imageQuality: 85,
      );
      if (picked == null) return;
      final file = File(picked.path);
      setState(() => _pickedFile = file);
    } catch (e) {
      AppSnackbar.error('Could not pick image.');
    }
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime(now.year - 20),
      firstDate: DateTime(1900),
      lastDate: now,
    );
    if (picked != null) {
      _dob.text = '${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}';
    }
  }

  Future<void> _updateProfile() async {
    final p = Get.find<ProfileController>();
    final onboardInfo = p.profile.value?.onboardInfo ?? const OnboardInfo();

    print('[SETTINGS] _updateProfile called');
    print('[SETTINGS] fullName: ${_name.text.trim()}');
    print('[SETTINGS] contactNumber: ${_phone.text.trim()}');
    print('[SETTINGS] country: $_country');
    print('[SETTINGS] picture: ${_pickedFile?.path}');

    final ok = await p.updateProfile(
      fullName: _name.text.trim().isEmpty ? null : _name.text.trim(),
      contactNumber: _phone.text.trim().isEmpty ? null : _phone.text.trim(),
      onboardInfo: OnboardInfo(
        age: onboardInfo.age,
        country: _country,
        purpose: onboardInfo.purpose,
        goalTime: onboardInfo.goalTime,
        userSource: onboardInfo.userSource,
        languageStrength: onboardInfo.languageStrength,
      ),
      picture: _pickedFile,
    );

    print('[SETTINGS] updateProfile result: ok=$ok');

    if (ok && mounted) {
      setState(() => _pictureVersion++);
      Get.back();
      AppSnackbar.success('Profile updated successfully.');
    }
  }

  Widget _security() {
    final a = Get.find<AuthController>();
    return Obx(
      () => ListView(
        children: [
          TextField(
            controller: _currentPassword,
            obscureText: true,
            decoration: const InputDecoration(
              labelText: 'Current password',
              prefixIcon: Icon(Icons.lock_outline),
            ),
          ),
          const SizedBox(height: 14),
          TextField(
            controller: _newPassword,
            obscureText: true,
            decoration: const InputDecoration(
              labelText: 'New password',
              prefixIcon: Icon(Icons.lock_reset_outlined),
            ),
          ),
          const SizedBox(height: 20),
          AppButton(
            label: 'Change password',
            loading: a.loading.value,
            onPressed: () async {
              final ok = await a.changePassword(
                _currentPassword.text,
                _newPassword.text,
              );
              if (ok) Get.back();
            },
          ),
        ],
      ),
    );
  }

  Widget _switchList({required List<_SettingSwitch> items}) {
    return ListView.separated(
      itemCount: items.length,
      separatorBuilder: (context, index) => const SizedBox(height: 12),
      itemBuilder: (_, index) => _SwitchTile(item: items[index]),
    );
  }

  Widget _infoList(List<_InfoRow> rows) {
    return ListView.separated(
      itemCount: rows.length,
      separatorBuilder: (context, index) => const SizedBox(height: 12),
      itemBuilder: (_, index) => Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
        ),
        child: Row(
          children: [
            Icon(rows[index].icon, color: AppColors.palm),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                rows[index].title,
                style: const TextStyle(fontWeight: FontWeight.w800),
              ),
            ),
            Text(
              rows[index].value,
              style: const TextStyle(color: AppColors.muted),
            ),
          ],
        ),
      ),
    );
  }

  Widget _findFriends() {
    return ListView(
      children: [
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
          ),
          child: const Text(
            'Invite friends by sharing your Nakhlah progress from the profile screen.',
            style: TextStyle(fontWeight: FontWeight.w700, height: 1.4),
          ),
        ),
        const SizedBox(height: 16),
        AppButton(
          label: 'Got it',
          icon: Icons.check,
          onPressed: () {
            AppSnackbar.success('Use Profile → Share to invite friends.');
            Get.back();
          },
        ),
      ],
    );
  }
}

class _SwitchTile extends StatefulWidget {
  const _SwitchTile({required this.item});

  final _SettingSwitch item;

  @override
  State<_SwitchTile> createState() => _SwitchTileState();
}

class _SwitchTileState extends State<_SwitchTile> {
  bool value = true;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.item.title,
                  style: const TextStyle(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 4),
                Text(
                  widget.item.subtitle,
                  style: const TextStyle(color: AppColors.muted),
                ),
              ],
            ),
          ),
          Switch(value: value, onChanged: (v) => setState(() => value = v)),
        ],
      ),
    );
  }
}

class _SettingSwitch {
  const _SettingSwitch(this.title, this.subtitle);

  final String title;
  final String subtitle;
}

class _InfoRow {
  const _InfoRow(this.icon, this.title, this.value);

  final IconData icon;
  final String title;
  final String value;
}
