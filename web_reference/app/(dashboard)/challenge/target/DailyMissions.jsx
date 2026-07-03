import { useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import MissionSection from "./MissionSection";
import { getSessionToken, isSessionValid } from "@/lib/authUtils";
import { getUserKey } from "@/lib/userKey";
import { useDailyQuestStore } from "@/stores/useDailyQuestStore";

const questSections = [
  {
    type: "daily",
    title: "Daily Quests",
    icon: "📅",
    description: "Reset every day",
  },
];

export default function DailyMissions() {
  const { data: session, status } = useSession();
  const dailyMissions = useDailyQuestStore(
    (store) => store.challengeDailyMissions,
  );
  const isLoading = useDailyQuestStore((store) => store.isLoading);
  const loadError = useDailyQuestStore((store) => store.error);
  const fetchDailyQuests = useDailyQuestStore(
    (store) => store.fetchDailyQuests,
  );
  const clearDailyQuests = useDailyQuestStore((store) => store.clear);

  useEffect(() => {
    if (status === "loading") return;

    if (!isSessionValid(session)) {
      clearDailyQuests();
      return;
    }

    const token = getSessionToken(session);
    if (!token) {
      clearDailyQuests();
      return;
    }

    fetchDailyQuests({ token, userKey: getUserKey(session) });
  }, [clearDailyQuests, fetchDailyQuests, session, status]);

  const sections = useMemo(() => {
    return questSections.map((section) => ({
      ...section,
      missions: dailyMissions.filter((m) => m.type === section.type),
    }));
  }, [dailyMissions]);

  const activeSections = sections.filter((s) => s.missions.length > 0);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center text-muted-foreground">
        Loading daily quests...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center text-destructive">
        {loadError}
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {!activeSections.length && (
        <div className="rounded-2xl border border-border bg-card p-6 text-center text-muted-foreground">
          No daily quests configured yet.
        </div>
      )}
      {activeSections.map((section) => (
        <MissionSection key={section.type} section={section} />
      ))}
    </div>
  );
}
