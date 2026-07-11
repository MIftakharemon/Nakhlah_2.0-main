import { fetchCurrentUser, refreshAccessToken } from "./auth";
import { buildApiUrl } from "@/lib/api-config";

const withApiUrl = (path) => buildApiUrl(path);

async function fetchWithAuthRetry(path, { method = "GET", token, body } = {}) {
    const endpoint = withApiUrl(path);

    const execute = (accessToken) =>
        fetch(endpoint, {
            method,
            headers: {
                "Content-Type": "application/json",
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
            ...(body !== undefined ? { body } : {}),
            credentials: "include",
        });

    let response = await execute(token);

    if (response.status !== 401) {
        return response;
    }

    const refreshed = await refreshAccessToken(token);
    if (!refreshed.success) {
        return response;
    }

    const me = await fetchCurrentUser(refreshed.token || token);
    const retriedToken = me.success ? me.token : refreshed.token || token;

    if (!retriedToken) {
        return response;
    }

    response = await execute(retriedToken);
    return response;
}

export async function fetchJourneyStructure(token) {
    try {
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetchWithAuthRetry("/api/lessons/journey-structure", {
            method: "GET",
            token,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.message || "Failed to load journey structure");
        }

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error("Fetch journey structure error:", error);
        return {
            success: false,
            error: error.message || "Unable to load journey structure",
        };
    }
}

export async function claimGiftBoxTask(taskId, token) {
    try {
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetchWithAuthRetry(`/api/lessons/gift-box/${taskId}`, {
            method: "GET",
            token,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.error || data?.message || "Failed to claim gift box");
        }

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error("Claim gift box error:", error);
        return {
            success: false,
            error: error.message || "Unable to claim gift box",
        };
    }
}

export async function fetchTaskLessons(taskId, token) {
    try {
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetchWithAuthRetry(`/api/lessons/tasks/${taskId}/lessons`, {
            method: "GET",
            token,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.message || "Failed to load task lessons");
        }

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error("Fetch task lessons error:", error);
        return {
            success: false,
            error: error.message || "Unable to load task lessons",
        };
    }
}

export async function fetchTaskExamQuestions(taskId, token) {
    try {
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetchWithAuthRetry(`/api/lessons/tasks/${taskId}/exam-questions`, {
            method: "GET",
            token,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.message || "Failed to load exam questions");
        }

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error("Fetch task exam questions error:", error);
        return {
            success: false,
            error: error.message || "Unable to load exam questions",
        };
    }
}


export async function fetchLessonQuestions(lessonId, token) {
    try {
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetchWithAuthRetry(`/api/lessons/${lessonId}`, {
            method: "GET",
            token,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.message || "Failed to load lesson questions");
        }

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error("Fetch lesson questions error:", error);
        return {
            success: false,
            error: error.message || "Unable to load lesson questions",
        };
    }
}

export async function reportFullMarks(lessonId, token) {
    try {
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetchWithAuthRetry(`/api/lessons/full-marks/${lessonId}`, {
            method: "GET",
            token,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data?.error || data?.message || "Failed to submit full marks");
        }

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error("Report full marks error:", error);
        return {
            success: false,
            error: error.message || "Unable to submit full marks",
        };
    }
}

export async function makeLearnerProgress(lessonId, token) {
    try {
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetchWithAuthRetry(`/api/lessons/make-learner-progress/${lessonId}`, {
            method: "GET",
            token,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data?.message || "Failed to update learner progress");
        }

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error("Make learner progress error:", error);
        return {
            success: false,
            error: error.message || "Unable to update learner progress",
        };
    }
}

export async function reportWrongAnswer(token) {
    try {
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetchWithAuthRetry("/api/lessons/wrong-answer", {
            method: "GET",
            token,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data?.message || "Failed to record wrong answer");
        }

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error("Report wrong answer error:", error);
        return {
            success: false,
            error: error.message || "Unable to record wrong answer",
        };
    }
}

function resolveGamificationCollection(payload, nestedKey) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        return {};
    }

    if (payload[nestedKey] && typeof payload[nestedKey] === "object" && !Array.isArray(payload[nestedKey])) {
        return payload[nestedKey];
    }

    if (payload.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
        if (payload.data[nestedKey] && typeof payload.data[nestedKey] === "object" && !Array.isArray(payload.data[nestedKey])) {
            return payload.data[nestedKey];
        }

        return payload.data;
    }

    return payload;
}

function normalizeBadgesPayload(payload) {
    const badgesObject = resolveGamificationCollection(payload, "badges");

    if (!badgesObject || typeof badgesObject !== "object" || Array.isArray(badgesObject)) {
        return [];
    }

    return Object.entries(badgesObject)
        .map(([key, value]) => ({
            key,
            name: value?.name || key,
            target: Number(value?.target) || 0,
            icon: value?.icon || null,
        }))
        .sort((a, b) => a.target - b.target);
}

