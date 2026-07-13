import { create } from "zustand";
import { createCachedSlice } from "./_utils/createCachedSlice";
import {
    fetchGamificationDailyQuest,
    fetchUserDailyQuest,
    claimUserDailyQuest,
} from "@/services/api";
import { buildApiUrl } from "@/lib/api-config";
import { resolveDailyQuestClaimParam } from "@/lib/gamification";

/**
 * Daily Quest Store
 * Manages global daily quests and user's current quest statuses
 * Serves both home card (DailyQuests.jsx) and challenge page (DailyMissions.jsx)
 * TTL: 5 minutes
 */
const DAILY_QUEST_TTL_MS = 5 * 60 * 1000;

const defaultLabels = [
    "Complete daily challenge",
    "Practice streak target",
    "Score goal challenge",
    "Bonus challenge",
];

const toTitleCase = (key = "") =>
    key
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/^./, (char) => char.toUpperCase());

const toMediaUrl = (url) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    return buildApiUrl(url);
};

const questAliases = {
    lessonWithNoMistake: ["lessonWithNoMistake", "noMistakes"],
    scoreHighPoints: ["scoreHighPoints", "highScore", "scoreEightyPlus"],
    shareTheApp: ["shareTheApp", "shareApp"],
    spendMinutes: ["spendMinutes", "practiceTime"],
    spendDatesForLives: ["spendDatesForLives", "spendDates"],
    completeLessonsToday: ["completeLessonsToday", "completeLessons"],
    earnInjazToday: ["earnInjazToday", "earnInjaz"],
};

const resolveQuestAliases = (questId = "") => {
    if (!questId) return [];
    const explicit = questAliases[questId] || [];
    const fromGroup = Object.values(questAliases).find((aliases) =>
        aliases.includes(questId),
    );
    return Array.from(new Set([questId, ...explicit, ...(fromGroup || [])]));
};

const getMatchingQuestConfig = (challengeId, globalQuests) => {
    const aliases = resolveQuestAliases(challengeId);
    return globalQuests.find((quest) => {
        const questKey = quest?.key || "";
        if (!questKey) return false;
        if (questKey === challengeId) return true;
        return aliases.includes(questKey);
    });
};

const getMatchingChallengeStatus = (questKey, challengeStatuses) => {
    const aliases = resolveQuestAliases(questKey);
    return challengeStatuses.find((item) => {
        const challengeId = item?.challengeId || "";
        if (!challengeId) return false;
        if (challengeId === questKey) return true;
        return aliases.includes(challengeId);
    });
};

const mapHomeDailyQuests = (globalQuests = [], challengeStatuses = []) =>
    challengeStatuses.map((statusEntry) => {
        const questKey = statusEntry?.challengeId || "";
        const questConfig = getMatchingQuestConfig(questKey, globalQuests);
        const statusValue = (statusEntry?.status || "pending").toLowerCase();

        return {
            key: questKey,
            label: questConfig?.name ? questConfig.name : questKey ? toTitleCase(questKey) : "Quest",
            iconUrl: toMediaUrl(questConfig?.icon?.url || questConfig?.icon || ""),
            current: Number(statusEntry?.details?.current) || 0,
            target: Number(statusEntry?.details?.required) || 0,
            reward: Number(statusEntry?.details?.reward) || 0,
            status: statusValue,
        };
    });

const mapChallengeDailyMissions = (globalQuests = [], challengeStatuses = []) => {
    const normalized = globalQuests.map((quest, index) => {
        const questKey = quest.key || `daily-${index + 1}`;
        const statusEntry = getMatchingChallengeStatus(questKey, challengeStatuses);
        const questConfig = getMatchingQuestConfig(questKey, globalQuests) || quest;
        const statusValue = (statusEntry?.status || "pending").toLowerCase();
        const current = Number(statusEntry?.details?.current) || 0;
        const target = Number(statusEntry?.details?.required) || Number(questConfig?.required) || 0;

        return {
            key: questKey,
            label: questConfig?.name
                ? questConfig.name
                : questKey
                    ? toTitleCase(questKey)
                    : defaultLabels[index] || `Mission ${index + 1}`,
            current,
            target,
            reward:
                Number(statusEntry?.details?.reward) || Number(questConfig?.reward) || 0,
            status: statusValue,
            iconUrl: questConfig?.icon?.url || questConfig?.icon || "",
            type: "daily",
            active: Boolean(statusEntry),
        };
    });

    normalized.sort((a, b) => Number(b.active) - Number(a.active));
    return normalized;
};

