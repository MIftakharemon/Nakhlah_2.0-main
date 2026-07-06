import '../constants/api_endpoints.dart';
import '../models/models.dart';
import 'api_service.dart';

class CmsService {
  CmsService(this._api);
  final ApiService _api;

  Future<List<FaqModel>> helpFaq() async {
    final r = await _api.get(ApiEndpoints.helpCenter);
    return ((r is Map ? r['faq'] : null) as List? ?? [])
        .map((e) => FaqModel.fromJson(e))
        .toList();
  }

  Future<String> helpGuide() async {
    final r = await _api.get(ApiEndpoints.helpCenter);
    return TextBlock.extract(r is Map ? r['learningGuide'] : r);
  }

  Future<List<Map<String, dynamic>>> helpLearningTips() async {
    final r = await _api.get(ApiEndpoints.helpCenter);
    if (r is Map && r['learningTips'] is List) {
      return (r['learningTips'] as List)
          .map((e) => Map<String, dynamic>.from(e as Map))
          .toList();
    }
    return [];
  }

  Future<Map<String, dynamic>?> aboutData() async {
    final r = await _api.get(ApiEndpoints.about);
    if (r is Map) return Map<String, dynamic>.from(r);
    return null;
  }

  Future<String> about() async {
    final r = await _api.get(ApiEndpoints.about);
    return TextBlock.extract(r is Map ? r['about'] : r);
  }

  Future<dynamic> aboutLexical() async {
    final r = await _api.get(ApiEndpoints.about);
    return r is Map ? r['about'] : null;
  }

  Future<dynamic> termsAndConditionsLexical() async {
    final r = await _api.get(ApiEndpoints.legalDocuments);
    if (r is Map && r['termsAndConditions'] != null) {
      return r['termsAndConditions'];
    }
    return null;
  }

  Future<dynamic> privacyPolicyLexical() async {
    final r = await _api.get(ApiEndpoints.legalDocuments);
    if (r is Map && r['privacyPolicy'] != null) {
      return r['privacyPolicy'];
    }
    return null;
  }

  Future<String> termsAndConditions() async {
    final r = await _api.get(ApiEndpoints.legalDocuments);
    if (r is Map && r['termsAndConditions'] != null) {
      return TextBlock.extract(r['termsAndConditions']);
    }
    return TextBlock.extract(r);
  }

  Future<String> privacyPolicy() async {
    final r = await _api.get(ApiEndpoints.legalDocuments);
    if (r is Map && r['privacyPolicy'] != null) {
      return TextBlock.extract(r['privacyPolicy']);
    }
    return TextBlock.extract(r);
  }

  Future<String> legal() async {
    final r = await _api.get(ApiEndpoints.legalDocuments);
    return TextBlock.extract(r);
  }

  Future<OnboardingOptions> onboarding() async => OnboardingOptions.fromJson(
    await _api.get(ApiEndpoints.userOnboarding, query: {'depth': 2}),
  );
}
