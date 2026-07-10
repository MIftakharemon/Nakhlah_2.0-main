import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../common/app_motion.dart';
import '../../constants/app_colors.dart';
import '../../routes/app_routes.dart';

class PremiumView extends StatefulWidget {
  const PremiumView({super.key});

  @override
  State<PremiumView> createState() => _PremiumViewState();
}

class _PremiumViewState extends State<PremiumView> {
  int _selectedIndex = 2; // Default to 6 Months (Most Popular)

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAF8F5),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                children: [
                  const SizedBox(height: 12),
                  const PageEnter(child: _BackHeader()),
                  const SizedBox(height: 24),
                  const PageEnter(
                    delay: Duration(milliseconds: 100),
                    child: _PremiumTitle(),
                  ),
                  const SizedBox(height: 28),
                  PageEnter(
                    delay: const Duration(milliseconds: 200),
                    child: StaggeredList(
                      gap: 16,
                      children: _plans.asMap().entries.map((entry) {
                        final index = entry.key;
                        final plan = entry.value;
                        return _PlanCard(
                          plan: plan,
                          isSelected: _selectedIndex == index,
                          onTap: () => setState(() => _selectedIndex = index),
                        );
                      }).toList(),
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: PageEnter(
                delay: const Duration(milliseconds: 400),
                child: PressableScale(
                  child: Container(
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      begin: Alignment.centerLeft,
                      end: Alignment.centerRight,
                      colors: [AppColors.premiumGradientStart, AppColors.premiumGradientEnd],
                    ),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => Get.toNamed(Routes.payment, arguments: {
                        'type': 'subscription',
                        'plan': {
                          'id': _selectedIndex == 0 ? '1' : _selectedIndex == 1 ? '3' : _selectedIndex == 2 ? '6' : '12',
                          'duration': _plans[_selectedIndex].duration,
                          'price': _plans[_selectedIndex].price,
                          'interval': _selectedIndex == 3 ? 'year' : 'month',
                        },
                      }),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        foregroundColor: Colors.white,
                        shadowColor: Colors.transparent,
                        minimumSize: const Size.fromHeight(56),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        elevation: 0,
                      ),
                      child: const Text(
                        'Continue to Payment',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BackHeader extends StatelessWidget {
  const _BackHeader();

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: PressableScale(
        child: InkWell(
          onTap: () => Get.back(),
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.arrow_back, color: AppColors.ink, size: 20),
                const SizedBox(width: 8),
                Text(
                  'Back',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: AppColors.ink,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _PremiumTitle extends StatelessWidget {
  const _PremiumTitle();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          'Choose a subscription plan',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.bold,
            color: AppColors.ink,
          ),
        ),
        const SizedBox(height: 10),
        Text(
          'Select the perfect plan for your learning journey and save more with longer subscriptions',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 14, color: AppColors.muted, height: 1.5),
        ),
      ],
    );
  }
}

class _SubscriptionPlan {
  final String duration;
  final String? savingsText;
  final String? originalPrice;
  final String price;
  final bool isMostPopular;

  const _SubscriptionPlan({
    required this.duration,
    this.savingsText,
    this.originalPrice,
    required this.price,
    this.isMostPopular = false,
  });
}

const _plans = [
  _SubscriptionPlan(duration: '1 Month', price: '\$10.00'),
  _SubscriptionPlan(
    duration: '3 Months',
    savingsText: 'Save over 40%',
    originalPrice: '\$30.00',
    price: '\$25.00',
  ),
  _SubscriptionPlan(
    duration: '6 Months',
    savingsText: 'Save over 45%',
    originalPrice: '\$60.00',
    price: '\$45.00',
    isMostPopular: true,
  ),
  _SubscriptionPlan(
    duration: '12 Months',
    savingsText: 'Save over 50%',
    originalPrice: '\$120.00',
    price: '\$80.00',
  ),
];

class _PlanCard extends StatelessWidget {
  final _SubscriptionPlan plan;
  final bool isSelected;
  final VoidCallback onTap;

  const _PlanCard({
    required this.plan,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        PressableScale(
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(24),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: isSelected
                    ? Border.all(color: AppColors.premiumGradientStart, width: 2)
                    : null,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.04),
                    blurRadius: 10,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              padding: const EdgeInsets.fromLTRB(20, 28, 20, 24),
              child: Column(
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      color: const Color(0xFFF3E8FF),
                      borderRadius: BorderRadius.circular(32),
                    ),
                    child: const Center(
                      child: Text('👑', style: TextStyle(fontSize: 28)),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    plan.duration,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppColors.ink,
                    ),
                  ),
                  if (plan.savingsText != null) ...[
                    const SizedBox(height: 6),
                    Text(
                      plan.savingsText!,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.premiumGradientStart,
                      ),
                    ),
                  ] else
                    const SizedBox(height: 6),
                  const SizedBox(height: 16),
                  Divider(color: Colors.grey.shade200, thickness: 1),
                  const SizedBox(height: 16),
                  if (plan.originalPrice != null) ...[
                    Text(
                      plan.originalPrice!,
                      style: TextStyle(
                        fontSize: 16,
                        color: AppColors.muted,
                        decoration: TextDecoration.lineThrough,
                      ),
                    ),
                    const SizedBox(height: 4),
                  ],
                  Text(
                    plan.price,
                    style: const TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: AppColors.premiumGradientStart,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'per billing cycle',
                    style: TextStyle(fontSize: 13, color: AppColors.muted),
                  ),
                ],
              ),
            ),
          ),
        ),
        if (plan.isMostPopular)
          Positioned(
            top: -12,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 5,
                ),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    begin: Alignment.centerLeft,
                    end: Alignment.centerRight,
                    colors: [AppColors.premiumGradientStart, AppColors.premiumGradientEnd],
                  ),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.star_border, color: Colors.white, size: 14),
                    SizedBox(width: 4),
                    Text(
                      'Most Popular',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
      ],
    );
  }
}
