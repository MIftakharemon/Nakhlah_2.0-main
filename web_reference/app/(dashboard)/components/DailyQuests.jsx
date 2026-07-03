"use client";

import { CheckCircle2, Circle, RefreshCw } from "lucide-react";
import { CardMenuOptions } from "@/components/nakhlah/CardMenuOptions";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
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
  const claimQuestIfAvailable = useDailyQuestStore(
    (store) => store.claimQuestIfAvailable,
  );
  const clearDailyQuests = useDailyQuestStore((store) => store.clear);
  const [claimingQuestKey, setClaimingQuestKey] = useState(null);
  const lastUserKeyRef = useRef(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!isSessionValid(session)) {
      clearDailyQuests();
      lastUserKeyRef.current = null;
      return;
    }

    const token = getSessionToken(session);
    if (!token) {
      clearDailyQuests();
      return;
    }

    const userKey = getUserKey(session);
    if (lastUserKeyRef.current === userKey && dailyQuests.length > 0) return;
    lastUserKeyRef.current = userKey;

    fetchDailyQuests({ token, userKey });
  }, [clearDailyQuests, fetchDailyQuests, session, status]);

  const handleClaimQuest = async (quest) => {
    if (!quest) return;
    if (isQuestCompleted(quest)) return;

    const token = getSessionToken(session);
    if (!token) return;

    setClaimingQuestKey(quest.key);
    try {
      await claimQuestIfAvailable({
        token,
        userKey: getUserKey(session),
        questKey: quest.key,
      });
    } finally {
      await fetchDailyQuests({
        token,
        userKey: getUserKey(session),
        forceRefresh: true,
      });
      setClaimingQuestKey(null);
    }
  };

  const menuOptions = [
    {
      label: "View Challenges",
      onClick: () => router.push("/challenge?tab=target"),
    },
  ];

  if (isLoading) {
    return (
      <div className="p-4 rounded-xl bg-white/30 dark:bg-white/10 backdrop-blur-md border border-white/40 dark:border-white/20 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Daily Quests</h2>
            <p className="text-xs text-slate-700">
              Complete tasks to earn rewards
            </p>
          </div>
          <CardMenuOptions options={menuOptions} />
        </div>
        <div className="text-xs text-slate-600">Loading quests...</div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-white/30 dark:bg-white/10 backdrop-blur-md border border-white/40 dark:border-white/20 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Daily Quests</h2>
          <p className="text-xs text-slate-700">
            Complete tasks to earn rewards
          </p>
        </div>
        <CardMenuOptions options={menuOptions} />
      </div>
      <AnimatePresence initial={false}>
        <ul className="space-y-2">
          {dailyQuests.length === 0 ? (
            <li className="text-xs text-slate-700">No daily quests yet</li>
          ) : (
            dailyQuests.map((quest, index) => (
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ delay: index * 0.05 }}
                key={quest.key}
                className="flex items-center justify-between bg-white/40 rounded-lg p-2 border border-white/30"
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
                  <span className="text-slate-800">{quest.label}</span>
                </div>
                {isQuestCompleted(quest) ? (
                  <CheckCircle2 className="text-emerald-500" />
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClaimQuest(quest);
                    }}
                    disabled={claimingQuestKey === quest.key}
                    className="flex items-center justify-center text-slate-500 hover:text-primary disabled:opacity-50"
                    aria-label="Check progress"
                    title="Check progress"
                  >
                    {claimingQuestKey === quest.key ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                )}
              </motion.li>
            ))
          )}
        </ul>
      </AnimatePresence>
    </div>
  );
}
