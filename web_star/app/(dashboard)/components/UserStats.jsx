import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  DatesIcon,
  PalmIcon,
  StreakIcon,
} from "@/components/icons/PublicAssetIcons";
import { TreasureChest } from "@/components/icons/TreasureChest";
import { StreakCalendar } from "@/components/nakhlah/StreakCalendar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getSessionToken, isSessionValid } from "@/lib/authUtils";
import { getUserKey } from "@/lib/userKey";
import { refillPalmTrees } from "@/services/api";
import { useProfileStore } from "@/stores/useProfileStore";
import { useStreakStore } from "@/stores/useStreakStore";
import { toast } from "@/components/nakhlah/Toast";
import {
  buildStreakActivities,
  getCurrentStreakCount,
} from "@/lib/streakUtils";

const JOURNEY_REFRESH_FLAG_KEY = "nakhlah:journey-needs-refresh";

export function UserStats() {
  const router = useRouter();
  const [mobileOpenCard, setMobileOpenCard] = useState(null);
  const [isRefillingPalmTrees, setIsRefillingPalmTrees] = useState(false);
  const hasForcedPalmRefreshRef = useRef(false);
  const { data: session, status } = useSession();
  const profileData = useProfileStore((state) => state.profile);
  const fetchProfile = useProfileStore((state) => state.fetchMyProfile);
  const clearProfile = useProfileStore((state) => state.clear);
  const streakData = useStreakStore((state) => state.streakData);
  const fetchStreak = useStreakStore((state) => state.fetchLearnerStreak);
  const clearStreak = useStreakStore((state) => state.clear);

  const loadStats = useCallback(
    async (forceRefresh = false) => {
      if (status === "loading") return;
      if (status === "unauthenticated" || !isSessionValid(session)) {
        clearProfile();
        clearStreak();
        return;
      }

      const token = getSessionToken(session);
      if (!token) return;

      const userKey = getUserKey(session);
      const [profileResult] = await Promise.all([
        fetchProfile(token, forceRefresh, userKey),
        fetchStreak({ token, userKey, forceRefresh }),
      ]);

      const cachedPalmTrees = Number(
        profileResult?.profile?.gamificationStock?.palm?.palmStock,
      );

      if (
        Number.isFinite(cachedPalmTrees) &&
        cachedPalmTrees === 0 &&
        !hasForcedPalmRefreshRef.current
      ) {
        hasForcedPalmRefreshRef.current = true;
        await fetchProfile(token, true, userKey);
      }
    },
    [clearProfile, clearStreak, fetchProfile, fetchStreak, session, status],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const shouldForceRefresh =
      sessionStorage.getItem(JOURNEY_REFRESH_FLAG_KEY) === "true";

    if (shouldForceRefresh) {
      sessionStorage.removeItem(JOURNEY_REFRESH_FLAG_KEY);
    }

    loadStats(shouldForceRefresh);
  }, [loadStats]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleJourneyUpdated = () => {
      void loadStats(true);
    };

    window.addEventListener("nakhlah:journey-updated", handleJourneyUpdated);
    return () => {
      window.removeEventListener(
        "nakhlah:journey-updated",
        handleJourneyUpdated,
      );
    };
  }, [loadStats]);

  const streakCount = getCurrentStreakCount(streakData);
  const datesCount = profileData?.gamificationStock?.dateStock ?? 0;
  const palmTreesCount = profileData?.gamificationStock?.palm?.palmStock ?? 5;
  const streakActivities = useMemo(
    () =>
      buildStreakActivities(
        Array.isArray(streakData?.dates) ? streakData.dates : [],
      ),
    [streakData],
  );
  const streakMessage =
    streakCount > 0
      ? `You're on a ${streakCount}-day streak.`
      : "Do a lesson today to start a new streak!";
  const palmTreesMessage =
    palmTreesCount >= 5
      ? "You have full Palm Trees"
      : `You have ${palmTreesCount} Palm Trees`;

  const handleMobileClick = (stat) => {
    setMobileOpenCard(mobileOpenCard === stat ? null : stat);
  };

  const handleCloseAll = () => {
    setMobileOpenCard(null);
  };

  const handleRefillPalmTrees = async () => {
    if (isRefillingPalmTrees) return;

    if (!isSessionValid(session)) {
      toast.error("Please login to refill Palm Trees.");
      return;
    }

    const token = getSessionToken(session);
    if (!token) {
      toast.error("Session expired. Please login again.");
      return;
    }

    setIsRefillingPalmTrees(true);
    try {
      const result = await refillPalmTrees(token);

      if (!result.success) {
        toast.error(result.error || "Unable to refill Palm Trees.");
        return;
      }

      await loadStats(true);
      toast.success(result.message || "Palm Trees refilled successfully.");
      handleCloseAll();
    } finally {
      setIsRefillingPalmTrees(false);
    }
  };

  const getMobilePopupPosition = (stat) => {
    switch (stat) {
      case "streak":
        return "left-0 -translate-x-0"; // Streak: align to left
      case "dates":
        return "left-1/2 -translate-x-1/2"; // Dates: center
      case "palms":
        return "right-0 translate-x-0"; // Palm Trees: align to right
      default:
        return "left-1/2 -translate-x-1/2";
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpenCard && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={handleCloseAll}
        />
      )}

      <div className="flex items-center bg-accent lg:bg-card p-4 rounded-none lg:rounded-lg shadow-sm justify-around lg:shadow-sm">
        {/* Streak */}
        <div className="relative">
          <div
            onClick={() => handleMobileClick("streak")}
            className="lg:hidden flex items-center space-x-2 text-lg font-semibold cursor-pointer"
          >
            <StreakIcon className="text-orange-500" />
            <span className="text-white">{streakCount}</span>
          </div>

          <div className="hidden lg:block">
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-lg font-semibold"
                >
                  <StreakIcon className="text-orange-500" />
                  <span className="text-foreground">{streakCount}</span>
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 space-y-4" align="start">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none text-lg">
                    {streakCount} day{streakCount === 1 ? "" : "s"} streak
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {streakMessage}
                  </p>
                </div>
                <StreakCalendar activities={streakActivities} />
              </HoverCardContent>
            </HoverCard>
          </div>

          {/* Mobile Popup for Streak - positioned to the right */}
          {mobileOpenCard === "streak" && (
            <div
              className={`lg:hidden absolute top-full mt-2 w-80 bg-card border rounded-lg shadow-lg z-50 p-4 space-y-4 ${getMobilePopupPosition("streak")}`}
            >
              <div className="space-y-2">
                <h4 className="font-medium leading-none text-lg">
                  {streakCount} day{streakCount === 1 ? "" : "s"} streak
                </h4>
                <p className="text-sm text-muted-foreground">{streakMessage}</p>
              </div>
              <StreakCalendar activities={streakActivities} />
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="relative">
          <div
            onClick={() => handleMobileClick("dates")}
            className="lg:hidden flex items-center space-x-2 text-lg font-semibold cursor-pointer"
          >
            <DatesIcon />
            <span className="text-white">{datesCount}</span>
          </div>

          <div className="hidden lg:block">
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-lg font-semibold"
                >
                  <DatesIcon />
                  <span className="text-foreground">{datesCount}</span>
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 space-y-4" align="center">
                <div className="flex space-x-4 items-center">
                  <TreasureChest size="xxl" />
                  <div className="space-y-1">
                    <h4 className="font-medium">Dates</h4>
                    <p className="text-sm text-muted-foreground">
                      You have {datesCount} dates
                    </p>
                    <Button
                      variant="link"
                      className="p-0 text-blue-500"
                      onClick={() => router.push("/store")}
                    >
                      Go To Shop
                    </Button>
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-lg border border-muted-foreground/50 text-sm">
                  <h5 className="font-medium">Daily Reward</h5>
                  <p>Complete a lesson today to earn extra dates!</p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>

          {/* Mobile Popup for Dates - centered */}
          {mobileOpenCard === "dates" && (
            <div
              className={`lg:hidden absolute top-full mt-2 w-80 bg-card border rounded-lg shadow-lg z-50 p-4 space-y-4 ${getMobilePopupPosition("dates")}`}
            >
              <div className="flex space-x-4 items-center">
                <TreasureChest size="xxl" />
                <div className="space-y-1">
                  <h4 className="font-medium">Dates</h4>
                  <p className="text-sm text-muted-foreground">
                    You have {datesCount} dates
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseAll();
                      router.push("/store");
                    }}
                    className="text-blue-500 hover:underline"
                  >
                    Go To Shop
                  </button>
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg border border-muted-foreground/50 text-sm">
                <h5 className="font-medium">Daily Reward</h5>
                <p>Complete a lesson today to earn extra dates!</p>
              </div>
            </div>
          )}
        </div>

        {/* Palm Trees */}
        <div className="relative">
          <div
            onClick={() => handleMobileClick("palms")}
            className="lg:hidden flex items-center space-x-2 text-lg font-semibold cursor-pointer"
          >
            <PalmIcon className="text-destructive" />
            <span className="text-white">{palmTreesCount}</span>
          </div>

          <div className="hidden lg:block">
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-lg font-semibold"
                >
                  <PalmIcon className="text-destructive" />
                  <span className="text-foreground">{palmTreesCount}</span>
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 space-y-4" align="end">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Palm Trees</h4>
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <PalmIcon
                        key={i}
                        className={
                          i < palmTreesCount ? "opacity-100" : "opacity-30"
                        }
                      />
                    ))}
                  </div>
                  <p className="text-sm font-semibold">{palmTreesMessage}</p>
                  <p className="text-sm text-muted-foreground">
                    Keep on learning
                  </p>
                </div>

                <div className="grid gap-2">
                  <Button
                    variant="outline"
                    className="text-purple-500"
                    onClick={() => router.push("/store")}
                  >
                    UNLIMITED PALM TREES
                  </Button>
                  <Button
                    onClick={handleRefillPalmTrees}
                    disabled={isRefillingPalmTrees}
                  >
                    {isRefillingPalmTrees
                      ? "REFILLING..."
                      : "REFILL PALM TREES (350 dates)"}
                  </Button>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>

          {/* Mobile Popup for Palm Trees - positioned to the left */}
          {mobileOpenCard === "palms" && (
            <div
              className={`lg:hidden absolute top-full mt-2 w-80 bg-card border rounded-lg shadow-lg z-50 p-4 space-y-4 ${getMobilePopupPosition("palms")}`}
            >
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Palm Trees</h4>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <PalmIcon
                      key={i}
                      className={
                        i < palmTreesCount ? "opacity-100" : "opacity-30"
                      }
                    />
                  ))}
                </div>
                <p className="text-sm font-semibold">{palmTreesMessage}</p>
                <p className="text-sm text-muted-foreground">
                  Keep on learning
                </p>
              </div>

              <div className="grid gap-2">
                <button
                  className="w-full py-2 border rounded-md text-purple-500"
                  onClick={() => {
                    handleCloseAll();
                    router.push("/store");
                  }}
                >
                  UNLIMITED PALM TREES
                </button>
                <button
                  className="w-full py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-70"
                  onClick={handleRefillPalmTrees}
                  disabled={isRefillingPalmTrees}
                >
                  {isRefillingPalmTrees
                    ? "REFILLING..."
                    : "REFILL PALM TREES (350 dates)"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
