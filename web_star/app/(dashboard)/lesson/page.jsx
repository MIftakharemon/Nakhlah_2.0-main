/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, X, Turtle, Check, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import LeavingDialog from "./leaving/page";
import { LessonResultHandler } from "../components/ResultHandler";
import LessonHeader from "../components/LessonHeader";
import { useAudio } from "@/hooks/use-audio";
import { ArabicTooltip } from "@/components/nakhlah/ArabicTooltip";
import { Mascot } from "@/components/nakhlah/Mascot";
import { getMediaUrl, shuffleArray, sortByOrder } from "./utils/mediaUtils";
import { useSession } from "next-auth/react";
import { getSessionToken, isSessionValid } from "@/lib/authUtils";
import {
  fetchLessonQuestions as fetchLessonAPI,
  fetchTaskExamQuestions,
  claimUserDailyQuest,
  makeLearnerProgress,
  reportFullMarks,
  reportWrongAnswer,
  refillPalmTrees,
} from "@/services/api";
import { resolveLessonCompletionDailyQuestParams } from "@/lib/gamification";
import { useDailyQuestStore } from "@/stores/useDailyQuestStore";
import { useLessonStore } from "@/stores/useLessonStore";
import { useProfileStore } from "@/stores/useProfileStore";
import { getUserKey } from "@/lib/userKey";
import { toast } from "@/components/nakhlah/Toast";

import LessonLoadingView from "./loading/LessonLoadingView";

const LESSON_SESSION_STORAGE_KEY = "activeLessonSessionV1";
const JOURNEY_REFRESH_FLAG_KEY = "nakhlah:journey-needs-refresh";
const LESSON_SESSION_USER_KEY = "nakhlah:active-lesson-user";
const LESSON_AUTH_SESSION_KEY = "nakhlah:active-auth-session";

function buildLessonSessionKey({ lessonId, taskId, isExamLesson }) {
  return [lessonId || "", taskId || "", isExamLesson ? "exam" : "lesson"].join(
    "::",
  );
}

