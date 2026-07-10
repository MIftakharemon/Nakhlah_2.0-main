import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

import '../constants/api_endpoints.dart';
import '../models/models.dart';
import 'storage_service.dart';

class ApiService {
  ApiService(this._storage);

  static const Duration _timeout = Duration(seconds: 30);

  final StorageService _storage;
  final http.Client _client = http.Client();

  Uri _uri(String path, [Map<String, dynamic>? query]) {
    final normalizedPath = path.startsWith('/api/')
        ? path.replaceFirst('/api', '')
        : path;
    final clean = '${ApiEndpoints.apiPrefix}$normalizedPath';
    final qp = <String, String>{};
    query?.forEach((k, v) {
      if (v != null && '$v'.isNotEmpty) qp[k] = '$v';
    });
    return Uri.parse(
      '${ApiEndpoints.baseUrl}$clean',
    ).replace(queryParameters: qp.isEmpty ? null : qp);
  }

  Map<String, String> _headers({bool auth = true, bool json = true}) {
    final token = _storage.token;
    final cookies = _storage.cookies;
    return {
      'Accept': 'application/json',
      if (json) 'Content-Type': 'application/json',
      if (auth && token != null && token.isNotEmpty)
        'Authorization': 'Bearer $token',
      if (cookies != null && cookies.isNotEmpty) 'Cookie': cookies,
    };
  }

  /// Returns auth headers from the central token store.
  ///
  /// Any code that cannot use get/post/patch/delete directly (for example
  /// just_audio media requests) must call this instead of reading/caching the
  /// token itself. This refreshes first when the token is inside the expiry
  /// buffer, then reads the updated token from [StorageService].
  Future<Map<String, String>> authHeaders({
    String accept = 'application/json',
    bool json = false,
  }) async {
    if (_storage.isLoggedIn && _storage.isTokenExpired) {
      await _refreshAccessToken();
    }

    final headers = _headers(auth: true, json: json);
    headers['Accept'] = accept;
    return headers;
  }

  Future<dynamic> get(
    String p, {
    Map<String, dynamic>? query,
    bool auth = true,
  }) => _send(
    () => _client.get(_uri(p, query), headers: _headers(auth: auth)),
    auth: auth,
    path: p,
  );

  Future<dynamic> post(String p, {dynamic body, bool auth = true}) => _send(
    () => _client.post(
      _uri(p),
      headers: _headers(auth: auth),
      body: jsonEncode(body ?? {}),
    ),
    auth: auth,
    path: p,
  );

  Future<dynamic> patch(String p, {dynamic body, bool auth = true}) => _send(
    () => _client.patch(
      _uri(p),
      headers: _headers(auth: auth),
      body: jsonEncode(body ?? {}),
    ),
    auth: auth,
    path: p,
  );

  Future<dynamic> delete(String p, {dynamic body, bool auth = true}) => _send(
    () => _client.delete(
      _uri(p),
      headers: _headers(auth: auth),
      body: body == null ? null : jsonEncode(body),
    ),
    auth: auth,
    path: p,
  );

  Future<dynamic> multipartPost(
    String p, {
    Map<String, String> fields = const {},
    File? file,
    String fileField = 'file',
    bool auth = true,
  }) => multipart(
    'POST',
    p,
    fields: fields,
    file: file,
    fileField: fileField,
    auth: auth,
  );

  Future<dynamic> multipartPatch(
    String p, {
    Map<String, String> fields = const {},
    File? file,
    String fileField = 'profilePicture',
    bool auth = true,
  }) => multipart(
    'PATCH',
    p,
    fields: fields,
    file: file,
    fileField: fileField,
    auth: auth,
  );

