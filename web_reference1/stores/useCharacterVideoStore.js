import { create } from "zustand";
import { getCharacterVideo } from "@/lib/characterVideos";

const GATE_IMAGE_SRC = "https://res.cloudinary.com/dqdeoobeb/image/upload/v1782722031/gate_2_pocgmn.png";

async function fetchBlobUrl(url, fallback) {
    try {
        const response = await fetch(url);
        if (!response.ok) return fallback;
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch {
        return fallback;
    }
}

/**
 * Prefetches character animation videos and the gate banner image as blob URLs
 * so they render instantly. Call prefetchAll() once at app startup (ClientWrapper).
 */
export const useCharacterVideoStore = create((set, get) => ({
    blobUrls: {},
    gateBlobUrl: null,
    prefetched: false,

    prefetchAll: async () => {
        if (get().prefetched) return;

        // Prefetch gate first so it renders immediately
        const gateUrl = await fetchBlobUrl(GATE_IMAGE_SRC, GATE_IMAGE_SRC);
        set({ gateBlobUrl: gateUrl });

        // Then fetch videos in the background
        const keys = ["happy", "sad"];
        const videoEntries = await Promise.all(
            keys.map(async (key) => [
                key,
                await fetchBlobUrl(getCharacterVideo(key), getCharacterVideo(key)),
            ]),
        );

        set({
            blobUrls: Object.fromEntries(videoEntries),
            prefetched: true,
        });
    },

    getVideoSrc: (key) => {
        const { blobUrls } = get();
        return blobUrls[key] || getCharacterVideo(key);
    },

    getGateSrc: () => {
        const { gateBlobUrl } = get();
        return gateBlobUrl || GATE_IMAGE_SRC;
    },
}));

/**
 * Convenience hook — returns the prefetched blob URL for a given key,
 * or falls back to the remote Cloudinary URL if not yet prefetched.
 */
export function useCharacterVideo(key) {
    return useCharacterVideoStore((s) => s.getVideoSrc(key));
}

export function useGateImage() {
    return useCharacterVideoStore((s) => s.getGateSrc());
}
