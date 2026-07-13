import '../constants/api_endpoints.dart';

Map<String, dynamic>? _map(dynamic value) {
  if (value is Map<String, dynamic>) return value;
  if (value is Map) {
    return value.map((key, val) => MapEntry(key.toString(), val));
  }
  return null;
}

List<dynamic> _list(dynamic value) => value is List ? value : const [];

int _int(dynamic value, [int fallback = 0]) {
  if (value is int) return value;
  if (value is num) return value.toInt();
  return int.tryParse('$value') ?? fallback;
}

bool _bool(dynamic value) => value == true || value?.toString() == 'true';

String _string(dynamic value, [String fallback = '']) {
  final text = value?.toString();
  return text == null || text == 'null' ? fallback : text;
}

dynamic _unwrap(dynamic value) {
  var current = value;
  final seen = <dynamic>{};
  while (current is Map && !seen.contains(current)) {
    seen.add(current);
    if (current['data'] is Map || current['data'] is List) {
      current = current['data'];
    } else if (current['doc'] is Map) {
      current = current['doc'];
    } else if (current['profile'] is Map) {
      current = current['profile'];
    } else if (current['docs'] is List &&
        (current['docs'] as List).isNotEmpty) {
      current = (current['docs'] as List).first;
    } else {
      break;
    }
  }
  return current;
}

List<dynamic> _unwrapList(dynamic value, {List<String> keys = const []}) {
  var current = value;
  for (var depth = 0; depth < 8; depth++) {
    if (current is List) return current;

    final map = _map(current);
    if (map == null) return const [];

    for (final key in [...keys, 'data', 'docs', 'items', 'results']) {
      if (map[key] is List) return map[key] as List;
    }

    dynamic next;
    for (final key in ['data', 'payload', 'result']) {
      if (map[key] is Map || map[key] is List) {
        next = map[key];
        break;
      }
    }

    if (next == null || identical(next, current)) break;
    current = next;
  }
  return const [];
}

class ApiException implements Exception {
  ApiException(this.message, {this.statusCode, this.payload});

  final String message;
  final int? statusCode;
  final dynamic payload;

  @override
  String toString() => message;
}

class MediaModel {
  const MediaModel({
    this.id,
    this.url,
    this.thumbnailUrl,
    this.filename,
    this.mimeType,
    this.alt,
  });

  final String? id, url, thumbnailUrl, filename, mimeType, alt;

  bool get isAudio {
    final mime = mimeType?.toLowerCase() ?? '';
    final path = (url ?? filename ?? '').toLowerCase();
    return mime.startsWith('audio/') ||
        path.endsWith('.mp3') ||
        path.endsWith('.m4a') ||
        path.endsWith('.aac') ||
        path.endsWith('.wav') ||
        path.endsWith('.ogg') ||
        path.endsWith('.opus');
  }

  String? get absoluteUrl {
    final u = url ?? thumbnailUrl;
    if (u == null || u.isEmpty) return null;
    if (u.startsWith('http')) return u;
    final normalized = u.startsWith('/api/') ? u.replaceFirst('/api', '') : u;
    return '${ApiEndpoints.baseUrl}$normalized';
  }

  factory MediaModel.fromJson(dynamic value) {
    final j = _map(_unwrap(value));
    if (j == null) return const MediaModel();
    return MediaModel(
      id: j['id']?.toString(),
      url:
          (j['url'] ??
                  j['audioUrl'] ??
                  j['audioURL'] ??
                  j['fileUrl'] ??
                  j['fileURL'] ??
                  j['path'] ??
                  j['profilePictureUrl'])
              ?.toString(),
      thumbnailUrl:
          j['thumbnailURL']?.toString() ?? j['thumbnailUrl']?.toString(),
      filename: (j['filename'] ?? j['fileName'] ?? j['name'])?.toString(),
      mimeType: (j['mimeType'] ?? j['mimetype'] ?? j['type'])?.toString(),
      alt: j['alt']?.toString(),
    );
  }
}

