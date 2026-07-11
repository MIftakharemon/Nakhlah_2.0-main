"use client";

import { BookOpen } from "@/components/icons/BookOpen";
import { Lock } from "@/components/icons/Lock";
import { Trophy } from "@/components/icons/Trophy";
import { TreasureChest } from "@/components/icons/TreasureChest";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  fetchTaskLessons,
  claimGiftBoxTask,
  fetchMyProfile,
  fetchJourneyStructure,
  makeLearnerProgress,
} from "@/services/api";
import { useSession } from "next-auth/react";
import { getSessionToken, isSessionValid } from "@/lib/authUtils";
import { hasOpenedGiftBox } from "@/lib/gamification";
import { useDailyQuestStore } from "@/stores/useDailyQuestStore";
import { useLessonStore } from "@/stores/useLessonStore";

const sortByOrder = (items, key) =>
  [...(items || [])].sort((a, b) => (a?.[key] || 0) - (b?.[key] || 0));

const getOrderedJourneyTasks = (journeyData) => {
  const levels = sortByOrder(journeyData?.levels, "levelOrder");

  return levels.flatMap((level) => {
    const units = sortByOrder(level?.units, "unitOrder");

    return units.flatMap((unit) => sortByOrder(unit?.tasks, "taskOrder"));
  });
};

