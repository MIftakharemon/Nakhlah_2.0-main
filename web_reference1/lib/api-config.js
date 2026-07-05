export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export const buildApiUrl = (path = "") => {
    if (!path) return API_BASE_URL;

    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    if (!API_BASE_URL) {
        return path;
    }

    const normalizedBase = API_BASE_URL.endsWith("/")
        ? API_BASE_URL.slice(0, -1)
        : API_BASE_URL;

    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${normalizedBase}${normalizedPath}`;
};