import 'dart:async';

import 'package:app_links/app_links.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../constants/app_colors.dart';
import '../../constants/dark_mode_colors.dart';
import '../../controllers/app_controller.dart';
import '../../services/api_service.dart';
import '../../services/payment_service.dart';

class PaymentView extends StatefulWidget {
  const PaymentView({super.key});

  @override
  State<PaymentView> createState() => _PaymentViewState();
}

class _PaymentViewState extends State<PaymentView> {
  late final PaymentService _paymentService;
  late final dynamic _args;
  StreamSubscription<Uri>? _linkSub;

  bool _isProcessing = false;
  String? _error;
  bool _hasCaptured = false;

  String _paymentType = 'date';
  Map<String, dynamic>? _package;
  Map<String, dynamic>? _plan;

  @override
  void initState() {
    super.initState();
    _paymentService = PaymentService(Get.find<ApiService>());
    _args = Get.arguments;
    _parseArgs();
    _listenForDeepLink();
  }

  @override
  void dispose() {
    _linkSub?.cancel();
    super.dispose();
  }

  void _parseArgs() {
    if (_args is Map) {
      _paymentType = _args['type'] ?? 'date';
      _package = _args['package'];
      _plan = _args['plan'];
    }
  }

  void _listenForDeepLink() {
    final appLinks = AppLinks();
    print('[PAYMENT] _listenForDeepLink: setting up deep link listener');
    _linkSub = appLinks.uriLinkStream.listen((Uri uri) {
      print('[PAYMENT] Deep link received: $uri');
      if (uri.scheme == 'nakhlah' && uri.host == 'payment') {
        final orderId = uri.queryParameters['token'];
        final path = uri.path;
        print('[PAYMENT] Deep link path=$path | orderId=$orderId');
        if (path == '/success' && orderId != null && !_hasCaptured) {
          print('[PAYMENT] Payment success deep link - capturing order: $orderId');
          _captureAndFinish(orderId);
        } else if (path == '/cancel') {
          print('[PAYMENT] Payment cancelled via deep link');
          setState(() {
            _isProcessing = false;
          });
          Get.snackbar('Cancelled', 'Payment was cancelled.', snackPosition: SnackPosition.BOTTOM);
        }
      }
    }, onError: (e) {
      print('[PAYMENT] Deep link stream error: $e');
    });
    _checkInitialLink(appLinks);
  }

  Future<void> _checkInitialLink(AppLinks appLinks) async {
    try {
      print('[PAYMENT] Checking initial deep link...');
      final uri = await appLinks.getInitialLink();
      print('[PAYMENT] Initial link: $uri');
      if (uri != null && uri.scheme == 'nakhlah' && uri.host == 'payment') {
        final orderId = uri.queryParameters['token'];
        final path = uri.path;
        if (path == '/success' && orderId != null && !_hasCaptured) {
          print('[PAYMENT] Initial deep link success - capturing order: $orderId');
          _captureAndFinish(orderId);
        }
      }
    } catch (e) {
      print('[PAYMENT] _checkInitialLink error: $e');
    }
  }

  Future<void> _captureAndFinish(String orderId) async {
    if (_hasCaptured) {
      print('[PAYMENT] _captureAndFinish skipped - already captured');
      return;
    }
    _hasCaptured = true;
    setState(() => _isProcessing = true);
    print('[PAYMENT] _captureAndFinish: calling captureDatePaymentOrder with orderId=$orderId');

    final result = await _paymentService.captureDatePaymentOrder(orderId);
    print('[PAYMENT] captureDatePaymentOrder result: $result');
    if (!mounted) return;

    if (result['success'] == true) {
      print('[PAYMENT] Payment captured successfully');
      Get.snackbar(
        'Success',
        _paymentType == 'date'
            ? 'Payment confirmed! Your dates have been added.'
            : 'Subscription activated!',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: AppColors.palm,
        colorText: Colors.white,
        duration: const Duration(seconds: 3),
      );
      Get.back();
      Get.find<AppController>().setTab(2);
    } else {
      print('[PAYMENT] Payment capture FAILED: ${result['error']}');
      setState(() {
        _isProcessing = false;
        _error = 'Payment verification failed. Please try again.';
      });
    }
  }