function normalizeAchievementsPayload(payload) {
    const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.docs)
                ? payload.docs
                : [];

    return list.map((item) => ({
        id: item?.id,
        title: item?.title || "",
        unitIcon: item?.unitIcon || null,
        unitDescription: item?.unitDescription || null,
        levelOrder: Number(item?.levelOrder) || 0,
        unitOrder: Number(item?.unitOrder) || 0,
        achievementTitle: item?.achievementTitle || "",
        achieved: Boolean(item?.achieved),
    }));
}

function normalizeDailyQuestPayload(payload) {
    const dailyQuestObject = resolveGamificationCollection(payload, "dailyQuest");

    if (!dailyQuestObject || typeof dailyQuestObject !== "object" || Array.isArray(dailyQuestObject)) {
        return [];
    }

    return Object.entries(dailyQuestObject).map(([key, value]) => ({
        key,
        name: value?.name || key,
        required: Number(value?.required) || 0,
        reward: Number(value?.reward) || 0,
        icon: value?.icon || null,
    }));
}

function normalizeUserDailyQuestPayload(payload) {
    const statuses = Array.isArray(payload?.challengeStatuses)
        ? payload.challengeStatuses
        : [];

    return {
        challengeStatuses: statuses
            .map((item) => ({
                challengeId: item?.challengeId || "",
                status: item?.status || "pending",
                details: {
                    required: Number(item?.details?.required) || 0,
                    current: Number(item?.details?.current) || 0,
                    reward: Number(item?.details?.reward) || 0,
                },
            }))
            .filter((item) => Boolean(item.challengeId)),
        injazReward: Number(payload?.injazReward) || 0,
        badges: {
            added: Array.isArray(payload?.badges?.added) ? payload.badges.added : [],
            total: Array.isArray(payload?.badges?.total) ? payload.badges.total : [],
        },
    };
}

export async function fetchGamificationBadges(token) {
    try {
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetchWithAuthRetry("/api/globals/gamification/get-badges", {
            method: "GET",
            token,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data?.message || "Failed to load badges");
        }

        return {
            success: true,
            badges: normalizeBadgesPayload(data),
            data,
        };
    } catch (error) {
        console.error("Fetch gamification badges error:", error);
        return {
            success: false,
            error: error.message || "Unable to load badges",
        };
    }
}

export async function fetchQuestionnaireAchievements(token) {
    try {
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetchWithAuthRetry("/api/lessons/get-achievements", {
            method: "GET",
            token,
        });

        const data = await response.json().catch(() => ([]));

        if (!response.ok) {
            throw new Error(data?.message || "Failed to load achievements");
        }

        return {
            success: true,
            achievements: normalizeAchievementsPayload(data),
            data,
        };
    } catch (error) {
        console.error("Fetch questionnaire achievements error:", error);
        return {
            success: false,
            error: error.message || "Unable to load achievements",
        };
    }
}

export async function fetchGamificationDailyQuest(token) {
    try {
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetchWithAuthRetry("/api/globals/gamification/get-daily-quests", {
            method: "GET",
            token,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data?.message || "Failed to load daily quests");
        }

        return {
            success: true,
            dailyQuest: normalizeDailyQuestPayload(data),
            data,
        };
    } catch (error) {
        console.error("Fetch gamification daily quest error:", error);
        return {
            success: false,
            error: error.message || "Unable to load daily quests",
        };
    }
}

export async function fetchUserDailyQuest(token) {
    try {
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetchWithAuthRetry("/api/user-profile/daily-quest", {
            method: "GET",
            token,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data?.message || "Failed to load user daily quest");
        }

        return {
            success: true,
            dailyQuest: normalizeUserDailyQuestPayload(data),
            data,
        };
    } catch (error) {
        console.error("Fetch user daily quest error:", error);
        return {
            success: false,
            error: error.message || "Unable to load user daily quest",
        };
    }
}

export async function claimUserDailyQuest(token, quest) {
    try {
        if (!token) {
            throw new Error("Authentication required");
        }

        const endpoint = quest
            ? `/api/user-profile/daily-quest?quest=${encodeURIComponent(quest)}`
            : "/api/user-profile/daily-quest";

        const response = await fetchWithAuthRetry(endpoint, {
            method: "GET",
            token,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data?.message || "Failed to claim daily quest");
        }

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error("Claim user daily quest error:", error);
        return {
            success: false,
            error: error.message || "Unable to claim daily quest",
        };
    }
}


export async function submitLessonCompletion(lessonId, score, token) {
    try {
        const response = await fetchWithAuthRetry(`/api/lessons/${lessonId}/complete`, {
            method: "POST",
            token,
            body: JSON.stringify({ score }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.message || "Failed to submit lesson");
        }

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error("Submit lesson error:", error);
        return {
            success: false,
            error: error.message || "Unable to submit lesson",
        };
    }
}
