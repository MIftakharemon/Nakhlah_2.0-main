import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

export const SectionHeader = ({ title, subtitle, colorVariant }) => {
  const colorClasses = {
    green: "bg-section-green",
    purple: "bg-section-purple",
    orange: "bg-section-orange",
  };

  return (
    <motion.div
      className={`
        w-full max-w-lg mx-auto
        ${colorClasses[colorVariant]}
        rounded-2xl px-4 py-3
        flex items-center justify-between
        shadow-lg
      `}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <div className="text-left">
        <h3 className="text-accent-foreground font-bold text-base md:text-lg">{title}</h3>
        <p className="text-accent-foreground/80 text-xs md:text-sm">{subtitle}</p>
      </div>
      <div className="bg-card/20 rounded-xl p-2">
        <BookOpen className="w-5 h-5 text-accent-foreground" />
      </div>
    </motion.div>
  );
};
