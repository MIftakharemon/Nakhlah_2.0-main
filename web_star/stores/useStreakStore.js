import { create } from "zustand";
import { createCachedSlice } from "./_utils/createCachedSlice";
import { fetchLearnerStreak as fetchLearnerStreakApi } from "@/services/api";
import { buildStreakActivities } from "@/lib/streakUtils";

/**
 * Streak Store
 * Manages learning streak calendar and activity history
 * TTL: 5 minutes
 * Note: No persistence (session-specific, users expect fresh on reload)
 */
const STREAK_TTL_MS = 5 * 60 * 1000;

export const useStreakStore = create((set, get) => ({
    ...createCachedSlice(STREAK_TTL_MS),
    userKey: null,
    streakData: null,

    dates: [],
    activities: {},

    fetchLearnerStreak: async ({ token, userKey = "guest", forceRefresh = false } = {}) => {
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

        if (!shouldFetch && state.streakData) {
            return {
                success: true,
                fromCache: true,
                streak: state.streakData,
            };
        }

        set({ isLoading: true, error: null });

        const result = await fetchLearnerStreakApi(token);
        if (!result?.success) {
            set({
                isLoading: false,
                error: result?.error || "Failed to load learner streak",
            });
            return {
                success: false,
                error: result?.error || "Failed to load learner streak",
            };
        }

        const streakData = result?.streak || null;
        const dates = Array.isArray(streakData?.dates) ? streakData.dates : [];

        set({
            userKey,
            streakData,
            dates,
            activities: buildStreakActivities(dates),
            isLoading: false,
            error: null,
            lastFetchedAt: Date.now(),
        });

        return { success: true, fromCache: false, streak: streakData };
    },

    invalidate: () => {
        set({ lastFetchedAt: null, error: null });
    },

    clear: () => {
        set({
            userKey: null,
            streakData: null,
            dates: [],
            activities: {},
            lastFetchedAt: null,
            isLoading: false,
            error: null,
        });
    },
}));
