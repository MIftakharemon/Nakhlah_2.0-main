
class ApiEndpoints {

  ApiEndpoints._();

  static const String baseUrl = 'https://test-api.nakhlah.net/api';
  static const String apiPrefix = '';
  static const String signUp = '/users/sign-in';
  static const String login = '/users/login';
  static const String logout = '/users/logout';
  static const String socialLogin = '/users/social-login';
  static const String forgotPassword = '/users/forgot-password';
  static const String resetPassword = '/users/reset-password';
  static const String changePassword = '/users/change-password';
  static const String refreshToken = '/users/refresh-token';
  static const String me = '/users/me';
  static const String userProfile = '/user-profile';
  static const String updateProfile = '/user-profile/update-me';
  static const String deleteProfile = '/user-profile/me';
  static const String learnerProgress = '/user-profile/learner-progress';
  static const String profileDailyQuest = '/user-profile/daily-quest';
  static const String palmRefill = '/user-profile/palm-refill';
  static const String learnerStreak = '/user-profile/learner-streak';
  static const String gamificationStocks = '/user-profile/gamification-stocks';
  static const String leaderboard = '/user-profile/get-leaderboard';
  static const String helpCenter = '/globals/help-center';
  static const String about = '/globals/about';
  static const String legalDocuments = '/globals/legal-documents';
  static const String userOnboarding = '/globals/user-onboarding';

  static const String journeyStructure = '/lessons/journey-structure';
  static const String lessonByOrder = '/lessons/lesson-by-order';
  static const String wrongAnswer = '/lessons/wrong-answer';

  static const String dailyQuestsConfig =
      '/globals/gamification/get-daily-quests';
  static const String badgesConfig = '/globals/gamification/get-badges';
  static const String achievements = '/lessons/get-achievements';
  static const String nextLesson = '/lessons/next-lesson';
  static const String previousLesson = '/lessons/previous-lesson';
  static const String generalMedia = '/general-media';

  static String lessonsByTask(String id) => '/lessons/tasks/$id/lessons';
  static String giftBox(String id) => '/lessons/gift-box/$id';
  static String examQuestions(String id) => '/lessons/tasks/$id/exam-questions';
  static String questionsByLesson(String id) => '/lessons/$id';
  static String fullMarks(String id) => '/lessons/full-marks/$id';
  static String makeLearnerProgress(String id) => '/lessons/make-learner-progress/$id';
  static String restoreStreak(int days) => '/lessons/restore-streak/$days';

  // Payment & Store
  static const String datePackages = '/date-packages';
  static const String subscriptionPlans = '/subscription-plans';
  static const String createDatePaymentOrder = '/payments/dates/create-order';
  static const String captureDatePaymentOrder = '/payments/dates/capture-order';
  static const String createSubscriptionPayment = '/payments/subscriptions/create';
  static const String currentSubscription = '/payments/me/subscription';
  static String cancelSubscription(String id) => '/payments/subscriptions/cancel';

}
