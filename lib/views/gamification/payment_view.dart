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

class _PaymentViewState extends State<PaymentView> with WidgetsBindingObserver {
  late final PaymentService _paymentService;
  late final dynamic _args;

  bool _isProcessing = false;
  String? _error;
  bool _paymentInitiated = false;

  // Args from store page
  String _paymentType = 'date'; // 'date' or 'subscription'
  Map<String, dynamic>? _package;
  Map<String, dynamic>? _plan;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _paymentService = PaymentService(Get.find<ApiService>());
    _args = Get.arguments;
    _parseArgs();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  void _parseArgs() {
    if (_args is Map) {
      _paymentType = _args['type'] ?? 'date';
      _package = _args['package'];
      _plan = _args['plan'];
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    // When user returns from PayPal browser
    if (state == AppLifecycleState.resumed && _paymentInitiated) {
      _paymentInitiated = false;
      _showPaymentReturnDialog();
    }
  }

  void _showPaymentReturnDialog() {
    Get.defaultDialog(
      title: 'Payment',
      middleText: 'Did you complete the payment?',
      textConfirm: 'Yes',
      textCancel: 'No',
      confirmTextColor: Colors.white,
      onConfirm: () {
        Get.back(); // close dialog
        _showSuccessAndGoBack();
      },
      onCancel: () {
        Get.back(); // close dialog
        setState(() => _isProcessing = false);
      },
    );
  }

  void _showSuccessAndGoBack() {
    Get.snackbar(
      'Success',
      _paymentType == 'date'
          ? 'Payment completed! Your dates will be added shortly.'
          : 'Subscription activated! Enjoy premium features.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: AppColors.palm,
      colorText: Colors.white,
      duration: const Duration(seconds: 3),
    );
    // Navigate back to store tab
    Get.back(); // close payment page
    Get.find<AppController>().setTab(2); // go to store tab
  }

  Future<void> _handlePayPalCheckout() async {
    setState(() {
      _isProcessing = true;
      _error = null;
    });

    try {
      String? approvalUrl;

      if (_paymentType == 'date' && _package != null) {
        final packageId = _package!['id']?.toString() ?? '';
        final result = await _paymentService.createDatePaymentOrder(packageId);
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
        final result = await _paymentService.createSubscriptionPayment(planId);
        if (result['success'] != true) {
          setState(() {
            _error = result['error'] ?? 'Failed to create subscription.';
            _isProcessing = false;
          });
          return;
        }
        approvalUrl = result['approvalUrl'];
      }

      if (approvalUrl == null || approvalUrl.isEmpty) {
        setState(() {
          _error = 'Payment URL not received. Please try again.';
          _isProcessing = false;
        });
        return;
      }

      // Open PayPal in browser
      final url = Uri.parse(approvalUrl);
      if (await canLaunchUrl(url)) {
        _paymentInitiated = true;
        await launchUrl(url, mode: LaunchMode.externalApplication);
      } else {
        setState(() {
          _error = 'Could not open payment page.';
          _isProcessing = false;
        });
      }
    } catch (e) {
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
