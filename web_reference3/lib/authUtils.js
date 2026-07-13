// Export API services
export { registerUser, loginUser } from '@/services/api';

/**
 * Get session token from NextAuth session
 */
export function getSessionToken(session) {
    return session?.accessToken || null;
}

/**
 * Check if session is valid and not expired
 */
export function isSessionValid(session) {
    if (!session || !session.accessToken) {
        return false;
    }

    if (session.error === "TokenExpired" || session.error === "RefreshAccessTokenError") {
        return false;
    }

    return true;
}