export const useDailyQuestStore = create((set, get) => ({
    ...createCachedSlice(DAILY_QUEST_TTL_MS),

    userKey: null,
    globalQuests: [],
    challengeStatuses: [],
    homeDailyQuests: [],
    challengeDailyMissions: [],

    fetchDailyQuests: async ({ token, userKey = "guest", forceRefresh = false } = {}) => {
        if (!token) {
            set({ isLoading: false });
            return { success: false, error: "No authentication token available." };
        }

        const state = get();
        const switchedUser = state.userKey !== userKey;
        const needsRefetch =
            forceRefresh ||
            switchedUser ||
            state.shouldRefetch(state.lastFetchedAt);

        if (!needsRefetch) {
            return {
                success: true,
                fromCache: true,
                data: {
                    globalQuests: state.globalQuests,
                    challengeStatuses: state.challengeStatuses,
                    homeDailyQuests: state.homeDailyQuests,
                    challengeDailyMissions: state.challengeDailyMissions,
                },
            };
        }

        set({ isLoading: true, error: null });

        try {
            const [globalResult, userQuestResult] = await Promise.all([
                fetchGamificationDailyQuest(token),
                fetchUserDailyQuest(token),
            ]);

            if (!globalResult?.success) {
                throw new Error(globalResult?.error || "Failed to load daily quests.");
            }

            if (!userQuestResult?.success) {
                throw new Error(
                    userQuestResult?.error || "Failed to load current daily quest status.",
                );
            }

            const globalQuests = Array.isArray(globalResult?.dailyQuest)
                ? globalResult.dailyQuest
                : [];
            const challengeStatuses = Array.isArray(
                userQuestResult?.dailyQuest?.challengeStatuses,
            )
                ? userQuestResult.dailyQuest.challengeStatuses
                : [];

            set({
                userKey,
                globalQuests,
                challengeStatuses,
                homeDailyQuests: mapHomeDailyQuests(globalQuests, challengeStatuses),
                challengeDailyMissions: mapChallengeDailyMissions(
                    globalQuests,
                    challengeStatuses,
                ),
                lastFetchedAt: Date.now(),
                isLoading: false,
                error: null,
            });

            return {
                success: true,
                fromCache: false,
                data: {
                    globalQuests,
                    challengeStatuses,
                },
            };
        } catch (error) {
            set({
                isLoading: false,
                error: error?.message || "Unable to load daily quests.",
            });
            return {
                success: false,
                error: error?.message || "Unable to load daily quests.",
            };
        }
    },

    getHomeDailyQuests: () => get().homeDailyQuests,
    getChallengeDailyMissions: () => get().challengeDailyMissions,

    claimQuestIfAvailable: async ({
        token,
        userKey = "guest",
        questKey,
    } = {}) => {
        if (!token || !questKey) {
            return {
                success: false,
                error: "Missing token or quest key",
            };
        }

        const state = get();
        let challengeStatuses = Array.isArray(state.challengeStatuses)
            ? state.challengeStatuses
            : [];

        if (!challengeStatuses.length) {
            const fetched = await state.fetchDailyQuests({
                token,
                userKey,
                forceRefresh: true,
            });

            if (!fetched?.success) {
                return {
                    success: false,
                    error: fetched?.error || "Failed to load daily quests",
                };
            }

            challengeStatuses = Array.isArray(get().challengeStatuses)
                ? get().challengeStatuses
                : [];
        }

        const aliases = resolveQuestAliases(questKey);
        const pendingQuest = challengeStatuses.find((item) => {
            const challengeId = item?.challengeId || "";
            const status = (item?.status || "pending").toLowerCase();
            return aliases.includes(challengeId) && status !== "completed";
        });

        if (!pendingQuest) {
            return {
                success: true,
                skipped: true,
                reason: "Quest is not present or already completed",
            };
        }

        const claimParam = resolveDailyQuestClaimParam(questKey) || questKey;
        const claimResult = await claimUserDailyQuest(token, claimParam);

        if (!claimResult?.success) {
            return {
                success: false,
                error: claimResult?.error || "Failed to claim quest",
            };
        }

        await get().fetchDailyQuests({ token, userKey, forceRefresh: true });

        return {
            success: true,
            skipped: false,
        };
    },

    invalidate: () => {
        set({ lastFetchedAt: null, error: null });
    },

    clear: () => {
        set({
            userKey: null,
            globalQuests: [],
            challengeStatuses: [],
            homeDailyQuests: [],
            challengeDailyMissions: [],
            lastFetchedAt: null,
            isLoading: false,
            error: null,
        });
    },
}));
