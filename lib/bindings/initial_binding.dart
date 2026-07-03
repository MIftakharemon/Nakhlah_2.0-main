import 'package:get/get.dart';
import '../controllers/app_controller.dart';
import '../controllers/auth_controller.dart';
import '../controllers/content_controller.dart';
import '../controllers/gamification_controller.dart';
import '../controllers/profile_controller.dart';
import '../controllers/theme_controller.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../services/cms_service.dart';
import '../services/content_service.dart';
import '../services/gamification_service.dart';
import '../services/profile_service.dart';
import '../services/storage_service.dart';

class InitialBinding extends Bindings {
  @override
  void dependencies() {
    if (!Get.isRegistered<StorageService>()) {
      Get.put(StorageService(), permanent: true);
    }
    if (!Get.isRegistered<ApiService>()) {
      Get.put(ApiService(Get.find()), permanent: true);
    }
    Get.put(AuthService(Get.find(), Get.find()), permanent: true);
    Get.put(ProfileService(Get.find()), permanent: true);
    Get.put(ContentService(Get.find()), permanent: true);
    Get.put(GamificationService(Get.find()), permanent: true);
    Get.put(CmsService(Get.find()), permanent: true);
    Get.put(AppController(Get.find()), permanent: true);
    Get.put(ThemeController(), permanent: true);
    Get.put(AuthController(Get.find(), Get.find()), permanent: true);
    Get.put(ProfileController(Get.find()), permanent: true);
    Get.put(ContentController(Get.find()), permanent: true);
    Get.put(GamificationController(Get.find()), permanent: true);
  }
}
