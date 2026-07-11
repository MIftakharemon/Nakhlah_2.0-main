import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Trophy } from "@/components/icons/Trophy";
import { useSession } from "next-auth/react";
import { getSessionToken, isSessionValid } from "@/lib/authUtils";
import { getUserKey } from "@/lib/userKey";
import { useLeaderboardStore } from "@/stores/useLeaderboardStore";

export default function Leaderboard({ onViewProfile }) {
  const { data: session, status } = useSession();
  const leaderboardData = useLeaderboardStore((state) => state.leaderboard);
  const topThree = useLeaderboardStore((state) => state.topThree);
  const isLoading = useLeaderboardStore((state) => state.isLoading);
  const fetchLeaderboard = useLeaderboardStore(
    (state) => state.fetchLeaderboard,
  );
  const clearLeaderboard = useLeaderboardStore((state) => state.clear);

  useEffect(() => {
    const loadLeaderboard = async () => {
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

    loadLeaderboard();
  }, [clearLeaderboard, fetchLeaderboard, session, status]);

  return (
    <div className="min-h-screen">
      <div className=" container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              Leaderboard
            </h1>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
              <Trophy />
            </div>
          </div>
          <button className="w-10 h-10 rounded-xl hover:bg-muted flex items-center justify-center transition-colors">
            <Search className="w-5 h-5 text-muted-foreground" />
          </button>
        </motion.div>

        {/* Top 3 Podium */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative mb-8 flex items-end justify-center gap-4 lg:gap-8 mt-8"
        >
          {/* Second Place */}
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <div
                className={`w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br ${topThree[1]?.color} flex items-center justify-center text-white font-bold text-xl lg:text-2xl shadow-xl border-4 border-background`}
              >
                {topThree[1]?.avatarUrl ? (
                  <img
                    src={topThree[1].avatarUrl}
                    alt={topThree[1]?.name || "Rank 2"}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  topThree[1]?.avatar
                )}
              </div>
            </motion.div>
            <div className="mt-2 bg-card rounded-2xl px-4 py-3 text-center shadow-lg border border-border min-w-[120px]">
              <p className="font-semibold text-foreground text-sm mb-1">
                {topThree[1]?.name}
              </p>
              <p className="text-accent font-bold text-lg">
                {topThree[1]?.injaz} Injaz
              </p>
            </div>
            <div className="w-24 lg:w-32 h-24 bg-gradient-to-b from-gray-300 to-gray-400 rounded-t-2xl mt-2 flex items-center justify-center">
              <span className="text-4xl font-bold text-white/80">2</span>
            </div>
          </div>

          {/* First Place */}
          <div className="flex flex-col items-center -mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <div
                className={`w-24 h-24 lg:w-28 lg:h-28 rounded-full bg-gradient-to-br ${topThree[0]?.color} flex items-center justify-center text-white font-bold text-2xl lg:text-3xl shadow-2xl border-4 border-background`}
              >
                {topThree[0]?.avatarUrl ? (
                  <img
                    src={topThree[0].avatarUrl}
                    alt={topThree[0]?.name || "Rank 1"}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  topThree[0]?.avatar
                )}
              </div>
            </motion.div>
            <div className="mt-2 bg-card rounded-2xl px-6 py-4 text-center shadow-xl border-2 border-primary/20 min-w-[140px]">
              <p className="font-bold text-foreground mb-1">
                {topThree[0]?.name}
              </p>
              <p className="text-accent font-bold text-2xl">
                {topThree[0]?.injaz} Injaz
              </p>
            </div>
            <div className="w-28 lg:w-36 h-32 bg-gradient-to-b from-violet-400 to-violet-500 rounded-t-2xl mt-2 flex items-center justify-center shadow-lg">
              <span className="text-5xl font-bold text-white/90">1</span>
            </div>
          </div>

          {/* Third Place */}
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative"
            >
              <div
                className={`w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br ${topThree[2]?.color} flex items-center justify-center text-white font-bold text-xl lg:text-2xl shadow-xl border-4 border-background`}
              >
                {topThree[2]?.avatarUrl ? (
                  <img
                    src={topThree[2].avatarUrl}
                    alt={topThree[2]?.name || "Rank 3"}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  topThree[2]?.avatar
                )}
              </div>
            </motion.div>
            <div className="mt-2 bg-card rounded-2xl px-4 py-3 text-center shadow-lg border border-border min-w-[120px]">
              <p className="font-semibold text-foreground text-sm mb-1">
                {topThree[2]?.name}
              </p>
              <p className="text-accent font-bold text-lg">
                {topThree[2]?.injaz} Injaz
              </p>
            </div>
            <div className="w-24 lg:w-32 h-20 bg-gradient-to-b from-amber-600 to-amber-700 rounded-t-2xl mt-2 flex items-center justify-center">
              <span className="text-4xl font-bold text-white/80">3</span>
            </div>
          </div>
        </motion.div>

        {/* Rest of Leaderboard List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:space-y-3"
        >
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={`leader-skeleton-${i}`}
                  className="h-20 rounded-2xl bg-card border border-border animate-pulse"
                />
              ))}
            </div>
          ) : leaderboardData.length === 0 ? (
            <div className="w-full rounded-2xl border border-border bg-card p-5 text-center text-muted-foreground">
              No leaderboard data available.
            </div>
          ) : (
            leaderboardData.slice(3).map((user, index) => (
              <motion.button
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                onClick={() => onViewProfile(user)}
                className={`w-full bg-transparent lg:bg-card flex items-center gap-4 px-2 py-4 lg:p-4 rounded-2xl transition-all hover:scale-[1.02] ${
                  user.isCurrentUser
                    ? "bg-muted/30 border-2 border-primary lg:shadow-lg"
                    : "border border-border shadow-md"
                }`}
              >
                <div className="w-8 text-center">
                  <span className="font-bold text-muted-foreground text-lg">
                    {user.rank}
                  </span>
                </div>
                <div
                  className={`w-14 h-14 rounded-full bg-gradient-to-br ${user.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    user.avatar
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p
                    className={`font-bold ${
                      user.isCurrentUser ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {user.name}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {user.injaz} Injaz
                  </p>
                </div>
              </motion.button>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}
