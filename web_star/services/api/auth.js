import { buildApiUrl } from "@/lib/api-config";

const withApiUrl = (path) => {
    return buildApiUrl(path);
};

const toErrorMessage = (data, fallback) => {
    if (typeof data === "string" && data.trim()) return data;
    return data?.message || fallback;
};

export async function refreshAccessToken(currentToken) {
    try {
        const response = await fetch(withApiUrl("/api/users/refresh-token"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
            },
            credentials: "include",
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(toErrorMessage(data, "Failed to refresh token"));
        }

        return {
            success: true,
            token: data?.token || null,
            exp: data?.exp || null,
            data,
        };
    } catch (error) {
        console.error("Refresh token error:", error);
        return {
            success: false,
            error: error.message || "Failed to refresh token",
        };
    }
}

export async function fetchCurrentUser(token) {
    try {
        const response = await fetch(withApiUrl("/api/users/me"), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            credentials: "include",
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(toErrorMessage(data, "Failed to load account"));
        }

        return {
            success: true,
            user: data?.user || null,
            token: data?.token || token || null,
            exp: data?.exp || null,
            message: data?.message,
            data,
        };
    } catch (error) {
        console.error("Fetch current user error:", error);
        return {
            success: false,
            error: error.message || "Failed to load account",
        };
    }
}

