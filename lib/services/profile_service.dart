import 'dart:convert';
import 'dart:io';

import '../constants/api_endpoints.dart';
import '../models/models.dart';
import 'api_service.dart';

class ProfileService {
  ProfileService(this._api);

  final ApiService _api;

  Future<UserProfileModel> getProfile() async {
    return UserProfileModel.fromJson(await _api.get(ApiEndpoints.userProfile));
  }

  Future<OnboardingOptions> fetchOnboardingOptions() async {
    return OnboardingOptions.fromJson(
      await _api.get(ApiEndpoints.userOnboarding, auth: false),
    );
  }

  Future<UserProfileModel> createProfile(
    OnboardInfo info, {
    String? fullName,
    String? contactNumber,
    String? profilePictureUrl,
  }) async {
    // Check if profile already exists (API may auto-create during registration)
    try {
      final existing = await getProfile();
      if (existing != null) {
        print('[PROFILE] Profile exists, using PATCH instead of POST');
        return await updateProfile(
          fullName: fullName,
          contactNumber: contactNumber,
          onboardInfo: info,
        );
      }
    } catch (_) {
      // Profile doesn't exist, continue with POST
    }

    print('[PROFILE] Creating new profile with POST');
    final body = <String, dynamic>{
      'onboardInfo': info.toJson(),
      if (fullName != null && fullName.trim().isNotEmpty)
        'fullName': fullName.trim(),
      if (contactNumber != null && contactNumber.trim().isNotEmpty)
        'contactNumber': contactNumber.trim(),
      if (profilePictureUrl != null && profilePictureUrl.trim().isNotEmpty)
        'profilePictureUrl': profilePictureUrl.trim(),
    };
    return UserProfileModel.fromJson(
      await _api.post(ApiEndpoints.userProfile, body: body),
    );
  }

  Future<UserProfileModel> updateProfile({
    String? fullName,
    String? contactNumber,
    OnboardInfo? onboardInfo,
    File? picture,
  }) async {
    final data = <String, dynamic>{};
    if (fullName != null) data['fullName'] = fullName;
    if (contactNumber != null) data['contactNumber'] = contactNumber;
    if (onboardInfo != null) data['onboardInfo'] = onboardInfo.toJson();

    final dataJson = jsonEncode(data);
    print('[PROFILE] updateProfile called');
    print('[PROFILE] fields data: $dataJson');
    print('[PROFILE] picture file: ${picture?.path}');
    print('[PROFILE] fileField: profilePicture');

    try {
      final result = await _api.multipartPatch(
        ApiEndpoints.updateProfile,
        fields: {'data': dataJson},
        file: picture,
        fileField: 'profilePicture',
      );
      print('[PROFILE] updateProfile SUCCESS: $result');
      return UserProfileModel.fromJson(result);
    } catch (e) {
      print('[PROFILE] updateProfile ERROR: $e');
      rethrow;
    }
  }

  Future<UserProfileModel> updateProfilePicture(File picture) async {
    print('[PROFILE] updateProfilePicture called');
    print('[PROFILE] picture file: ${picture.path}');

    try {
      final result = await _api.multipartPatch(
        ApiEndpoints.updateProfile,
        fields: {'data': '{}'},
        file: picture,
        fileField: 'profilePicture',
      );
      print('[PROFILE] updateProfilePicture SUCCESS: $result');
      return UserProfileModel.fromJson(result);
    } catch (e) {
      print('[PROFILE] updateProfilePicture ERROR: $e');
      rethrow;
    }
  }

  Future<void> deleteProfile() => _api.delete(ApiEndpoints.deleteProfile);

  Future<ProgressModel> learnerProgress() async {
    return ProgressModel.fromJson(await _api.get(ApiEndpoints.learnerProgress));
  }

  Future<List<QuestStatus>> dailyQuest({String? quest}) async {
    return parseQuestStatuses(
      await _api.get(
        ApiEndpoints.profileDailyQuest,
        query: quest == null ? null : {'quest': quest},
      ),
    );
  }

  Future<dynamic> palmRefill() => _api.get(ApiEndpoints.palmRefill);

  Future<StreakModel> learnerStreak() async {
    return StreakModel.fromJson(await _api.get(ApiEndpoints.learnerStreak));
  }

  Future<GamificationStock> stocks() async {
    return GamificationStock.fromJson(
      await _api.get(ApiEndpoints.gamificationStocks),
    );
  }

  Future<List<LeaderboardEntryModel>> leaderboard({String? period}) async {
    return parseLeaderboard(
      await _api.get(
        ApiEndpoints.leaderboard,
        query: period == null ? null : {'period': period, 'filter': period},
      ),
    );
  }
}
