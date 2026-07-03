import { create } from "zustand";
import { createCachedSlice } from "./_utils/createCachedSlice";
import { fetchQuestionnaireAchievements } from "@/services/api";

/**
 * Achievements Store
 * Caches questionnaire achievements per user.
 * TTL: 10 minutes (achievements change infrequently)
 */
const ACHIEVEMENTS_TTL_MS = 10 * 60 * 1000;

export const useAchievementsStore = create((set, get) => ({
    ...createCachedSlice(ACHIEVEMENTS_TTL_MS),
    userKey: null,
    achievements: [],

    fetchAchievements: async ({ token, userKey = "guest", forceRefresh = false } = {}) => {
        if (!token) {
            set({ isLoading: false });
            return { success: false, error: "Authentication required" };
        }

        const state = get();
        const switchedUser = state.userKey !== userKey;
        const shouldFetch =
            forceRefresh ||
            switchedUser ||
            state.shouldRefetch(state.lastFetchedAt);

        if (!shouldFetch && state.achievements.length) {
            return { success: true, fromCache: true, achievements: state.achievements };
        }

        set({ isLoading: true, error: null });

        const result = await fetchQuestionnaireAchievements(token);

        if (!result?.success) {
            set({
                isLoading: false,
                error: result?.error || "Failed to load achievements",
            });
            return { success: false, error: result?.error || "Failed to load achievements" };
        }

        const achievements = result.achievements || [];
        set({
            userKey,
            achievements,
            isLoading: false,
            error: null,
            lastFetchedAt: Date.now(),
        });

        return { success: true, fromCache: false, achievements };
    },

    invalidate: () => {
        set({ lastFetchedAt: null, error: null });
    },

    clear: () => {
        set({
            userKey: null,
            achievements: [],
            lastFetchedAt: null,
            isLoading: false,
            error: null,
        });
    },
}));
