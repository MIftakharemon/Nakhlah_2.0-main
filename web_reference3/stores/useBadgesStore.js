import { create } from "zustand";
import { createCachedSlice } from "./_utils/createCachedSlice";
import { fetchGamificationBadges as fetchGamificationBadgesApi } from "@/services/api";

/**
 * Gamification Badges Store
 * Caches the global badge dictionary used by the profile section.
 * Badges change rarely, so a longer TTL is safe.
 * TTL: 10 minutes
 */
const BADGES_TTL_MS = 10 * 60 * 1000;

export const useBadgesStore = create((set, get) => ({
    ...createCachedSlice(BADGES_TTL_MS),
    userKey: null,
    badges: [],

    fetchBadges: async ({ token, userKey = "guest", forceRefresh = false } = {}) => {
        if (!token) {
            set({ isLoading: false });
            return { success: false, error: "Authentication required" };
        }

        const state = get();
        const switchedUser = state.userKey !== userKey;
        const shouldFetch =
            forceRefresh || switchedUser || state.shouldRefetch(state.lastFetchedAt);

        if (!shouldFetch && state.badges.length) {
            return { success: true, fromCache: true, badges: state.badges };
        }

        set({ isLoading: true, error: null });

        const result = await fetchGamificationBadgesApi(token);

        if (!result?.success) {
            set({
                isLoading: false,
                error: result?.error || "Failed to load badges",
            });
            return { success: false, error: result?.error || "Failed to load badges" };
        }

        const badges = result.badges || [];
        set({
            userKey,
            badges,
            isLoading: false,
            error: null,
            lastFetchedAt: Date.now(),
        });

        return { success: true, fromCache: false, badges };
    },

    invalidate: () => {
        set({ lastFetchedAt: null });
    },

    clear: () => {
        set({
            userKey: null,
            badges: [],
            lastFetchedAt: null,
            isLoading: false,
            error: null,
        });
    },
}));
