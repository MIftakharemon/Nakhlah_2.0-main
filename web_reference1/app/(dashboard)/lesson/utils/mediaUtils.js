/**
 * Constructs the full media URL from the API response
 * @param {string} url - The media URL from the API
 * @returns {string} The full media URL
 */
export function getMediaUrl(url) {
    if (!url) return "";
    if (url.startsWith("http")) {
        return url;
    }
    return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
}

/**
 * Shuffles an array randomly
 * @param {Array} array - The array to shuffle
 * @returns {Array} A new shuffled array
 */
export function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Sorts answers by their order property
 * @param {Array} answers - The answers array to sort
 * @returns {Array} The sorted array
 */
export function sortByOrder(answers) {
    return [...answers].sort((a, b) => (a._order || a.order_number || 0) - (b._order || b.order_number || 0));
}
