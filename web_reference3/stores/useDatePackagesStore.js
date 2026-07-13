import { create } from "zustand";
import { createCachedSlice } from "./_utils/createCachedSlice";
import { fetchDatePackages as fetchDatePackagesApi } from "@/services/api";

/**
 * Date Packages Store
 * Manages date/gem purchase packages from the API
 * TTL: 5 minutes
 * Persistence: Yes (read-only pricing data, safe to cache)
 */
const DATE_PACKAGES_TTL_MS = 5 * 60 * 1000;

const mapDatePackage = (item, index) => ({
    id: item?.id || `date-package-${index}`,
    label: item?.name || "DATE PACKAGE",
    amount: Number(item?.dateAmount) || 0,
    price: `$${item?.price ?? 0}`,
    description:
        item?.description ||
        `Get ${item?.dateAmount || 0} Dates to keep learning without interruption.`,
    buttonLabel: "GET DATES",
    emoji: "💎",
    popular: item?.sortOrder === 2,
    isActive: item?.isActive !== false,
    sortOrder: item?.sortOrder || 0,
    raw: item,
});

export const useDatePackagesStore = create((set, get) => ({
    ...createCachedSlice(DATE_PACKAGES_TTL_MS),

    packages: [],

    fetchDatePackages: async ({ forceRefresh = false } = {}) => {
        const state = get();
        const shouldFetch = forceRefresh || state.shouldRefetch(state.lastFetchedAt);

        if (!shouldFetch && state.packages.length) {
            return { success: true, fromCache: true, packages: state.packages };
        }

        set({ isLoading: true, error: null });

        const result = await fetchDatePackagesApi();
        if (!result?.success) {
            set({ isLoading: false, error: result?.error || "Failed to load date packages" });
            return {
                success: false,
                error: result?.error || "Failed to load date packages",
            };
        }

        const packages = (result.packages || [])
            .filter((item) => item?.isActive !== false)
            .map(mapDatePackage)
            .sort((a, b) => a.sortOrder - b.sortOrder);

        set({
            packages,
            isLoading: false,
            error: null,
            lastFetchedAt: Date.now(),
        });

        return { success: true, fromCache: false, packages };
    },

    invalidate: () => {
        set({ lastFetchedAt: null, error: null });
    },

    clear: () => {
        set({ packages: [], lastFetchedAt: null, isLoading: false, error: null });
    },
}));
