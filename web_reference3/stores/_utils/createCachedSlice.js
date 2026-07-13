/**
 * Shared TTL cache helpers for Zustand stores.
 */
export const createCachedSlice = (ttlMs = 5 * 60 * 1000) => ({
    lastFetchedAt: null,
    isLoading: false,
    error: null,
    shouldRefetch: (lastFetchedAt) => {
        if (!lastFetchedAt) return true;
        return Date.now() - lastFetchedAt > ttlMs;
    },
});
