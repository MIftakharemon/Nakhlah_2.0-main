import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Mascot } from "../Mascot";

export function PurposeStep({ title, purposes = [], selectedPurpose, onSelect, getMediaUrl }) {
  return (
    <div className="w-full max-w-xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex items-center gap-8 justify-center"
      >
        <Mascot mood="thinking" size="md" className="" />
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            {title}
          </h1>
          <p className="text-muted-foreground text-lg">
            Choose the one that matches you best
          </p>
        </div>
      </motion.div>

      <div className="flex flex-col gap-4">
        {purposes.map((purpose, index) => (
          <motion.button
            key={purpose.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            onClick={() => onSelect(purpose.id)}
            className={cn(
              "flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-300",
              "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
              selectedPurpose === purpose.id
                ? "border-accent bg-accent/10 shadow-accent-glow"
                : "border-border bg-card hover:border-primary"
            )}
          >
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                selectedPurpose === purpose.id
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted"
              )}
            >
              {purpose?.purposeMedia?.url ? (
                <img
                  src={getMediaUrl(purpose.purposeMedia.url)}
                  alt={purpose?.purposeMedia?.alt || purpose.purposeTitle}
                  className="w-7 h-7 object-contain"
                />
              ) : (
                <span className="text-xs font-bold text-muted-foreground">🎯</span>
              )}
            </div>
            <p className="font-bold text-foreground text-lg text-left flex-1">
              {purpose.purposeTitle}
            </p>
            {selectedPurpose === purpose.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 rounded-full bg-accent flex items-center justify-center"
              >
                <svg
                  className="w-4 h-4 text-accent-foreground"
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
        ))}
      </div>
    </div>
  );
}
