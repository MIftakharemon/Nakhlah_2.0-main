import 'dart:developer' as developer;
import 'api_service.dart';
import '../constants/api_endpoints.dart';

class PaymentService {
  PaymentService(this._api);
  final ApiService _api;

  void _log(String msg) => developer.log(msg, name: 'PaymentService');

  // ── Date Packages ──
  Future<List<Map<String, dynamic>>> fetchDatePackages() async {
    try {
      _log('fetchDatePackages: GET ${ApiEndpoints.datePackages}');
      final res = await _api.get(ApiEndpoints.datePackages, auth: false);
      _log('fetchDatePackages: response type=${res.runtimeType}');
      final data = res is Map ? res : {};
      final docs = data['docs'] ?? data['data'] ?? res;
      if (docs is List) {
        _log('fetchDatePackages: found ${docs.length} packages');
        return docs.cast<Map<String, dynamic>>();
      }
      _log('fetchDatePackages: no list found, raw=$res');
      return [];
    } catch (e) {
      _log('fetchDatePackages: ERROR $e');
      return [];
    }
  }

  // ── Subscription Plans ──
  Future<List<Map<String, dynamic>>> fetchSubscriptionPlans() async {
    try {
      _log('fetchSubscriptionPlans: GET ${ApiEndpoints.subscriptionPlans}');
      final res = await _api.get(ApiEndpoints.subscriptionPlans, auth: false);
      _log('fetchSubscriptionPlans: response type=${res.runtimeType}');
      final data = res is Map ? res : {};
      final docs = data['docs'] ?? data['data'] ?? res;
      if (docs is List) {
        _log('fetchSubscriptionPlans: found ${docs.length} plans');
        return docs.cast<Map<String, dynamic>>();
      }
      _log('fetchSubscriptionPlans: no list found, raw=$res');
      return [];
    } catch (e) {
      _log('fetchSubscriptionPlans: ERROR $e');
      return [];
    }
  }

  // ── Create Date Payment Order (PayPal) ──
  Future<Map<String, dynamic>> createDatePaymentOrder(String packageId) async {
    try {
      _log('createDatePaymentOrder: POST ${ApiEndpoints.createDatePaymentOrder} body={"packageId":"$packageId"}');
      final res = await _api.post(
        ApiEndpoints.createDatePaymentOrder,
        body: {'packageId': packageId},
      );
      _log('createDatePaymentOrder: raw response=$res');
      final data = Map<String, dynamic>.from(res is Map ? res : {});
      _log('createDatePaymentOrder: parsed data keys=${data.keys.toList()}');
      final approvalUrl = _extractApprovalUrl(data);
      _log('createDatePaymentOrder: approvalUrl=$approvalUrl');
      return {
        'success': true,
        'orderId': data['orderId'] ?? data['id'],
        'approvalUrl': approvalUrl,
      };
    } catch (e) {
      _log('createDatePaymentOrder: ERROR $e');
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
      _log('createSubscriptionPayment: POST ${ApiEndpoints.createSubscriptionPayment} body={"planId":"$planId"}');
      final res = await _api.post(
        ApiEndpoints.createSubscriptionPayment,
        body: {'planId': planId},
      );
      _log('createSubscriptionPayment: raw response=$res');
      final data = Map<String, dynamic>.from(res is Map ? res : {});
      _log('createSubscriptionPayment: parsed data keys=${data.keys.toList()}');
      final approvalUrl = _extractApprovalUrl(data);
      _log('createSubscriptionPayment: approvalUrl=$approvalUrl');
      return {
        'success': true,
        'subscriptionId': data['subscriptionId'] ?? data['id'],
        'approvalUrl': approvalUrl,
      };
    } catch (e) {
      _log('createSubscriptionPayment: ERROR $e');
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
    _log('_extractApprovalUrl: checking data keys=${data.keys.toList()}');
    if (data['approvalUrl'] != null) {
      _log('_extractApprovalUrl: found approvalUrl=${data['approvalUrl']}');
      return data['approvalUrl'];
    }
    if (data['approveUrl'] != null) {
      _log('_extractApprovalUrl: found approveUrl=${data['approveUrl']}');
      return data['approveUrl'];
    }
    if (data['url'] != null) {
      _log('_extractApprovalUrl: found url=${data['url']}');
      return data['url'];
    }

    final links = data['links'];
    if (links is List) {
      _log('_extractApprovalUrl: checking ${links.length} links');
      for (final link in links) {
        if (link is Map) {
          final rel = (link['rel'] ?? '').toString().toLowerCase();
          _log('_extractApprovalUrl: link rel=$rel href=${link['href']}');
          if (rel == 'approve' || rel == 'approval_url') {
            _log('_extractApprovalUrl: found approve link=${link['href']}');
            return link['href'];
          }
        }
      }
    }
    _log('_extractApprovalUrl: NO approval URL found in response');
    return null;
  }
}
