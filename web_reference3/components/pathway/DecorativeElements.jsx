import { motion } from "framer-motion";
import { Trophy, Star, Sparkles, Crown, Zap } from "lucide-react";

export const DecorativeElement = ({ type, position, delay = 0 }) => {
  const positionClass =
    position === "left" ? "-left-8 md:-left-12" : "-right-8 md:-right-12";

  const icons = {
    trophy: (
      <Trophy className="w-6 h-6 md:w-8 md:h-8 text-secondary fill-secondary" />
    ),
    star: (
      <Star className="w-5 h-5 md:w-7 md:h-7 text-secondary fill-secondary sparkle" />
    ),
    sparkle: <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary" />,
    crown: (
      <Crown className="w-6 h-6 md:w-7 md:h-7 text-secondary fill-secondary" />
    ),
    zap: (
      <Zap className="w-5 h-5 md:w-6 md:h-6 text-section-orange fill-section-orange" />
    ),
  };

  return (
    <motion.div
      className={`absolute ${positionClass} top-1/2 -translate-y-1/2`}
      initial={{ opacity: 0, scale: 0, rotate: -20 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ delay, type: "spring", stiffness: 300 }}
    >
      {icons[type]}
    </motion.div>
  );
};

export const ConnectorLine = ({ completed }) => (
  <div
    className={`
      w-1 h-12 md:h-16 rounded-full mx-auto
      ${completed ? "bg-accent" : "bg-muted"}
      transition-colors duration-300
    `}
  />
);
