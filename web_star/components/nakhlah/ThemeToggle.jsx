"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

export function ThemeToggle({ className, variant = "default" }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const toggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  if (variant === "icon") {
    return (
      <button
        onClick={toggle}
        aria-label="Toggle theme"
        className={cn("relative flex items-center justify-center", className)}
      >
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ scale: 0.6, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.6, rotate: 90, opacity: 0 }}
            >
              <Moon className="h-6 w-6 text-accent-foreground" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ scale: 0.6, rotate: 90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.6, rotate: -90, opacity: 0 }}
            >
              <Sun className="h-6 w-6 text-orange-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={cn(
        "relative flex h-10 w-20 items-center rounded-full border-2 border-border p-1 transition-colors",
        className,
      )}
    >
      <motion.div
        layout
        animate={{ x: isDark ? 36 : 0 }}
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full",
          isDark ? "bg-accent" : "bg-primary",
        )}
      >
        {isDark ? <Moon /> : <Sun />}
      </motion.div>
    </button>
  );
}
