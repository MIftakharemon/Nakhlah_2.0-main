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
import { createPortal } from "react-dom";
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

const POPOVER_BASE =
  "w-80 rounded-xl bg-white/30 dark:bg-white/10 backdrop-blur-md border border-white/40 dark:border-white/20 shadow-sm p-4 text-slate-900";

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

    if (palmTreesCount >= 5) {
      toast.info("You already have full Palm Trees.");
      return;
    }

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

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpenCard && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-[9998]"
          onClick={handleCloseAll}
        />
      )}

      <div className="flex items-center bg-white/30 dark:bg-white/10 backdrop-blur-md border border-white/40 dark:border-white/20 shadow-sm p-4 rounded-xl justify-around">
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
              <HoverCardContent
                className={`${POPOVER_BASE} space-y-4`}
                align="start"
              >
                <div className="space-y-2">
                  <h4 className="font-medium leading-none text-lg">
                    {streakCount} day{streakCount === 1 ? "" : "s"} streak
                  </h4>
                  <p className="text-sm text-slate-700">{streakMessage}</p>
                </div>
                <StreakCalendar activities={streakActivities} />
              </HoverCardContent>
            </HoverCard>
          </div>

          {/* Mobile Popup for Streak - positioned to the right */}
          {mobileOpenCard === "streak" &&
            typeof document !== "undefined" &&
            createPortal(
              <div
                className={`lg:hidden fixed top-20 left-4 z-[9999] space-y-4 ${POPOVER_BASE}`}
              >
                <div className="space-y-2">
                  <h4 className="font-medium leading-none text-lg">
                    {streakCount} day{streakCount === 1 ? "" : "s"} streak
                  </h4>
                  <p className="text-sm text-slate-700">{streakMessage}</p>
                </div>
                <StreakCalendar activities={streakActivities} />
              </div>,
              document.body,
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
              <HoverCardContent
                className={`${POPOVER_BASE} space-y-4`}
                align="center"
              >
                <div className="flex space-x-4 items-center">
                  <TreasureChest size="xxl" />
                  <div className="space-y-1">
                    <h4 className="font-medium">Dates</h4>
                    <p className="text-sm text-slate-700">
                      You have {datesCount} dates
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      className="h-8 px-3 text-sm"
                      onClick={() => router.push("/store")}
                    >
                      Go To Shop
                    </Button>
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-white/30 bg-white/40 text-sm text-slate-700">
                  <h5 className="font-medium text-slate-900">Daily Reward</h5>
                  <p>Complete a lesson today to earn extra dates!</p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>

          {/* Mobile Popup for Dates - centered */}
          {mobileOpenCard === "dates" &&
            typeof document !== "undefined" &&
            createPortal(
              <div
                className={`lg:hidden fixed top-20 left-1/2 -translate-x-1/2 z-[9999] space-y-4 ${POPOVER_BASE}`}
              >
                <div className="flex space-x-4 items-center">
                  <TreasureChest size="xxl" />
                  <div className="space-y-1">
                    <h4 className="font-medium">Dates</h4>
                    <p className="text-sm text-slate-700">
                      You have {datesCount} dates
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloseAll();
                        router.push("/store");
                      }}
                      className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
                    >
                      Go To Shop
                    </button>
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-white/30 bg-white/40 text-sm text-slate-700">
                  <h5 className="font-medium text-slate-900">Daily Reward</h5>
                  <p>Complete a lesson today to earn extra dates!</p>
                </div>
              </div>,
              document.body,
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
              <HoverCardContent
                className={`${POPOVER_BASE} space-y-4`}
                align="end"
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
                  <p className="text-sm text-slate-700">Keep on learning</p>
                </div>

                <div className="grid gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => router.push("/store")}
                  >
                    UNLIMITED PALM TREES
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    onClick={handleRefillPalmTrees}
                    disabled={isRefillingPalmTrees || palmTreesCount >= 5}
                  >
                    {isRefillingPalmTrees
                      ? "REFILLING..."
                      : "REFILL PALM TREES"}
                  </Button>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>

          {/* Mobile Popup for Palm Trees - positioned to the left */}
          {mobileOpenCard === "palms" &&
            typeof document !== "undefined" &&
            createPortal(
              <div
                className={`lg:hidden fixed top-20 right-4 z-[9999] space-y-4 ${POPOVER_BASE}`}
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
                  <p className="text-sm text-slate-700">Keep on learning</p>
                </div>

                <div className="grid gap-2">
                  <button
                    className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                    onClick={() => {
                      handleCloseAll();
                      router.push("/store");
                    }}
                  >
                    UNLIMITED PALM TREES
                  </button>
                  <button
                    className="w-full py-2 rounded-lg bg-accent text-accent-foreground font-semibold hover:bg-accent/90 disabled:opacity-70"
                    onClick={handleRefillPalmTrees}
                    disabled={isRefillingPalmTrees || palmTreesCount >= 5}
                  >
                    {isRefillingPalmTrees
                      ? "REFILLING..."
                      : "REFILL PALM TREES"}
                  </button>
                </div>
              </div>,
              document.body,
            )}
        </div>
      </div>
    </>
  );
}
