"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/nakhlah/Mascot";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DatesIcon, InjazStarIcon } from "@/components/icons/PublicAssetIcons";
import { Bullseye } from "@/components/icons/BullsEye";
import { NotoStopwatch } from "@/components/icons/NotoStopwatch";

function formatTime(totalSeconds) {
  const clamped = Math.max(0, Number(totalSeconds) || 0);
  const minutes = Math.floor(clamped / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (clamped % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function calculateAccuracyPercentage({
  totalQuestions,
  correctAnswerAttempts,
}) {
  const normalizedQuestionCount = Number(totalQuestions);
  const normalizedCorrectAttempts = Number(correctAnswerAttempts);

  if (
    !Number.isFinite(normalizedQuestionCount) ||
    normalizedQuestionCount <= 0 ||
    !Number.isFinite(normalizedCorrectAttempts)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      100,
      Math.round((normalizedCorrectAttempts / normalizedQuestionCount) * 100),
    ),
  );
}

export default function LessonCompleted() {
  const router = useRouter();
  const [progressData] = useState(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const raw = sessionStorage.getItem("lessonProgressData");
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    } finally {
      sessionStorage.removeItem("lessonProgressData");
    }
  });

  const datesReceived =
    progressData?.datesReceived ??
    progressData?.dateReceived ??
    progressData?.dateEarned ??
    progressData?.dailyQuest?.datesSpend ??
    progressData?.dateStock ??
    0;
  const injazReceived =
    progressData?.injazReceived ??
    progressData?.InjazReceived ??
    progressData?.injazReward ??
    progressData?.reward?.injazReceived ??
    progressData?.reward?.InjazReceived ??
    progressData?.xpEarned ??
    progressData?.injazStock ??
    0;

  const elapsedSeconds =
    progressData?.__clientStats?.elapsedSeconds ??
    progressData?.elapsedSeconds ??
    0;
  const totalQuestions =
    progressData?.__clientStats?.scoredQuestionsCount ??
    progressData?.__clientStats?.totalQuestions ??
    progressData?.totalQuestions ??
    0;
  const correctAnswerAttempts =
    progressData?.__clientStats?.correctAnswerAttempts ??
    progressData?.correctAnswerAttempts ??
    0;
  const accuracyValue = calculateAccuracyPercentage({
    totalQuestions,
    correctAnswerAttempts,
  });
  const addedBadges = Array.isArray(progressData?.badges?.added)
    ? progressData.badges.added
    : [];
  const streakMessage = progressData?.streak?.message || "";

  const stats = [
    {
      label: "Total Dates",
      value: String(datesReceived),
      icon: <DatesIcon size="sm" />,
      border: "border-sky-400",
      header: "bg-sky-500",
    },
    {
      label: "Time",
      value: formatTime(elapsedSeconds),
      icon: <NotoStopwatch size="sm" />,
      border: "border-emerald-400",
      header: "bg-emerald-500",
    },
    {
      label: "Accuracy",
      value: `${Math.max(0, Math.min(100, Number(accuracyValue) || 0))}%`,
      icon: <Bullseye size="sm" />,
      border: "border-rose-400",
      header: "bg-rose-500",
    },
  ];

  const handleContinue = () => {
    router.push("/lesson/daily-mission");
  };

  return (
    <div className="min-h-screen sm:min-h-[calc(100vh_-_64px)] lg:min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg mx-auto text-center flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-transparent lg:bg-card rounded-none lg:rounded-3xl shadow-none lg:shadow-lg border-0 lg:border lg:border-border p-0 lg:p-8"
        >
          {/* Mascot */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-6"
          >
            <Mascot mood="surprised" size="xxl" className="w-32 h-32 mx-auto" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-4xl font-extrabold text-accent mb-8"
          >
            Lesson completed!
          </motion.h1>

          {/* Dates Earned Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mb-10 px-4 sm:px-0"
          >
            <div className="max-w-sm mx-auto rounded-2xl overflow-hidden border-2 border-amber-400">
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-400 to-amber-500 py-4">
                <p className="text-white text-xl font-bold text-center">
                  Injaz Earned
                </p>
              </div>

              {/* Body */}
              <div className="bg-white py-6">
                <div className="flex items-center justify-center gap-3">
                  <InjazStarIcon size="md" className="text-amber-500" />
                  <span className="text-4xl font-extrabold text-slate-800">
                    {injazReceived}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-8 px-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`rounded-2xl overflow-hidden border-2 ${stat.border} bg-white`}
              >
                {/* Header */}
                <div className={`${stat.header} py-2`}>
                  <p className="text-white font-bold text-base text-center truncate">
                    {stat.label}
                  </p>
                </div>

                {/* Body */}
                <div className="flex items-center justify-center gap-2 py-4">
                  {stat.icon}
                  <span className="text-xl font-extrabold text-slate-900">
                    {stat.value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {addedBadges.length > 0 && (
            <div className="mb-8 px-4">
              <div className="max-w-sm mx-auto rounded-2xl border border-border bg-card p-4 text-left">
                <p className="text-sm font-bold text-foreground">
                  Gifts earned
                </p>
                {addedBadges.length ? (
                  <p className="text-sm text-muted-foreground mt-1">
                    New badges: {addedBadges.join(", ")}
                  </p>
                ) : null}
                {/* {streakMessage ? (
                  <p className="text-sm text-muted-foreground mt-1">
                    {streakMessage}
                  </p>
                ) : null} */}
              </div>
            </div>
          )}

          {/* Desktop Continue Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="hidden sm:block"
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

      {/* Mobile bottom action */}
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
