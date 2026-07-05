import MissionCard from "./MissionCard";

export default function MissionSection({ section }) {
  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-lg">
            {section.icon}
          </div>
          <div>
            <h3 className="font-bold text-foreground text-lg">
              {section.title}
            </h3>
            <p className="text-xs text-muted-foreground">
              {section.description}
            </p>
          </div>
        </div>

        <span className="text-sm font-semibold text-accent px-3 py-1 rounded-full bg-muted/50">
          {section.missions.length} quests
        </span>
      </div>

      {/* Grid on desktop, list on mobile */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {section.missions.map((mission, index) => (
          <MissionCard key={index} mission={mission} />
        ))}
      </div>
    </div>
  );
}
