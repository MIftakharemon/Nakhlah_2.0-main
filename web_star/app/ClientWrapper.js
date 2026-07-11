"use client";

import { useEffect, useRef, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/nakhlah/Navbar";
import { getSessionToken, isSessionValid } from "@/lib/authUtils";
import { getUserKey } from "@/lib/userKey";
import { useDailyQuestStore } from "@/stores/useDailyQuestStore";

const ACTIVE_SECONDS_STORAGE_PREFIX = "nakhlah:active-seconds";
const CLAIMED_SPEND_MINUTES_PREFIX = "nakhlah:daily-quest:spend-minutes";

const getDateKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getSpendMinutesQuest = (challengeStatuses = []) => {
  const aliases = ["spendMinutes", "practiceTime"];
  return challengeStatuses.find((item) => {
    const challengeId = item?.challengeId || "";
    const status = (item?.status || "pending").toLowerCase();
    return aliases.includes(challengeId) && status !== "completed";
  });
};

export default function ClientWrapper({ children }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const fetchDailyQuests = useDailyQuestStore((store) => store.fetchDailyQuests);
  const claimQuestIfAvailable = useDailyQuestStore((store) => store.claimQuestIfAvailable);
  const challengeStatuses = useDailyQuestStore((store) => store.challengeStatuses);
  const hideNavbar = pathname === "/onboarding" || pathname === "/get-started";
  const activeAtRef = useRef(null);
  const isClaimingSpendMinutesRef = useRef(false);

  // Initialize QueryClient inside the client component
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  }));

  useEffect(() => {
    if (status === "loading") return;
    if (!isSessionValid(session)) return;

    const token = getSessionToken(session);
    if (!token) return;

    fetchDailyQuests({ token, userKey: getUserKey(session) });
  }, [fetchDailyQuests, session, status]);

  useEffect(() => {
    if (status === "loading") return;

    if (!isSessionValid(session)) {
      activeAtRef.current = null;
      return;
    }

    const token = getSessionToken(session);
    if (!token) return;

    const userKey = getUserKey(session);
    const dateKey = getDateKey();
    const secondsStorageKey = `${ACTIVE_SECONDS_STORAGE_PREFIX}:${userKey}:${dateKey}`;
    const claimedStorageKey = `${CLAIMED_SPEND_MINUTES_PREFIX}:${userKey}:${dateKey}`;

    const writeActiveSeconds = (nextSeconds) => {
      sessionStorage.setItem(secondsStorageKey, String(Math.max(0, nextSeconds)));
    };

    const readActiveSeconds = () => {
      return Number(sessionStorage.getItem(secondsStorageKey) || 0) || 0;
    };

    const isUserActive = () =>
      document.visibilityState === "visible" && document.hasFocus();

    const updateActiveSeconds = () => {
      const now = Date.now();

      if (!isUserActive()) {
        activeAtRef.current = null;
        return readActiveSeconds();
      }

      if (activeAtRef.current == null) {
        activeAtRef.current = now;
        return readActiveSeconds();
      }

      const elapsedSeconds = Math.max(0, Math.floor((now - activeAtRef.current) / 1000));
      activeAtRef.current = now;

      if (elapsedSeconds <= 0) {
        return readActiveSeconds();
      }

      const nextTotalSeconds = readActiveSeconds() + elapsedSeconds;
      writeActiveSeconds(nextTotalSeconds);
      return nextTotalSeconds;
    };

    const tryClaimSpendMinutes = async () => {
      if (isClaimingSpendMinutesRef.current) return;
      if (sessionStorage.getItem(claimedStorageKey) === "true") return;

      const spendMinutesQuest = getSpendMinutesQuest(challengeStatuses);
      if (!spendMinutesQuest) return;

      const requiredMinutes = Number(spendMinutesQuest?.details?.required);
      const thresholdMinutes = Number.isFinite(requiredMinutes)
        ? requiredMinutes
        : 10;
      const thresholdSeconds = thresholdMinutes * 60;
      const activeSeconds = updateActiveSeconds();

      if (activeSeconds < thresholdSeconds) return;

      isClaimingSpendMinutesRef.current = true;
      const claimResult = await claimQuestIfAvailable({
        token,
        userKey,
        questKey: "spendMinutes",
      });

      if (claimResult?.success) {
        sessionStorage.setItem(claimedStorageKey, "true");
      }

      isClaimingSpendMinutesRef.current = false;
    };

    const tick = () => {
      updateActiveSeconds();
      void tryClaimSpendMinutes();
    };

    activeAtRef.current = Date.now();
    const intervalId = window.setInterval(tick, 10000);
    const onVisibilityChange = () => tick();
    const onFocus = () => {
      activeAtRef.current = Date.now();
      tick();
    };

    window.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onFocus);
      activeAtRef.current = null;
    };
  }, [challengeStatuses, claimQuestIfAvailable, session, status]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {!hideNavbar && <Navbar />}
        {children}
      </TooltipProvider>
    </QueryClientProvider>
  );
}