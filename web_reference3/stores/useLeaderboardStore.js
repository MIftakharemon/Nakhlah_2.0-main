import { create } from "zustand";
import { createCachedSlice } from "./_utils/createCachedSlice";
import { fetchLeaderboard as fetchLeaderboardApi } from "@/services/api";
import { buildApiUrl } from "@/lib/api-config";

/**
 * Leaderboard Store
 * Manages leaderboard rankings and top 3 podium
 * TTL: 5 minutes
 * Persistence: Yes (read-only, safe to cache with localStorage)
 */
const LEADERBOARD_TTL_MS = 5 * 60 * 1000;

const LEADERBOARD_COLORS = [
    "from-purple-500 to-pink-500",
    "from-primary to-accent",
    "from-orange-500 to-red-500",
    "from-green-500 to-emerald-500",
    "from-violet-500 to-purple-500",
    "from-amber-500 to-orange-500",
    "from-teal-500 to-cyan-500",
    "from-rose-500 to-pink-500",
];

const toDisplayName = (fullName, email) => {
    const trimmedName = (fullName || "").trim();
    if (trimmedName) return trimmedName;
    const trimmedEmail = (email || "").trim();
    return trimmedEmail || "Unknown learner";
};

const toAvatarText = (nameOrEmail) => {
    const text = (nameOrEmail || "").trim();
    if (!text) return "NA";
    const localPart = text.includes("@") ? text.split("@")[0] : text;
    const parts = localPart
        .replace(/[^a-zA-Z0-9\s]/g, " ")
        .split(/\s+/)
        .filter(Boolean);
    if (parts.length >= 2) {
        return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
    }
    return localPart.slice(0, 2).toUpperCase();
};

const toMediaUrl = (url) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    return buildApiUrl(url);
};

export const useLeaderboardStore = create((set, get) => ({
    ...createCachedSlice(LEADERBOARD_TTL_MS),
    userKey: null,

    leaderboard: [],
    topThree: [],

    fetchLeaderboard: async ({ token, userKey = "guest", forceRefresh = false, sessionUserId = "" } = {}) => {
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

        if (!shouldFetch && state.leaderboard.length) {
            return {
                success: true,
                fromCache: true,
                leaderboard: state.leaderboard,
                topThree: state.topThree,
            };
        }

        set({ isLoading: true, error: null });

        const result = await fetchLeaderboardApi(token);
        if (!result?.success) {
            set({
                isLoading: false,
                error: result?.error || "Failed to load leaderboard",
            });
            return {
                success: false,
                error: result?.error || "Failed to load leaderboard",
            };
        }

        const mapped = (result.leaderboard || [])
            .map((item, index) => {
                const name = toDisplayName(item?.fullName, item?.email);
                const rank = Number(item?.rank);
                return {
                    rank: Number.isFinite(rank) ? rank : index + 1,
                    id: item?.id || `leader-${index}`,
                    name,
                    email: item?.email || "",
                    injaz: Number(item?.injazCount) || 0,
                    avatar: toAvatarText(name),
                    avatarUrl: toMediaUrl(item?.profilePictureUrl),
                    color: LEADERBOARD_COLORS[index % LEADERBOARD_COLORS.length],
                    isCurrentUser: Boolean(sessionUserId) && sessionUserId === item?.id,
                };
            })
            .sort((a, b) => a.rank - b.rank);

        set({
            userKey,
            leaderboard: mapped,
            topThree: mapped.slice(0, 3),
            isLoading: false,
            error: null,
            lastFetchedAt: Date.now(),
        });

        return {
            success: true,
            fromCache: false,
            leaderboard: mapped,
            topThree: mapped.slice(0, 3),
        };
    },

    invalidate: () => {
        set({ lastFetchedAt: null, error: null });
    },

    clear: () => {
        set({
            leaderboard: [],
            topThree: [],
            lastFetchedAt: null,
            isLoading: false,
            error: null,
        });
    },
}));