MediaModel? _firstAudioMedia(dynamic value) {
  final direct = MediaModel.fromJson(value);
  if (direct.isAudio && direct.absoluteUrl != null) return direct;

  final map = _map(_unwrap(value));
  if (map == null) return null;

  final directUrl = _string(
    map['audioUrl'] ??
        map['audioURL'] ??
        map['audio'] ??
        map['audioFile'] ??
        map['soundUrl'] ??
        map['soundURL'] ??
        map['voiceUrl'] ??
        map['voiceURL'],
  );
  if (directUrl.isNotEmpty) {
    final media = MediaModel(url: directUrl, mimeType: 'audio');
    if (media.absoluteUrl != null) return media;
  }

  for (final key in [
    'media',
    'questionMedia',
    'lessonMedia',
    'audios',
    'audioFiles',
    'files',
    'attachments',
  ]) {
    final raw = map[key];
    if (raw is List) {
      for (final item in raw) {
        final nested = _map(item);
        final media = _firstAudioMedia(nested?['media'] ?? item);
        if (media != null) return media;
      }
    } else if (raw != null) {
      final media = _firstAudioMedia(raw);
      if (media != null) return media;
    }
  }

  return null;
}

class UserModel {
  const UserModel({this.id, this.email, this.name, this.role, this.pictureUrl});

  final String? id, email, name, role, pictureUrl;

  factory UserModel.fromJson(dynamic value) {
    final j = _map(_unwrap(value));
    if (j == null) return const UserModel();
    return UserModel(
      id: j['id']?.toString(),
      email: j['email']?.toString(),
      name: (j['name'] ?? j['fullName'])?.toString(),
      role: j['role']?.toString(),
      pictureUrl: (j['socialMediaPictureUrl'] ?? j['profilePictureUrl'])
          ?.toString(),
    );
  }
}

class AuthSession {
  const AuthSession({
    this.message,
    this.exp,
    this.token,
    this.refreshToken,
    this.user,
  });

  final String? message, token, refreshToken;
  final int? exp;
  final UserModel? user;

  factory AuthSession.fromJson(dynamic value) {
    final j = _map(value);
    if (j == null) return const AuthSession();
    final data = _map(j['data']);
    final source = data ?? j;
    return AuthSession(
      message: j['message']?.toString(),
      exp: source['exp'] is int
          ? source['exp'] as int
          : int.tryParse('${source['exp']}'),
      token: (source['token'] ?? source['accessToken'] ?? source['refreshedToken'])
          ?.toString(),
      refreshToken:
          (source['refreshToken'] ??
                  source['refresh_token'] ??
                  source['refresh'])
              ?.toString(),
      user: UserModel.fromJson(source['user']),
    );
  }
}

class OnboardInfo {
  const OnboardInfo({
    this.age = '',
    this.country = '',
    this.purpose = '',
    this.goalTime = 0,
    this.userSource = '',
    this.languageStrength = '',
  });

  final String age, country, purpose, userSource, languageStrength;
  final int goalTime;

  Map<String, dynamic> toJson() => {
    'age': age,
    'country': country,
    'purpose': purpose,
    'goalTime': goalTime,
    'userSource': userSource,
    'languageStrength': languageStrength,
  };

  factory OnboardInfo.fromJson(dynamic value) {
    final j = _map(_unwrap(value));
    if (j == null) return const OnboardInfo();
    return OnboardInfo(
      age: _string(j['age']),
      country: _string(j['country']),
      purpose: _string(j['purpose']),
      goalTime: _int(j['goalTime']),
      userSource: _string(j['userSource']),
      languageStrength: _string(j['languageStrength']),
    );
  }
}

class ProgressModel {
  const ProgressModel({
    this.levelOrder = 1,
    this.unitOrder = 1,
    this.taskOrder = 1,
    this.lessonOrder = 1,
    this.achievement = '',
  });

  final int levelOrder, unitOrder, taskOrder, lessonOrder;
  final String achievement;

  factory ProgressModel.fromJson(dynamic value) {
    final j = _map(_unwrap(value));
    if (j == null) return const ProgressModel();
    return ProgressModel(
      levelOrder: _int(j['levelOrder'], 1),
      unitOrder: _int(j['unitOrder'], 1),
      taskOrder: _int(j['taskOrder'], 1),
      lessonOrder: _int(j['lessonOrder'], 1),
      achievement: _string(j['achievement']),
    );
  }
}

class GamificationStock {
  const GamificationStock({
    this.palmStock = 0,
    this.dateStock = 0,
    this.injazStock = 0,
    this.badges,
  });

  final int palmStock, dateStock, injazStock;
  final dynamic badges;

  int get badgesCount {
    if (badges == null) return 0;
    if (badges is List) return badges.length;
    if (badges is Map) return badges.length;
    return 0;
  }

