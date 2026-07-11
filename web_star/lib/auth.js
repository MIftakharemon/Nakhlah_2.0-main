import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { buildApiUrl } from "@/lib/api-config";

const DEFAULT_PROFILE_IMAGE = "https://github.com/shadcn.png";

async function refreshAccessTokenWithApi(token) {
    try {
        const refreshResponse = await fetch(
            buildApiUrl("/api/users/refresh-token"),
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token?.accessToken ? { Authorization: `Bearer ${token.accessToken}` } : {}),
                },
                credentials: "include",
            }
        );

        const refreshData = await refreshResponse.json().catch(() => ({}));

        if (!refreshResponse.ok) {
            throw new Error(refreshData?.message || "Failed to refresh access token");
        }

        const meResponse = await fetch(buildApiUrl("/api/users/me"), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(refreshData?.token
                    ? { Authorization: `Bearer ${refreshData.token}` }
                    : token?.accessToken
                        ? { Authorization: `Bearer ${token.accessToken}` }
                        : {}),
            },
            credentials: "include",
        });

        const meData = await meResponse.json().catch(() => ({}));
        const resolvedToken = meData?.token || refreshData?.token || token?.accessToken;
        const resolvedExp = meData?.exp || refreshData?.exp || token?.exp;

        if (!resolvedToken) {
            throw new Error("Token refresh succeeded but no access token was returned");
        }

        return {
            ...token,
            accessToken: resolvedToken,
            exp: resolvedExp,
            userId: meData?.user?.id || token?.userId,
            role: meData?.user?.role || token?.role,
            error: undefined,
        };
    } catch (error) {
        console.error("Refresh access token error:", error);
        return {
            ...token,
            error: "RefreshAccessTokenError",
        };
    }
}

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password required");
                }

                try {
                    const response = await fetch(
                        buildApiUrl("/api/users/login"),
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            credentials: "include",
                            body: JSON.stringify({
                                email: credentials.email,
                                password: credentials.password,
                            }),
                        }
                    );

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data?.message || "Authentication failed");
                    }

                    if (data.token && data.user) {
                        return {
                            id: data.user.id,
                            email: data.user.email,
                            name: data.user.name,
                            role: data.user.role,
                            accessToken: data.token,
                            exp: data.exp,
                        };
                    }

                    return null;
                } catch (error) {
                    console.error("Auth error:", error);
                    throw new Error(error.message || "Authentication failed");
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            // Google/social sign in
            if (account && account.provider === "google") {
                console.log("Account :: ", account)
                try {
                    const requestBody = {
                        email: user.email,
                        sid: account.providerAccountId,
                        provider: "google",
                        socialMediaPictureUrl: user.image || "",
                        token: account.access_token || "",
                    };

                    // console.log("Google OAuth Account Data:", {
                    //     providerAccountId: account.providerAccountId,
                    //     access_token: account.access_token ? "exists" : "missing",
                    // });
                    console.log("Sending to social-login API:", requestBody);

                    // Call backend social login API
                    const response = await fetch(
                        buildApiUrl("/api/users/social-login"),
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            credentials: "include",
                            body: JSON.stringify(requestBody),
                        }
                    );

                    const data = await response.json();
                    console.log("Data response social :: ", data)

                    // Check for errors in response
                    if (!response.ok || data.errors) {
                        console.error("Social login API error:", data.errors || data);
                        return {
                            ...token,
                            error: "SocialLoginFailed",
                        };
                    }

                    return {
                        ...token,
                        accessToken: data.token,
                        exp: data.exp,
                        userId: data.user?.id || user.id,
                        role: data.user?.role,
                        userImage: user?.image || DEFAULT_PROFILE_IMAGE,
                    };
                } catch (error) {
                    console.error("Social login error:", error);
                    return {
                        ...token,
                        error: "SocialLoginFailed",
                    };
                }
            }

            // Initial credentials sign in
            if (account && user) {
                return {
                    ...token,
                    accessToken: user.accessToken,
                    exp: user.exp,
                    userId: user.id,
                    role: user.role,
                    userImage: token?.userImage || DEFAULT_PROFILE_IMAGE,
                };
            }

            // Check if token has expired
            if (token.exp && Date.now() / 1000 > token.exp) {
                return refreshAccessTokenWithApi(token);
            }

            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.userId;
                session.user.role = token.role;
                session.user.image = token.userImage || DEFAULT_PROFILE_IMAGE;
                session.accessToken = token.accessToken;
                session.error = token.error;
            }
            console.log("Session :: ", session)
            return session;
        },
    },
    pages: {
        signIn: "/auth/login",
        error: "/auth/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 2 * 60 * 60, // 2 hours (matching API session duration)
    },
    secret: process.env.NEXTAUTH_SECRET,
};
