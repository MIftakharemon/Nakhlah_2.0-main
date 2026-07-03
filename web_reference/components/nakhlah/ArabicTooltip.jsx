import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * ArabicTooltip component for displaying pronunciation tooltips on Arabic words.
 * @param {string} text - The Arabic text to display
 * @param {string} pronunciation - The pronunciation word to show in tooltip
 * @param {string} children - Child content
 */
export function ArabicTooltip({ text, pronunciation }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help border-b border-dotted border-foreground/30 hover:border-foreground/60 hover:text-accent transition-colors">
            {text}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-foreground text-background">
          <p className="text-sm font-medium">{pronunciation}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
