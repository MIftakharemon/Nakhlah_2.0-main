"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getSessionToken, isSessionValid } from "@/lib/authUtils";

/**
 * Custom hook for authentication
 * Provides session data and utility functions
 */
export function useAuth(options = {}) {
    const { requireAuth = false, redirectTo = "/auth/login" } = options;
    const { data: session, status } = useSession();
    const router = useRouter();

    const isLoading = status === "loading";
    const isAuthenticated = status === "authenticated" && isSessionValid(session);
    const token = isAuthenticated ? getSessionToken(session) : null;

    useEffect(() => {
        if (requireAuth && !isLoading && !isAuthenticated) {
            router.push(redirectTo);
        }
    }, [requireAuth, isLoading, isAuthenticated, router, redirectTo]);

    return {
        session,
        status,
        isLoading,
        isAuthenticated,
        token,
        user: session?.user || null,
    };
}
