import 'package:get/get.dart';

import '../common/app_motion.dart';
import '../views/auth/forgot_password_view.dart';
import '../views/auth/get_started_view.dart';
import '../views/auth/login_view.dart';
import '../views/auth/otp_verification_view.dart';
import '../views/auth/reset_password_view.dart';
import '../views/auth/signup_view.dart';
import '../views/auth/social_redirect_view.dart';
import '../views/auth/welcome_back_view.dart';
import '../views/challenges/challenges_view.dart';
import '../views/exercises/exercise_view.dart';
import '../views/exercises/lesson_result_view.dart';
import '../views/home/app_shell_view.dart';
import '../views/lessons/arabic_lesson_flow_view.dart';
import '../views/lessons/lessons_view.dart';
import '../views/onboarding/onboarding_form_view.dart';
import '../views/onboarding/onboarding_view.dart';
import '../views/gamification/premium_view.dart';
import '../views/gamification/payment_view.dart';
import '../views/gamification/purchase_dates_view.dart';
import '../views/settings/about_view.dart';
import '../views/settings/contact_view.dart';
import '../views/settings/faq_view.dart';
import '../views/settings/help_center_view.dart';
import '../views/settings/legal_view.dart';
import '../views/settings/settings_view.dart';
import '../views/settings/terms_view.dart';
import '../views/settings/privacy_policy_view.dart';
import '../views/profile/stats_view.dart';
import 'app_routes.dart';
import 'game_page_transition.dart';

class AppPages {
  static final _transition = GamePageTransition();

  static GetPage _page(String name, GetPageBuilder page) => GetPage(
    name: name,
    page: page,
    customTransition: _transition,
    transitionDuration: AppMotion.page,
  );

  static final pages = <GetPage>[
    _page(Routes.getStarted, () => const GetStartedView()),
    _page(Routes.arabicLessonFlow, () => const ArabicLessonFlowView()),
    _page(Routes.onboarding, () => const OnboardingView()),
    _page(Routes.onboardingForm, () => const OnboardingFormView()),
    _page(Routes.login, () => const LoginView()),
    _page(Routes.signup, () => const SignupView()),
    _page(Routes.forgotPassword, () => const ForgotPasswordView()),
    _page(Routes.otpVerification, () => const OtpVerificationView()),
    _page(Routes.shell, () => const AppShellView()),
    _page(Routes.lessons, () => const LessonsView()),
    _page(Routes.exercise, () => const ExerciseView()),
    _page(Routes.lessonResult, () => const LessonResultView()),
    _page(Routes.screen2AssalamuAlaykum, () => const ArabicLessonFlowView()),
    _page(Routes.question1, () => const ArabicLessonFlowView()),
    _page(Routes.correctFeedback, () => const ArabicLessonFlowView()),
    _page(Routes.screen4Ismii, () => const ArabicLessonFlowView()),
    _page(Routes.question3, () => const ArabicLessonFlowView()),
    _page(Routes.question4, () => const ArabicLessonFlowView()),
    _page(Routes.screen7KayfHaaluka, () => const ArabicLessonFlowView()),
    _page(Routes.writeQuestion, () => const ArabicLessonFlowView()),
    _page(Routes.match1, () => const ArabicLessonFlowView()),
    _page(Routes.match2, () => const ArabicLessonFlowView()),
    _page(Routes.lessonComplete, () => const ArabicLessonFlowView()),
    _page(Routes.dailyMission, () => const ArabicLessonFlowView()),
    _page(Routes.settings, () => const SettingsView()),
    _page(Routes.premium, () => const PremiumView()),
    _page(Routes.purchaseDates, () => const PurchaseDatesView()),
    _page(Routes.payment, () => const PaymentView()),
    _page(Routes.helpCenter, () => const HelpCenterView()),
    _page(Routes.about, () => const AboutView()),
    _page(Routes.legal, () => const LegalView()),
    _page(Routes.resetPassword, () => const ResetPasswordView()),
    _page(Routes.welcomeBack, () => const WelcomeBackView()),
    _page(Routes.socialRedirect, () => const SocialRedirectView()),
    _page(Routes.challenges, () => const ChallengesView()),
    _page(Routes.faq, () => const FaqView()),
    _page(Routes.terms, () => const TermsView()),
    _page(Routes.privacyPolicy, () => const PrivacyPolicyView()),
    _page(Routes.stats, () => const StatsView()),
    _page(Routes.contact, () => const ContactView()),
  ];
}
