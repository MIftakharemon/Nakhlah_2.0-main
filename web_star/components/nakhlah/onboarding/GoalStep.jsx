import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Mascot } from "../Mascot";

export function GoalStep({ title, goals = [], selectedGoal, onSelect, getMediaUrl }) {
  return (
    <div className="w-full max-w-xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex items-center gap-8 justify-center"
      >
        <Mascot mood="sleeping" size="md" className="" />
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            {title}
          </h1>
          <p className="text-muted-foreground text-lg">
            How much time can you dedicate each day?
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        {goals.map((goal, index) => {
          const value = String(goal.goalTime);
          return (
            <motion.button
              key={goal.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelect(value)}
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-300",
                "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
                selectedGoal === value
                  ? "border-accent bg-accent/10 shadow-accent-glow"
                  : "border-border bg-card hover:border-primary"
              )}
            >
              <div
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
                  selectedGoal === value
                    ? "bg-accent text-accent-foreground"
                    : "bg-gradient-accent text-accent-foreground"
                )}
              >
                {goal?.goalMedia?.url ? (
                  <img
                    src={getMediaUrl(goal.goalMedia.url)}
                    alt={goal?.goalMedia?.alt || `${value} minutes`}
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <span className="font-bold">⏱</span>
                )}
              </div>
              <div className="text-center">
                <p className="text-accent font-semibold text-sm">
                  {value} min / day
                </p>
              </div>
              {selectedGoal === value && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center"
                >
                  <svg
                    className="w-3 h-3 text-accent-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-4 rounded-xl bg-secondary/10 border border-secondary/20"
      >
        <p className="text-center text-sm text-muted-foreground">
          💡 <span className="text-foreground font-medium">Tip:</span> You can
          always change your daily goal later in settings
        </p>
      </motion.div>
    </div>
  );
}