  Future<dynamic> multipart(
    String method,
    String p, {
    Map<String, String> fields = const {},
    File? file,
    String fileField = 'file',
    bool auth = true,
    Map<String, String>? extraHeaders,
  }) async {
    Future<http.Response> request() async {
      // Build multipart body manually using dart:io to match browser FormData exactly.
      final uri = _uri(p);
      final boundary = '----FlutterBoundary${DateTime.now().millisecondsSinceEpoch}';
      final token = _storage.token;
      final cookies = _storage.cookies;

      final bodyBytes = <int>[];

      // Add text fields
      for (final entry in fields.entries) {
        bodyBytes.addAll('--$boundary\r\n'.codeUnits);
        bodyBytes.addAll(
          'Content-Disposition: form-data; name="${entry.key}"\r\n\r\n'.codeUnits,
        );
        bodyBytes.addAll('${entry.value}\r\n'.codeUnits);
      }

      // Add file field
      if (file != null) {
        final fileBytes = await file.readAsBytes();
        final fileName = file.path.split('/').last;
        final contentType = _mimeFromPath(file.path);
        bodyBytes.addAll('--$boundary\r\n'.codeUnits);
        bodyBytes.addAll(
          'Content-Disposition: form-data; name="$fileField"; filename="$fileName"\r\n'
              .codeUnits,
        );
        bodyBytes.addAll('Content-Type: $contentType\r\n\r\n'.codeUnits);
        bodyBytes.addAll(fileBytes);
        bodyBytes.addAll('\r\n'.codeUnits);
      }

      bodyBytes.addAll('--$boundary--\r\n'.codeUnits);

      // Send using dart:io HttpClient for full control
      final client = HttpClient();
      try {
        final request = await client.openUrl(method, uri);
        request.headers.set('Authorization', 'Bearer $token');
        if (cookies != null && cookies.isNotEmpty) {
          request.headers.set('Cookie', cookies);
        }
        if (extraHeaders != null) {
          for (final entry in extraHeaders.entries) {
            request.headers.set(entry.key, entry.value);
          }
        }
        request.headers.contentType = ContentType('multipart', 'form-data', parameters: {'boundary': boundary});
        request.add(bodyBytes);

        final response = await request.close().timeout(_timeout);
        final responseBody = await response.transform(utf8.decoder).join();

        print('[API] multipart $method $uri fields=${fields.keys.toList()} file=$fileField status=${response.statusCode}');
        print('[API] multipart ${response.statusCode} body=${responseBody.length > 500 ? responseBody.substring(0, 500) + '...' : responseBody}');

        final respHeaders = <String, String>{};
        response.headers.forEach((key, values) {
          respHeaders[key] = values.join(', ');
        });
        return http.Response(responseBody, response.statusCode, headers: respHeaders);
      } finally {
        client.close();
      }
    }

    return _send(request, auth: auth, path: p);
  }

  /// Simple MIME type detection from file extension.
  String _mimeFromPath(String path) {
    final ext = path.split('.').last.toLowerCase();
    return {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'pdf': 'application/pdf',
    }[ext] ?? 'application/octet-stream';
  }

  /// Refresh the saved access token immediately.
  ///
  /// This is intentionally public so app startup can refresh the session before
  /// the first screen/API call is made.
  Future<bool> refreshAccessToken() => _refreshAccessToken();

  void close() => _client.close();

  Future<dynamic> _send(
    Future<http.Response> Function() request, {
    bool auth = true,
    String? path,
  }) async {
    try {
      if (auth &&
          path != ApiEndpoints.refreshToken &&
          _storage.isTokenExpired) {
        await _refreshAccessToken();
      }

      final response = await request().timeout(_timeout);
      await _captureCookies(response);
      if (_shouldRefresh(response, auth: auth, path: path)) {
        final refreshed = await _refreshAccessToken();
        if (refreshed) {
          final retryResponse = await request().timeout(_timeout);
          await _captureCookies(retryResponse);
          return _decode(retryResponse);
        }
      }

      return _decode(response);
    } on SocketException {
      throw ApiException('No internet connection.');
    } on TimeoutException {
      throw ApiException('Request timed out. Please try again.');
    } on ApiException {
      rethrow;
    } catch (e) {
      throw ApiException('Unexpected network error: $e');
    }
  }

  bool _shouldRefresh(
    http.Response response, {
    required bool auth,
    String? path,
  }) {
    return auth &&
        (response.statusCode == 401 || response.statusCode == 403) &&
        path != ApiEndpoints.refreshToken &&
        _storage.token != null &&
        _storage.token!.isNotEmpty;
  }

  /// Persist Set-Cookie headers so the refresh-token cookie is replayed on
  /// subsequent requests (mimics the browser's credentials: "include" behaviour).
  Future<void> _captureCookies(http.Response response) async {
    final setCookies = response.headers['set-cookie'];
    if (setCookies == null || setCookies.isEmpty) return;

    final cookieHeader = _cookieHeaderFromSetCookie(setCookies);
    if (cookieHeader.isEmpty) return;

    await _storage.saveCookies(cookieHeader);
  }

