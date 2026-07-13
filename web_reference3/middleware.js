import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isAuth = !!token;
        const isAuthPage = req.nextUrl.pathname.startsWith("/auth");
        const isOnboarding = req.nextUrl.pathname.startsWith("/onboarding");
        const isGetStarted = req.nextUrl.pathname.startsWith("/get-started");

        // Allow auth pages, onboarding, and get-started without authentication
        if (isAuthPage || isOnboarding || isGetStarted) {
            return NextResponse.next();
        }

        // Redirect to login if not authenticated on protected routes
        if (!isAuth) {
            let from = req.nextUrl.pathname;
            if (req.nextUrl.search) {
                from += req.nextUrl.search;
            }

            return NextResponse.redirect(
                new URL(`/auth/login?from=${encodeURIComponent(from)}`, req.url)
            );
        }

        // Check for expired token
        if (token.error === "TokenExpired" || token.error === "RefreshAccessTokenError") {
            return NextResponse.redirect(
                new URL("/auth/login?error=SessionExpired", req.url)
            );
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: () => true, // Handle authorization in the middleware function above
        },
    }
);

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