export async function logoutUser(token) {
    try {
        const response = await fetch(withApiUrl("/api/users/logout"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            credentials: "include",
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(toErrorMessage(data, "Failed to logout"));
        }

        return {
            success: true,
            message: data?.message || "Logged out successfully",
        };
    } catch (error) {
        console.error("Logout API error:", error);
        return {
            success: false,
            error: error.message || "Failed to logout",
        };
    }
}

async function fetchWithAuthRetry(path, { method = "GET", token, headers = {}, body } = {}) {
    const endpoint = withApiUrl(path);

    const buildHeaders = (accessToken) => ({
        ...headers,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    });

    const execute = (accessToken) =>
        fetch(endpoint, {
            method,
            headers: buildHeaders(accessToken),
            ...(body !== undefined ? { body } : {}),
            credentials: "include",
        });

    let response = await execute(token);
    let resolvedToken = token || null;

    if (response.status !== 401) {
        return { response, token: resolvedToken };
    }

    if (!token) {
        return { response, token: resolvedToken };
    }

    const refreshed = await refreshAccessToken(token);
    if (!refreshed.success) {
        return { response, token: resolvedToken };
    }

    const me = await fetchCurrentUser(refreshed.token || token);
    const retriedToken = me.success ? me.token : refreshed.token || token;

    if (!retriedToken) {
        return { response, token: resolvedToken };
    }

    resolvedToken = retriedToken;
    response = await execute(retriedToken);
    return { response, token: resolvedToken };
}

export async function fetchUserOnboardingGlobals(token) {
    try {
        const { response } = await fetchWithAuthRetry("/api/globals/user-onboarding", {
            method: "GET",
            token,
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.message || "Failed to load onboarding data");
        }

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error("Fetch onboarding globals error:", error);
        return {
            success: false,
            error: error.message || "Failed to load onboarding data",
        };
    }
}

export async function registerUser(email, password) {
    try {
        const response = await fetch(withApiUrl("/api/users/sign-in"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.message || "Registration failed");
        }

        return {
            success: true,
            token: data.token,
            user: data.user,
            exp: data.exp,
            message: data.message,
        };
    } catch (error) {
        console.error("Registration error:", error);
        return {
            success: false,
            error: error.message || "Registration failed",
        };
    }
}


export async function loginUser(email, password) {
    try {
        const response = await fetch(withApiUrl("/api/users/login"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.message || "Login failed");
        }

        return {
            success: true,
            token: data.token,
            user: data.user,
            exp: data.exp,
            message: data.message,
        };
    } catch (error) {
        console.error("Login error:", error);
        return {
            success: false,
            error: error.message || "Login failed",
        };
    }
}

export async function createUserProfile(profileData, token) {
    try {
        const { response } = await fetchWithAuthRetry("/api/user-profile", {
            method: "POST",
            token,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(profileData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.message || "Profile creation failed");
        }

        return {
            success: true,
            profile: data.doc,
            message: data.message,
        };
    } catch (error) {
        console.error("Profile creation error:", error);
        return {
            success: false,
            error: error.message || "Profile creation failed",
        };
    }
}

export async function updateMyProfile(profileDetails, profilePictureFile, token) {
    try {
        if (!token) {
            throw new Error("Missing authentication token");
        }

        const formData = new FormData();
        formData.append("data", JSON.stringify(profileDetails || {}));

        if (profilePictureFile) {
            formData.append("profilePicture", profilePictureFile);
        }

        const { response } = await fetchWithAuthRetry("/api/user-profile/update-me", {
            method: "PATCH",
            token,
            body: formData,
        });

        const rawText = await response.text();
        let data = null;

        try {
            data = rawText ? JSON.parse(rawText) : null;
        } catch {
            data = null;
        }

        if (!response.ok) {
            throw new Error(data?.message || rawText || "Profile update failed");
        }

        return {
            success: true,
            profile: data?.doc || data,
            message: data?.message || "Profile updated successfully",
        };
    } catch (error) {
        console.error("Profile update error:", error);
        return {
            success: false,
            error: error.message || "Profile update failed",
        };
    }
}

export async function fetchMyProfile(token) {
    try {
        const { response } = await fetchWithAuthRetry("/api/user-profile", {
            method: "GET",
            token,
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(toErrorMessage(data, "Failed to load profile"));
        }

        return {
            success: true,
            profile: Array.isArray(data?.docs) ? data.docs[0] || null : data?.doc || null,
            data,
        };
    } catch (error) {
        console.error("Fetch profile error:", error);
        return {
            success: false,
            error: error.message || "Failed to load profile",
        };
    }
}

export async function refillPalmTrees(token) {
    try {
        if (!token) {
            throw new Error("Authentication required");
        }

        const { response } = await fetchWithAuthRetry("/api/user-profile/palm-refill", {
            method: "GET",
            token,
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(toErrorMessage(data, "Failed to refill Palm Trees"));
        }

        return {
            success: true,
            data,
            profile: Array.isArray(data?.docs) ? data.docs[0] || null : data?.doc || null,
            message: data?.message || "Palm Trees refilled successfully",
        };
    } catch (error) {
        console.error("Refill palm trees error:", error);
        return {
            success: false,
            error: error.message || "Failed to refill Palm Trees",
        };
    }
}

export async function fetchLearnerStreak(token) {
    try {
        const { response } = await fetchWithAuthRetry("/api/user-profile/learner-streak", {
            method: "GET",
            token,
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(toErrorMessage(data, "Failed to load learner streak"));
        }

        return {
            success: true,
            streak: data,
            data,
        };
    } catch (error) {
        console.error("Fetch learner streak error:", error);
        return {
            success: false,
            error: error.message || "Failed to load learner streak",
        };
    }
}

export async function fetchLeaderboard(token) {
    try {
        const { response } = await fetchWithAuthRetry("/api/user-profile/get-leaderboard", {
            method: "GET",
            token,
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(toErrorMessage(data, "Failed to load leaderboard"));
        }

        return {
            success: true,
            leaderboard: Array.isArray(data?.data) ? data.data : [],
            data,
        };
    } catch (error) {
        console.error("Fetch leaderboard error:", error);
        return {
            success: false,
            error: error.message || "Failed to load leaderboard",
        };
    }
}

export async function forgotPassword(email) {
    try {
        const response = await fetch(withApiUrl("/api/users/forgot-password"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.message || "Failed to send reset email");
        }

        return {
            success: true,
            message: data.message || "Reset code sent to your email",
        };
    } catch (error) {
        console.error("Forgot password error:", error);
        return {
            success: false,
            error: error.message || "Failed to send reset email",
        };
    }
}

export async function resetPassword(token, password) {
    try {
        const response = await fetch(withApiUrl("/api/users/reset-password"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ token, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.message || "Failed to reset password");
        }

        return {
            success: true,
            message: data.message || "Password reset successfully",
        };
    } catch (error) {
        console.error("Reset password error:", error);
        return {
            success: false,
            error: error.message || "Failed to reset password",
        };
    }
}

// export async function verifyOTP(email, otp) {
//     try {
//         const response = await fetch(withApiUrl("/api/users/verify-otp"), {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             credentials: "include",
//             body: JSON.stringify({ email, otp }),
//         });

//         const data = await response.json();

//         if (!response.ok || data.errors) {
//             throw new Error(data?.errors?.message || data?.message || "Invalid OTP code");
//         }

//         return {
//             success: true,
//             token: data.token || data.access_token,
//             message: data.message || "OTP verified successfully",
//         };
//     } catch (error) {
//         console.error("OTP verification error:", error);
//         return {
//             success: false,
//             error: error.message || "Failed to verify OTP",
//         };
//     }
// }

