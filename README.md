# Nakhlah 2.0

**Arabic Learning Platform | Flutter Mobile Application**

A cross-platform mobile application built with Flutter for learning Arabic through structured lessons, interactive exercises, and gamified progress tracking. The app serves as a comprehensive learning management system with payment integration, real-time gamification, and content management.

---

## Technical Architecture

### State Management & Navigation
- **GetX** for reactive state management, dependency injection, and declarative routing
- Reactive `Rx` observables with `Obx` widgets for real-time UI updates
- Service-locator pattern with `Get.put()` and `Get.find()` for dependency injection
- Named routing with `GetMaterialApp` and custom page transitions

### Backend Integration
- RESTful API integration with 50+ endpoints across authentication, content, gamification, and payments
- JWT-based authentication with automatic token refresh (60-second interval with 5-minute expiry buffer)
- Cookie-based session persistence mimicking browser behavior
- Multipart HTTP requests for file uploads (profile images)
- Error handling with retry logic on 401/403 responses

### Payment Integration
- PayPal payment gateway for in-app currency purchases and premium subscriptions
- Deep link handling for payment callbacks (`nakhlah://payment/success` and `/cancel`)
- Order creation, capture, and subscription management endpoints
- App lifecycle monitoring for payment flow continuity

### Authentication System
- Email/password authentication with OTP verification
- Google Sign-In integration
- Forgot password flow with reset token
- JWT token management with background refresh timer
- Auto-routing based on authentication state

### Data Layer
- Service-oriented architecture with dedicated services for auth, content, profile, gamification, payment, CMS, and storage
- GetStorage for local persistence (JWT, preferences, theme state)
- Comprehensive data models with serialization/deserialization

---

## Project Structure

```
lib/
├── main.dart                    # Entry point, session refresh, deep links
├── bindings/                    # Dependency injection setup
├── constants/                   # API endpoints, colors, themes, strings
├── models/                      # Data models (barrel file)
├── services/                    # API service layer (7 services)
│   ├── api_service.dart         # HTTP client with retry logic
│   ├── auth_service.dart        # Authentication endpoints
│   ├── content_service.dart     # Curriculum, lessons, progress
│   ├── profile_service.dart     # User profile, leaderboard
│   ├── gamification_service.dart # Quests, badges, streaks
│   ├── payment_service.dart     # PayPal integration
│   └── cms_service.dart         # CMS content management
├── controllers/                 # Business logic (GetX controllers)
├── views/                       # UI screens (~30 views)
│   ├── auth/                    # Login, signup, forgot password, OTP
│   ├── home/                    # App shell with bottom navigation
│   ├── lessons/                 # Learning flow, exercises
│   ├── profile/                 # User profile, stats
│   ├── gamification/            # Quests, badges, premium
│   ├── store/                   # In-app purchases
│   └── settings/                # Settings, FAQ, legal
├── routes/                      # Route definitions, custom transitions
├── common/                      # Reusable UI components
└── widgets/                     # Custom widgets, icons
```

---

## Key Features

### Learning System
- Hierarchical curriculum: Levels → Units → Tasks → Lessons
- Multiple question types: multiple-choice, write, match pairs, audio-based
- Exam mode with dedicated question sets
- Progress tracking with per-lesson analytics
- Arabic diacritics handling and fallback rendering
- Audio playback for pronunciation

### Gamification Engine
- Three in-app currencies: Palm, Date, and Injaz
- Daily quests with configurable targets
- Streak tracking with restore functionality
- Badge and achievement system
- Gift boxes at milestones
- Leaderboard with period filtering

### User Experience
- Material 3 design with palm-green accent theme
- Light/dark mode with persistence
- Animated mascot with floating animation
- Shimmer loading states
- Custom SVG icons
- CMS-driven FAQ, About, Terms & Privacy Policy
- Lexical editor JSON rendering for rich text

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `get` | State management, DI, routing |
| `get_storage` | Local persistent storage |
| `http` | HTTP client |
| `google_sign_in` | Social authentication |
| `just_audio` | Audio playback |
| `cached_network_image` | Image caching |
| `shimmer` | Loading effects |
| `fl_chart` | Progress visualization |
| `image_picker` | Profile picture upload |
| `flutter_svg` | SVG rendering |
| `url_launcher` | External URL handling |
| `app_links` | Deep link handling |
| `share_plus` | Social sharing |
| `intl` | Date/number formatting |

---

## Getting Started

```bash
git clone https://github.com/Salman-Farid/Nakhlah_2.0-main.git
cd Nakhlah_2.0-main
flutter pub get
flutter run
```

---

## Platform Support

- Android
- iOS
- Web
- macOS
- Windows
- Linux

---

## API

- Base URL: `https://test-api.nakhlah.net/api`
- RESTful endpoints with standard HTTP methods
- JWT authentication with automatic refresh
- Multipart file uploads for media