  factory GamificationStock.fromJson(dynamic value) {
    final j = _map(_unwrap(value));
    if (j == null) return const GamificationStock();
    final palm = _map(j['palm']);
    return GamificationStock(
      palmStock: palm == null ? _int(j['palmStock']) : _int(palm['palmStock']),
      dateStock: _int(j['dateStock']),
      injazStock: _int(j['injazStock'] ?? j['injazCount']),
      badges: j['badges'],
    );
  }
}

class DailyChallengeActivity {
  const DailyChallengeActivity({
    this.tasksCompleted = 0,
    this.lessonsCompleted = 0,
  });

  final int tasksCompleted, lessonsCompleted;

  factory DailyChallengeActivity.fromJson(dynamic value) {
    final j = _map(_unwrap(value));
    if (j == null) return const DailyChallengeActivity();
    return DailyChallengeActivity(
      tasksCompleted: _int(j['tasksCompleted']),
      lessonsCompleted: _int(j['lessonsCompleted']),
    );
  }
}

class UserProfileModel {
  const UserProfileModel({
    this.id,
    this.fullName,
    this.contactNumber,
    this.email,
    this.profilePicture,
    this.onboardInfo = const OnboardInfo(),
    this.currentProgress = const ProgressModel(),
    this.stock = const GamificationStock(),
    this.dailyChallengeActivity = const DailyChallengeActivity(),
    this.openedGiftBoxes = const [],
  });

  final String? id, fullName, contactNumber, email;
  final MediaModel? profilePicture;
  final OnboardInfo onboardInfo;
  final ProgressModel currentProgress;
  final GamificationStock stock;
  final DailyChallengeActivity dailyChallengeActivity;
  final List<String> openedGiftBoxes;

  bool hasOpenedGiftBox(String taskId) {
    return openedGiftBoxes.contains(taskId);
  }

  factory UserProfileModel.fromJson(dynamic value) {
    final j = _map(_unwrap(value));
    if (j == null) return const UserProfileModel();
    final openedRaw = j['openedGiftBoxes'];
    final openedGiftBoxes = openedRaw is List
        ? openedRaw.map((e) {
            if (e is Map) return '${e['taskId'] ?? ''}';
            return '$e';
          }).where((s) => s.isNotEmpty).toList()
        : <String>[];
    return UserProfileModel(
      id: j['id']?.toString(),
      fullName: j['fullName']?.toString(),
      contactNumber: j['contactNumber']?.toString(),
      email: j['email']?.toString(),
      profilePicture: MediaModel.fromJson(
        j['profilePicture'] ?? {'profilePictureUrl': j['profilePictureUrl']},
      ),
      onboardInfo: OnboardInfo.fromJson(j['onboardInfo']),
      currentProgress: ProgressModel.fromJson(
        j['currentProgress'] ?? j['learnerProgress'],
      ),
      stock: GamificationStock.fromJson(j['gamificationStock'] ?? j['stock']),
      dailyChallengeActivity: DailyChallengeActivity.fromJson(
        j['dailyChallengeActivity'],
      ),
      openedGiftBoxes: openedGiftBoxes,
    );
  }
}

class LeaderboardEntryModel {
  LeaderboardEntryModel({
    required this.rank,
    required this.id,
    required this.fullName,
    required this.injazCount,
    this.email,
    this.profilePictureUrl,
    this.isCurrentUser = false,
  });

  final int rank;
  final String id, fullName;
  final String? email, profilePictureUrl;
  final int injazCount;
  bool isCurrentUser;

  /// Resolves [profilePictureUrl] to an absolute URL for Image.network.
  String? get absolutePictureUrl {
    final u = profilePictureUrl;
    if (u == null || u.isEmpty) return null;
    if (u.startsWith('http')) return u;
    final normalized = u.startsWith('/api/') ? u.replaceFirst('/api', '') : u;
    return '${ApiEndpoints.baseUrl}$normalized';
  }

  String get initials {
    final words = fullName
        .trim()
        .split(RegExp(r'\s+'))
        .where((e) => e.isNotEmpty)
        .toList();
    if (words.isEmpty) return '?';
    return words.take(2).map((e) => e[0].toUpperCase()).join();
  }

  factory LeaderboardEntryModel.fromJson(dynamic value) {
    final j = _map(value) ?? const {};
    return LeaderboardEntryModel(
      rank: _int(j['rank'], 0),
      id: _string(j['id']),
      fullName: _string(j['fullName'] ?? j['name'], 'Learner'),
      email: j['email']?.toString(),
      injazCount: _int(j['injazCount'] ?? j['injazStock'] ?? j['score']),
      profilePictureUrl: j['profilePictureUrl']?.toString(),
    );
  }
}

