# Token Expiration: Web vs Flutter App

## Overview

This document compares how JWT token expiration is handled in the **web reference** (Next.js + NextAuth.js) and the **Flutter app** (GetX + GetStorage).

---

## 1. Token Storage

| Aspect | Web (Next.js) | Flutter App |
|--------|---------------|-------------|
| **Storage** | HttpOnly encrypted session cookie (managed by NextAuth.js) | `GetStorage` (unencrypted local box) |
| **Token location** | `session.accessToken` inside NextAuth JWT | `auth.token` key in GetStorage |
| **Refresh token** | HttpOnly cookie (sent automatically via `credentials: "include"`) | `auth.cookies` header string (captured from `Set-Cookie`) |
| **Expiry claim** | `session.exp` stored on NextAuth JWT | `auth.exp` stored as Unix epoch seconds |
| **Security** | HttpOnly cookie (not accessible via JS) | Plaintext in app sandbox directory |

### Web Storage Flow
```
POST /api/users/login → { token, exp, user }
    ↓
NextAuth jwt callback stores: { accessToken, exp, userId, role }
    ↓
NextAuth creates encrypted HttpOnly session cookie
    ↓
Cookie sent automatically on every request
```

### Flutter Storage Flow
```
POST /api/users/login → { token, exp, user }
    ↓
StorageService.saveToken(token, exp: exp)
    ↓
GetStorage writes: auth.token, auth.exp, auth.cookies
    ↓
Token attached as Authorization: Bearer header manually
```

---

## 2. Token Expiration Check

| Aspect | Web | Flutter |
|--------|-----|---------|
| **Method** | `Date.now() / 1000 > token.exp` in NextAuth JWT callback | `exp <= nowSeconds + 300` (5-minute buffer) |
| **When checked** | Every JWT callback invocation (server-side) | Before every `_send()` call + periodic 1-min timer |
| **Buffer** | None (checks exact expiry) | 5 minutes before expiry |
| **Middleware** | Next.js middleware checks `token.error` field | No formal middleware (inline in `ApiService._send()`) |

### Web Expiration Check
```javascript
// lib/auth.js - NextAuth JWT callback
if (token.exp && Date.now() / 1000 > token.exp) {
    return refreshAccessTokenWithApi(token);
}
```

### Flutter Expiration Check
```dart
// storage_service.dart
bool get isTokenExpired {
  final expiry = exp;
  if (expiry == null) return false;
  final nowSeconds = DateTime.now().millisecondsSinceEpoch ~/ 1000;
  // 5-minute buffer: refresh while token is still valid
  return expiry <= nowSeconds + const Duration(minutes: 5).inSeconds;
}
```

---

## 3. Refresh Token Flow

### Web (Two-layer refresh)

```
Layer 1: Server-side (NextAuth JWT callback)
─────────────────────────────────────────────
Token expired? → POST /api/users/refresh-token
                    ├── Sends refresh token via cookie
                    ├── Gets new token
                    └── GET /api/users/me → gets user + fresh token
                    └── Returns { accessToken, exp, ... }

Layer 2: Client-side (fetchWithAuthRetry)
─────────────────────────────────────────────
API returns 401? → POST /api/users/refresh-token
                    ├── Gets new token
                    ├── GET /api/users/me → gets fresh token
                    └── Retries original request with new token
```

**Refresh Token Transmission:**
- Sent via HttpOnly cookie automatically (`credentials: "include"`)
- Never stored in JavaScript/accessible to client code

### Flutter (Single-layer refresh)

```
ApiService._refreshAccessTokenNow()
─────────────────────────────────────
1. POST /users/refresh-token
   ├── Authorization: Bearer <current_token>
   ├── Cookie: <captured cookies from previous responses>
   └── Body: {}

2. Extract token from response:
   ├── Try: refreshedToken → token → accessToken

3. GET /users/me (with new token)
   ├── If /me returns token, use that instead
   └── Fallback: use token from step 2

4. StorageService.saveToken(finalToken, exp: finalExp)
```

**Refresh Token Transmission:**
- Captured from `Set-Cookie` headers on every response
- Stored as string in `auth.cookies`
- Sent as `Cookie` header on subsequent requests
- The `auth.refreshToken` value in GetStorage is **never used** (dead code)

### Comparison

