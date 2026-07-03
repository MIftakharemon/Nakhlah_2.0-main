"use client";
import { BarChart } from "@/components/icons/BarChart";
import { Bullseye } from "@/components/icons/BullsEye";
import { Calendar } from "@/components/icons/Calendar";
import {
  DatesIcon,
  InjazStarIcon,
  StreakIcon,
} from "@/components/icons/PublicAssetIcons";
import { Medal } from "@/components/icons/Medal";
import { motion } from "framer-motion";
import { getProfileBadgeCount } from "@/lib/gamification";

export default function StatisticsGrid({ profileData, achievementsData = [] }) {
  const totalDates = profileData?.gamificationStock?.dateStock ?? 0;
  const totalXp = profileData?.gamificationStock?.injazStock ?? 0;
  const tasksCompleted =
    profileData?.dailyChallengeActivity?.tasksCompleted ?? 0;
  const lessonsCompleted =
    profileData?.dailyChallengeActivity?.lessonsCompleted ?? 0;
  const achievementsUnlocked = Array.isArray(achievementsData)
    ? achievementsData.filter((achievement) => achievement?.achieved).length
    : 0;
  const badgesEarned = getProfileBadgeCount(profileData);

  const userStats = [
    {
      icon: StreakIcon,
      value: `${tasksCompleted}`,
      label: "Tasks Completed Today",
      color: "text-primary",
      bg: "bg-muted/30",
    },
    {
      icon: Calendar,
      value: `${lessonsCompleted}`,
      label: "Lessons Completed Today",
      color: "text-primary",
      bg: "bg-muted/30",
    },
    {
      icon: DatesIcon,
      value: totalDates.toLocaleString(),
      label: "Total Dates",
      color: "text-primary",
      bg: "bg-muted/30",
    },
    {
      icon: InjazStarIcon,
      value: totalXp.toLocaleString(),
      label: "Total Injaz Gained",
      color: "text-primary",
      bg: "bg-muted/30",
    },
    {
      icon: Bullseye,
      value: `${achievementsUnlocked}`,
      label: "Achievements Unlocked",
      color: "text-primary",
      bg: "bg-muted/30",
    },
    {
      icon: Medal,
      value: `${badgesEarned}`,
      label: "Badges Earned",
      color: "text-primary",
      bg: "bg-muted/30",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className="bg-transparent lg:bg-card rounded-none lg:rounded-2xl shadow-none lg:shadow-lg border-0 lg:border lg:border-border p-0 lg:p-6"
    >
      <div className="lg:p-6 mb-4 lg:mb-6">
        <h3 className="flex items-center gap-2 text-xl font-semibold">
          Your Statistics
          <BarChart size="sm" className="text-foreground" />
        </h3>
      </div>
      <div className="">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {userStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
                className={`${stat.bg} rounded-xl lg:rounded-2xl p-4 lg:p-6 hover:shadow-sm lg:hover:shadow-md transition-all cursor-pointer border border-border/30`}
              >
                <IconComponent
                  size="sm"
                  className={`${stat.color} mb-2 lg:mb-3`}
                />
                <div className="text-xl lg:text-2xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-xs lg:text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
