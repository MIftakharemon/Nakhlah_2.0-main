"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  DatesIcon,
  InjazStarIcon,
  StreakIcon,
} from "@/components/icons/PublicAssetIcons";
import { Bullseye } from "@/components/icons/BullsEye";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchUserDailyQuest } from "@/services/api";
import { getSessionToken, isSessionValid } from "@/lib/authUtils";

const missionIcons = [InjazStarIcon, DatesIcon, Bullseye, StreakIcon];

const toTitleCase = (value = "") =>
  value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (char) => char.toUpperCase());

export default function DailyMissionUpdate() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [dailyQuestState, setDailyQuestState] = useState([]);

  useEffect(() => {
    const loadDailyMission = async () => {
      if (status === "loading") return;

      if (!isSessionValid(session)) {
        setLoadError("Please login to view daily missions.");
        setIsLoading(false);
        return;
      }

      const token = getSessionToken(session);
      if (!token) {
        setLoadError("No authentication token available.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError("");

        const dailyQuestResult = await fetchUserDailyQuest(token);

        if (!dailyQuestResult.success) {
          throw new Error(
            dailyQuestResult.error || "Failed to load daily mission progress.",
          );
        }

        const challengeStatuses = Array.isArray(
          dailyQuestResult.dailyQuest?.challengeStatuses,
        )
          ? dailyQuestResult.dailyQuest.challengeStatuses
          : [];

        const merged = challengeStatuses.map((quest, index) => {
          const challengeId = quest?.challengeId || `daily-${index + 1}`;
          const current = Number(quest?.details?.current) || 0;
          const target = Number(quest?.details?.required) || 0;
          const completed = quest?.status === "completed";
          const IconComponent = missionIcons[index % missionIcons.length];

          return {
            key: challengeId,
            label: toTitleCase(challengeId),
            current,
            target,
            completed,
            IconComponent,
          };
        });

        setDailyQuestState(merged);
      } catch (error) {
        setLoadError(
          error?.message || "Unable to load daily mission progress.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadDailyMission();
  }, [session, status]);

  const missions = useMemo(() => dailyQuestState, [dailyQuestState]);

  const handleContinue = () => {
    router.push("/lesson/streak-update");
  };

  return (
    <div className="min-h-screen sm:min-h-[calc(100vh_-_64px)] lg:min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:overflow-hidden">
      <div className="w-full max-w-lg mx-auto text-center flex-1 min-h-0 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-transparent lg:bg-card rounded-none lg:rounded-3xl shadow-none lg:shadow-lg border-0 lg:border lg:border-border p-0 lg:p-8 flex flex-col min-h-0 sm:max-h-[calc(100vh-2rem)] lg:max-h-[calc(100vh-4rem)]"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8 shrink-0"
          >
            <h1 className="text-3xl font-extrabold text-accent mb-2">
              Daily mission updated!
            </h1>
          </motion.div>

          <div className="space-y-4 mb-8 min-h-0 flex-1 overflow-y-auto pr-1">
            {isLoading ? (
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={`mission-skeleton-${i}`}
                    className="border border-accent/20 rounded-2xl p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-muted animate-pulse flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : null}

            {!isLoading && loadError ? (
              <div className="rounded-xl border border-destructive/30 p-4 text-sm text-destructive">
                {loadError}
              </div>
            ) : null}

            {!isLoading && !loadError && !missions.length ? (
              <div className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
                No daily mission available for now.
              </div>
            ) : null}

            {missions.map((mission, index) => {
              const IconComponent = mission.IconComponent;

              return (
                <motion.div
                  key={mission.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-transparent border border-accent/20 rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                        <IconComponent size="md" className="text-accent" />
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`font-bold text-left ${
                            mission.completed
                              ? "line-through text-muted-foreground"
                              : "text-foreground"
                          }`}
                        >
                          {mission.label}
                        </p>
                        <p className="text-xs text-left text-muted-foreground mt-1">
                          {mission.completed ? "Completed" : "In progress"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {mission.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-accent" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/40" />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="hidden sm:block shrink-0"
          >
            <Button
              onClick={handleContinue}
              className="w-full h-14 bg-accent hover:opacity-90 text-accent-foreground font-bold text-lg rounded-xl"
            >
              CONTINUE
            </Button>
          </motion.div>
        </motion.div>
      </div>

      <div className="w-full max-w-lg mx-auto sm:hidden bg-background border-t border-border p-4">
        <Button
          onClick={handleContinue}
          className="w-full h-12 bg-accent hover:opacity-90 text-accent-foreground font-bold text-lg rounded-xl"
        >
          CONTINUE
        </Button>
      </div>
    </div>
  );
}
