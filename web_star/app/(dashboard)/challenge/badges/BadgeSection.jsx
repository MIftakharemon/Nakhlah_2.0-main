import { Calendar } from "lucide-react";
import BadgeCard from "./BadgeCard";

export default function BadgeSection({ section }) {
  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </div>
          <h3 className="font-bold text-foreground text-lg">{section.title}</h3>
        </div>

        <span className="text-sm font-semibold text-accent px-3 py-1 rounded-full bg-muted/50">
          {section.badges.length} total
        </span>
      </div>

      {section.description && (
        <p className="text-sm text-muted-foreground px-1">
          {section.description}
        </p>
      )}

      {/* Grid on desktop, list on mobile */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {section.badges.map((badge) => (
          <BadgeCard key={badge.key || badge.title} badge={badge} />
        ))}
      </div>
    </div>
  );
}
