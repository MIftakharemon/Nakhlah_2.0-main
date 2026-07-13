// Central map for character animation videos.
// Uses f_webm (not f_auto) to preserve alpha channel transparency.
// f_auto may pick MP4/H.264 which strips the alpha channel, causing a black background.

const CHARACTER_VIDEO_URLS = {
  happy: "https://res.cloudinary.com/dqdeoobeb/video/upload/v1782297720/new_happy_girl_2_pics_szbivr.webm",
  sad: "https://res.cloudinary.com/dqdeoobeb/video/upload/v1782297721/new_sad_boy_2_pics_b0ho6r.webm",
};

function optimizeCloudinaryVideo(url) {
  if (!url) return url;
  if (
    url.includes("res.cloudinary.com") &&
    url.includes("/video/upload/") &&
    !url.includes("/video/upload/f_webm")
  ) {
    return url.replace("/video/upload/", "/video/upload/f_webm,q_auto/");
  }
  return url;
}

export function getCharacterVideo(key) {
  const url = CHARACTER_VIDEO_URLS[key] || CHARACTER_VIDEO_URLS.happy;
  return optimizeCloudinaryVideo(url);
}

/**
 * Re-export the hook from the store so components can import from one place.
 * Returns the blob URL once prefetched, otherwise the remote Cloudinary URL.
 * Requires useCharacterVideoStore.prefetchVideos() to be called at app startup.
 */
export { useCharacterVideo } from "@/stores/useCharacterVideoStore";
