import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function FilterChips({
  options,
  selected,
  onChange,
  multiple = false,
  className,
}) {
  const handleSelect = (id) => {
    if (multiple) {
      if (selected.includes(id)) {
        onChange(selected.filter((s) => s !== id));
      } else {
        onChange([...selected, id]);
      }
    } else {
      onChange([id]);
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => {
        const isSelected = selected.includes(option.id);

        return (
          <motion.button
            key={option.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(option.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200",
              isSelected
                ? "bg-accent text-accent-foreground shadow-accent"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            )}
          >
            {option.icon}
            {option.label}
          </motion.button>
        );
      })}
    </div>
  );
}
