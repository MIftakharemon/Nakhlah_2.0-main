import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function XPDisplay({ current, nextLevel, level, className }) {
  const progress = (current / nextLevel) * 100;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
            <Sparkles className="h-4 w-4 text-accent-foreground" />
          </div>
          <span className="font-bold text-foreground">Level {level}</span>
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {current} / {nextLevel} Injaz
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-accent"
          style={{ background: "var(--gradient-accent)" }}
        />
      </div>
    </div>
  );
}
