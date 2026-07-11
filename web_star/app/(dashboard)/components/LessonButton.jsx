
'use client'
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function LessonButton({
  type,
  title,
  isCompleted,
  isCurrent,
  icon,
}) {
  const isLocked = !isCompleted && !isCurrent;

  const buttonClasses = cn(
    "relative w-24 h-24 rounded-full border-b-8 shadow-lg transform transition-transform duration-200 hover:scale-105",
    {
      "bg-gray-300 dark:bg-gray-600 border-gray-400 dark:border-gray-500 cursor-not-allowed":
        isLocked,
      "bg-green-500 border-green-700 text-white": isCompleted,
      "bg-blue-500 border-blue-700 text-white animate-pulse": isCurrent,
    }
  );

  const iconClasses = cn("w-10 h-10 mx-auto", {
    "text-gray-500 dark:text-gray-400": isLocked,
    "text-white": isCompleted || isCurrent,
  });

  const renderButton = () => (
    <Button
      className={buttonClasses}
      disabled={isLocked}
      aria-label={title}
      variant={isLocked ? "secondary" : "default"}
    >
      <div className={iconClasses}>{icon}</div>
    </Button>
  );

  return (
    <div className="flex flex-col items-center space-y-2">
      {isLocked ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{renderButton()}</TooltipTrigger>
            <TooltipContent>
              <p>Complete the previous lesson to unlock</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        renderButton()
      )}
      <p className="text-sm font-semibold text-center">{title}</p>
    </div>
  );
}
