import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ProgressSteps({
  steps,
  currentStep,
  className,
}) {
  const percent = Math.max(0, ((currentStep - 1) / (steps.length - 1)) * 100);

  return (
    <div className={cn("w-full", className)}>
      <div className="w-full h-2 bg-muted dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${percent}%` }}
          transition={{ type: "spring", stiffness: 160, damping: 20 }}
          className="h-full bg-accent shadow-sm"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
