"use client";

import { Trophy } from "@/components/icons/Trophy";
import { CardMenuOptions } from "@/components/nakhlah/CardMenuOptions";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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

  useEffect(() => {
    const loadLeaders = async () => {
      if (status === "loading") return;
      if (!isSessionValid(session)) {
        clearLeaderboard();
        return;
      }

      const token = getSessionToken(session);
      await fetchLeaderboard({
        token,
        userKey: getUserKey(session),
        sessionUserId: session?.user?.id || "",
      });
    };

    loadLeaders();
  }, [clearLeaderboard, fetchLeaderboard, session, status]);

  const menuOptions = [
    {
      label: "See Full Leaderboard",
      onClick: () => router.push("/leaderboard"),
    },
  ];

  return (
    <div className="bg-card p-4 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Trophy size="md" className="text-accent" />
            Top Leaders
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Weekly rankings</p>
        </div>
        <CardMenuOptions options={menuOptions} />
      </div>

      <ul className="space-y-2">
        {topLeaders.map((leader, index) => (
          <motion.li
            key={leader.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between bg-muted/20 rounded-md p-2"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-muted flex items-center justify-center text-xs font-semibold">
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
                <p className="text-sm font-medium">{leader.name}</p>
                <p className="text-xs text-muted-foreground">
                  {leader.injaz} Injaz
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-accent">
              #{leader.rank}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