function safelyParseLessonSession(rawValue) {
  if (!rawValue) return null;
  try {
    const parsed = JSON.parse(rawValue);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function clearPersistedLessonSession() {
  if (typeof window === "undefined") return;

  sessionStorage.removeItem(LESSON_SESSION_STORAGE_KEY);
  sessionStorage.removeItem(LESSON_SESSION_USER_KEY);
  sessionStorage.removeItem("currentLessonIndex");
  sessionStorage.removeItem("selectedLessonId");
  sessionStorage.removeItem("selectedNodeId");
  sessionStorage.removeItem("selectedLessonIsExam");
  sessionStorage.removeItem("selectedLessonStatus");
}

function buildAuthSessionKey(session) {
  const email = session?.user?.email || "";
  const id = session?.user?.id || session?.user?._id || "";
  // Use stable identity only so focus-based session refreshes do not reset lesson state.
  return [email, id].join("::");
}

function normalizeText(value) {
  return (value || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/\s+/g, " ");
}

function stripArabicDiacritics(value) {
  return (value || "").toString().replace(/[\u064B-\u065F\u0670]/g, "");
}

function hasArabicDiacritics(value) {
  return /[\u064B-\u065F\u0670]/.test((value || "").toString());
}

function looksArabic(value) {
  return /[\u0600-\u06FF]/.test((value || "").toString());
}

function resolveCanonicalArabicFromLearnAnswer(learnAnswer) {
  if (!learnAnswer) return "";

  if (typeof learnAnswer === "string") {
    return looksArabic(learnAnswer) ? learnAnswer : "";
  }

  if (typeof learnAnswer !== "object") {
    return "";
  }

  const entries = Object.entries(learnAnswer);
  for (const [key, value] of entries) {
    if (typeof value === "string" && looksArabic(value)) {
      return value;
    }
    if (typeof key === "string" && looksArabic(key)) {
      return key;
    }
  }

  return "";
}

// Last-resort display mapping for common undiacritized starter words.
const DIACRITIC_FALLBACK_BY_BASE_WORD = {
  اسمي: "اِسْمِي",
};

function applyDiacriticsFallback(value) {
  const normalized = (value || "").toString();
  const base = stripArabicDiacritics(normalized).replace(/\s+/g, "").trim();
  return DIACRITIC_FALLBACK_BY_BASE_WORD[base] || normalized;
}

function buildDiacritizedPreview(targetWord, selectedWord) {
  const safeTarget = (targetWord || "").toString();
  const safeSelected = (selectedWord || "").toString();

  if (!safeTarget || !safeSelected) return safeSelected;

  const targetBase = stripArabicDiacritics(safeTarget).replace(/\s+/g, "");
  const selectedBase = stripArabicDiacritics(safeSelected).replace(/\s+/g, "");

  // Only project diacritics when user build matches target prefix.
  if (!targetBase.startsWith(selectedBase)) {
    return safeSelected;
  }

  let consumedBaseChars = 0;
  let preview = "";
  const selectedBaseLength = selectedBase.length;

  for (const char of safeTarget) {
    const isDiacritic = /[\u064B-\u065F\u0670]/.test(char);
    const isWhitespace = /\s/.test(char);

    if (isDiacritic) {
      // Keep harakat tied to the last consumed base character.
      if (consumedBaseChars > 0 && consumedBaseChars <= selectedBaseLength) {
        preview += char;
      }
      continue;
    }

    if (isWhitespace) {
      if (consumedBaseChars > 0 && consumedBaseChars < selectedBaseLength) {
        preview += char;
      }
      continue;
    }

    if (consumedBaseChars >= selectedBaseLength) {
      break;
    }

    preview += char;
    consumedBaseChars += 1;
  }

  return preview || safeSelected;
}

function getQuestionMedia(question, mediaType) {
  const mediaList = Array.isArray(question?.question_media)
    ? question.question_media
    : Array.isArray(question?.questionMedia)
      ? question.questionMedia
      : [];
  const mediaItem = mediaList.find((item) => item?.mediaType === mediaType);
  const mediaUrl = mediaItem?.media?.url;

  return mediaUrl ? getMediaUrl(mediaUrl) : "";
}

function normalizeAnswerFields(answer) {
  // Normalize answer field names from camelCase to snake_case
  return {
    ...answer,
    id: answer.id,
    title: answer.title,
    is_correct: answer.is_correct ?? answer.isCorrect ?? false,
    order_number:
      answer.order_number ??
      answer.orderNumber ??
      answer._order ??
      answer.order,
    left_title: answer.left_title || answer.leftTitle,
    right_title: answer.right_title || answer.RightTitle || answer.rightTitle,
    media: answer.media,
  };
}

function normalizeQuestionFields(question) {
  // Map camelCase API fields to snake_case format
  return {
    ...question,
    id: question.id || question._id,
    question_type: question.question_type || question.questionType,
    question_title: question.question_title || question.questionTitle,
    question_media: question.question_media || question.questionMedia || [],
    answers: Array.isArray(question.answers)
      ? question.answers.map(normalizeAnswerFields)
      : [],
    learn_answer: question.learn_answer || question.learnAnswer,
    true_false_answer: question.true_false_answer ?? question.trueFalseAnswer,
  };
}

function isScoredQuestion(question) {
  const questionType = question?.question_type || question?.questionType;

  return questionType && questionType !== "learn";
}

function normalizeQuestionsPayload(payload) {
  let questions = [];
  if (Array.isArray(payload)) questions = payload;
  else if (Array.isArray(payload?.data)) questions = payload.data;
  else if (Array.isArray(payload?.docs)) questions = payload.docs;
  else if (Array.isArray(payload?.questions)) questions = payload.questions;
  else if (Array.isArray(payload?.items)) questions = payload.items;
  else return [];

  return questions.map(normalizeQuestionFields);
}

function parseQuestionSequence(question) {
  const rawOrder =
    question?._order ??
    question?.order ??
    question?.order_number ??
    question?.sequence;
  const parsedOrder = Number(rawOrder);

  return Number.isFinite(parsedOrder) ? parsedOrder : null;
}

function parseMongoObjectIdValue(id) {
  if (typeof id !== "string" || !/^[a-f0-9]{24}$/i.test(id)) {
    return null;
  }

  const timestampHex = id.slice(0, 8);
  const timestamp = Number.parseInt(timestampHex, 16);

  return Number.isFinite(timestamp) ? timestamp : null;
}

function sortExamQuestionsForDisplay(questions) {
  return [...questions]
    .map((question, index) => ({
      question,
      index,
      sequence: parseQuestionSequence(question),
      objectIdValue: parseMongoObjectIdValue(question?.id),
    }))
    .sort((a, b) => {
      if (a.sequence !== null || b.sequence !== null) {
        if (a.sequence === null) return 1;
        if (b.sequence === null) return -1;
        if (a.sequence !== b.sequence) return a.sequence - b.sequence;
      }

      if (a.objectIdValue !== null || b.objectIdValue !== null) {
        if (a.objectIdValue === null) return 1;
        if (b.objectIdValue === null) return -1;
        if (a.objectIdValue !== b.objectIdValue) {
          return a.objectIdValue - b.objectIdValue;
        }
      }

      return a.index - b.index;
    })
    .map(({ question }) => question);
}

function normalizeLessonRewardPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const injazReceived = Number(
    payload?.injazReceived ??
      payload?.InjazReceived ??
      payload?.InjazEarned ??
      payload?.injazReward ??
      payload?.reward?.injazReceived ??
      payload?.reward?.InjazReceived ??
      payload?.reward?.InjazEarned ??
      0,
  );

  return {
    ...payload,
    injazReceived: Number.isFinite(injazReceived) ? injazReceived : 0,
  };
}

async function claimLessonCompletionDailyQuests(token, rewards) {
  if (!token) return [];

  const questParams = resolveLessonCompletionDailyQuestParams(rewards);
  if (!questParams.length) return [];

  const results = [];
  for (const questParam of questParams) {
    const claimResult = await claimUserDailyQuest(token, questParam);
    if (claimResult.success && claimResult.data) {
      results.push(claimResult.data);
    }
  }

  return results;
}

function syncProfilePalmTrees(nextPalmTrees) {
  const palmTreesValue = Number(nextPalmTrees);
  if (!Number.isFinite(palmTreesValue)) return;

  useProfileStore.setState((state) => {
    const currentProfile = state.profile;
    if (!currentProfile) return state;

    return {
      ...state,
      profile: {
        ...currentProfile,
        gamificationStock: {
          ...(currentProfile.gamificationStock || {}),
          palm: {
            ...(currentProfile.gamificationStock?.palm || {}),
            palmStock: palmTreesValue,
          },
        },
      },
      stats: {
        ...(currentProfile.gamificationStock || {}),
        palm: {
          ...(currentProfile.gamificationStock?.palm || {}),
          palmStock: palmTreesValue,
        },
      },
    };
  });
}

export default function LessonPage() {
  const router = useRouter();
  const { play } = useAudio();
  const { data: session, status } = useSession();
  const storeSelectedLessonId = useLessonStore(
    (state) => state.selectedLessonId,
  );
  const storeSelectedNodeId = useLessonStore((state) => state.selectedNodeId);
  const storeSelectedLessonStatus = useLessonStore(
    (state) => state.selectedLessonStatus,
  );
  const storeSelectedLessonIsExam = useLessonStore(
    (state) => state.selectedLessonIsExam,
  );
  const clearLessonSelection = useLessonStore(
    (state) => state.clearLessonSelection,
  );
  const fetchProfile = useProfileStore((state) => state.fetchMyProfile);

  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [palmTrees, setPalmTrees] = useState(5);
  const [hasWrongAnswer, setHasWrongAnswer] = useState(false);
  const [isExamLesson, setIsExamLesson] = useState(false);
  const [selectedLessonStatus, setSelectedLessonStatus] = useState("");
  const [showFullMarksClaimedNotice, setShowFullMarksClaimedNotice] =
    useState(false);
  const [isRefillingFromError, setIsRefillingFromError] = useState(false);
  const [isCompletingFromNotice, setIsCompletingFromNotice] = useState(false);
  const [isNavigatingToCompletion, setIsNavigatingToCompletion] =
    useState(false);
  const [fullMarksRewardData, setFullMarksRewardData] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerStartedAtMs, setTimerStartedAtMs] = useState(null);
  const [totalAnswerAttempts, setTotalAnswerAttempts] = useState(0);
  const [correctAnswerAttempts, setCorrectAnswerAttempts] = useState(0);

  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [selectedTrueFalse, setSelectedTrueFalse] = useState(null);
  const [selectedFillBlankOptionId, setSelectedFillBlankOptionId] =
    useState(null);
  const [fillBlankAnswer, setFillBlankAnswer] = useState("");

  const [selectedTokens, setSelectedTokens] = useState([]);
  const [availableTokens, setAvailableTokens] = useState([]);

  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [leftState, setLeftState] = useState([]);
  const [rightState, setRightState] = useState([]);
  const [incorrectPairs, setIncorrectPairs] = useState([]);
  const [pairPenaltyApplied, setPairPenaltyApplied] = useState(false);
  const sessionRef = useRef(session);
  const autoplayedAudioQuestionIdRef = useRef(null);
  const totalAnswerAttemptsRef = useRef(0);
  const correctAnswerAttemptsRef = useRef(0);

  const totalQuestions = questions.length;
  const totalScoredQuestions = questions.filter(isScoredQuestion).length;
  const currentQuestion = questions[currentIndex];
  const progressPercentage =
    totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;
  const activeUserKey = getUserKey(session);
  const authSessionKey = buildAuthSessionKey(session);

  const questionType = currentQuestion?.question_type;
  const hasPalmTrees = palmTrees > 0;

  const imageUrl = getQuestionMedia(currentQuestion, "image");
  const audioUrl = getQuestionMedia(currentQuestion, "audio");
  const audioQuestionId = currentQuestion?.id || currentIndex;

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated" || !isSessionValid(session)) {
      clearPersistedLessonSession();
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(LESSON_AUTH_SESSION_KEY);
      }
      router.push("/auth/login");
      return;
    }

    if (typeof window !== "undefined" && authSessionKey) {
      sessionStorage.setItem(LESSON_AUTH_SESSION_KEY, authSessionKey);
    }
  }, [status, session, router, authSessionKey]);

  useEffect(() => {
    if (status !== "authenticated" || !isSessionValid(session)) return;

    const persistedUserKey = sessionStorage.getItem(LESSON_SESSION_USER_KEY);
    const persistedAuthSessionKey = sessionStorage.getItem(
      LESSON_AUTH_SESSION_KEY,
    );

    if (
      (persistedUserKey && persistedUserKey !== activeUserKey) ||
      (persistedAuthSessionKey && persistedAuthSessionKey !== authSessionKey)
    ) {
      clearPersistedLessonSession();
      clearLessonSelection();
    }
  }, [activeUserKey, clearLessonSelection, session, status, authSessionKey]);

  useEffect(() => {
    const fetchLessonQuestions = async () => {
      if (isNavigatingToCompletion) return;
      if (status === "loading") return;

      const currentSession = sessionRef.current;

      if (!isSessionValid(currentSession)) {
        setLoadError("Please login to access lessons.");
        setIsLoading(false);
        router.push("/auth/login");
        return;
      }

      const lessonId =
        (storeSelectedLessonId || "").trim() ||
        sessionStorage.getItem("selectedLessonId")?.trim();
      const taskId =
        (storeSelectedNodeId || "").trim() ||
        sessionStorage.getItem("selectedNodeId")?.trim();
      const selectedLessonIsExam =
        Boolean(storeSelectedLessonIsExam) ||
        sessionStorage.getItem("selectedLessonIsExam") === "true";
      const selectedStatus =
        (storeSelectedLessonStatus || "").trim() ||
        sessionStorage.getItem("selectedLessonStatus")?.trim() ||
        "";
      const lessonSessionKey = buildLessonSessionKey({
        lessonId,
        taskId,
        isExamLesson: selectedLessonIsExam,
      });

      // Always start a lesson from a clean state instead of resuming stale cached progress.
      clearPersistedLessonSession();

      if (!lessonId) {
        setLoadError("No lesson selected.");
        setIsLoading(false);
        return;
      }

      if (selectedLessonIsExam && !taskId) {
        setLoadError("No task selected for exam lesson.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError("");
        setHasWrongAnswer(false);
        setIsExamLesson(selectedLessonIsExam);
        setSelectedLessonStatus(selectedStatus);
        setFullMarksRewardData(null);

        const token = getSessionToken(currentSession);
        if (!token) {
          throw new Error("No authentication token available");
        }

        const profileResult = await fetchProfile(
          token,
          true,
          getUserKey(currentSession),
        );

        if (!profileResult.success) {
          throw new Error(
            profileResult.error || "Unable to verify available Palm Trees.",
          );
        }

        const resolvedProfile = profileResult?.success
          ? profileResult.profile
          : null;
        if (resolvedProfile) {
          const palmStock = Number(
            resolvedProfile?.gamificationStock?.palm?.palmStock,
          );
          if (Number.isFinite(palmStock)) {
            setPalmTrees(palmStock);
            syncProfilePalmTrees(palmStock);
            if (palmStock <= 0) {
              setLoadError(
                "You need more Palm Trees before opening this lesson.",
              );
              setIsLoading(false);
              return;
            }
          } else {
            throw new Error("Unable to verify available Palm Trees.");
          }
        } else {
          throw new Error("Unable to verify available Palm Trees.");
        }

        const questionsRequest = selectedLessonIsExam
          ? fetchTaskExamQuestions(taskId, token)
          : fetchLessonAPI(lessonId, token);

        const result = await questionsRequest;

        if (!result.success) {
          throw new Error(result.error);
        }

        const normalizedQuestions = normalizeQuestionsPayload(result.data);
        const orderedQuestions = selectedLessonIsExam
          ? sortExamQuestionsForDisplay(normalizedQuestions)
          : normalizedQuestions;
        if (!orderedQuestions.length) {
          throw new Error("No questions returned from API.");
        }

        setQuestions(orderedQuestions);
        setCurrentIndex(0);
        setElapsedSeconds(0);
        setTimerStartedAtMs(Date.now());
        setTotalAnswerAttempts(0);
        totalAnswerAttemptsRef.current = 0;
        setCorrectAnswerAttempts(0);
        correctAnswerAttemptsRef.current = 0;
      } catch (error) {
        setLoadError(error?.message || "Unable to load lesson.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessonQuestions();
  }, [
    activeUserKey,
    authSessionKey,
    fetchProfile,
    storeSelectedLessonId,
    storeSelectedNodeId,
    storeSelectedLessonIsExam,
    storeSelectedLessonStatus,
    status,
    router,
    isNavigatingToCompletion,
  ]);

  useEffect(() => {
    if (currentIndex >= totalQuestions && totalQuestions > 0) {
      setCurrentIndex(0);
    }
  }, [currentIndex, totalQuestions]);

  useEffect(() => {
    totalAnswerAttemptsRef.current = totalAnswerAttempts;
  }, [totalAnswerAttempts]);

  useEffect(() => {
    correctAnswerAttemptsRef.current = correctAnswerAttempts;
  }, [correctAnswerAttempts]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isLoading || isNavigatingToCompletion || !questions.length) return;

    if (!Number.isFinite(timerStartedAtMs) || timerStartedAtMs <= 0) {
      setTimerStartedAtMs(Date.now());
      return;
    }

    const syncElapsedSeconds = () => {
      setElapsedSeconds(
        Math.max(0, Math.floor((Date.now() - timerStartedAtMs) / 1000)),
      );
    };

    syncElapsedSeconds();

    const interval = setInterval(syncElapsedSeconds, 1000);
    const handleWindowFocus = () => syncElapsedSeconds();
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        syncElapsedSeconds();
      }
    };

    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isLoading, isNavigatingToCompletion, questions.length, timerStartedAtMs]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isLoading || !questions.length) return;

    const lessonId =
      (storeSelectedLessonId || "").trim() ||
      sessionStorage.getItem("selectedLessonId")?.trim();
    const taskId =
      (storeSelectedNodeId || "").trim() ||
      sessionStorage.getItem("selectedNodeId")?.trim();
    const selectedLessonIsExam =
      Boolean(storeSelectedLessonIsExam) ||
      sessionStorage.getItem("selectedLessonIsExam") === "true";

    if (!lessonId) return;

    if (!activeUserKey) return;

    sessionStorage.setItem(
      LESSON_SESSION_STORAGE_KEY,
      JSON.stringify({
        key: buildLessonSessionKey({
          lessonId,
          taskId,
          isExamLesson: selectedLessonIsExam,
        }),
        lessonId,
        taskId,
        isExamLesson: selectedLessonIsExam,
        userKey: activeUserKey,
        authSessionKey,
        selectedLessonStatus,
        questions,
        currentIndex,
        palmTrees,
        lives: palmTrees,
        hasWrongAnswer,
        fullMarksRewardData,
        elapsedSeconds,
        timerStartedAtMs,
        totalAnswerAttempts,
        correctAnswerAttempts,
      }),
    );
    sessionStorage.setItem(LESSON_SESSION_USER_KEY, activeUserKey);
    sessionStorage.setItem(LESSON_AUTH_SESSION_KEY, authSessionKey);
  }, [
    activeUserKey,
    authSessionKey,
    storeSelectedLessonId,
    storeSelectedNodeId,
    storeSelectedLessonIsExam,
    storeSelectedLessonStatus,
    isLoading,
    questions,
    selectedLessonStatus,
    currentIndex,
    palmTrees,
    hasWrongAnswer,
    fullMarksRewardData,
    elapsedSeconds,
    timerStartedAtMs,
    totalAnswerAttempts,
    correctAnswerAttempts,
    session,
  ]);

  const mcqOptions = useMemo(() => {
    if (questionType !== "mcq") return [];
    return (currentQuestion.answers || []).map((answer) => ({
      id: answer.id,
      text: answer.title,
      correct: Boolean(answer.is_correct),
    }));
  }, [currentQuestion, questionType]);

  const fillBlankCorrectAnswer = useMemo(() => {
    if (questionType !== "fill_blank") return "";
    return (
      (currentQuestion.answers || []).find((answer) =>
        Boolean(answer.is_correct),
      )?.title || ""
    );
  }, [currentQuestion, questionType]);

  const fillBlankCorrectOptionId = useMemo(() => {
    if (questionType !== "fill_blank") return "";
    return (
      (currentQuestion.answers || []).find((answer) =>
        Boolean(answer.is_correct),
      )?.id || ""
    );
  }, [currentQuestion, questionType]);

  const fillBlankOptions = useMemo(() => {
    if (questionType !== "fill_blank") return [];
    return (currentQuestion.answers || []).map((answer) => ({
      id: answer.id,
      text: answer.title,
      correct: Boolean(answer.is_correct),
    }));
  }, [currentQuestion, questionType]);

  const fillBlankQuestionParts = useMemo(() => {
    if (questionType !== "fill_blank") {
      return { before: "", blank: "", after: "", hasBlank: false };
    }

    const title = (currentQuestion?.question_title || "").toString();
    // Support single underscore placeholders (e.g. "'_'") in addition to older multi-char markers.
    const match = title.match(/_{1,}|-{3,}|\.{3,}/);

    if (!match || match.index === undefined) {
      return {
        before: title,
        blank: "____",
        after: "",
        hasBlank: false,
      };
    }

    const startIndex = match.index;
    const endIndex = startIndex + match[0].length;

    return {
      before: title.slice(0, startIndex),
      blank: match[0],
      after: title.slice(endIndex),
      hasBlank: true,
    };
  }, [currentQuestion, questionType]);

  const orderedTokens = useMemo(() => {
    if (questionType !== "word_making" && questionType !== "sentence_making") {
      return [];
    }

    const answers = Array.isArray(currentQuestion?.answers)
      ? currentQuestion.answers
      : [];

    // Prefer explicitly correct tokens when backend provides them.
    const correctAnswers = answers.filter((answer) =>
      Boolean(answer?.is_correct),
    );
    const sourceAnswers = correctAnswers.length > 0 ? correctAnswers : answers;

    return sortByOrder(sourceAnswers).map((answer) => answer.title);
  }, [currentQuestion, questionType]);

  const selectedConstructedAnswer = useMemo(() => {
    if (questionType !== "word_making" && questionType !== "sentence_making") {
      return "";
    }

    return selectedTokens.join(questionType === "sentence_making" ? " " : "");
  }, [questionType, selectedTokens]);

  const diacritizedWordPreview = useMemo(() => {
    if (questionType !== "word_making") return selectedConstructedAnswer;

    const canonicalFromLearnAnswer = resolveCanonicalArabicFromLearnAnswer(
      currentQuestion?.learn_answer,
    );

    const explicitAnswerCandidates = [
      canonicalFromLearnAnswer,
      currentQuestion?.correct_answer,
      currentQuestion?.correctAnswer,
      currentQuestion?.correct_word,
      currentQuestion?.correctWord,
      currentQuestion?.answer,
      currentQuestion?.finalAnswer,
      currentQuestion?.wordAnswer,
    ];

    const targetWord = explicitAnswerCandidates.find(
      (candidate) => typeof candidate === "string" && candidate.trim(),
    );

    const fallbackTargetWord = applyDiacriticsFallback(
      targetWord || orderedTokens.join(""),
    );

    if (!targetWord) {
      return buildDiacritizedPreview(
        fallbackTargetWord,
        selectedConstructedAnswer,
      );
    }

    if (!hasArabicDiacritics(targetWord)) {
      return buildDiacritizedPreview(
        fallbackTargetWord,
        selectedConstructedAnswer,
      );
    }

    return buildDiacritizedPreview(targetWord, selectedConstructedAnswer);
  }, [currentQuestion, orderedTokens, questionType, selectedConstructedAnswer]);

  useEffect(() => {
    setIsCorrect(null);
    setSelectedOptionId(null);
    setSelectedTrueFalse(null);
    setSelectedFillBlankOptionId(null);
    setFillBlankAnswer("");
    setSelectedTokens([]);
    setSelectedLeft(null);
    setSelectedRight(null);
    setIncorrectPairs([]);
    setPairPenaltyApplied(false);

    if (questionType === "word_making" || questionType === "sentence_making") {
      setAvailableTokens(shuffleArray(orderedTokens));
      return;
    }

    if (questionType === "pair_matching") {
      const pairs = currentQuestion.answers || [];
      const leftItems = pairs.map((pair, index) => ({
        id: `left-${index}-${pair.id}`,
        text: pair.left_title,
        matchKey: pair.id,
        matched: false,
      }));
      const rightItems = shuffleArray(
        pairs.map((pair, index) => ({
          id: `right-${index}-${pair.id}`,
          text: pair.right_title,
          matchKey: pair.id,
          matched: false,
        })),
      );
      setLeftState(leftItems);
      setRightState(rightItems);
      return;
    }

    setAvailableTokens([]);
    setLeftState([]);
    setRightState([]);
  }, [currentIndex, currentQuestion, orderedTokens, questionType]);

  const handlePlayAudio = () => {
    if (!audioUrl) return;
    play({ url: audioUrl, rate: 1.0 });
  };

  const handlePlayAudioSlow = () => {
    if (!audioUrl) return;
    play({ url: audioUrl, rate: 0.6 });
  };

  useEffect(() => {
    if (!audioUrl || !audioQuestionId) return;
    if (autoplayedAudioQuestionIdRef.current === audioQuestionId) return;
    autoplayedAudioQuestionIdRef.current = audioQuestionId;
    play({ url: audioUrl, rate: 1.0 });
  }, [audioQuestionId, audioUrl, play]);

  const applyWrongAnswerPenalty = async () => {
    setHasWrongAnswer(true);

    if (!isSessionValid(session)) return;

    const token = getSessionToken(session);
    if (!token) return;

    const result = await reportWrongAnswer(token);
    if (!result.success) return;

    const palmStock = Number(result.data?.palmStock);
    if (Number.isFinite(palmStock)) {
      setPalmTrees(palmStock);
      syncProfilePalmTrees(palmStock);
    }
  };

  const recordAnswerAttempt = (isAnswerCorrect) => {
    totalAnswerAttemptsRef.current += 1;
    setTotalAnswerAttempts(totalAnswerAttemptsRef.current);
    if (isAnswerCorrect) {
      correctAnswerAttemptsRef.current += 1;
      setCorrectAnswerAttempts(correctAnswerAttemptsRef.current);
    }
  };

  const calculateAccuracyPercentage = ({
    questionCount = totalScoredQuestions,
    correctAttempts = correctAnswerAttemptsRef.current,
  } = {}) => {
    const normalizedQuestionCount = Number(questionCount);
    const normalizedCorrectAttempts = Number(correctAttempts);

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
  };

  const completeLessonAndRedirect = async ({
    skipLearnerProgress = false,
    rewardPayload = null,
    accuracyPercentageOverride = null,
    hasWrongAnswerOverride = null,
    forceDailyQuestRefresh = false,
  } = {}) => {
    setIsNavigatingToCompletion(true);

    const lessonId =
      (storeSelectedLessonId || "").trim() ||
      sessionStorage.getItem("selectedLessonId")?.trim();
    const token = getSessionToken(session);
    let progressPayload = normalizeLessonRewardPayload(rewardPayload);
    let shouldInvalidateDailyQuestCache = Boolean(forceDailyQuestRefresh);

    if (lessonId && token && !skipLearnerProgress) {
      const progressResult = await makeLearnerProgress(lessonId, token);
      if (progressResult.success && progressResult.data) {
        shouldInvalidateDailyQuestCache = true;
        progressPayload = normalizeLessonRewardPayload({
          ...progressResult.data,
          ...(progressPayload || {}),
        });
      }
    }

    const accuracyPercentage = Number.isFinite(
      Number(accuracyPercentageOverride),
    )
      ? Number(accuracyPercentageOverride)
      : calculateAccuracyPercentage();
    const hasWrongAnswerToUse =
      typeof hasWrongAnswerOverride === "boolean"
        ? hasWrongAnswerOverride
        : hasWrongAnswer;

    let mergedClaimPayload = progressPayload || {};

    if (token) {
      const dailyQuestClaims = await claimLessonCompletionDailyQuests(token, {
        accuracyPercentage,
        hasWrongAnswer: hasWrongAnswerToUse,
      });

      if (dailyQuestClaims.length > 0) {
        shouldInvalidateDailyQuestCache = true;
      }

      mergedClaimPayload = dailyQuestClaims.reduce((accumulator, item) => {
        const itemInjaz = Number(
          item?.injazReceived ??
            item?.InjazReceived ??
            item?.injazReward ??
            item?.reward?.injazReceived ??
            item?.reward?.InjazReceived ??
            item?.reward?.injazReward ??
            0,
        );

        return {
          ...accumulator,
          injazReceived:
            (Number(accumulator?.injazReceived) || 0) +
            (Number.isFinite(itemInjaz) ? itemInjaz : 0),
          badges: {
            added: [
              ...(Array.isArray(accumulator?.badges?.added)
                ? accumulator.badges.added
                : []),
              ...(Array.isArray(item?.badges?.added) ? item.badges.added : []),
            ],
            total: [
              ...(Array.isArray(accumulator?.badges?.total)
                ? accumulator.badges.total
                : []),
              ...(Array.isArray(item?.badges?.total) ? item.badges.total : []),
            ],
          },
        };
      }, mergedClaimPayload);
    }

    sessionStorage.setItem(
      "lessonProgressData",
      JSON.stringify({
        ...mergedClaimPayload,
        __clientStats: {
          elapsedSeconds,
          totalQuestions,
          scoredQuestionsCount: totalScoredQuestions,
          totalAnswerAttempts: totalAnswerAttemptsRef.current,
          correctAnswerAttempts: correctAnswerAttemptsRef.current,
          accuracyPercentage,
        },
      }),
    );

    if (token && shouldInvalidateDailyQuestCache) {
      useDailyQuestStore.getState().invalidate();
    }

    if (typeof window !== "undefined") {
      sessionStorage.setItem(JOURNEY_REFRESH_FLAG_KEY, "true");
      window.dispatchEvent(new Event("nakhlah:journey-updated"));
    }

    clearPersistedLessonSession();
    clearLessonSelection();
    router.push("/lesson/completed");
  };

  const goToNext = async () => {
    if (!hasPalmTrees) {
      toast.error(
        "No Palm Trees left. Refill Palm Trees to continue this lesson.",
      );
      return;
    }

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    if (totalScoredQuestions > 0 && totalAnswerAttempts === 0) {
      toast.error("Answer at least one question before completing the lesson.");
      setCurrentIndex(0);
      return;
    }

    const lessonId = sessionStorage.getItem("selectedLessonId")?.trim();
    const token = getSessionToken(session);
    const isReplayOfCompletedLesson =
      (selectedLessonStatus || "").trim().toLowerCase() === "completed";

    if (isReplayOfCompletedLesson) {
      await completeLessonAndRedirect();
      return;
    }

    if (lessonId && token && !hasWrongAnswer) {
      const fullMarksResult = await reportFullMarks(lessonId, token);
      if (fullMarksResult.success) {
        const rewardData = fullMarksResult.data || null;
        setFullMarksRewardData(rewardData);
        await completeLessonAndRedirect({
          skipLearnerProgress: true,
          rewardPayload: rewardData,
          forceDailyQuestRefresh: true,
          accuracyPercentageOverride: calculateAccuracyPercentage(),
          hasWrongAnswerOverride: hasWrongAnswer,
        });
        return;
      } else {
        const fullMarksError = (fullMarksResult.error || "").toLowerCase();
        const shouldShowAlreadyClaimed =
          fullMarksError === "please maintain the sequence" ||
          fullMarksError.includes("maintain the sequence");

        if (shouldShowAlreadyClaimed) {
          setShowFullMarksClaimedNotice(true);
          return;
        }
      }
    }

    await completeLessonAndRedirect();
  };

  const handleClaimedNoticeContinue = async () => {
    if (isCompletingFromNotice) return;
    setIsCompletingFromNotice(true);
    setShowFullMarksClaimedNotice(false);
    await completeLessonAndRedirect();
  };

  const handleLeaveLesson = () => {
    clearPersistedLessonSession();
    clearLessonSelection();
    setShowExitDialog(false);
    router.push("/");
  };

  const handleCheckAnswer = async () => {
    if (!currentQuestion) return;
    if (!hasPalmTrees) {
      toast.error("No Palm Trees left. Refill Palm Trees to answer questions.");
      return;
    }

    if (questionType === "mcq") {
      const selected = mcqOptions.find(
        (option) => option.id === selectedOptionId,
      );
      if (!selected) return;
      if (!selected.correct) {
        await applyWrongAnswerPenalty();
      }
      recordAnswerAttempt(selected.correct);
      setIsCorrect(selected.correct);
      return;
    }

    if (questionType === "true_false") {
      if (selectedTrueFalse === null) return;
      const answerIsCorrect =
        selectedTrueFalse === Boolean(currentQuestion.true_false_answer);
      if (!answerIsCorrect) {
        await applyWrongAnswerPenalty();
      }
      recordAnswerAttempt(answerIsCorrect);
      setIsCorrect(answerIsCorrect);
      return;
    }

    if (questionType === "fill_blank") {
      if (!selectedFillBlankOptionId && !fillBlankAnswer.trim()) return;
      const answerIsCorrect = selectedFillBlankOptionId
        ? selectedFillBlankOptionId === fillBlankCorrectOptionId
        : normalizeText(fillBlankAnswer) ===
          normalizeText(fillBlankCorrectAnswer);
      if (!answerIsCorrect) {
        await applyWrongAnswerPenalty();
      }
      recordAnswerAttempt(answerIsCorrect);
      setIsCorrect(answerIsCorrect);
      return;
    }

    if (questionType === "word_making" || questionType === "sentence_making") {
      if (selectedTokens.length === 0) return;
      const answerIsCorrect =
        JSON.stringify(selectedTokens) === JSON.stringify(orderedTokens);
      if (!answerIsCorrect) {
        await applyWrongAnswerPenalty();
      }
      recordAnswerAttempt(answerIsCorrect);
      setIsCorrect(answerIsCorrect);
      return;
    }

    if (questionType === "pair_matching") {
      const allPairsMatched =
        leftState.length > 0 && leftState.every((item) => item.matched);
      if (!allPairsMatched) {
        toast.error("Match all pairs before checking the answer.");
        return;
      }

      recordAnswerAttempt(true);
      setIsCorrect(true);
      return;
    }

    await goToNext();
  };

  const handleTokenClick = (token, index) => {
    if (isCorrect !== null) return;
    setSelectedTokens((prev) => [...prev, token]);
    setAvailableTokens((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveToken = (index) => {
    if (isCorrect !== null) return;
    const token = selectedTokens[index];
    setSelectedTokens((prev) => prev.filter((_, i) => i !== index));
    setAvailableTokens((prev) => [...prev, token]);
  };

  const checkMatch = (leftItem, rightItem) => {
    if (leftItem.matchKey === rightItem.matchKey) {
      setLeftState((prev) =>
        prev.map((item) =>
          item.id === leftItem.id ? { ...item, matched: true } : item,
        ),
      );
      setRightState((prev) =>
        prev.map((item) =>
          item.id === rightItem.id ? { ...item, matched: true } : item,
        ),
      );
    } else {
      setIncorrectPairs((prev) => [
        ...prev,
        { leftId: leftItem.id, rightId: rightItem.id },
      ]);
      if (!pairPenaltyApplied) {
        setPairPenaltyApplied(true);
        void applyWrongAnswerPenalty();
      }
      setTimeout(() => setIncorrectPairs([]), 450);
    }
    setTimeout(() => {
      setSelectedLeft(null);
      setSelectedRight(null);
    }, 200);
  };

  const handleLeftClick = (item) => {
    if (item.matched || isCorrect !== null) return;
    setSelectedLeft(item);
    if (selectedRight) {
      checkMatch(item, selectedRight);
    }
  };

  const handleRightClick = (item) => {
    if (item.matched || isCorrect !== null) return;
    setSelectedRight(item);
    if (selectedLeft) {
      checkMatch(selectedLeft, item);
    }
  };

  const learnAnswerEntry = useMemo(() => {
    if (questionType !== "learn") return ["", ""];
    return Object.entries(currentQuestion.learn_answer || {})[0] || ["", ""];
  }, [currentQuestion, questionType]);

  const matchedCount = leftState.filter((item) => item.matched).length;
  const isPairMatchingReadyToCheck =
    questionType === "pair_matching" &&
    leftState.length > 0 &&
    matchedCount === leftState.length;

  const handleRefillFromErrorState = async () => {
    if (isRefillingFromError) return;

    if (!isSessionValid(session)) {
      router.push("/auth/login");
      return;
    }

    const token = getSessionToken(session);
    if (!token) {
      toast.error("Session expired. Please login again.");
      router.push("/auth/login");
      return;
    }

    setIsRefillingFromError(true);
    try {
      const refillResult = await refillPalmTrees(token);

      if (!refillResult.success) {
        toast.error(refillResult.error || "Unable to refill Palm Trees.");
        return;
      }

      await fetchProfile(token, true, getUserKey(session));
      toast.success(
        refillResult.message || "Palm Trees refilled successfully.",
      );
      router.refresh();
    } finally {
      setIsRefillingFromError(false);
    }
  };

  if (isLoading || isNavigatingToCompletion) {
    return <LessonLoadingView progress={65} />;
  }

  if (loadError) {
    const isLifeError = /heart|life|palm/i.test(loadError);

    return (
      <div className="min-h-screen sm:min-h-[calc(100vh_-_64px)] lg:min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-lg text-center space-y-5 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-lg">
          <Mascot mood="sad" size="xxl" className="w-32 h-32 mx-auto" />
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {isLifeError
                ? "No Palm Trees left for this lesson"
                : "Lesson unavailable"}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
              {isLifeError
                ? "Take a short break, refill your Palm Trees, and come back ready to continue the journey."
                : loadError}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push("/")}
              className="px-5 py-3 rounded-xl bg-accent text-accent-foreground font-semibold"
            >
              Back to Home
            </button>
            {isLifeError ? (
              <button
                onClick={handleRefillFromErrorState}
                disabled={isRefillingFromError}
                className="px-5 py-3 rounded-xl border border-border bg-background text-foreground font-semibold"
              >
                {isRefillingFromError ? "Refilling..." : "Refill Palm Trees"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen sm:min-h-[calc(100vh_-_64px)] lg:min-h-screen bg-background flex flex-col">
      <AnimatePresence>
        {showFullMarksClaimedNotice ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[130] bg-background p-4 flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-lg mx-auto text-center bg-transparent lg:bg-card rounded-none lg:rounded-3xl shadow-none lg:shadow-lg border-0 lg:border lg:border-border p-0 lg:p-8"
            >
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.35 }}
                className="mb-6"
              >
                <Mascot mood="sad" size="xxl" className="w-32 h-32 mx-auto" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.35 }}
                className="text-3xl sm:text-4xl font-extrabold text-accent mb-4"
              >
                Perfect score again!
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.35 }}
                className="text-base sm:text-lg font-semibold text-foreground mb-2"
              >
                Great job. You nailed the exam.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.35 }}
                className="text-sm text-muted-foreground max-w-md mx-auto"
              >
                Full marks gift was already claimed earlier, so it cannot be
                collected again.
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.35 }}
                className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Continue when you&apos;re ready
              </motion.p>

              <button
                type="button"
                onClick={handleClaimedNoticeContinue}
                disabled={isCompletingFromNotice}
                className="w-full mt-6 h-14 bg-accent hover:opacity-90 text-accent-foreground font-bold text-lg rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isCompletingFromNotice ? "CONTINUING..." : "CONTINUE"}
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <LessonHeader
        progressPercentage={progressPercentage}
        onExit={() => setShowExitDialog(true)}
        elapsedSeconds={elapsedSeconds}
        palmTrees={palmTrees}
        maxPalmTrees={5}
      />

      {showExitDialog && (
        <div className="fixed inset-0 z-50">
          <LeavingDialog
            onCancel={() => setShowExitDialog(false)}
            onLeave={handleLeaveLesson}
          />
        </div>
      )}

      <div
        className={`flex-1 flex justify-center p-3 sm:p-4 ${
          questionType === "pair_matching"
            ? "items-start overflow-x-hidden"
            : "items-center"
        }`}
      >
        <div className="w-full max-w-4xl mx-auto">
          <motion.div
            key={currentQuestion?.id || currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 sm:space-y-6"
          >
            {questionType === "learn" && (
              <>
                <div className="flex flex-row items-center gap-3 sm:gap-4">
                  {audioUrl ? (
                    <>
                      <button
                        onClick={handlePlayAudio}
                        className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent flex items-center justify-center text-accent-foreground hover:opacity-90 self-start"
                      >
                        <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                      <button
                        onClick={handlePlayAudioSlow}
                        className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted flex items-center justify-center text-foreground hover:opacity-90 self-start"
                        aria-label="Play slow audio"
                      >
                        <Turtle className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                    </>
                  ) : null}
                  <div className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">
                    Learn
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 sm:gap-6 lg:gap-8">
                  <div className="lg:w-2/5 flex justify-center">
                    <div className="relative w-full max-w-[280px] sm:max-w-sm">
                      <div className="aspect-square bg-gradient-to-br from-accent/20 to-primary/10 rounded-xl sm:rounded-2xl p-2">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt="Learning illustration"
                            className="w-full h-full object-cover rounded-lg sm:rounded-xl"
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-3/5 w-full space-y-4 sm:space-y-6">
                    <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10">
                      <div className="text-center space-y-4">
                        <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
                          {learnAnswerEntry[1]
                            .split(/\s+/)
                            .filter(Boolean)
                            .map((word, index, words) => {
                              const pronunciation = learnAnswerEntry[0]
                                .split(/\s+/)
                                .filter(Boolean)[index];
                              const isLast = index === words.length - 1;
                              return (
                                <span key={`${word}-${index}`}>
                                  <ArabicTooltip
                                    text={word}
                                    pronunciation={pronunciation}
                                  />
                                  {isLast ? "" : " "}
                                </span>
                              );
                            })}
                        </h3>
                        <div className="h-px bg-border my-4" />
                        <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-muted-foreground">
                          {currentQuestion.question_title}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {questionType === "mcq" && (
              <>
                <div className="flex flex-row items-center gap-3 sm:gap-4">
                  {audioUrl ? (
                    <>
                      <button
                        onClick={handlePlayAudio}
                        className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent flex items-center justify-center text-accent-foreground hover:opacity-90 self-start"
                      >
                        <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                      <button
                        onClick={handlePlayAudioSlow}
                        className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted flex items-center justify-center text-foreground hover:opacity-90 self-start"
                        aria-label="Play slow audio"
                      >
                        <Turtle className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                    </>
                  ) : null}
                  <p className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">
                    Question
                  </p>
                </div>

                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-4 sm:mb-6 text-center sm:text-start">
                  {currentQuestion.question_title}
                </h2>

                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 sm:gap-6 lg:gap-8">
                  <div className="lg:w-2/5 flex justify-center">
                    <div className="relative w-full max-w-[280px] sm:max-w-sm">
                      <div className="aspect-square bg-gradient-to-br from-accent/20 to-primary/10 rounded-xl sm:rounded-2xl p-2">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt="Question illustration"
                            className="w-full h-full object-cover rounded-lg sm:rounded-xl"
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-3/5 w-full">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {mcqOptions.map((option, index) => (
                        <motion.button
                          key={option.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => setSelectedOptionId(option.id)}
                          disabled={isCorrect !== null}
                          className={`p-3 sm:p-4 md:p-6 w-full min-h-[80px] sm:min-h-[100px] rounded-lg sm:rounded-xl border-2 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
                            selectedOptionId === option.id
                              ? isCorrect === true
                                ? "border-green-500 bg-green-500/10 text-green-600"
                                : isCorrect === false
                                  ? "border-red-500 bg-red-500/10 text-red-600"
                                  : "border-accent bg-accent/10 text-foreground shadow-md sm:shadow-lg"
                              : "border-border bg-card text-foreground hover:border-accent hover:shadow-sm sm:hover:shadow-md"
                          }`}
                        >
                          <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-center leading-tight">
                            {option.text}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {questionType === "true_false" && (
              <>
                <div>
                  <p className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">
                    True or False?
                  </p>
                </div>

                <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground text-center">
                    {currentQuestion.question_title}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    onClick={() => setSelectedTrueFalse(true)}
                    disabled={isCorrect !== null}
                    className={`p-4 sm:p-6 md:p-8 w-full min-h-[100px] sm:min-h-[120px] rounded-xl sm:rounded-2xl border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-2 sm:gap-3 ${
                      selectedTrueFalse === true
                        ? isCorrect === true
                          ? "border-green-500 bg-green-500/10 text-green-600"
                          : isCorrect === false
                            ? "border-red-500 bg-red-500/10 text-red-600"
                            : "border-accent bg-accent/10 text-foreground"
                        : "border-border bg-card text-foreground hover:border-accent"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-2xl font-bold ${
                        selectedTrueFalse === true
                          ? isCorrect === true
                            ? "bg-green-500 text-white"
                            : isCorrect === false
                              ? "bg-red-500 text-white"
                              : "bg-accent text-white"
                          : "bg-muted text-foreground dark:bg-muted/80 dark:text-foreground"
                      }`}
                    >
                      <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-lg sm:text-xl font-bold">True</span>
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    onClick={() => setSelectedTrueFalse(false)}
                    disabled={isCorrect !== null}
                    className={`p-4 sm:p-6 md:p-8 w-full min-h-[100px] sm:min-h-[120px] rounded-xl sm:rounded-2xl border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-2 sm:gap-3 ${
                      selectedTrueFalse === false
                        ? isCorrect === true
                          ? "border-green-500 bg-green-500/10 text-green-600"
                          : isCorrect === false
                            ? "border-red-500 bg-red-500/10 text-red-600"
                            : "border-accent bg-accent/10 text-foreground"
                        : "border-border bg-card text-foreground hover:border-accent"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-2xl font-bold ${
                        selectedTrueFalse === false
                          ? isCorrect === true
                            ? "bg-green-500 text-white"
                            : isCorrect === false
                              ? "bg-red-500 text-white"
                              : "bg-accent text-white"
                          : "bg-muted text-foreground dark:bg-muted/80 dark:text-foreground"
                      }`}
                    >
                      <XIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-lg sm:text-xl font-bold">False</span>
                  </motion.button>
                </div>
              </>
            )}

            {questionType === "fill_blank" && (
              <>
                <div className="flex flex-row items-center gap-3 sm:gap-4">
                  {audioUrl ? (
                    <>
                      <button
                        onClick={handlePlayAudio}
                        className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent flex items-center justify-center text-accent-foreground hover:opacity-90 self-start"
                      >
                        <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                      <button
                        onClick={handlePlayAudioSlow}
                        className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted flex items-center justify-center text-foreground hover:opacity-90 self-start"
                        aria-label="Play slow audio"
                      >
                        <Turtle className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                    </>
                  ) : null}
                  <p className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">
                    Fill in the blank
                  </p>
                </div>

                <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-4 sm:mb-6 text-center leading-relaxed">
                    {fillBlankQuestionParts.hasBlank ? (
                      <>
                        {fillBlankQuestionParts.before}
                        <span className="inline-flex min-w-[110px] sm:min-w-[140px] mx-1 align-middle justify-center border-b-2 border-foreground/40 overflow-hidden leading-none py-1">
                          <AnimatePresence mode="wait">
                            {fillBlankAnswer ? (
                              <motion.span
                                key={fillBlankAnswer}
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 320,
                                  damping: 28,
                                }}
                                className="inline-block text-foreground"
                              >
                                {fillBlankAnswer}
                              </motion.span>
                            ) : (
                              <motion.span
                                key="blank"
                                initial={{ opacity: 0.6 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0.6 }}
                                className="inline-block text-muted-foreground"
                              >
                                {fillBlankQuestionParts.blank}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </span>
                        {fillBlankQuestionParts.after}
                      </>
                    ) : (
                      <>
                        {fillBlankQuestionParts.before}
                        <span className="inline-flex min-w-[110px] sm:min-w-[140px] mx-1 align-middle justify-center border-b-2 border-foreground/40 overflow-hidden leading-none py-1">
                          <AnimatePresence mode="wait">
                            {fillBlankAnswer ? (
                              <motion.span
                                key={fillBlankAnswer}
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 320,
                                  damping: 28,
                                }}
                                className="inline-block text-foreground"
                              >
                                {fillBlankAnswer}
                              </motion.span>
                            ) : (
                              <motion.span
                                key="blank-fallback"
                                initial={{ opacity: 0.6 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0.6 }}
                                className="inline-block text-muted-foreground"
                              >
                                ____
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </span>
                      </>
                    )}
                  </h2>
                  <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-3 sm:gap-4">
                    {fillBlankOptions.map((option, index) => {
                      const isSelected =
                        selectedFillBlankOptionId === option.id;

                      return (
                        <motion.button
                          key={option.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => {
                            setSelectedFillBlankOptionId(option.id);
                            setFillBlankAnswer(option.text);
                          }}
                          disabled={isCorrect !== null}
                          className={`p-3 sm:p-4 md:p-6 w-full min-h-[80px] sm:min-h-[100px] rounded-lg sm:rounded-xl border-2 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
                            isSelected
                              ? isCorrect === true
                                ? "border-green-500 bg-green-500/10 text-green-600"
                                : isCorrect === false
                                  ? "border-red-500 bg-red-500/10 text-red-600"
                                  : "border-accent bg-accent/10 text-foreground shadow-md sm:shadow-lg"
                              : "border-border bg-card text-foreground hover:border-accent hover:shadow-sm sm:hover:shadow-md"
                          }`}
                        >
                          <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-center leading-tight">
                            {option.text}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {(questionType === "word_making" ||
              questionType === "sentence_making") && (
              <>
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-4 sm:mb-6 text-center sm:text-start">
                    {currentQuestion.question_title}
                  </h2>
                </div>

                <div className="h-[136px] bg-card rounded-2xl border-2 border-border p-4 overflow-hidden">
                  {questionType === "word_making" ? (
                    selectedTokens.length === 0 ? (
                      <div className="h-full flex items-center justify-center">
                        <div
                          dir="rtl"
                          className="text-4xl sm:text-5xl font-bold text-foreground leading-tight tracking-normal"
                        >
                          ...
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-between gap-3">
                        <div
                          dir="rtl"
                          className="h-14 flex items-center justify-center text-4xl sm:text-5xl font-bold text-foreground leading-tight tracking-normal"
                        >
                          {diacritizedWordPreview}
                        </div>

                        <div
                          dir="rtl"
                          className="w-full h-10 flex flex-nowrap gap-2 justify-center items-center overflow-x-auto overflow-y-hidden"
                        >
                          {selectedTokens.map((token, index) => (
                            <motion.button
                              key={`${token}-${index}`}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              onClick={() => handleRemoveToken(index)}
                              disabled={isCorrect !== null}
                              className="px-3 py-2 shrink-0 bg-accent/15 text-foreground border border-accent/30 rounded-lg font-semibold text-base hover:bg-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {token}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )
                  ) : (
                    <div
                      dir="rtl"
                      className="h-full flex flex-wrap content-start gap-2 justify-center items-center overflow-y-auto"
                    >
                      {selectedTokens.map((token, index) => (
                        <motion.button
                          key={`${token}-${index}`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          onClick={() => handleRemoveToken(index)}
                          disabled={isCorrect !== null}
                          className="px-5 py-3 bg-accent text-accent-foreground rounded-xl font-bold text-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {token}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 justify-center">
                  {availableTokens.map((token, index) => (
                    <motion.button
                      key={`${token}-${index}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleTokenClick(token, index)}
                      disabled={isCorrect !== null}
                      className="px-4 py-3 bg-card border-2 border-border rounded-xl font-bold text-xl text-foreground hover:border-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {token}
                    </motion.button>
                  ))}
                </div>
              </>
            )}

            {questionType === "pair_matching" && (
              <>
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-4 sm:mb-6 text-center sm:text-start">
                    Match Arabic & English
                  </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                  <div className="w-full">
                    <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col overflow-hidden">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-foreground mb-2 sm:mb-3 text-center">
                        Arabic
                      </h3>
                      <div className="space-y-2.5 sm:space-y-4 pr-1">
                        {leftState.map((item, index) => {
                          const isSelected = selectedLeft?.id === item.id;
                          const isMatched = item.matched;
                          const isIncorrect = incorrectPairs.some(
                            (pair) => pair.leftId === item.id,
                          );

                          return (
                            <motion.button
                              key={item.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              onClick={() => handleLeftClick(item)}
                              disabled={isMatched}
                              className={`w-full p-2 sm:p-2.5 rounded-lg sm:rounded-xl border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[44px] sm:min-h-[50px] ${
                                isMatched
                                  ? "border-green-500 bg-green-500/10 text-green-600"
                                  : isIncorrect
                                    ? "border-red-500 bg-red-500/10 text-red-600"
                                    : isSelected
                                      ? "border-accent bg-accent/10 text-foreground shadow-md sm:shadow-lg"
                                      : "border-border bg-card text-foreground hover:border-accent hover:shadow-sm sm:hover:shadow-md"
                              }`}
                            >
                              <span className="text-base sm:text-lg md:text-xl font-bold text-center leading-tight">
                                {item.text}
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="w-full">
                    <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col overflow-hidden">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-foreground mb-2 sm:mb-3 text-center">
                        English
                      </h3>
                      <div className="space-y-2.5 sm:space-y-4 pr-1">
                        {rightState.map((item, index) => {
                          const isSelected = selectedRight?.id === item.id;
                          const isMatched = item.matched;
                          const isIncorrect = incorrectPairs.some(
                            (pair) => pair.rightId === item.id,
                          );

                          return (
                            <motion.button
                              key={item.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              onClick={() => handleRightClick(item)}
                              disabled={isMatched}
                              className={`w-full p-2 sm:p-2.5 rounded-lg sm:rounded-xl border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[44px] sm:min-h-[50px] ${
                                isMatched
                                  ? "border-green-500 bg-green-500/10 text-green-600"
                                  : isIncorrect
                                    ? "border-red-500 bg-red-500/10 text-red-600"
                                    : isSelected
                                      ? "border-accent bg-accent/10 text-foreground shadow-md sm:shadow-lg"
                                      : "border-border bg-card text-foreground hover:border-accent hover:shadow-sm sm:hover:shadow-md"
                              }`}
                            >
                              <span className="text-sm sm:text-base md:text-lg font-bold text-center leading-tight line-clamp-2">
                                {item.text}
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center text-sm sm:text-base text-muted-foreground mt-3 pb-1 sm:pb-2">
                  {matchedCount} of {leftState.length} pairs correctly matched
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>

      <div className="shrink-0">
        {questionType === "learn" ? (
          <div className="border-t-2 border-border bg-background min-h-[120px] flex flex-col justify-center">
            <div className="container max-w-4xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={goToNext}
                disabled={!hasPalmTrees}
                className="text-muted-foreground hover:text-foreground font-bold text-lg underline underline-offset-4 order-2 sm:order-1"
              >
                Skip
              </button>
              <button
                onClick={goToNext}
                disabled={!hasPalmTrees}
                className="w-full sm:w-auto sm:min-w-[200px] h-14 bg-accent hover:opacity-90 text-accent-foreground font-bold text-lg rounded-xl order-1 sm:order-2"
              >
                Continue
              </button>
            </div>
          </div>
        ) : (
          <LessonResultHandler
            isCorrect={isCorrect}
            correctAnswer={
              questionType === "mcq"
                ? mcqOptions.find((option) => option.correct)?.text
                : questionType === "true_false"
                  ? Boolean(currentQuestion.true_false_answer)
                    ? "True"
                    : "False"
                  : questionType === "fill_blank"
                    ? fillBlankCorrectAnswer
                    : questionType === "word_making" ||
                        questionType === "sentence_making"
                      ? orderedTokens.join(" ")
                      : !isCorrect && isCorrect !== null
                        ? "All pairs need to be correctly matched"
                        : undefined
            }
            onCheck={handleCheckAnswer}
            onContinue={goToNext}
            onSkip={goToNext}
            disabled={
              !hasPalmTrees ||
              (questionType === "mcq"
                ? !selectedOptionId
                : questionType === "true_false"
                  ? selectedTrueFalse === null
                  : questionType === "fill_blank"
                    ? !selectedFillBlankOptionId
                    : questionType === "pair_matching"
                      ? !isPairMatchingReadyToCheck
                      : questionType === "word_making" ||
                          questionType === "sentence_making"
                        ? selectedTokens.length === 0
                        : false)
            }
          />
        )}
      </div>
    </div>
  );
}
