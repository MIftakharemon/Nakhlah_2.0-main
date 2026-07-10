import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../common/app_motion.dart';
import '../../constants/app_colors.dart';
import '../../routes/app_routes.dart';

class PurchaseDatesView extends StatelessWidget {
  const PurchaseDatesView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAF8F5),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          children: [
            const SizedBox(height: 12),
            const PageEnter(child: _BackHeader()),
            const SizedBox(height: 24),
            const PageEnter(
              delay: Duration(milliseconds: 100),
              child: _PurchaseTitle(),
            ),
            const SizedBox(height: 28),
            PageEnter(
              delay: const Duration(milliseconds: 200),
              child: StaggeredList(
                gap: 16,
                children: _packs.map((p) => _DatePackCard(pack: p)).toList(),
              ),
            ),
            const SizedBox(height: 24),
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
                  'Back to Store',
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

class _PurchaseTitle extends StatelessWidget {
  const _PurchaseTitle();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('💎', style: TextStyle(fontSize: 28)),
            const SizedBox(width: 10),
            Text(
              'Purchase Dates',
              style: TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.bold,
                color: AppColors.ink,
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Text(
          'Boost your learning with dates to unlock premium\ncontent and features',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 14, color: AppColors.muted, height: 1.5),
        ),
      ],
    );
  }
}

class _DatePack {
  final int dates;
  final String name;
  final String description;
  final String price;
  final bool isPopular;

  const _DatePack({
    required this.dates,
    required this.name,
    required this.description,
    required this.price,
    this.isPopular = false,
  });
}

const _packs = [
  _DatePack(
    dates: 500,
    name: 'Starter Pack',
    description: 'Perfect for beginners',
    price: '\$2',
  ),
  _DatePack(
    dates: 1000,
    name: 'Value Pack',
    description: 'Best value for money',
    price: '\$10',
    isPopular: true,
  ),
  _DatePack(
    dates: 1500,
    name: 'Premium Pack',
    description: 'Maximum dates',
    price: '\$15',
  ),
  _DatePack(
    dates: 3000,
    name: 'Ultimate Pack',
    description: 'Pro player bundle',
    price: '\$25',
  ),
];

class _DatePackCard extends StatelessWidget {
  final _DatePack pack;

  const _DatePackCard({required this.pack});

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.04),
                blurRadius: 10,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          padding: const EdgeInsets.fromLTRB(20, 28, 20, 20),
          child: Column(
            children: [
              const Text('💎', style: TextStyle(fontSize: 36)),
              const SizedBox(height: 12),
              Text(
                '${pack.dates}',
                style: const TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: AppColors.premiumGradientStart,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Dates',
                style: TextStyle(fontSize: 14, color: AppColors.muted),
              ),
              const SizedBox(height: 16),
              Text(
                pack.name,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.ink,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                pack.description,
                style: TextStyle(fontSize: 13, color: AppColors.muted),
              ),
              const SizedBox(height: 16),
              Divider(color: Colors.grey.shade200, thickness: 1),
              const SizedBox(height: 12),
              Text(
                pack.price,
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: AppColors.ink,
                ),
              ),
              const SizedBox(height: 14),
              PressableScale(
                child: Container(
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      begin: Alignment.centerLeft,
                      end: Alignment.centerRight,
                      colors: [AppColors.premiumGradientStart, AppColors.premiumGradientEnd],
                    ),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => Get.toNamed(Routes.payment, arguments: {
                        'type': 'date',
                        'package': {
                          'id': pack.dates.toString(),
                          'name': pack.name,
                          'price': pack.price,
                          'dateAmount': pack.dates,
                          'description': pack.description,
                        },
                      }),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        foregroundColor: Colors.white,
                        shadowColor: Colors.transparent,
                        minimumSize: const Size.fromHeight(50),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                        elevation: 0,
                      ),
                      child: const Text(
                        'Buy Now',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        if (pack.isPopular)
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
                    Text('⭐', style: TextStyle(fontSize: 12)),
                    SizedBox(width: 4),
                    Text(
                      'POPULAR',
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