class JourneyLevel {
  const JourneyLevel({
    required this.id,
    required this.title,
    required this.levelOrder,
    required this.units,
    this.active = false,
  });

  final String id, title;
  final int levelOrder;
  final bool active;
  final List<JourneyUnit> units;

  factory JourneyLevel.fromJson(dynamic value) {
    final j = _map(value) ?? const {};
    return JourneyLevel(
      id: _string(j['id']),
      title: _string(j['title'] ?? j['name'], 'Level'),
      levelOrder: _int(j['levelOrder'] ?? j['order']),
      active: _bool(j['inProgressOrCompleted'] ?? j['active']),
      units: _list(j['units']).map((e) => JourneyUnit.fromJson(e)).toList(),
    );
  }
}

class JourneyUnit {
  const JourneyUnit({
    required this.id,
    required this.title,
    required this.unitOrder,
    required this.tasks,
    this.active = false,
  });

  final String id, title;
  final int unitOrder;
  final bool active;
  final List<JourneyTask> tasks;

  factory JourneyUnit.fromJson(dynamic value) {
    final j = _map(value) ?? const {};
    return JourneyUnit(
      id: _string(j['id']),
      title: _string(j['title'] ?? j['name'], 'Unit'),
      unitOrder: _int(j['unitOrder'] ?? j['order']),
      active: _bool(j['inProgressOrCompleted'] ?? j['active']),
      tasks: _list(j['tasks']).map((e) => JourneyTask.fromJson(e)).toList(),
    );
  }
}

class JourneyTask {
  const JourneyTask({
    required this.id,
    required this.title,
    required this.taskOrder,
    this.lessonCount = 0,
    this.giftBox = false,
    this.active = false,
  });

  final String id, title;
  final int taskOrder, lessonCount;
  final bool giftBox, active;

  factory JourneyTask.fromJson(dynamic value) {
    final j = _map(value) ?? const {};
    return JourneyTask(
      id: _string(j['id']),
      title: _string(j['title'] ?? j['name'], 'Task'),
      taskOrder: _int(j['taskOrder'] ?? j['order']),
      lessonCount: _int(j['lessonCount'] ?? j['lessonsCount']),
      giftBox: _bool(j['giftBox']),
      active: _bool(j['inProgressOrCompleted'] ?? j['active']),
    );
  }
}

enum LessonStepType { learn, mcq, write, match, complete, mission }

class LessonModel {
  const LessonModel({
    required this.id,
    required this.title,
    this.levelOrder = 1,
    this.unitOrder = 1,
    this.taskOrder = 1,
    this.lessonOrder = 1,
    this.isExam = false,
    this.active = false,
    this.arabicText = '',
    this.transliteration = '',
    this.english = '',
    this.image = '',
    this.options = const [],
    this.correctIndex = 0,
    this.imagePath = '',
    this.correctAnswer = '',
    this.matchPairs = const [],
    this.letterTiles = const [],
    this.audioMedia,
  });

  final String id, title;
  final int levelOrder, unitOrder, taskOrder, lessonOrder;
  final bool isExam, active;
  final String arabicText,
      transliteration,
      english,
      image,
      imagePath,
      correctAnswer;
  final int correctIndex;
  final List<String> options, letterTiles;
  final List<MatchPairModel> matchPairs;
  final MediaModel? audioMedia;
  String? get audioUrl => audioMedia?.absoluteUrl;

  factory LessonModel.fromJson(dynamic value) {
    final j = _map(value) ?? const {};
    return LessonModel(
      id: _string(j['id']),
      title: _string(j['title'] ?? j['lessonTitle'] ?? j['name'], 'Lesson'),
      levelOrder: _int(j['levelOrder'], 1),
      unitOrder: _int(j['unitOrder'], 1),
      taskOrder: _int(j['taskOrder'], 1),
      lessonOrder: _int(j['lessonOrder'], 1),
      isExam: _bool(j['isExam']),
      active: _bool(j['inProgressOrCompleted'] ?? j['active']),
      arabicText: _string(j['arabicText'] ?? j['arabic']),
      transliteration: _string(j['transliteration']),
      english: _string(j['english'] ?? j['translation']),
      image: _string(j['image'] ?? j['imageUrl']),
      options: _list(j['options']).map((e) => _string(e)).toList(),
      correctIndex: _int(j['correctIndex']),
      imagePath: _string(j['imagePath'] ?? j['image'] ?? j['imageUrl']),
      correctAnswer: _string(j['correctAnswer']),
      matchPairs: _list(
        j['matchPairs'],
      ).map((e) => MatchPairModel.fromJson(e)).toList(),
      letterTiles: _list(j['letterTiles']).map((e) => _string(e)).toList(),
      audioMedia: _firstAudioMedia(j),
    );
  }
}

