import { buildApiUrl } from "@/lib/api-config";

const withApiUrl = (path) => {
    return buildApiUrl(path);
};

const toErrorMessage = (data, fallback) => {
    if (typeof data === "string" && data.trim()) return data;
    return data?.message || fallback;
};

export async function fetchAbout(token) {
    try {
        const response = await fetch(withApiUrl("/api/globals/about"), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            credentials: "include",
            cache: "no-store",
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(toErrorMessage(data, "Failed to fetch about content"));
        }

        return { success: true, data };
    } catch (error) {
        console.error("fetchAbout error:", error);
        return { success: false, error: error.message || "Failed to fetch about content" };
    }
}

export async function fetchHelpCenter(select = {}, token) {
    try {
        const params = new URLSearchParams();
        Object.entries(select).forEach(([key, val]) => {
            if (val) params.append(`select[${key}]`, "true");
        });

        const url = withApiUrl(`/api/globals/help-center${params.toString() ? `?${params}` : ""}`);

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            credentials: "include",
            cache: "no-store",
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(toErrorMessage(data, "Failed to fetch help center content"));
        }

        return { success: true, data };
    } catch (error) {
        console.error("fetchHelpCenter error:", error);
        return { success: false, error: error.message || "Failed to fetch help center content" };
    }
}

export async function fetchLegalDocuments(select = {}, token) {
    try {
        const params = new URLSearchParams();
        Object.entries(select).forEach(([key, val]) => {
            if (val) params.append(`select[${key}]`, "true");
        });

        const url = withApiUrl(`/api/globals/legal-documents${params.toString() ? `?${params}` : ""}`);

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            credentials: "include",
            cache: "no-store",
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(toErrorMessage(data, "Failed to fetch legal documents"));
        }

        return { success: true, data };
    } catch (error) {
        console.error("fetchLegalDocuments error:", error);
        return { success: false, error: error.message || "Failed to fetch legal documents" };
    }
}
