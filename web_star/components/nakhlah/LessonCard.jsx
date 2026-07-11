import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Lock, Star, CheckCircle2 } from "lucide-react";

export function LessonCard({
  title,
  description,
  progress = 0,
  isLocked = false,
  isCompleted = false,
  xpReward,
  icon,
  onClick,
  className,
}) {
  return (
    <motion.div
      whileHover={!isLocked ? { scale: 1.02, y: -2 } : undefined}
      whileTap={!isLocked ? { scale: 0.98 } : undefined}
      onClick={!isLocked ? onClick : undefined}
      className={cn(
        "relative overflow-hidden rounded-2xl border-2 p-5 transition-all duration-300",
        isLocked
          ? "cursor-not-allowed border-muted bg-muted/50 opacity-60"
          : isCompleted
            ? "cursor-pointer border-palm bg-palm/10 shadow-md hover:shadow-lg"
            : "cursor-pointer border-border bg-card shadow-sm hover:border-accent hover:shadow-md",
        className,
      )}
    >
      {/* Injaz Badge */}
      {xpReward && !isLocked && (
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-primary px-2 py-1">
          <Star className="h-3 w-3 text-primary-foreground" />
          <span className="text-xs font-bold text-primary-foreground">
            +{xpReward} Injaz
          </span>
        </div>
      )}

      {/* Lock Icon */}
      {isLocked && (
        <div className="absolute right-4 top-4">
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>
      )}

      {/* Completed Icon */}
      {isCompleted && (
        <div className="absolute right-4 top-4">
          <CheckCircle2 className="h-6 w-6 text-palm" />
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Icon */}
        {icon && (
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-xl",
              isCompleted
                ? "bg-palm/20 text-palm"
                : isLocked
                  ? "bg-muted text-muted-foreground"
                  : "bg-accent/10 text-accent",
            )}
          >
            {icon}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              "font-bold text-lg",
              isLocked ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {description}
            </p>
          )}

          {/* Progress Bar */}
          {!isLocked && progress > 0 && (
            <div className="mt-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full",
                    isCompleted ? "bg-palm" : "bg-accent",
                  )}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {progress}% complete
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
