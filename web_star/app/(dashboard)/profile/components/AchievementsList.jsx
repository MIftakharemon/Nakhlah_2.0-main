"use client";
import { Trophy } from "@/components/icons/Trophy";
import AchievementTick from "@/components/icons/AchievementTick";
import { motion } from "framer-motion";
import { ChevronRight, Lock } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const getMediaUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (!API_URL) return url;
  return `${API_URL}${url}`;
};

const resolveCardColor = (isAchieved) =>
  isAchieved ? "text-accent-foreground" : "text-muted-foreground";

export default function AchievementsList({
  onViewAll,
  achievements = [],
  isLoading = false,
}) {
  const compactAchievements = achievements.slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="space-y-4 bg-transparent lg:bg-card rounded-none lg:rounded-2xl shadow-none lg:shadow-lg border-0 lg:border lg:border-border p-0 lg:p-6"
    >
      <div className="flex items-center justify-between lg:p-6 mb-4 lg:mb-6">
        <h3 className="flex items-center gap-2 text-xl font-semibold">
          Achievements
          <Trophy size="sm" />
        </h3>
        <button
          onClick={onViewAll}
          className="text-sm text-accent hover:text-accent/80 transition-colors flex items-center gap-1 font-medium"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {isLoading && (
          <div className="p-4 bg-muted/30 rounded-xl border border-border/30 text-sm text-muted-foreground">
            Loading achievements...
          </div>
        )}

        {!isLoading && !compactAchievements.length && (
          <div className="p-4 bg-muted/30 rounded-xl border border-border/30 text-sm text-muted-foreground">
            No achievements available yet.
          </div>
        )}

        {!isLoading &&
          compactAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.id || `${achievement.achievementTitle}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index + 0.4, duration: 0.5 }}
              className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border border-border/30"
            >
              <div className="relative">
                <div
                  className={`w-12 h-12 rounded-xl ${resolveCardColor(achievement.achieved)} flex items-center justify-center text-sm font-bold`}
                >
                  {achievement.unitIcon ? (
                    <img
                      src={getMediaUrl(
                        achievement.unitIcon?.url || achievement.unitIcon,
                      )}
                      alt={achievement.title || "Unit icon"}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    `U${achievement.unitOrder || "-"}`
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm">
                  {achievement.achievementTitle || "Achievement"}
                </h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Level {achievement.levelOrder || "-"}, Unit{" "}
                  {achievement.unitOrder || "-"}:{" "}
                  {achievement.title || "Untitled Unit"}
                </p>
              </div>

              {achievement.achieved ? (
                <AchievementTick />
              ) : (
                <Lock className="w-5 h-5 text-muted-foreground" />
              )}
            </motion.div>
          ))}
      </div>
    </motion.div>
  );
}
