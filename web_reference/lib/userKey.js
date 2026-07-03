export function getUserKey(session) {
    return session?.user?.id || session?.user?.email || "guest";
}
