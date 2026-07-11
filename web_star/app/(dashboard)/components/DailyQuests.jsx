"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { CardMenuOptions } from "@/components/nakhlah/CardMenuOptions";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { getSessionToken, isSessionValid } from "@/lib/authUtils";
import { getUserKey } from "@/lib/userKey";
import { useDailyQuestStore } from "@/stores/useDailyQuestStore";

const isQuestCompleted = (quest) => {
  const completedByStatus = (quest?.status || "").toLowerCase() === "completed";
  const completedByProgress =
    Number(quest?.target) > 0 &&
    Number(quest?.current) >= Number(quest?.target);
  return completedByStatus || completedByProgress;
};

export function DailyQuests() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const dailyQuests = useDailyQuestStore((store) => store.homeDailyQuests);
  const isLoading = useDailyQuestStore((store) => store.isLoading);
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

  const menuOptions = [
    {
      label: "View Challenges",
      onClick: () => router.push("/challenge?tab=target"),
    },
  ];

  if (isLoading) {
    return (
      <div className="bg-card p-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Daily Quests</h2>
            <p className="text-xs text-muted-foreground">
              Complete tasks to earn rewards
            </p>
          </div>
          <CardMenuOptions options={menuOptions} />
        </div>
        <div className="text-xs text-muted-foreground">Loading quests...</div>
      </div>
    );
  }

  return (
    <div className="bg-card p-4 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Daily Quests</h2>
          <p className="text-xs text-muted-foreground">
            Complete tasks to earn rewards
          </p>
        </div>
        <CardMenuOptions options={menuOptions} />
      </div>
      <ul className="space-y-2">
        {dailyQuests.length === 0 ? (
          <li className="text-xs text-muted-foreground">No daily quests yet</li>
        ) : (
          dailyQuests.map((quest, index) => (
            <motion.li
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              key={quest.key}
              className="flex items-center justify-between bg-muted/20 rounded-md p-2"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 flex items-center justify-center">
                  {quest.iconUrl && (
                    <img
                      src={quest.iconUrl}
                      alt={quest.label}
                      className="w-6 h-6 object-contain"
                    />
                  )}
                </div>
                <span>{quest.label}</span>
              </div>
              {isQuestCompleted(quest) ? (
                <CheckCircle2 className="text-accent" />
              ) : (
                <Circle className="text-muted-foreground" />
              )}
            </motion.li>
          ))
        )}
      </ul>
    </div>
  );
}
