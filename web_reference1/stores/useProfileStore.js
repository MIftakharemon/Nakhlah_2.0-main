import { create } from "zustand";
import { createCachedSlice } from "./_utils/createCachedSlice";
import { fetchMyProfile as fetchMyProfileApi } from "@/services/api";

/**
 * Profile Store
 * Manages user profile and stats
 * Replaces CACHE_PROFILE from page.jsx
 * TTL: 5 minutes
 * Note: No localStorage persistence (user-specific, prefers fresh on mount)
 */
const PROFILE_TTL_MS = 5 * 60 * 1000;

export const useProfileStore = create((set, get) => ({
    ...createCachedSlice(PROFILE_TTL_MS),
    userKey: null,
    profile: null,
    stats: {},

    fetchMyProfile: async (token, forceRefresh = false, userKey = "guest") => {
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

        if (!shouldFetch && state.profile) {
            return { success: true, fromCache: true, profile: state.profile };
        }

        set({ isLoading: true, error: null });

        const result = await fetchMyProfileApi(token);

        if (!result?.success) {
            set({
                isLoading: false,
                error: result?.error || "Failed to load profile",
            });
            return {
                success: false,
                error: result?.error || "Failed to load profile",
            };
        }

        const profile = result?.profile || null;
        set({
            userKey,
            profile,
            stats: profile?.gamificationStock || {},
            isLoading: false,
            error: null,
            lastFetchedAt: Date.now(),
        });

        return { success: true, fromCache: false, profile };
    },

    invalidate: () => {
        set({ lastFetchedAt: null, error: null });
    },

    clear: () => {
        set({
            userKey: null,
            profile: null,
            stats: {},
            lastFetchedAt: null,
            isLoading: false,
            error: null,
        });
    },
}));