export function LessonSelectionPopup({
  taskId,
  isCompleted,
  isCurrent,
  isLocked,
  isTaskGiftBox,
  onClose,
  open,
}) {
  const router = useRouter();
  const setSelectedLesson = useLessonStore((state) => state.setSelectedLesson);
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [isGiftAlreadyOpened, setIsGiftAlreadyOpened] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [giftRewards, setGiftRewards] = useState(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (!open || !taskId) return;

    const loadLessons = async () => {
      try {
        setIsLoading(true);
        setLoadError("");
        setIsGiftAlreadyOpened(false);
        setHasClaimed(false);
        setGiftRewards(null);

        if (status === "loading") return;
        if (status === "unauthenticated" || !isSessionValid(session)) {
          throw new Error("Please login to view lessons.");
        }

        const token = getSessionToken(session);

        const [result, profileResult] = await Promise.all([
          fetchTaskLessons(taskId, token),
          isTaskGiftBox ? fetchMyProfile(token) : Promise.resolve(null),
        ]);
        if (!result.success) {
          throw new Error(result.error || "Failed to load lessons");
        }

        const docs = Array.isArray(result.data?.docs) ? result.data.docs : [];
        const sortedLessons = sortByOrder(docs, "lessonOrder");

        const normalized = sortedLessons.map((lesson) => {
          const status = lesson?.status;

          return {
            id: lesson.id,
            title: lesson.title,
            status,
            isExam: Boolean(lesson.isExam),
            isGiftBox: Boolean(isTaskGiftBox),
            isCompleted: status === "completed",
            isCurrent: status === "inProgress",
            isLocked: status === "locked",
          };
        });

        setLessons(normalized);

        if (isTaskGiftBox && profileResult?.success) {
          const alreadyOpened = hasOpenedGiftBox(profileResult.profile, taskId);

          if (alreadyOpened) {
            setIsGiftAlreadyOpened(true);
            setHasClaimed(true);
            setLoadError("");
          }
        }
      } catch (error) {
        setLoadError(error?.message || "Unable to load lessons");
      } finally {
        setIsLoading(false);
      }
    };

    loadLessons();
  }, [open, session, status, taskId, isTaskGiftBox]);

  // ... keeping the rest the same up to the return
  const footerText = isLocked
    ? "Complete previous tasks to unlock"
    : isCompleted
      ? "All content is available to practice"
      : isCurrent
        ? "Select an available block to begin"
        : "Complete previous tasks to unlock";

  const handleLessonClick = async (lesson) => {
    if (lesson.isLocked) return;

    sessionStorage.setItem("selectedLessonId", lesson.id);
    sessionStorage.setItem("selectedNodeId", taskId);
    sessionStorage.setItem(
      "selectedLessonIsExam",
      lesson.isExam ? "true" : "false",
    );
    sessionStorage.setItem("selectedLessonStatus", lesson.status || "");

    setSelectedLesson({
      lessonId: lesson.id,
      nodeId: taskId,
      status: lesson.status || "",
      isExam: Boolean(lesson.isExam),
    });

    router.push("/lesson");
    onClose();
  };

  const handleClaimGift = async () => {
    if (isClaiming || hasClaimed || isLocked || isGiftAlreadyOpened) return;

    setIsClaiming(true);
    // Optimistic UI update
    setHasClaimed(true);

    try {
      const token = getSessionToken(session);
      const result = await claimGiftBoxTask(taskId, token);

      if (!result.success) {
        throw new Error(result.error);
      }

      const rewardPayload = result.data || {};
      setGiftRewards({
        datesReceived:
          Number(rewardPayload?.datesReceived) ||
          Number(rewardPayload?.dateReceived) ||
          0,
        injazReceived:
          Number(rewardPayload?.injazReceived) ||
          Number(rewardPayload?.InjazReceived) ||
          0,
        badgesAdded: Array.isArray(rewardPayload?.badges?.added)
          ? rewardPayload.badges.added
          : [],
      });

      const activeGiftLessonId =
        lessons.find((lesson) => lesson.isCurrent || !lesson.isLocked)?.id ||
        lessons[0]?.id ||
        "";

      if (activeGiftLessonId) {
        const progressResult = await makeLearnerProgress(
          activeGiftLessonId,
          token,
        );
        if (progressResult?.success) {
          useDailyQuestStore.getState().invalidate();
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("nakhlah:journey-updated"));
        }
      }

      // Auto close after showing animation for a bit
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (error) {
      console.error(error);
      const errorMessage = error?.message || "";
      if (errorMessage.toLowerCase().includes("gift box already opened")) {
        setIsGiftAlreadyOpened(true);
        setHasClaimed(true);
        setLoadError("");
      } else {
        setLoadError("Failed to claim gift. Please try again.");
        setHasClaimed(false);
      }
    } finally {
      setIsClaiming(false);
    }
  };

  // Render Gift Box specific layout
  if (isTaskGiftBox) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md p-0 gap-0 border-border [&>button]:hidden rounded-2xl overflow-hidden shadow-xl border-2 bg-gradient-to-b from-accent/5 to-accent/10">
          <div className="bg-accent p-4 text-center relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <DialogTitle className="text-xl font-black text-white tracking-wide">
              {isGiftAlreadyOpened
                ? "Gift Already Claimed"
                : hasClaimed
                  ? "Gift Claimed!"
                  : "Mystery Gift Box"}
            </DialogTitle>
          </div>

          <div className="p-10 flex flex-col items-center justify-center relative overflow-hidden">
            {loadError && (
              <div className="absolute top-4 bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-bold z-20">
                {loadError}
              </div>
            )}

            {hasClaimed && !isGiftAlreadyOpened && (
              <motion.div
                className="absolute inset-0 pointer-events-none flex items-center justify-center z-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* Decorative Sparkles */}
                <motion.div
                  animate={{
                    rotate: 180,
                    scale: [1, 1.5, 1],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  className="absolute -top-4 -left-4 text-yellow-400"
                >
                  <Sparkles className="w-12 h-12" />
                </motion.div>
                <motion.div
                  animate={{
                    rotate: -180,
                    scale: [1, 1.2, 1],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.2,
                    delay: 0.2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  className="absolute top-10 right-4 text-yellow-500"
                >
                  <Sparkles className="w-8 h-8" />
                </motion.div>
                <motion.div
                  animate={{
                    rotate: 90,
                    scale: [1, 1.4, 1],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.8,
                    delay: 0.4,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  className="absolute bottom-5 -left-2 text-yellow-300"
                >
                  <Sparkles className="w-10 h-10" />
                </motion.div>
                <motion.div
                  animate={{
                    rotate: -90,
                    scale: [1, 1.3, 1],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.4,
                    delay: 0.1,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  className="absolute -bottom-6 right-8 text-yellow-400"
                >
                  <Sparkles className="w-14 h-14" />
                </motion.div>
              </motion.div>
            )}

            <motion.button
              onClick={handleClaimGift}
              disabled={
                isLocked || hasClaimed || isClaiming || isGiftAlreadyOpened
              }
              className={`
                relative z-10 w-48 h-48 rounded-full flex flex-col items-center justify-center
                transition-all duration-300
                ${isLocked ? "opacity-50 grayscale cursor-not-allowed" : "cursor-pointer"}
                ${!hasClaimed && !isLocked && !isGiftAlreadyOpened ? "hover:scale-105 active:scale-95 drop-shadow-xl" : ""}
              `}
              animate={
                hasClaimed && !isGiftAlreadyOpened
                  ? {
                      scale: [1, 1.2, 1.1],
                      rotate: [0, -10, 10, -10, 10, 0],
                    }
                  : {
                      y: [0, -10, 0],
                    }
              }
              transition={
                hasClaimed && !isGiftAlreadyOpened
                  ? { duration: 0.8, ease: "easeOut" }
                  : { repeat: Infinity, duration: 3, ease: "easeInOut" }
              }
            >
              <div
                className={`
                absolute inset-0 rounded-full blur-3xl opacity-50
                ${
                  isGiftAlreadyOpened
                    ? "bg-muted"
                    : hasClaimed
                      ? "bg-yellow-400"
                      : "bg-accent"
                }
              `}
              />

              <div className="relative text-accent">
                {isGiftAlreadyOpened ? (
                  <div className="relative">
                    <TreasureChest className="w-32 h-32 opacity-70 grayscale-[0.15]" />
                    {/* <div className="absolute -right-2 -top-2 rounded-full bg-emerald-500 p-2 text-white shadow-lg">
                      <CheckCircle2 className="w-6 h-6" />
                    </div> */}
                  </div>
                ) : hasClaimed ? (
                  <TreasureChest className="w-36 h-36 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] text-yellow-500" />
                ) : (
                  <TreasureChest className="w-32 h-32" />
                )}
              </div>
            </motion.button>

            <motion.div
              className="mt-8 text-center z-10"
              initial={false}
              animate={{ y: hasClaimed ? -10 : 0 }}
            >
              <h3 className="text-2xl font-black text-foreground mb-2">
                {isLocked
                  ? "Locked Gift"
                  : isGiftAlreadyOpened
                    ? "Already opened!"
                    : hasClaimed
                      ? "Awesome!"
                      : "You found a gift!"}
              </h3>
              <p className="text-muted-foreground font-semibold">
                {isLocked
                  ? "Complete previous tasks to open."
                  : isGiftAlreadyOpened
                    ? "You already collected this gift earlier."
                    : hasClaimed
                      ? "Your rewards have been added to your account."
                      : "Tap the chest to claim your rewards."}
              </p>

              {hasClaimed && !isGiftAlreadyOpened && giftRewards ? (
                <motion.div
                  className="mt-6 flex flex-col items-center gap-3"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.18 } },
                  }}
                >
                  {giftRewards.injazReceived > 0 && (
                    <motion.p
                      className="text-2xl font-black text-amber-500 drop-shadow-sm"
                      variants={{
                        hidden: { opacity: 0, y: 20, scale: 0.85 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          scale: 1,
                          transition: {
                            type: "spring",
                            stiffness: 260,
                            damping: 18,
                          },
                        },
                      }}
                    >
                      +{giftRewards.injazReceived.toLocaleString()} Injaz ✨
                    </motion.p>
                  )}
                  {giftRewards.datesReceived > 0 && (
                    <motion.p
                      className="text-2xl font-black text-sky-500 drop-shadow-sm"
                      variants={{
                        hidden: { opacity: 0, y: 20, scale: 0.85 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          scale: 1,
                          transition: {
                            type: "spring",
                            stiffness: 260,
                            damping: 18,
                          },
                        },
                      }}
                    >
                      +{giftRewards.datesReceived.toLocaleString()} Dates 🌴
                    </motion.p>
                  )}
                  {giftRewards.badgesAdded.length > 0 && (
                    <motion.p
                      className="text-xl font-bold text-emerald-500 drop-shadow-sm"
                      variants={{
                        hidden: { opacity: 0, y: 20, scale: 0.85 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          scale: 1,
                          transition: {
                            type: "spring",
                            stiffness: 260,
                            damping: 18,
                          },
                        },
                      }}
                    >
                      +{giftRewards.badgesAdded.length} Badge
                      {giftRewards.badgesAdded.length > 1 ? "s" : ""} Earned 🏅
                    </motion.p>
                  )}
                </motion.div>
              ) : null}
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Regular Lesson Selection layout
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 border-border [&>button]:hidden rounded-2xl overflow-hidden shadow-lg border-2">
        {/* Simple Header */}
        <div className="bg-accent p-5 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-1"
          >
            <X className="w-6 h-6" />
          </button>
          <DialogTitle className="text-2xl font-black text-white tracking-wide">
            Choose a Lesson
          </DialogTitle>
          <p className="text-white/90 font-medium text-sm mt-1">
            {isLocked
              ? "Lesson is locked"
              : isCompleted
                ? "All lessons unlocked"
                : isCurrent
                  ? "Start learning"
                  : "Complete previous lessons first"}
          </p>
        </div>

        {/* Lessons Grid (Tighter Spacing) */}
        <div className="p-6 bg-card">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`lesson-skeleton-${index}`}
                  className="relative p-5 rounded-2xl border-4 border-border/60 bg-background/70"
                >
                  <div className="w-24 h-24 mx-auto rounded-2xl bg-muted animate-pulse" />
                  <div className="mt-4 h-4 w-3/4 mx-auto rounded bg-muted animate-pulse" />
                  <div className="mt-2 h-3 w-1/2 mx-auto rounded bg-muted/80 animate-pulse" />
                </div>
              ))}
            </div>
          ) : loadError ? (
            <p className="text-sm font-semibold text-destructive text-center py-4">
              {loadError}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {lessons.map((lesson) => {
                const lessonIcon = lesson.isExam ? (
                  <Trophy size="xxl" />
                ) : (
                  <BookOpen size="xxl" />
                );

                return (
                  <button
                    key={lesson.id}
                    onClick={() => handleLessonClick(lesson)}
                    disabled={lesson.isLocked}
                    className={`
                      relative p-5 rounded-2xl border-4 transition-all
                      flex flex-col items-center justify-center gap-3 group
                      ${
                        lesson.isLocked
                          ? "bg-muted border-muted-foreground/20 cursor-not-allowed opacity-75"
                          : lesson.isCompleted
                            ? "bg-card border-accent/20 hover:border-accent hover:bg-accent/5 cursor-pointer"
                            : "bg-card border-border hover:border-accent hover:bg-accent/5 cursor-pointer shadow-sm hover:shadow-md"
                      }
                      ${!lesson.isLocked && "active:scale-95"}
                    `}
                  >
                    {/* Small Status Overlays */}
                    {lesson.isLocked && (
                      <div className="absolute top-2 right-2">
                        <Lock size="sm" variant="silver" />
                      </div>
                    )}
                    {lesson.isCompleted && !lesson.isLocked && (
                      <div className="absolute top-2 right-2 text-emerald-500">
                        <CheckCircle2 className="w-6 h-6 fill-emerald-100" />
                      </div>
                    )}

                    {/* Extra Large Icon */}
                    <div
                      className={`
                        w-24 h-24 flex items-center justify-center
                        ${lesson.isLocked ? "grayscale opacity-50" : ""}
                        transition-transform group-hover:scale-105 duration-200
                      `}
                    >
                      {lessonIcon}
                    </div>

                    {/* Lesson Title */}
                    <p
                      className={`
                        text-md font-bold text-center tracking-tight leading-tight px-1
                        ${lesson.isLocked ? "text-muted-foreground" : "text-foreground"}
                      `}
                    >
                      {lesson.title}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {/* Info Text */}
          {footerText ? (
            <p className="text-xs font-semibold text-muted-foreground/80 text-center mt-5 uppercase tracking-wider">
              {footerText}
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
