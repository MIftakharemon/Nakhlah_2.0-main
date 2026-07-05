import { motion } from "framer-motion";
import { Check, Lock, Star } from "lucide-react";

export const PathwayNode = ({
  id,
  label,
  completed,
  active,
  locked,
  onClick,
}) => {
  const getNodeClasses = () => {
    if (completed) {
      return "bg-accent pathway-node-shadow-completed";
    }
    if (active) {
      return "bg-secondary pathway-node-shadow node-bounce pulse-glow";
    }
    if (locked) {
      return "bg-node-locked pathway-node-shadow-locked";
    }
    return "bg-secondary pathway-node-shadow";
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={locked}
      className={`
        relative flex items-center justify-center
        w-16 h-16 md:w-20 md:h-20
        rounded-full
        transition-all duration-200
        ${getNodeClasses()}
        ${locked ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:scale-105 active:scale-95"}
      `}
      whileHover={!locked ? { y: -4 } : undefined}
      whileTap={!locked ? { scale: 0.95 } : undefined}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {completed ? (
        <Check className="w-8 h-8 md:w-10 md:h-10 text-accent-foreground" strokeWidth={3} />
      ) : locked ? (
        <Lock className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground" />
      ) : active ? (
        <Star className="w-8 h-8 md:w-10 md:h-10 text-secondary-foreground fill-current" />
      ) : (
        <span className="text-xl md:text-2xl font-bold text-secondary-foreground">{id}</span>
      )}

      {/* START button for active node */}
      {active && (
        <motion.div
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-4 py-1.5 rounded-xl font-bold text-sm shadow-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          START
        </motion.div>
      )}
    </motion.button>
  );
};
