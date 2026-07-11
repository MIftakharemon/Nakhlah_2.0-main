"use client";

export function StreakCalendar({ activities = {} }) {
  // Generate calendar for the last 30 days with activity highlights
  const getDaysArray = () => {
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    return days;
  };

  const days = getDaysArray();

  const isActivityDay = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return activities[dateStr] || false;
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((date, index) => {
          const hasActivity = isActivityDay(date);
          const today = new Date();
          const isToday =
            date.toISOString().split("T")[0] ===
            today.toISOString().split("T")[0];

          return (
            <div
              key={index}
              className={`
                flex items-center justify-center w-full aspect-square rounded-lg text-xs font-semibold
                transition-all cursor-default
                ${
                  hasActivity
                    ? "bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-md"
                    : isToday
                      ? "bg-muted border-2 border-orange-500 text-foreground"
                      : "bg-muted text-muted-foreground"
                }
              `}
              title={date.toLocaleDateString()}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
        <div className="w-3 h-3 rounded bg-muted"></div>
        <span>No activity</span>
        <div className="w-3 h-3 rounded bg-gradient-to-r from-orange-400 to-orange-600"></div>
        <span>Activity</span>
      </div>
    </div>
  );
}
