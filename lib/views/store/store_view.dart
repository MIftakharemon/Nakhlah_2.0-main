import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../constants/app_colors.dart';
import '../../constants/dark_mode_colors.dart';
import '../../services/api_service.dart';
import '../../services/payment_service.dart';

class StoreView extends StatefulWidget {
  const StoreView({super.key});

  @override
  State<StoreView> createState() => _StoreViewState();
}

class _StoreViewState extends State<StoreView> {
  List<Map<String, dynamic>> _datePackages = [];
  List<Map<String, dynamic>> _subscriptionPlans = [];
  Map<String, dynamic>? _currentSubscription;
  bool _isLoadingDates = true;
  String? _checkoutId;
  int? _selectedDateIndex;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final api = Get.find<ApiService>();
    final paymentService = PaymentService(api);

    // Fetch all in parallel
    final results = await Future.wait([
      _fetchDatePackages(paymentService),
      _fetchSubscriptionPlans(paymentService),
      _fetchCurrentSubscription(paymentService),
    ]);

    if (mounted) {
      setState(() {
        _datePackages = results[0] as List<Map<String, dynamic>>;
        _subscriptionPlans = results[1] as List<Map<String, dynamic>>;
        _currentSubscription = results[2] as Map<String, dynamic>?;
        _isLoadingDates = false;
      });
    }
  }

  Future<List<Map<String, dynamic>>> _fetchDatePackages(
    PaymentService paymentService,
  ) async {
    try {
      return await paymentService.fetchDatePackages();
    } catch (_) {
      return [];
    }
  }

  Future<List<Map<String, dynamic>>> _fetchSubscriptionPlans(
    PaymentService paymentService,
  ) async {
    try {
      return await paymentService.fetchSubscriptionPlans();
    } catch (_) {
      return [];
    }
  }

  Future<Map<String, dynamic>?> _fetchCurrentSubscription(
    PaymentService paymentService,
  ) async {
    try {
      final result = await paymentService.fetchCurrentSubscription();
      if (result['success'] == true) {
        return result['subscription'];
      }
    } catch (_) {}
    return null;
  }

  Future<void> _handleDateCheckout(Map<String, dynamic> pkg) async {
    final api = Get.find<ApiService>();
    final paymentService = PaymentService(api);
    final packageId = pkg['id']?.toString() ?? '';

    setState(() => _checkoutId = 'dates:$packageId');

    final result = await paymentService.createDatePaymentOrder(packageId);

    if (!mounted) return;

    if (result['success'] != true || result['approvalUrl'] == null) {
      setState(() => _checkoutId = null);
      Get.snackbar(
        'Error',
        result['error'] ?? 'Unable to start PayPal checkout.',
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }

    final url = Uri.parse(result['approvalUrl']);
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
    setState(() => _checkoutId = null);
  }

  Future<void> _handleSubscriptionCheckout(Map<String, dynamic> plan) async {
    final api = Get.find<ApiService>();
    final paymentService = PaymentService(api);
    final planId = plan['id']?.toString() ?? '';

    // Check if user already has this plan
    if (_currentSubscription != null &&
        _currentSubscription!['status'] != 'cancelled' &&
        _currentSubscription!['plan']?['id'] == planId) {
      Get.snackbar(
        'Info',
        'You already have this plan.',
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }

    setState(() => _checkoutId = 'premium:$planId');

    final result = await paymentService.createSubscriptionPayment(planId);

    if (!mounted) return;

    if (result['success'] != true || result['approvalUrl'] == null) {
      setState(() => _checkoutId = null);
      Get.snackbar(
        'Error',
        result['error'] ?? 'Unable to start PayPal subscription.',
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }

    final url = Uri.parse(result['approvalUrl']);
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
    setState(() => _checkoutId = null);
  }

  @override
  Widget build(BuildContext context) {
    final dc = DarkModeColors.of(context);
    return Scaffold(
      backgroundColor: dc.scaffoldBackground,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          children: [
            const SizedBox(height: 20),
            // ── Header ──
            Text(
              'Store',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: dc.textPrimary,
              ),
            ),
            const SizedBox(height: 24),
            // ── Date Packages ──
            _buildDatePackagesSection(dc),
            const SizedBox(height: 32),
            // ── Get Unlimited Lives (Premium) ──
            _buildPremiumSection(dc),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildDatePackagesSection(DarkModeColors dc) {
    if (_isLoadingDates) {
      return Column(
        children: List.generate(
          3,
          (i) => Container(
            margin: const EdgeInsets.only(bottom: 16),
            height: 280,
            decoration: BoxDecoration(
              color: dc.cardBackground,
              borderRadius: BorderRadius.circular(16),
            ),
          ),
        ),
      );
    }

    if (_datePackages.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: dc.cardBackground,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: dc.border),
        ),
        child: Column(
          children: [
            Text(
              _error ?? 'No date packages available.',
              style: TextStyle(color: dc.textSecondary),
            ),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: () {
                setState(() {
                  _isLoadingDates = true;
                  _error = null;
                });
                _loadData();
              },
              child: const Text('RETRY'),
            ),
          ],
        ),
      );
    }

    return Column(
      children: List.generate(_datePackages.length, (i) {
        final pkg = _datePackages[i];
        final isPopular = pkg['sortOrder'] == 2;
        final isSelected = _selectedDateIndex == i || isPopular;
        final price = pkg['price'] ?? 0;
        final amount = pkg['dateAmount'] ?? pkg['amount'] ?? 0;
        final label = pkg['name'] ?? pkg['label'] ?? 'DATE PACKAGE';
        final description = pkg['description'] ??
            'Get $amount Dates to keep learning without interruption.';
        final packageId = pkg['id']?.toString() ?? '';
        final isCheckingOut = _checkoutId == 'dates:$packageId';

        return GestureDetector(
          onTap: () {
            setState(() => _selectedDateIndex = i);
          },
          child: Container(
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(
              color: dc.cardBackground,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isSelected ? AppColors.accent : dc.border,
                width: isSelected ? 2 : 1,
              ),
              boxShadow: isSelected
                  ? [
                      BoxShadow(
                        color: AppColors.accent.withValues(alpha: 0.15),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ]
                  : null,
            ),
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                if (isPopular)
                  Positioned(
                    top: -12,
                    left: 0,
                    right: 0,
                    child: Center(
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.palm,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Text(
                          'MOST POPULAR',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 1,
                          ),
                        ),
                      ),
                    ),
                  ),
                Column(
                  children: [
                    if (isPopular) const SizedBox(height: 16),
                    Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        children: [
                          // Label + Price + Date icon
                          Stack(
                            clipBehavior: Clip.none,
                            children: [
                              Column(
                                children: [
                                  Text(
                                    '$label'.toUpperCase(),
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w700,
                                      color: dc.textSecondary,
                                      letterSpacing: 1,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '\$$price',
                                    style: TextStyle(
                                      fontSize: 44,
                                      fontWeight: FontWeight.w900,
                                      color: dc.textPrimary,
                                    ),
                                  ),
                                ],
                              ),
                              Positioned(
                                top: 0,
                                right: 0,
                                child: Image.asset(
                                  'assets/store/date_for_store.png',
                                  width: 44,
                                  height: 44,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          // Divider
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
                              '$amount',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                          const SizedBox(height: 12),
                          // Description
                          Text(
                            description,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 13,
                              color: dc.textSecondary,
                              height: 1.4,
                            ),
                          ),
                          const SizedBox(height: 16),
                          // CTA Button
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: isCheckingOut
                                  ? null
                                  : () => _handleDateCheckout(pkg),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.accent,
                                foregroundColor: Colors.white,
                                disabledBackgroundColor:
                                    AppColors.accent.withValues(alpha: 0.6),
                                padding:
                                    const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                elevation: 0,
                              ),
                              child: isCheckingOut
                                  ? const SizedBox(
                                      width: 20,
                                      height: 20,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: Colors.white,
                                      ),
                                    )
                                  : const Text(
                                      'GET DATES',
                                      style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w800,
                                        letterSpacing: 1,
                                      ),
                                    ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      }),
    );
  }

  Widget _buildPremiumSection(DarkModeColors dc) {
    final monthlyPlan = _subscriptionPlans.isNotEmpty
        ? _subscriptionPlans.firstWhere(
            (p) => p['interval'] == 'month',
            orElse: () => _subscriptionPlans.first,
          )
        : null;
    final yearlyPlan = _subscriptionPlans.isNotEmpty
        ? _subscriptionPlans.firstWhere(
            (p) => p['interval'] == 'year',
            orElse: () => _subscriptionPlans.last,
          )
        : null;

    return Container(
      decoration: BoxDecoration(
        color: dc.cardBackground,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.accent, width: 2),
      ),
      child: Column(
        children: [
          // Banner header
          Padding(
            padding: const EdgeInsets.only(top: 20),
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 32,
                    vertical: 10,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.accent,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.accent.withValues(alpha: 0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: const Text(
                    'Get Unlimited Lives',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
                // GO PREMIUM tag
                Positioned(
                  top: -8,
                  right: -20,
                  child: Transform.rotate(
                    angle: 0.2,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.palm,
                        borderRadius: BorderRadius.circular(8),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.15),
                            blurRadius: 4,
                          ),
                        ],
                      ),
                      child: const Text(
                        'GO PREMIUM',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 9,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          // Features + Image + Plans
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              children: [
                // Feature list + Palm tree
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Feature list
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _featureItem('Unlimited palms', dc),
                          _featureItem('Progress Tracking', dc),
                          _featureItem('Advanced Analytics', dc),
                          _featureItem('Personalized dashboard', dc),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    // Palm tree illustration
                    Expanded(
                      child: Center(
                        child: Image.asset(
                          'assets/store/palm_tree_for_store.png',
                          width: 140,
                          height: 140,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                // Plan cards - side by side
                Row(
                  children: [
                    if (monthlyPlan != null)
                      Expanded(
                        child: _planCard(monthlyPlan, dc),
                      ),
                    if (monthlyPlan != null && yearlyPlan != null)
                      const SizedBox(width: 12),
                    if (yearlyPlan != null)
                      Expanded(
                        child: _planCard(yearlyPlan, dc),
                      ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _featureItem(String text, DarkModeColors dc) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: const BoxDecoration(
              color: AppColors.accent,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: dc.textPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _planCard(
    Map<String, dynamic> plan,
    DarkModeColors dc,
  ) {
    final isYearly = plan['interval'] == 'year';
    final price = plan['price'] ?? 0;
    final suffix = isYearly ? '/yr' : '/mo';
    final planId = plan['id']?.toString() ?? '';
    final isCurrentPlan = _currentSubscription != null &&
        _currentSubscription!['status'] != 'cancelled' &&
        _currentSubscription!['plan']?['id'] == planId;
    final isCheckingOut = _checkoutId == 'premium:$planId';

    return Stack(
      clipBehavior: Clip.none,
      children: [
        GestureDetector(
          onTap: isCurrentPlan || isCheckingOut
              ? null
              : () => _handleSubscriptionCheckout(plan),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isCurrentPlan
                  ? AppColors.palm.withValues(alpha: 0.1)
                  : dc.cardBackground,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isCurrentPlan ? AppColors.palm : dc.border,
                width: isCurrentPlan ? 2 : 1,
              ),
            ),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: isCurrentPlan ? AppColors.palm : AppColors.accent,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    isCurrentPlan ? 'Current' : 'Subscribe',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                isCheckingOut
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: AppColors.accent,
                        ),
                      )
                    : Text(
                        '\$$price$suffix',
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w900,
                          color: dc.textPrimary,
                        ),
                      ),
              ],
            ),
          ),
        ),
        if (isYearly)
          Positioned(
            bottom: -10,
            right: -16,
            child: Transform.rotate(
              angle: -0.2,
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 8,
                  vertical: 2,
                ),
                decoration: BoxDecoration(
                  color: AppColors.palm,
                  borderRadius: BorderRadius.circular(8),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.15),
                      blurRadius: 4,
                    ),
                  ],
                ),
                child: const Text(
                  'BEST VALUE',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 9,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}
