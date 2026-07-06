import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../common/app_button.dart';
import '../../common/app_snackbar.dart';
import '../../common/responsive.dart';
import '../../constants/app_colors.dart';
import '../../controllers/auth_controller.dart';
import '../../controllers/profile_controller.dart';

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

  @override
  void initState() {
    super.initState();
    final p = Get.find<ProfileController>();
    _name.text = p.profile.value?.fullName ?? '';
    _phone.text = p.profile.value?.contactNumber ?? '';
  }

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _currentPassword.dispose();
    _newPassword.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9F7F2),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF9F7F2),
        elevation: 0,
        leading: IconButton(
          onPressed: () => Get.back(),
          icon: const Icon(
            Icons.arrow_back_ios,
            color: AppColors.ink,
            size: 20,
          ),
        ),
        title: Text(
          widget.title,
          style: const TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: AppColors.ink,
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
    return Obx(
      () => ListView(
        children: [
          TextField(
            controller: _name,
            decoration: const InputDecoration(
              labelText: 'Full name',
              prefixIcon: Icon(Icons.person_outline),
            ),
          ),
          const SizedBox(height: 14),
          TextField(
            controller: _phone,
            keyboardType: TextInputType.phone,
            decoration: const InputDecoration(
              labelText: 'Contact number',
              prefixIcon: Icon(Icons.phone_outlined),
            ),
          ),
          const SizedBox(height: 20),
          AppButton(
            label: 'Save changes',
            loading: p.loading.value,
            onPressed: () async {
              final ok = await p.updateProfile(
                fullName: _name.text.trim().isEmpty ? null : _name.text.trim(),
                contactNumber: _phone.text.trim().isEmpty
                    ? null
                    : _phone.text.trim(),
              );
              if (ok) Get.back();
            },
          ),
        ],
      ),
    );
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
