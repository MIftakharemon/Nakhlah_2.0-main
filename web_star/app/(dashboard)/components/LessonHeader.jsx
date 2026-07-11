"use client";

import { useMemo } from "react";
import { X, Clock3 } from "lucide-react";
import { PalmIcon } from "@/components/icons/PublicAssetIcons";
import { NotoStopwatch } from "@/components/icons/NotoStopwatch";

function formatTime(totalSeconds) {
  const clamped = Math.max(0, totalSeconds);
  const minutes = Math.floor(clamped / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (clamped % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function LessonHeader({
  progressPercentage,
  onExit,
  elapsedSeconds = 0,
  palmTrees = 5,
  maxPalmTrees = 5,
}) {
  const normalizedProgress = useMemo(
    () => Math.max(0, Math.min(100, progressPercentage || 0)),
    [progressPercentage],
  );

  return (
    <div className="border-b border-border">
      <div className="container max-w-4xl mx-auto px-4 py-4 sm:py-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onExit}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Exit lesson"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <div className="flex-1 h-2 sm:h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${normalizedProgress}%` }}
            />
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border">
            <NotoStopwatch size="xs" />
            <span className="text-sm font-bold text-foreground">
              {formatTime(elapsedSeconds)}
            </span>
          </div>

          <div className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full bg-card border border-border">
            {Array.from({ length: maxPalmTrees }).map((_, index) => (
              <PalmIcon
                key={index}
                size="sm"
                className={index < palmTrees ? "opacity-100" : "opacity-30"}
              />
            ))}
          </div>
        </div>

        <div className="sm:hidden mt-3 flex items-center justify-end">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border">
            <Clock3 className="w-4 h-4 text-accent" />
            <span className="text-sm font-bold text-foreground">
              {formatTime(elapsedSeconds)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