  Future<void> _handlePayPalCheckout() async {
    print('[PAYMENT] _handlePayPalCheckout START | type=$_paymentType | package=$_package | plan=$_plan');
    setState(() {
      _isProcessing = true;
      _error = null;
    });

    try {
      String? approvalUrl;

      if (_paymentType == 'date' && _package != null) {
        final packageId = _package!['id']?.toString() ?? '';
        print('[PAYMENT] Creating date payment order for packageId=$packageId');
        final result = await _paymentService.createDatePaymentOrder(packageId);
        print('[PAYMENT] createDatePaymentOrder result: success=${result['success']} | error=${result['error']} | approvalUrl=${result['approvalUrl']}');
        if (result['success'] != true) {
          setState(() {
            _error = result['error'] ?? 'Failed to create payment order.';
            _isProcessing = false;
          });
          return;
        }
        approvalUrl = result['approvalUrl'];
      } else if (_paymentType == 'subscription' && _plan != null) {
        final planId = _plan!['id']?.toString() ?? '';
        print('[PAYMENT] Creating subscription payment for planId=$planId');
        final result = await _paymentService.createSubscriptionPayment(planId);
        print('[PAYMENT] createSubscriptionPayment result: success=${result['success']} | error=${result['error']} | approvalUrl=${result['approvalUrl']}');
        if (result['success'] != true) {
          setState(() {
            _error = result['error'] ?? 'Failed to create subscription.';
            _isProcessing = false;
          });
          return;
        }
        approvalUrl = result['approvalUrl'];
      } else {
        print('[PAYMENT] ERROR: paymentType=$_paymentType but package/plan is null');
      }

      if (approvalUrl == null || approvalUrl.isEmpty) {
        print('[PAYMENT] ERROR: approvalUrl is null or empty');
        setState(() {
          _error = 'Payment URL not received. Please try again.';
          _isProcessing = false;
        });
        return;
      }

      final url = Uri.parse(approvalUrl);
      print('[PAYMENT] Parsed PayPal URL: $url');
      try {
        await launchUrl(url, mode: LaunchMode.externalApplication);
        print('[PAYMENT] launchUrl succeeded - browser opened');
      } catch (e) {
        print('[PAYMENT] launchUrl FAILED: $e');
        setState(() {
          _error = 'Could not open payment page.';
          _isProcessing = false;
        });
      }
    } catch (e, stackTrace) {
      print('[PAYMENT] EXCEPTION in _handlePayPalCheckout: $e');
      print('[PAYMENT] StackTrace: $stackTrace');
      setState(() {
        _error = 'An unexpected error occurred.';
        _isProcessing = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final dc = DarkModeColors.of(context);

    final String title;
    final String price;
    final String description;
    final String? amount;
    final String? label;

    if (_paymentType == 'date' && _package != null) {
      label = _package!['name'] ?? _package!['label'] ?? 'DATE PACKAGE';
      price = '\$${_package!['price'] ?? 0}';
      amount = '${_package!['dateAmount'] ?? _package!['amount'] ?? 0} Dates';
      description = _package!['description'] ??
          'Get $amount to keep learning without interruption.';
      title = 'Buy Dates';
    } else if (_paymentType == 'subscription' && _plan != null) {
      label = _plan!['duration'] ?? _plan!['name'] ?? 'SUBSCRIPTION';
      final isYearly = _plan!['interval'] == 'year';
      final planPrice = _plan!['price'] ?? 0;
      price = '\$$planPrice${isYearly ? '/yr' : '/mo'}';
      amount = null;
      description =
          'Subscribe to unlock unlimited palms, advanced analytics and all premium features.';
      title = 'Subscribe';
    } else {
      title = 'Payment';
      price = '';
      description = '';
      amount = null;
      label = null;
    }

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
          title,
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: dc.textPrimary,
          ),
        ),
        centerTitle: false,
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        children: [
          // ── Payment Card ──
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: dc.cardBackground,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: dc.border),
            ),
            child: Column(
              children: [
                // Icon
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: AppColors.accent.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.payment,
                    color: AppColors.accent,
                    size: 32,
                  ),
                ),
                const SizedBox(height: 16),

                // Label
                if (label != null)
                  Text(
                    label.toUpperCase(),
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: dc.textSecondary,
                      letterSpacing: 1,
                    ),
                  ),
                const SizedBox(height: 8),

                // Price
                Text(
                  price,
                  style: TextStyle(
                    fontSize: 44,
                    fontWeight: FontWeight.w900,
                    color: dc.textPrimary,
                  ),
                ),

                if (amount != null) ...[
                  const SizedBox(height: 12),
                  Divider(color: dc.border),
                  const SizedBox(height: 12),
                  // Amount pill
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.accent,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      amount,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],

                const SizedBox(height: 16),

                // Description
                Text(
                  description,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    color: dc.textSecondary,
                    height: 1.5,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // ── Error Message ──
          if (_error != null)
            Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.error.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.error.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.error_outline, color: AppColors.error, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _error!,
                      style: const TextStyle(
                        color: AppColors.error,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ],
              ),
            ),

          // ── Pay with PayPal Button ──
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isProcessing ? null : _handlePayPalCheckout,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.accent,
                foregroundColor: Colors.white,
                disabledBackgroundColor: AppColors.accent.withValues(alpha: 0.6),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 0,
              ),
              child: _isProcessing
                  ? const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text(
                      'Pay with PayPal',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
            ),
          ),

          const SizedBox(height: 12),

          // ── Cancel Button ──
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: _isProcessing ? null : () => Get.back(),
              style: OutlinedButton.styleFrom(
                foregroundColor: dc.textSecondary,
                side: BorderSide(color: dc.border),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text(
                'Cancel',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),

          const SizedBox(height: 24),

          // ── Info text ──
          Text(
            'You will be redirected to PayPal to complete the payment. After payment, return to this app to confirm.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 12,
              color: dc.textMuted,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}