  String _cookieHeaderFromSetCookie(String setCookieHeader) {
    return setCookieHeader
        .split(RegExp(r',(?=\s*[^;,=\s]+=)'))
        .map((cookie) => cookie.trim().split(';').first.trim())
        .where((cookie) => cookie.isNotEmpty)
        .join('; ');
  }

  Future<bool>? _refreshRequest;

  Future<bool> _refreshAccessToken() {
    final pending = _refreshRequest;
    if (pending != null) return pending;

    final future = _refreshAccessTokenNow();
    _refreshRequest = future;
    future.whenComplete(() => _refreshRequest = null);
    return future;
  }

  Future<bool> _refreshAccessTokenNow() async {
    final currentToken = _storage.token;
    if (currentToken == null || currentToken.isEmpty) return false;

    try {
      final response = await _client
          .post(
            _uri(ApiEndpoints.refreshToken),
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $currentToken',
              if (_storage.cookies != null) 'Cookie': _storage.cookies!,
            },
            body: jsonEncode({}),
          )
          .timeout(_timeout);

      await _captureCookies(response);
      if (response.statusCode != 200) return false;

      final decoded = _decode(response);
      final refreshMap = decoded is Map ? decoded : const <String, dynamic>{};
      // The refresh response may nest data under "data" (same as login).
      final data =
          refreshMap['data'] is Map
              ? refreshMap['data'] as Map
              : refreshMap;

      // Match web: prefer refreshedToken over token (the refresh endpoint
      // returns the new JWT as refreshedToken, not token).
      String? finalToken =
          (data['refreshedToken'] ?? data['token'] ?? data['accessToken'])
              ?.toString();
      int? finalExp =
          data['exp'] is int
              ? data['exp'] as int
              : int.tryParse('${data['exp']}');

      if (finalToken != null && finalToken.isNotEmpty) {
        try {
          final meResp = await _client
              .get(
                _uri(ApiEndpoints.me),
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer $finalToken',
                  if (_storage.cookies != null) 'Cookie': _storage.cookies!,
                },
              )
              .timeout(_timeout);

          await _captureCookies(meResp);

          if (meResp.statusCode == 200) {
            final meData = _decode(meResp);
            if (meData is Map) {
              final meToken =
                  (meData['token'] ?? meData['refreshedToken'])?.toString();
              if (meToken != null && meToken.isNotEmpty) {
                finalToken = meToken;
              }
              if (meData['exp'] is int) {
                finalExp = meData['exp'] as int;
              }
            }
          }
        } catch (_) {
          // /me failed but refresh token is still valid — use it.
        }
      }

      if (finalToken == null || finalToken.isEmpty) return false;

      await _storage.saveToken(finalToken, exp: finalExp);
      return true;
    } catch (_) {
      // Don't clear auth on transient failures — let the caller decide.
      return false;
    }
  }

  dynamic _decode(http.Response r) {
    dynamic body;
    final raw = r.body.trim();
    if (raw.isNotEmpty) {
      try {
        body = jsonDecode(raw);
      } catch (_) {
        body = raw;
      }
    }

    if (r.statusCode >= 200 && r.statusCode < 300) return body;

    throw ApiException(
      _extractErrorMessage(body),
      statusCode: r.statusCode,
      payload: body,
    );
  }

  String _extractErrorMessage(dynamic body) {
    if (body is String && body.trim().isNotEmpty) return body.trim();
    if (body is! Map) return 'Request failed';

    final nestedMessages = <String>[];
    void collectMessages(dynamic value) {
      if (value is List) {
        for (final item in value) {
          collectMessages(item);
        }
        return;
      }
      if (value is! Map) return;

      final message = value['message'] ?? value['detail'] ?? value['msg'];
      if (message != null && message.toString().trim().isNotEmpty) {
        nestedMessages.add(message.toString().trim());
      }

      collectMessages(value['errors']);
      collectMessages(value['data']);
      collectMessages(value['collection']);
    }

    collectMessages(body['errors']);
    collectMessages(body['data']);
    if (nestedMessages.isNotEmpty) {
      return nestedMessages.toSet().join('\n');
    }

    final direct = body['message'] ?? body['error'];
    if (direct != null && direct.toString().trim().isNotEmpty) {
      return direct.toString().trim();
    }

    return 'Request failed';
  }
}
