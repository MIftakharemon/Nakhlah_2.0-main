"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import LogoAnimation from "@/components/icons/Logo";

const MESSAGES = [
  "Getting your journey ready...",
  "Loading your lessons...",
  "Preparing your progress...",
  "Almost there...",
  "Fetching your quests...",
];

/**
 * PageLoader
 *
 * Shows a CSS placeholder immediately on mount (zero WASM cost),
 * then swaps to the Camel Lottie animation after hydration settles.
 * Fades out smoothly when isLoading becomes false.
 *
 * Usage:
 *   <PageLoader />
 *   <PageLoader isLoading={bool} />
 *   <PageLoader isLoading={bool} message="Custom..." onDone={() => ...} />
 *
 * Props:
 *   isLoading  {boolean}   default true
 *   message    {string}    optional fixed message (overrides cycling)
 *   onDone     {function}  called after exit animation completes
 */
export function PageLoader({ isLoading = true, message, onDone }) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) return;
    const msgTimer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 1800);
    return () => clearInterval(msgTimer);
  }, [isLoading]);

  return (
    <AnimatePresence onExitComplete={onDone}>
      {isLoading && (
        <motion.div
          key="page-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background"
        >
          <LogoAnimation className="w-44 mb-2" />

          {/* App name */}
          <motion.p
            className="mt-2 text-2xl font-extrabold tracking-wide text-accent"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Nakhlah
          </motion.p>

          {/* Cycling message */}
          <div className="mt-3 h-6 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={message ?? msgIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-muted-foreground text-center"
              >
                {message ?? MESSAGES[msgIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Animated dots */}
          <div className="mt-5 flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-2 h-2 rounded-full bg-accent/60"
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                transition={{
                  repeat: Infinity,
                  duration: 1,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
