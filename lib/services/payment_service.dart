import 'api_service.dart';
import '../constants/api_endpoints.dart';

class PaymentService {
  PaymentService(this._api);
  final ApiService _api;

  // ── Date Packages ──
  Future<List<Map<String, dynamic>>> fetchDatePackages() async {
    try {
      final res = await _api.get(ApiEndpoints.datePackages, auth: false);
      final data = res is Map ? res : {};
      final docs = data['docs'] ?? data['data'] ?? res;
      if (docs is List) {
        return docs.cast<Map<String, dynamic>>();
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  // ── Subscription Plans ──
  Future<List<Map<String, dynamic>>> fetchSubscriptionPlans() async {
    try {
      final res = await _api.get(ApiEndpoints.subscriptionPlans, auth: false);
      final data = res is Map ? res : {};
      final docs = data['docs'] ?? data['data'] ?? res;
      if (docs is List) {
        return docs.cast<Map<String, dynamic>>();
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  // ── Create Date Payment Order (PayPal) ──
  Future<Map<String, dynamic>> createDatePaymentOrder(String packageId) async {
    try {
      final res = await _api.post(
        ApiEndpoints.createDatePaymentOrder,
        body: {'packageId': packageId},
      );
      final data = Map<String, dynamic>.from(res is Map ? res : {});
      final approvalUrl = _extractApprovalUrl(data);
      return {
        'success': true,
        'orderId': data['orderId'] ?? data['id'],
        'approvalUrl': approvalUrl,
      };
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  // ── Capture Date Payment Order ──
  Future<Map<String, dynamic>> captureDatePaymentOrder(String orderId) async {
    try {
      final res = await _api.post(
        ApiEndpoints.captureDatePaymentOrder,
        body: {'orderId': orderId},
      );
      return {'success': true, 'data': res};
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  // ── Create Subscription Payment (PayPal) ──
  Future<Map<String, dynamic>> createSubscriptionPayment(String planId) async {
    try {
      final res = await _api.post(
        ApiEndpoints.createSubscriptionPayment,
        body: {'planId': planId},
      );
      final data = Map<String, dynamic>.from(res is Map ? res : {});
      final approvalUrl = _extractApprovalUrl(data);
      return {
        'success': true,
        'subscriptionId': data['subscriptionId'] ?? data['id'],
        'approvalUrl': approvalUrl,
      };
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  // ── Fetch Current Subscription ──
  Future<Map<String, dynamic>> fetchCurrentSubscription() async {
    try {
      final res = await _api.get(ApiEndpoints.currentSubscription);
      final data = res is Map ? res : {};
      return {
        'success': true,
        'subscription': data['subscription'],
      };
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  // ── Cancel Subscription ──
  Future<Map<String, dynamic>> cancelSubscription(String subscriptionId) async {
    try {
      final res = await _api.post(
        ApiEndpoints.cancelSubscription(subscriptionId),
      );
      return {'success': true, 'data': res};
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  String? _extractApprovalUrl(Map<String, dynamic> data) {
    if (data['approvalUrl'] != null) return data['approvalUrl'];
    if (data['approveUrl'] != null) return data['approveUrl'];
    if (data['url'] != null) return data['url'];

    final links = data['links'];
    if (links is List) {
      for (final link in links) {
        if (link is Map) {
          final rel = (link['rel'] ?? '').toString().toLowerCase();
          if (rel == 'approve' || rel == 'approval_url') {
            return link['href'];
          }
        }
      }
    }
    return null;
  }
}