class AnswerModel {
  const AnswerModel({
    required this.id,
    this.title = '',
    this.isCorrect,
    this.mediaType,
    this.media,
  });

  final String id, title;
  final bool? isCorrect;
  final String? mediaType;
  final MediaModel? media;

  factory AnswerModel.fromJson(dynamic value) {
    final j = _map(value) ?? const {};
    return AnswerModel(
      id: _string(j['id']),
      title: _string(j['title'] ?? j['answer_title'] ?? j['text']),
      isCorrect: j['is_correct'] is bool
          ? j['is_correct'] as bool
          : (j['isCorrect'] is bool ? j['isCorrect'] as bool : null),
      mediaType: j['media_type']?.toString() ?? j['mediaType']?.toString(),
      media: MediaModel.fromJson(j['media']),
    );
  }
}

class MatchPairModel {
  const MatchPairModel({
    required this.arabic,
    required this.english,
    this.arabicId = '',
    this.englishId = '',
  });

  final String arabic, english, arabicId, englishId;

  factory MatchPairModel.fromJson(dynamic value) {
    final j = _map(value) ?? const {};
    return MatchPairModel(
      arabic: _string(j['arabic'] ?? j['left']),
      english: _string(j['english'] ?? j['right']),
      arabicId: _string(j['arabicId'] ?? j['leftId']),
      englishId: _string(j['englishId'] ?? j['rightId']),
    );
  }
}

class QuestionModel {
  const QuestionModel({
    required this.id,
    required this.type,
    required this.title,
    required this.answers,
    this.media = const [],
    this.arabicText = '',
    this.transliteration = '',
    this.english = '',
    this.image = '',
    this.options = const [],
    this.correctIndex = 0,
    this.imagePath = '',
    this.correctAnswer = '',
    this.matchPairs = const [],
    this.letterTiles = const [],
    this.audioMedia,
  });

  final String id, type, title;
  final List<AnswerModel> answers;
  final List<MediaModel> media;
  final String arabicText,
      transliteration,
      english,
      image,
      imagePath,
      correctAnswer;
  final int correctIndex;
  final List<String> options, letterTiles;
  final List<MatchPairModel> matchPairs;
  final MediaModel? audioMedia;
  String? get audioUrl => audioMedia?.absoluteUrl;

  factory QuestionModel.fromJson(dynamic value) {
    final j = _map(value) ?? const {};
    final answers = _list(
      j['answers'],
    ).map((e) => AnswerModel.fromJson(e)).toList();
    return QuestionModel(
      id: _string(j['id']),
      type: _string(
        j['question_type'] ?? j['questionType'] ?? j['type'],
        'mcq',
      ),
      title: _string(
        j['question_title'] ?? j['questionTitle'] ?? j['title'],
        'Question',
      ),
      answers: answers,
      media: _list(
        j['questionMedia'],
      ).map((e) => MediaModel.fromJson(_map(e)?['media'] ?? e)).toList(),
      arabicText: _string(j['arabicText'] ?? j['arabic']),
      transliteration: _string(j['transliteration']),
      english: _string(j['english'] ?? j['translation']),
      image: _string(j['image'] ?? j['imageUrl']),
      options: _list(
        j['options'],
      ).map((e) => _string(e)).where((e) => e.isNotEmpty).toList(),
      correctIndex: _int(j['correctIndex']),
      imagePath: _string(j['imagePath'] ?? j['image'] ?? j['imageUrl']),
      correctAnswer: _string(
        j['correctAnswer'] ??
            (answers.where((a) => a.isCorrect == true).isEmpty
                ? ''
                : answers.where((a) => a.isCorrect == true).first.id),
      ),
      matchPairs: _list(
        j['matchPairs'],
      ).map((e) => MatchPairModel.fromJson(e)).toList(),
      letterTiles: _list(j['letterTiles']).map((e) => _string(e)).toList(),
      audioMedia: _firstAudioMedia(j),
    );
  }
}

class QuestStatus {
  const QuestStatus({
    required this.challengeId,
    required this.status,
    this.required = 0,
    this.current = 0,
    this.reward = 0,
  });

