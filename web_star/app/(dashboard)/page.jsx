"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ZigzagPath } from "./components/ZigzagPath";
import { UserStats } from "./components/UserStats";
import { DailyQuests } from "./components/DailyQuests";
import { ProfileSection } from "./components/ProfileSection";
import { LeaderboardCard } from "./components/LeaderboardCard";
import { JourneyErrorFallback } from "./components/JourneyErrorFallback";
import { Trophy } from "@/components/icons/Trophy";
import { useSession } from "next-auth/react";
import { getSessionToken, isSessionValid } from "@/lib/authUtils";
import { getUserKey } from "@/lib/userKey";
import { useJourneyStore } from "@/stores/useJourneyStore";
import { useProfileStore } from "@/stores/useProfileStore";

const mascots = [];
const JOURNEY_REFRESH_FLAG_KEY = "nakhlah:journey-needs-refresh";

const sortByOrder = (items, key) =>
  [...(items || [])].sort((a, b) => (a?.[key] || 0) - (b?.[key] || 0));

const buildJourneyView = (journey, currentProgress) => {
  const sections = [];
  const nodes = [];
  const levelOrder = Number(currentProgress?.levelOrder);
  const unitOrder = Number(currentProgress?.unitOrder);
  const taskOrder = Number(currentProgress?.taskOrder);
  const sortedLevels = sortByOrder(journey?.levels, "levelOrder");
  const hasExplicitProgress =
    Number.isFinite(unitOrder) && Number.isFinite(taskOrder);

  sortedLevels.forEach((level) => {
    const units = sortByOrder(level?.units, "unitOrder");

    units.forEach((unit) => {
      const sectionId = `${level.id}-${unit.id}`;
      const isEarlierLevel =
        hasExplicitProgress && level.levelOrder < levelOrder;
      const isCurrentLevel =
        hasExplicitProgress && level.levelOrder === levelOrder;
      const isEarlierUnitInCurrentLevel =
        hasExplicitProgress && isCurrentLevel && unit.unitOrder < unitOrder;
      const isEarlierUnit = isEarlierLevel || isEarlierUnitInCurrentLevel;
      const isCurrentUnit =
        hasExplicitProgress && isCurrentLevel && unit.unitOrder === unitOrder;

      const unitUnlocked =
        !hasExplicitProgress ||
        isEarlierUnit ||
        isCurrentUnit ||
        unit?.inProgressOrCompleted ||
        level?.inProgressOrCompleted;

      const unitLocked = !unitUnlocked;

      sections.push({
        id: sectionId,
        name: unit.title,
        unitOrder: unit.unitOrder,
        levelOrder: level.levelOrder,
        levelName: level.title,
        colorIndex: level.levelOrder,
      });

      const tasks = sortByOrder(unit?.tasks, "taskOrder");
      const lastActiveIndex = tasks
        .map((task) => Boolean(task?.inProgressOrCompleted))
        .lastIndexOf(true);

      tasks.forEach((task, index) => {
        const hasTaskProgress = lastActiveIndex >= 0;
        const isEarlierTaskInCurrentUnit =
          hasExplicitProgress && isCurrentUnit && task.taskOrder < taskOrder;
        const isCurrentTask =
          hasExplicitProgress && isCurrentUnit && task.taskOrder === taskOrder;

        let isCompleted =
          (hasExplicitProgress &&
            (isEarlierUnit || isEarlierTaskInCurrentUnit)) ||
          (!hasExplicitProgress && hasTaskProgress && index < lastActiveIndex);

        let isCurrent =
          (hasExplicitProgress && isCurrentTask) ||
          (!hasExplicitProgress &&
            hasTaskProgress &&
            index === lastActiveIndex);

        if (
          !hasExplicitProgress &&
          !hasTaskProgress &&
          !unitLocked &&
          index === 0
        ) {
          isCurrent = true;
        }

        if (task?.inProgressOrCompleted && !isCurrent) {
          isCompleted = true;
        }

        const isLocked =
          unitLocked ||
          (!task?.inProgressOrCompleted && !isCurrent && !isCompleted);

        if (unitLocked) {
          isCurrent = false;
          isCompleted = false;
        }

        const isGiftBox = Boolean(task?.giftBox);
        const type = isGiftBox ? "trophy" : "lesson";

        nodes.push({
          id: `${sectionId}-${task.id}`,
          apiId: task.id,
          type,
          title: task.title,
          isCompleted,
          isCurrent,
          isLocked,
          icon: isGiftBox ? <Trophy size="xl" /> : null,
          level: unit.unitOrder,
          sectionId,
        });
      });
    });
  });

  return { sections, nodes };
};

