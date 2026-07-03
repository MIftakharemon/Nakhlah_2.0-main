"use client";

import { Trophy } from "@/components/icons/Trophy";
import { CardMenuOptions } from "@/components/nakhlah/CardMenuOptions";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { getSessionToken, isSessionValid } from "@/lib/authUtils";
import { getUserKey } from "@/lib/userKey";
import { useLeaderboardStore } from "@/stores/useLeaderboardStore";

const FALLBACK_LEADERS = [
  {
    rank: 1,
    id: "fallback-1",
    name: "Maryland Winkles",
    injaz: 948,
    avatar: "MW",
    avatarUrl: "",
  },
  {
    rank: 2,
    id: "fallback-2",
    name: "Andrew Ainsley",
    injaz: 872,
    avatar: "AA",
    avatarUrl: "",
  },
  {
    rank: 3,
    id: "fallback-3",
    name: "Charlotte Hanlin",
    injaz: 769,
    avatar: "CH",
    avatarUrl: "",
  },
];

export function LeaderboardCard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const topThree = useLeaderboardStore((state) => state.topThree);
  const fetchLeaderboard = useLeaderboardStore(
    (state) => state.fetchLeaderboard,
  );
  const clearLeaderboard = useLeaderboardStore((state) => state.clear);
  const topLeaders = topThree.length ? topThree : FALLBACK_LEADERS;
  const lastUserKeyRef = useRef(null);

  useEffect(() => {
    const loadLeaders = async () => {
      if (status === "loading") return;
      if (!isSessionValid(session)) {
        clearLeaderboard();
        lastUserKeyRef.current = null;
        return;
      }

      const token = getSessionToken(session);
      if (!token) return;

      const userKey = getUserKey(session);
      if (lastUserKeyRef.current === userKey && topThree.length > 0) return;
      lastUserKeyRef.current = userKey;

      await fetchLeaderboard({
        token,
        userKey,
        sessionUserId: session?.user?.id || "",
      });
    };

    loadLeaders();
  }, [clearLeaderboard, fetchLeaderboard, session, status, topThree.length]);

  const menuOptions = [
    {
      label: "See Full Leaderboard",
      onClick: () => router.push("/leaderboard"),
    },
  ];

  return (
    <div className="p-4 rounded-xl bg-white/30 dark:bg-white/10 backdrop-blur-md border border-white/40 dark:border-white/20 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900">
            <Trophy size="md" className="text-primary" />
            Top Leaders
          </h2>
          <p className="text-xs text-slate-700 mt-1">Weekly rankings</p>
        </div>
        <CardMenuOptions options={menuOptions} />
      </div>

      <AnimatePresence initial={false}>
        <ul className="space-y-2">
          {topLeaders.map((leader, index) => (
            <motion.li
              key={leader.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between bg-white/40 rounded-lg p-2 border border-white/30"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-800">
                  {leader.avatarUrl ? (
                    <img
                      src={leader.avatarUrl}
                      alt={leader.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    leader.avatar
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {leader.name}
                  </p>
                  <p className="text-xs text-slate-600">{leader.injaz} Injaz</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-900">
                #{leader.rank}
              </span>
            </motion.li>
          ))}
        </ul>
      </AnimatePresence>
    </div>
  );
}