  final String challengeId, status;
  final int required, current, reward;

  factory QuestStatus.fromJson(dynamic value) {
    final j = _map(value) ?? const {};
    final d = _map(j['details']) ?? const {};
    return QuestStatus(
      challengeId: _string(j['challengeId']),
      status: _string(j['status'], 'pending'),
      required: _int(d['required']),
      current: _int(d['current']),
      reward: _int(d['reward']),
    );
  }
}

class StreakModel {
  const StreakModel({
    this.currentStreak = 0,
    this.missedDays = 0,
    this.startDate,
    this.lastCompletedDate,
    this.streakDates = const [],
  });

  final int currentStreak, missedDays;
  final String? startDate, lastCompletedDate;
  final List<StreakDateEntry> streakDates;

  /// Compute current streak client-side from dates array (matches web getCurrentStreakCount).
  int get computedStreak {
    if (streakDates.isEmpty) return currentStreak;

    // Build status map: missed takes priority over completed
    final statusMap = <String, String>{};
    for (final entry in streakDates) {
      final key = entry.date;
      if (key.isEmpty) continue;
      final currentStatus = statusMap[key];
      if (currentStatus == 'missed') continue;
      if (entry.status == 'missed' || currentStatus == null) {
        statusMap[key] = entry.status;
      }
    }

    if (statusMap.isEmpty) return currentStreak;

    // Count consecutive completed days backward from today
    var streak = 0;
    final now = DateTime.now();
    for (var offset = 0; offset < 366; offset++) {
      final day = DateTime(now.year, now.month, now.day - offset);
      final key =
          '${day.year}-${day.month.toString().padLeft(2, '0')}-${day.day.toString().padLeft(2, '0')}';
      final status = statusMap[key];

      if (status == 'completed') {
        streak++;
        continue;
      }

      // Today can be skipped (no entry yet)
      if (streak == 0 && offset == 0 && status == null) {
        continue;
      }

      break;
    }

    return streak;
  }

  factory StreakModel.fromJson(dynamic value) {
    final j = _map(_unwrap(value));
    if (j == null) return const StreakModel();
    final rawDates = _list(j['dates']);
    return StreakModel(
      currentStreak: _int(j['currentStreak']),
      missedDays: _int(j['missedDays']),
      startDate: j['startDate']?.toString(),
      lastCompletedDate: j['lastCompletedDate']?.toString(),
      streakDates: rawDates.map((e) => StreakDateEntry.fromJson(e)).toList(),
    );
  }
}

class StreakDateEntry {
  const StreakDateEntry({required this.date, required this.status});
  final String date;
  final String status;

  factory StreakDateEntry.fromJson(dynamic value) {
    final j = _map(value);
    if (j != null) {
      var rawDate = _string(j['date']);
      // strip time portion if present (e.g. "2026-05-15T00:00:00.000Z")
      final tIndex = rawDate.indexOf('T');
      if (tIndex > 0) rawDate = rawDate.substring(0, tIndex);
      return StreakDateEntry(
        date: rawDate,
        status: _string(j['status']).toLowerCase(),
      );
    }
    // handle case where value is a plain date string
    final raw = value?.toString() ?? '';
    final tIndex = raw.indexOf('T');
    return StreakDateEntry(
      date: tIndex > 0 ? raw.substring(0, tIndex) : raw,
      status: 'completed',
    );
  }
}

class AchievementModel {
  const AchievementModel({
    required this.id,
    required this.title,
    required this.achievementTitle,
    this.achieved = false,
    this.levelOrder = 0,
    this.unitOrder = 0,
  });

  final String id, title, achievementTitle;
  final bool achieved;
  final int levelOrder, unitOrder;

  factory AchievementModel.fromJson(dynamic value) {
    final j = _map(value) ?? const {};
    return AchievementModel(
      id: _string(j['id']),
      title: _string(j['title']),
      achievementTitle: _string(j['achievementTitle'] ?? j['name']),
      achieved: _bool(j['achieved']),
      levelOrder: _int(j['levelOrder']),
      unitOrder: _int(j['unitOrder']),
    );
  }
}

class FaqModel {
  const FaqModel({required this.question, required this.answer});

  final String question, answer;

  factory FaqModel.fromJson(dynamic value) {
    final j = _map(value) ?? const {};
    return FaqModel(
      question: _string(j['question']),
      answer: _string(j['answer']),
    );
  }
}

