const pad = (value) => String(value).padStart(2, "0");

export const formatLocalDateKey = (date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    return `${year}-${month}-${day}`;
};

export const normalizeStreakDateKey = (value) => {
    if (!value) return "";

    if (typeof value === "string") {
        const trimmed = value.trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
            return trimmed;
        }

        const parsed = new Date(trimmed);
        return formatLocalDateKey(parsed);
    }

    if (value instanceof Date) {
        return formatLocalDateKey(value);
    }

    return "";
};

export const buildStreakDateStatusMap = (dates = []) => {
    const map = new Map();

    dates.forEach((entry) => {
        if (!entry?.date) return;

        const key = normalizeStreakDateKey(entry.date);
        if (!key) return;

        const status = (entry?.status || "").toLowerCase();
        if (!status) return;

        const currentStatus = map.get(key);
        if (currentStatus === "missed") return;

        if (status === "missed" || !currentStatus) {
            map.set(key, status);
        }
    });

    return map;
};

export const buildStreakActivities = (dates = []) => {
    const statusMap = buildStreakDateStatusMap(dates);
    const activities = {};

    statusMap.forEach((status, key) => {
        if (status === "completed") {
            activities[key] = true;
        }
    });

    return activities;
};

export const getCurrentStreakCount = (streakData) => {
    const dates = Array.isArray(streakData?.dates) ? streakData.dates : [];
    const statusMap = buildStreakDateStatusMap(dates);

    if (statusMap.size > 0) {
        let streak = 0;
        const today = new Date();

        for (let offset = 0; offset < 366; offset += 1) {
            const day = new Date(today);
            day.setDate(today.getDate() - offset);
            const key = formatLocalDateKey(day);
            const status = statusMap.get(key);

            if (status === "completed") {
                streak += 1;
                continue;
            }

            if (streak === 0 && offset === 0 && !status) {
                continue;
            }

            break;
        }

        return streak;
    }

    return Number(streakData?.currentStreak ?? streakData?.current_streak) || 0;
};

export const getMissedDaysCount = (streakData) => {
    const dates = Array.isArray(streakData?.dates) ? streakData.dates : [];
    const statusMap = buildStreakDateStatusMap(dates);
    let missed = 0;

    statusMap.forEach((status) => {
        if (status === "missed") {
            missed += 1;
        }
    });

    return missed;
};

export const getRecentStreakDays = (streakData, days = 7) => {
    const statusMap = buildStreakDateStatusMap(
        Array.isArray(streakData?.dates) ? streakData.dates : [],
    );
    const today = new Date();
    const output = [];

    for (let offset = days - 1; offset >= 0; offset -= 1) {
        const day = new Date(today);
        day.setDate(today.getDate() - offset);

        const key = formatLocalDateKey(day);
        output.push({
            key,
            label: day.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2),
            completed: statusMap.get(key) === "completed",
            missed: statusMap.get(key) === "missed",
        });
    }

    return output;
};
