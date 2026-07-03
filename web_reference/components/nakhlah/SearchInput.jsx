import * as React from "react";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

export const SearchInput = React.forwardRef(
  ({ className, value, onChange, onClear, ...props }, ref) => {
    const hasValue = value && String(value).length > 0;

    return (
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={ref}
          value={value}
          onChange={onChange}
          className={cn(
            "h-12 w-full rounded-xl border-2 border-border bg-background pl-12 pr-10 text-base font-medium text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all duration-200",
            className
          )}
          {...props}
        />
        {hasValue && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";
