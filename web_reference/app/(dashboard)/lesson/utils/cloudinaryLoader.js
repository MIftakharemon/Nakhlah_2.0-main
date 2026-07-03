/**
 * Cloudinary Loader for Next.js Image component.
 * Optimizes Cloudinary images by requesting modern formats (e.g., WebP),
 * auto quality adjustments, and specific responsive widths.
 *
 * @param {Object} options - Next.js loader options
 * @param {string} options.src - Original image source URL
 * @param {number} [options.width] - Required width for responsive sizing
 * @param {number|string} [options.quality] - Optional quality override
 * @returns {string} Optimized image URL or original source
 */
export default function cloudinaryLoader({ src, width, quality }) {
  if (!src) return "";

  // Verify it is a Cloudinary URL and contains /upload/
  if (src.includes("res.cloudinary.com") && src.includes("/upload/")) {
    const params = ["f_auto", "q_auto"];
    
    if (width) {
      params.push(`w_${width}`);
    }
    if (quality) {
      params.push(`q_${quality}`);
    }

    // Insert parameters right after '/upload/' if not already present
    if (!src.includes("/upload/f_auto") && !src.includes("/upload/q_auto")) {
      return src.replace("/upload/", `/upload/${params.join(",")}/`);
    }
  }

  return src;
}