export default function LearnPage() {
  const stickyTopOffset = "top-6";
  const [loadError, setLoadError] = useState("");
  const { data: session, status } = useSession();
  const journeyData = useJourneyStore((state) => state.journeyData);
  const isJourneyLoading = useJourneyStore((state) => state.isLoading);
  const fetchJourney = useJourneyStore((state) => state.fetchJourneyStructure);
  const invalidateJourney = useJourneyStore((state) => state.invalidate);
  const clearJourney = useJourneyStore((state) => state.clear);
  const profileData = useProfileStore((state) => state.profile);
  const isProfileLoading = useProfileStore((state) => state.isLoading);
  const fetchProfile = useProfileStore((state) => state.fetchMyProfile);
  const invalidateProfile = useProfileStore((state) => state.invalidate);
  const clearProfile = useProfileStore((state) => state.clear);

  const loadJourney = useCallback(
    async (forceRefresh = false) => {
      try {
        setLoadError("");

        if (status === "loading") return;
        if (status === "unauthenticated" || !isSessionValid(session)) {
          clearJourney();
          clearProfile();
          throw new Error("Please login to view your journey.");
        }

        const token = getSessionToken(session);
        const userKey = getUserKey(session);
        const [profileResult, journeyResult] = await Promise.all([
          fetchProfile(token, forceRefresh, userKey),
          fetchJourney(token, forceRefresh, userKey),
        ]);

        if (!journeyResult.success) {
          throw new Error(
            journeyResult.error || "Failed to load journey structure",
          );
        }

        if (!profileResult.success && !profileResult.fromCache) {
          throw new Error(profileResult.error || "Failed to load profile");
        }
      } catch (error) {
        setLoadError(error?.message || "Unable to load journey structure");
      }
    },
    [clearJourney, clearProfile, fetchJourney, fetchProfile, session, status],
  );

  useEffect(() => {
    const shouldForceRefresh =
      typeof window !== "undefined" &&
      sessionStorage.getItem(JOURNEY_REFRESH_FLAG_KEY) === "true";

    if (shouldForceRefresh && typeof window !== "undefined") {
      invalidateJourney();
      invalidateProfile();
      sessionStorage.removeItem(JOURNEY_REFRESH_FLAG_KEY);
    }

    loadJourney(shouldForceRefresh);
  }, [loadJourney]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleJourneyUpdated = () => {
      invalidateJourney();
      invalidateProfile();
      loadJourney(true);
    };

    window.addEventListener("nakhlah:journey-updated", handleJourneyUpdated);
    return () => {
      window.removeEventListener(
        "nakhlah:journey-updated",
        handleJourneyUpdated,
      );
    };
  }, [invalidateJourney, invalidateProfile, loadJourney]);

  const { levels, lessons } = useMemo(() => {
    const { sections, nodes } = buildJourneyView(
      journeyData || {},
      profileData?.currentProgress || null,
    );
    return { levels: sections, lessons: nodes };
  }, [journeyData, profileData]);

  const isLoading = isJourneyLoading || isProfileLoading;

  return (
    <div className="bg-background text-foreground">
      {/* Mobile sticky header */}
      <div className="lg:hidden fixed top-0 w-full z-[110] bg-primary shadow-md">
        <UserStats />
      </div>

      <main className="container mx-auto pt-[84px] lg:pt-0 lg:px-4 lg:py-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left side: Scrollable pathway */}
          <div className="lg:w-2/3 lg:h-[calc(100vh_-_64px)] lg:overflow-y-auto no-scrollbar">
            {loadError ? (
              <JourneyErrorFallback
                error={loadError}
                onRetry={() => loadJourney(true)}
              />
            ) : (
              <ZigzagPath
                lessons={lessons}
                levels={levels}
                mascots={mascots}
                isLoading={isLoading}
              />
            )}
          </div>

          {/* Right side: Sticky Sidebar */}
          <div
            className={`hidden lg:block lg:w-1/3 space-y-6 lg:h-[calc(100vh_-_64px)] lg:overflow-y-auto no-scrollbar lg:sticky ${stickyTopOffset} h-fit max-w-sm ml-auto`}
          >
            <UserStats />
            <DailyQuests />
            <LeaderboardCard />
            <ProfileSection />
          </div>
        </div>
      </main>
    </div>
  );
}