| Aspect | Web | Flutter |
|--------|-----|---------|
| **Trigger** | JWT callback (proactive) + 401 response (reactive) | `isTokenExpired` (proactive) + 401/403 (reactive) |
| **Concurrency** | NextAuth handles internally | Single `_refreshRequest` future (concurrent calls collapse) |
| **Retry on failure** | Sets `token.error` → middleware redirects to login | Returns `false` → snackbar error (no forced logout) |
| **Token source after refresh** | `/api/users/me` is authoritative | Both refresh and `/me` tried, best token wins |
| **Periodic refresh** | None (relies on JWT callback) | Every 1 minute via timer in `main.dart` |

---

## 4. Middleware / Route Protection

### Web (Next.js Middleware)

```javascript
// middleware.js
if (token.error === "TokenExpired" || token.error === "RefreshAccessTokenError") {
    return NextResponse.redirect(
        new URL("/auth/login?error=SessionExpired", req.url)
    );
}
```

- Runs server-side on every request
- Checks `token.error` field set by failed refresh
- Redirects to login with `?error=SessionExpired`
- Covers ALL routes except API/static assets

### Flutter (No formal middleware)

```dart
// api_service.dart - inline in _send()
if (_shouldRefresh(response, auth: auth, path: path)) {
    final refreshed = await _refreshAccessToken();
    if (refreshed) {
        final retryResponse = await request().timeout(_timeout);
        return _decode(retryResponse);
    }
}
// If refresh fails → throw ApiException → snackbar error
// NO automatic redirect to login
```

- Auth logic embedded in `ApiService._send()`
- No route-level protection
- No automatic redirect on failed refresh

---

## 5. Logout Flow

### Web

```
Manual Logout:
  1. POST /api/users/logout (backend invalidates refresh token cookie)
  2. signOut({ redirect: false }) (clears NextAuth session cookie)
  3. router.push("/auth/login")

Auto Logout (expired session):
  1. Middleware detects token.error === "TokenExpired"
  2. Redirects to /auth/login?error=SessionExpired
  3. useAuth hooks detect !isAuthenticated → redirect to login
```

### Flutter

```
Manual Logout:
  1. POST /api/users/logout (backend invalidates)
  2. StorageService.clearAuth() (clears GetStorage)
  3. Get.offAllNamed(Routes.login) (clears nav stack)

Auto Logout:
  ❌ NOT IMPLEMENTED
  - Failed refresh → snackbar error only
  - User stuck on current screen
  - Must manually logout or restart app
```

---

## 6. Known Gaps in Flutter App

| Gap | Impact | Web Equivalent |
|-----|--------|----------------|
| **No auto-logout on failed refresh** | User stuck with repeated API errors | Middleware redirects to login |
| **`auth.refreshToken` never used** | Dead code; relies on cookie capture | N/A (cookies work natively) |
| **GetStorage is unencrypted** | Tokens stored in plaintext | HttpOnly cookie (encrypted) |
| **No route-level middleware** | All routes unprotected after token expires | Next.js middleware blocks all routes |
| **No `?error=SessionExpired`** | User doesn't know why API calls fail | Clear error message on login page |
| **5-min buffer may be too aggressive** | Unnecessary refresh calls | No buffer (exact expiry check) |

---

## 7. Recommendations

1. **Add auto-logout on failed refresh**: When `_refreshAccessTokenNow()` returns `false`, call `AuthController.logout()` and redirect to login.

2. **Remove dead `auth.refreshToken` code**: Clean up `StorageService.refreshToken` since it's never used.

3. **Consider secure storage**: Migrate from `GetStorage` to `flutter_secure_storage` for token storage.

4. **Add session expiry error handling**: Show a dialog/snackbar explaining "Session expired, please login again" instead of generic API errors.

5. **Add route-level protection**: Wrap protected routes with an auth guard that checks `isLoggedIn` and redirects to login if false.

---

## Key Files Reference

### Web
| File | Purpose |
|------|---------|
| `web_reference1/lib/auth.js` | NextAuth config, JWT callbacks, refresh logic |
| `web_reference1/middleware.js` | Server-side route protection |
| `web_reference1/lib/authUtils.js` | Session validation utilities |
| `web_reference1/services/api/auth.js` | 401 retry logic, refresh utility |
| `web_reference1/hooks/use-auth.js` | Client-side auth hook |

### Flutter
| File | Purpose |
|------|---------|
| `lib/services/storage_service.dart` | Token storage, expiry check |
| `lib/services/api_service.dart` | HTTP client, refresh logic, 401 handling |
| `lib/services/auth_service.dart` | Login/logout API calls |
| `lib/controllers/auth_controller.dart` | Auth state management |
| `lib/main.dart` | Startup refresh, periodic timer |
