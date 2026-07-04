import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../constants/dark_mode_colors.dart';

class PaymentView extends StatelessWidget {
  const PaymentView({super.key});

  @override
  Widget build(BuildContext context) {
    final dc = DarkModeColors.of(context);
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
          'Payment',
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: dc.textPrimary,
          ),
        ),
        centerTitle: false,
      ),
      body: Center(
        child: Text(
          'Coming Soon',
          style: TextStyle(
            fontSize: 16,
            color: dc.textSecondary,
          ),
        ),
      ),
    );
  }
}
