import 'dart:async';

import 'package:app_links/app_links.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'bindings/initial_binding.dart';
import 'common/app_motion.dart';
import 'constants/app_theme.dart';
import 'controllers/theme_controller.dart';
import 'routes/app_pages.dart';
import 'routes/app_routes.dart';
import 'services/api_service.dart';
import 'services/storage_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await GetStorage.init();

  // Register the auth/token services before startup refresh so the whole app
  // uses the same ApiService + StorageService instances after reload.
  final storage = Get.put(StorageService(), permanent: true);
  Get.put(ApiService(storage), permanent: true);
  Get.put(ThemeController(), permanent: true);


  await _refreshSessionOnStartup();
  runApp(const NakhlahApp());
  _startSessionRefreshTimer();
  _startDeepLinkListener();
}


Timer? _sessionRefreshTimer;

void _startSessionRefreshTimer() {
  _sessionRefreshTimer?.cancel();
  _sessionRefreshTimer = Timer.periodic(const Duration(minutes: 1), (_) async {
    if (!Get.isRegistered<StorageService>() ||
        !Get.isRegistered<ApiService>()) {
      return;
    }

    final storage = Get.find<StorageService>();
    if (!storage.isLoggedIn || !storage.isTokenExpired) return;

    await Get.find<ApiService>().refreshAccessToken();
  });
}

void _startDeepLinkListener() {
  final appLinks = AppLinks();
  appLinks.uriLinkStream.listen((Uri uri) {
    if (uri.scheme == 'nakhlah' && uri.host == 'payment') {
      final orderId = uri.queryParameters['token'];
      final path = uri.path;
      if (path == '/success' && orderId != null) {
        // PaymentView handles capture via its own listener
      } else if (path == '/cancel') {
        Get.snackbar('Cancelled', 'Payment was cancelled.', snackPosition: SnackPosition.BOTTOM);
      }
    }
  });
}

Future<void> _refreshSessionOnStartup() async {
  final storage = Get.find<StorageService>();
  if (!storage.isLoggedIn) return;

  await Get.find<ApiService>().refreshAccessToken();
}

class NakhlahApp extends StatelessWidget {
  const NakhlahApp({super.key});
  @override
  Widget build(BuildContext context) {
    final storage = Get.find<StorageService>();
    final startRoute = storage.isLoggedIn ? Routes.shell : Routes.getStarted;
    final themeCtrl = Get.find<ThemeController>();
    return Obx(() => GetMaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Nakhlah 2.0',
      initialBinding: InitialBinding(),
      initialRoute: startRoute,
      getPages: AppPages.pages,
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: themeCtrl.themeMode,
      defaultTransition: Transition.cupertino,
      transitionDuration: AppMotion.page,
    ));
  }
}
