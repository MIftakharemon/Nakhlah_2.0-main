"use client";

import { motion } from "framer-motion";
import { Mascot } from "@/components/nakhlah/Mascot";
import Link from "next/link";

const ERROR_CONFIGS = {
  unauthenticated: {
    mood: "sad",
    quote: "Oops! You need to log in first.",
    subtext:
      "Your journey is waiting — sign in to continue where you left off.",
    primaryLabel: "LOG IN",
    primaryHref: "/auth/login",
    secondaryLabel: "CREATE AN ACCOUNT",
    secondaryHref: "/onboarding",
  },
  network: {
    mood: "confused",
    quote: "Hmm… I can't reach the server.",
    subtext: "Check your internet connection and try again. I'll be here!",
    primaryLabel: "TRY AGAIN",
    primaryHref: null, // triggers onRetry
    secondaryLabel: "GO HOME",
    secondaryHref: "/",
  },
  generic: {
    mood: "sad",
    quote: "Something went wrong!",
    subtext: "I couldn't load your journey right now. Let's try again.",
    primaryLabel: "TRY AGAIN",
    primaryHref: null,
    secondaryLabel: "GO HOME",
    secondaryHref: "/",
  },
};

function detectErrorType(errorMessage = "") {
  const msg = errorMessage.toLowerCase();
  if (
    msg.includes("login") ||
    msg.includes("auth") ||
    msg.includes("session") ||
    msg.includes("unauthenticated") ||
    msg.includes("unauthorized")
  )
    return "unauthenticated";
  if (
    msg.includes("network") ||
    msg.includes("fetch") ||
    msg.includes("connect")
  )
    return "network";
  return "generic";
}

export function JourneyErrorFallback({ error = "", onRetry }) {
  const errorType = detectErrorType(error);
  const config = ERROR_CONFIGS[errorType];

  const PrimaryButton = config.primaryHref ? (
    <Link
      href={config.primaryHref}
      className="w-full bg-accent hover:opacity-90 text-white font-bold text-lg py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center"
    >
      {config.primaryLabel}
    </Link>
  ) : (
    <button
      onClick={onRetry}
      className="w-full bg-accent hover:opacity-90 text-white font-bold text-lg py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center"
    >
      {config.primaryLabel}
    </button>
  );

  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center p-8">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-full max-w-sm text-center"
      >
        {/* Speech Bubble */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative inline-block mb-8"
        >
          <div className="bg-card px-8 py-4 rounded-3xl shadow-lg border border-border max-w-xs">
            <p className="text-xl font-semibold text-foreground">
              {config.quote}
            </p>
          </div>
          {/* Bubble tail pointing down toward mascot */}
          <div
            className="absolute left-1/2 -bottom-3 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: "12px solid transparent",
              borderRight: "12px solid transparent",
              borderTop: "12px solid hsl(var(--card))",
            }}
          />
        </motion.div>

        {/* Mascot */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.3,
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
          className="mb-6 flex justify-center"
        >
          <Mascot mood={config.mood} size="xxl" />
        </motion.div>

        {/* Subtext */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-base text-muted-foreground max-w-xs mx-auto leading-relaxed mb-8"
        >
          {config.subtext}
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col gap-4 max-w-xs mx-auto"
        >
          {PrimaryButton}

          <Link
            href={config.secondaryHref}
            className="w-full text-accent font-bold text-lg py-4 rounded-2xl hover:bg-accent/10 transition-all duration-200 flex items-center justify-center"
          >
            {config.secondaryLabel}
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