class TextBlock {
  static String extract(dynamic value) {
    final parts = <String>[];
    void walk(dynamic n) {
      if (n is Map) {
        if (n['text'] != null) parts.add(n['text'].toString());
        for (final v in n.values) {
          walk(v);
        }
      } else if (n is List) {
        for (final v in n) {
          walk(v);
        }
      }
    }

    walk(value);
    return parts.join('\n').trim();
  }
}

class OnboardingItem {
  const OnboardingItem({
    required this.id,
    required this.title,
    this.mediaUrl,
    this.mediaAlt,
    this.goalTime,
  });

  final String id, title;
  final String? mediaUrl, mediaAlt;
  final int? goalTime;

  String? get absoluteMediaUrl {
    final u = mediaUrl;
    if (u == null || u.isEmpty) return null;
    if (u.startsWith('http')) return u;
    final normalized = u.startsWith('/api/') ? u.replaceFirst('/api', '') : u;
    return '${ApiEndpoints.baseUrl}$normalized';
  }

  factory OnboardingItem.fromStrength(dynamic value) {
    final m = _map(value) ?? const {};
    return OnboardingItem(
      id: _string(m['id']),
      title: _string(m['strengthsTitle'] ?? m['title'] ?? m['label'] ?? m['name']),
      mediaUrl: _extractMediaUrl(m, ['strengthsMedia', 'strengthMedia']),
    );
  }

  factory OnboardingItem.fromGoal(dynamic value) {
    final m = _map(value) ?? const {};
    return OnboardingItem(
      id: _string(m['id']),
      title: _string(m['goalTime'] ?? m['title'] ?? m['label'] ?? m['name']),
      mediaUrl: _extractMediaUrl(m, ['goalMedia', 'goalPicture']),
      goalTime: _int(m['goalTime']),
    );
  }

  factory OnboardingItem.fromPurpose(dynamic value) {
    final m = _map(value) ?? const {};
    return OnboardingItem(
      id: _string(m['id']),
      title: _string(m['purposeTitle'] ?? m['title'] ?? m['label'] ?? m['name']),
      mediaUrl: _extractMediaUrl(m, ['purposeMedia', 'purposePicture']),
    );
  }

  factory OnboardingItem.fromCountry(dynamic value) {
    final m = _map(value) ?? const {};
    return OnboardingItem(
      id: _string(m['id']),
      title: _string(m['countryName'] ?? m['title'] ?? m['label'] ?? m['name']),
      mediaUrl: _extractMediaUrl(m, ['countryMedia', 'countryPicture']),
    );
  }

  factory OnboardingItem.fromSource(dynamic value) {
    final m = _map(value) ?? const {};
    return OnboardingItem(
      id: _string(m['id']),
      title: _string(m['sourceName'] ?? m['title'] ?? m['label'] ?? m['name']),
      mediaUrl: _extractMediaUrl(m, ['sourcePicture', 'sourceMedia']),
    );
  }

  factory OnboardingItem.fromInterest(dynamic value) {
    final m = _map(value) ?? const {};
    return OnboardingItem(
      id: _string(m['id']),
      title: _string(m['interestTitle'] ?? m['title'] ?? m['label'] ?? m['name']),
      mediaUrl: _extractMediaUrl(m, ['interestPicture', 'interestMedia']),
    );
  }

  factory OnboardingItem.fromAge(dynamic value) {
    final m = _map(value) ?? const {};
    return OnboardingItem(
      id: _string(m['id']),
      title: _string(m['ageTitle'] ?? m['title'] ?? m['label'] ?? m['name']),
    );
  }

  static String? _extractMediaUrl(
    Map<String, dynamic> item,
    List<String> preferredKeys,
  ) {
    for (final key in preferredKeys) {
      final value = item[key];
      if (value is String && value.isNotEmpty) return value;
      if (value is Map) {
        final url = value['url']?.toString();
        if (url != null && url.isNotEmpty) return url;
      }
    }
    for (final key in [
      'media', 'image', 'picture', 'icon', 'thumbnail', 'asset',
    ]) {
      final value = item[key];
      if (value is String && value.isNotEmpty) return value;
      if (value is Map) {
        final url = value['url']?.toString();
        if (url != null && url.isNotEmpty) return url;
      }
    }
    if (item['media'] is List) {
      for (final entry in item['media'] as List) {
        if (entry is Map) {
          final url = entry['url']?.toString() ?? entry['media']?['url']?.toString();
          if (url != null && url.isNotEmpty) return url;
        }
      }
    }
    return null;
  }
}

