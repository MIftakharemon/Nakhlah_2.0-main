const DAILY_QUEST_ACTIVITY_MAP = {
  completeLessons: "lessonsCompleted",
  earnInjaz: "InjazEarned",
  practiceLessons: "lessonsPracticed",
  completeTasks: "taskCompleted",
  attendExam: "examAttended",
  spendDates: "datesSpend",
};

const DAILY_QUEST_CHALLENGE_ALIASES = {
  noMistakes: ["noMistakes", "lessonWithNoMistake"],
  highScore: ["highScore", "scoreEightyPlus"],
  spendDates: ["spendDates", "spendDatesForLives"],
  shareApp: ["shareApp", "shareTheApp"],
};

export const DAILY_QUEST_PARAM_BASED_CHALLENGES = [
  "spendMinutes",
  "lessonWithNoMistake",
  "scoreHighPoints",
  "shareTheApp",
];

export function resolveDailyQuestClaimParam(challengeId = "") {
  const normalizedChallengeId = (challengeId || "").trim();

  if (!normalizedChallengeId) {
    return "";
  }

  const aliases = DAILY_QUEST_CHALLENGE_ALIASES[normalizedChallengeId] || [];
  const resolvedParam = DAILY_QUEST_PARAM_BASED_CHALLENGES.find((quest) => {
    return quest === normalizedChallengeId || aliases.includes(quest);
  });

  return resolvedParam || normalizedChallengeId;
}

export function isParamBasedDailyQuest(challengeId = "") {
  return Boolean(resolveDailyQuestClaimParam(challengeId));
}

export function resolveLessonCompletionDailyQuestParams({
  accuracyPercentage = 0,
  hasWrongAnswer = false,
  elapsedSeconds = 0,
} = {}) {
  const questParams = [];

  if (!hasWrongAnswer) {
    questParams.push("lessonWithNoMistake");
  }

  if (Number(accuracyPercentage) >= 80) {
    questParams.push("scoreHighPoints");
  }

  if (Number(elapsedSeconds) >= 60) {
    questParams.push("spendMinutes");
  }

  return [...new Set(questParams)];
}

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getProfileDailyChallengeActivity(profileData) {
  const activity = profileData?.dailyChallengeActivity;
  if (!activity || typeof activity !== "object") {
    return {};
  }

  return activity;
}

export function getDailyQuestCurrentValue(questKey, profileData) {
  const activity = getProfileDailyChallengeActivity(profileData);
  const mappedField = DAILY_QUEST_ACTIVITY_MAP[questKey];

  if (mappedField) {
    return Number(activity?.[mappedField]) || 0;
  }

  if (questKey === "spendMinutes") {
    return Number(activity?.minutesSpent) || 0;
  }

  const completedChallenges = Array.isArray(activity?.lastChallenges)
    ? activity.lastChallenges
    : [];
  const aliases = DAILY_QUEST_CHALLENGE_ALIASES[questKey] || [questKey];

  return aliases.some((alias) => completedChallenges.includes(alias)) ? 1 : 0;
}

/**
 * Returns true if the given quest key (or any of its known aliases) appears
 * in the provided lastChallenges array. Works for all quest types including
 * those that also have a numeric counter in DAILY_QUEST_ACTIVITY_MAP.
 */
export function isQuestActiveInLastChallenges(questKey, lastChallenges) {
  if (!Array.isArray(lastChallenges) || !lastChallenges.length) return false;
  const aliases = DAILY_QUEST_CHALLENGE_ALIASES[questKey] || [questKey];
  return (
    lastChallenges.includes(questKey) ||
    aliases.some((alias) => lastChallenges.includes(alias))
  );
}

export function getProfileBadgeCount(profileData) {
  const badges = profileData?.gamificationStock?.badges;

  if (Array.isArray(badges)) {
    return badges.length;
  }

  if (badges && typeof badges === "object") {
    return Object.keys(badges).length;
  }

  return 0;
}

export function getLongestStreak(profileData) {
  const streakDates = Array.isArray(profileData?.learnerStreak?.dates)
    ? profileData.learnerStreak.dates
    : [];

  if (!streakDates.length) {
    return 0;
  }

  const dateStatusMap = new Map();
  streakDates.forEach((entry) => {
    if (!entry?.date) return;
    const dateKey =
      typeof entry.date === "string"
        ? entry.date.slice(0, 10)
        : getLocalDateKey(new Date(entry.date));
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return;

    const currentStatus = dateStatusMap.get(dateKey);
    if (entry.status === "missed" || !currentStatus) {
      dateStatusMap.set(dateKey, entry.status);
    }
  });

  const completedDateKeys = Array.from(dateStatusMap.entries())
    .filter(([, status]) => status === "completed")
    .map(([dateKey]) => dateKey);

  const completedDates = [...new Set(completedDateKeys)]
    .sort();

  if (!completedDates.length) {
    return 0;
  }

  let longest = 1;
  let current = 1;

  const toDayNumber = (dateKey) => {
    const [year, month, day] = dateKey.split("-").map(Number);
    if (!year || !month || !day) return null;
    return Math.floor(Date.UTC(year, month - 1, day) / 86400000);
  };

  for (let index = 1; index < completedDates.length; index += 1) {
    const previous = toDayNumber(completedDates[index - 1]);
    const currentDate = toDayNumber(completedDates[index]);
    if (!Number.isFinite(previous) || !Number.isFinite(currentDate)) {
      continue;
    }

    const diffInDays = currentDate - previous;

    if (diffInDays === 1) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

export function hasOpenedGiftBox(profileData, taskId) {
  if (!taskId) {
    return false;
  }

  const openedGiftBoxes = Array.isArray(profileData?.openedGiftBoxes)
    ? profileData.openedGiftBoxes
    : [];

  return openedGiftBoxes.some((gift) => gift?.taskId === taskId);
}
