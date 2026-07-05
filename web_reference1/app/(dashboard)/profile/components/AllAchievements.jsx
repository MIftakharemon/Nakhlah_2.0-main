import { Medal } from "@/components/icons/Medal";
import AchievementTick from "@/components/icons/AchievementTick";
import { motion } from "framer-motion";
import { ChevronLeft, Lock } from "lucide-react";
import { useMemo } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const getMediaUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (!API_URL) return url;
  return `${API_URL}${url}`;
};

const levelColorClasses = [
  "bg-violet text-white",
  "bg-palm-green text-white",
  "bg-primary text-primary-foreground",
  "bg-amber-500 text-white",
];

function getLevelChip(levelOrder) {
  if (!Number.isFinite(levelOrder) || levelOrder <= 0) {
    return levelColorClasses[0];
  }
  return levelColorClasses[(levelOrder - 1) % levelColorClasses.length];
}

export default function AllAchievementsPage({
  onBack,
  achievements = [],
  isLoading = false,
}) {
  const groupedAchievements = useMemo(() => {
    const groups = achievements.reduce((acc, item) => {
      const level = Number(item?.levelOrder) || 0;
      if (!acc[level]) {
        acc[level] = [];
      }
      acc[level].push(item);
      return acc;
    }, {});

    return Object.entries(groups)
      .map(([level, items]) => ({
        level: Number(level),
        items: [...items].sort(
          (a, b) => (a.unitOrder || 0) - (b.unitOrder || 0),
        ),
      }))
      .sort((a, b) => a.level - b.level);
  }, [achievements]);

  const unlockedCount = achievements.filter((item) => item.achieved).length;
  const inProgressCount = Math.max(achievements.length - unlockedCount, 0);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-transparent lg:bg-card rounded-none lg:rounded-2xl shadow-none lg:shadow-lg border-0 lg:border lg:border-border p-0 lg:p-6"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center justify-center rounded-full hover:bg-muted h-10 w-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              All Achievements
              <Medal />
            </h1>
            <p className="text-sm text-muted-foreground">
              {unlockedCount} unlocked • {inProgressCount} in progress
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-border p-6 text-center text-muted-foreground">
            Loading achievements...
          </div>
        ) : !groupedAchievements.length ? (
          <div className="rounded-xl border border-border p-6 text-center text-muted-foreground">
            No achievements available yet.
          </div>
        ) : (
          <div className="space-y-8">
            {groupedAchievements.map((group) => (
              <section key={`level-${group.level}`} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">
                    Level {group.level || "-"}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {group.items.filter((item) => item.achieved).length}/
                    {group.items.length} unlocked
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {group.items.map((achievement, index) => {
                    const isUnlocked = Boolean(achievement.achieved);
                    return (
                      <motion.div
                        key={
                          achievement.id ||
                          `${achievement.achievementTitle}-${index}`
                        }
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.04 * index, duration: 0.25 }}
                        className={`relative p-5 rounded-xl border-2 transition-all ${
                          isUnlocked
                            ? "bg-muted/30 border-accent shadow-lg shadow-accent/20"
                            : "bg-muted/10 border-border/50"
                        }`}
                      >
                        {!isUnlocked && (
                          <div className="absolute top-3 right-3">
                            <Lock className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}

                        <div className="flex items-start gap-4 mb-3">
                          <div className="relative">
                            <div
                              className={`w-14 h-14 rounded-xl ${getLevelChip(group.level)} flex items-center justify-center text-sm font-bold ${
                                !isUnlocked ? "opacity-60" : ""
                              }`}
                            >
                              {achievement.unitIcon ? (
                                <img
                                  src={getMediaUrl(
                                    achievement.unitIcon?.url ||
                                      achievement.unitIcon,
                                  )}
                                  alt={achievement.title || "Unit icon"}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              ) : (
                                `U${achievement.unitOrder || "-"}`
                              )}
                            </div>
                            {isUnlocked && (
                              <AchievementTick className="absolute -bottom-1 -right-1" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0 space-y-1">
                            <h4 className="font-bold text-base break-words">
                              {achievement.achievementTitle || "Achievement"}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              Unit {achievement.unitOrder || "-"}:{" "}
                              {achievement.title || "Untitled Unit"}
                            </p>
                            {achievement.unitDescription ? (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {achievement.unitDescription}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <div className="text-xs font-medium text-muted-foreground">
                          Status: {isUnlocked ? "Unlocked" : "Locked"}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