class OnboardingOptions {
  const OnboardingOptions({
    this.purpose = const [],
    this.goal = const [],
    this.country = const [],
    this.userSource = const [],
    this.languageStrength = const [],
    this.age = const [],
    this.interests = const [],
    this.strengthsTitleTop = '',
    this.goalTimeTopTitle = '',
    this.purposeTitleTop = '',
    this.countryNameTop = '',
    this.sourceNameTop = '',
    this.interestTitleTop = '',
    this.ageTitleTop = '',
  });

  final List<OnboardingItem> purpose,
      goal,
      country,
      userSource,
      languageStrength,
      age,
      interests;

  final String strengthsTitleTop,
      goalTimeTopTitle,
      purposeTitleTop,
      countryNameTop,
      sourceNameTop,
      interestTitleTop,
      ageTitleTop;

  factory OnboardingOptions.fromJson(dynamic value) {
    final j = _map(_unwrap(value)) ?? const {};

    final langStrength = _map(j['languageStrength']) ?? const {};
    final goalSection = _map(j['Goal']) ?? _map(j['goal']) ?? const {};
    final purposeSection = _map(j['purpose']) ?? const {};
    final countrySection = _map(j['Country']) ?? _map(j['country']) ?? const {};
    final sourceSection = _map(j['userSource']) ?? const {};
    final interestSection = _map(j['interests']) ?? const {};
    final ageSection = _map(j['age']) ?? const {};

    return OnboardingOptions(
      languageStrength: _list(langStrength['strengthsList'])
          .map((e) => OnboardingItem.fromStrength(e))
          .toList(),
      goal: _list(goalSection['goalList'])
          .map((e) => OnboardingItem.fromGoal(e))
          .toList(),
      purpose: _list(purposeSection['purposeList'])
          .map((e) => OnboardingItem.fromPurpose(e))
          .toList(),
      country: _list(countrySection['countryList'])
          .map((e) => OnboardingItem.fromCountry(e))
          .toList(),
      userSource: _list(sourceSection['sourceList'])
          .map((e) => OnboardingItem.fromSource(e))
          .toList(),
      interests: _list(interestSection['interestList'])
          .map((e) => OnboardingItem.fromInterest(e))
          .toList(),
      age: _list(ageSection['ageList'])
          .map((e) => OnboardingItem.fromAge(e))
          .toList(),
      strengthsTitleTop: _string(langStrength['strengthsTitleTop'] ?? langStrength['titleTop']),
      goalTimeTopTitle: _string(goalSection['goalTimeTopTitle'] ?? goalSection['titleTop']),
      purposeTitleTop: _string(purposeSection['purposeTitleTop'] ?? purposeSection['titleTop']),
      countryNameTop: _string(countrySection['countryNameTop'] ?? countrySection['titleTop']),
      sourceNameTop: _string(sourceSection['sourceNameTop'] ?? sourceSection['titleTop']),
      interestTitleTop: _string(interestSection['interestTitleTop'] ?? interestSection['titleTop']),
      ageTitleTop: _string(ageSection['ageTitleTop'] ?? ageSection['titleTop'] ?? 'How old are you?'),
    );
  }
}

List<JourneyLevel> parseJourneyLevels(dynamic value) => _unwrapList(
  value,
  keys: const ['levels'],
).map((e) => JourneyLevel.fromJson(e)).toList();

List<LessonModel> parseLessons(dynamic value) => _unwrapList(
  value,
  keys: const ['lessons'],
).map((e) => LessonModel.fromJson(e)).toList();

List<QuestionModel> parseQuestions(dynamic value) => _unwrapList(
  value,
  keys: const ['questions'],
).map((e) => QuestionModel.fromJson(e)).toList();

List<AchievementModel> parseAchievements(dynamic value) => _unwrapList(
  value,
  keys: const ['achievements'],
).map((e) => AchievementModel.fromJson(e)).toList();

List<QuestStatus> parseQuestStatuses(dynamic value) => _unwrapList(
  value,
  keys: const ['challengeStatuses'],
).map((e) => QuestStatus.fromJson(e)).toList();

List<LeaderboardEntryModel> parseLeaderboard(dynamic value) =>
    _unwrapList(value, keys: const ['leaderboard'])
        .map((e) => LeaderboardEntryModel.fromJson(e))
        .where((e) => e.id.isNotEmpty || e.fullName.isNotEmpty)
        .toList();
