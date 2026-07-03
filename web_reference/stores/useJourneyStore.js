import { create } from "zustand";
import { createCachedSlice } from "./_utils/createCachedSlice";
import { fetchJourneyStructure as fetchJourneyStructureApi } from "@/services/api";

/**
 * Journey Store
 * Manages lesson structure, levels, and pathways
 * Replaces CACHE_JOURNEY from page.jsx
 * TTL: 10 minutes
 */
const JOURNEY_TTL_MS = 10 * 60 * 1000;

export const useJourneyStore = create((set, get) => ({
    ...createCachedSlice(JOURNEY_TTL_MS),
    userKey: null,
    journeyData: null,

    fetchJourneyStructure: async (token, forceRefresh = false, userKey = "guest") => {
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

        if (!shouldFetch && state.journeyData) {
            return { success: true, fromCache: true, data: state.journeyData };
        }

        set({ isLoading: true, error: null });

        const result = await fetchJourneyStructureApi(token);

        if (!result?.success) {
            set({
                isLoading: false,
                error: result?.error || "Unable to load journey structure",
            });
            return {
                success: false,
                error: result?.error || "Unable to load journey structure",
            };
        }

        const journeyData = result?.data || {};
        set({
            userKey,
            journeyData,
            isLoading: false,
            error: null,
            lastFetchedAt: Date.now(),
        });

        return { success: true, fromCache: false, data: journeyData };
    },

    invalidate: () => {
        set({ lastFetchedAt: null, error: null });
    },

    clear: () => {
        set({
            userKey: null,
            journeyData: null,
            lastFetchedAt: null,
            isLoading: false,
            error: null,
        });
    },
}));
