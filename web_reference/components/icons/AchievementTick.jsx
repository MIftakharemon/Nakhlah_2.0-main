import { Check } from "lucide-react";

export default function AchievementTick({ className = "" }) {
  return (
    <span
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-sm ring-2 ring-background ${className}`}
      aria-label="Achieved"
    >
      <Check className="h-3.5 w-3.5" strokeWidth={3} />
    </span>
  );
}
