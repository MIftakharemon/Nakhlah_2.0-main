"use client";

import { Toaster as Sonner } from "sonner";
import { useTheme } from "next-themes";
import { CheckCircle2, XCircle, Info, AlertCircle } from "lucide-react";

export function CustomToaster() {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme}
      position="bottom-right"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "group relative flex items-start gap-3 w-[min(380px,calc(100vw-2rem))] p-4 pr-8 rounded-lg border shadow-lg backdrop-blur-sm transition-all",
          title: "font-bold text-base leading-tight",
          description: "text-sm opacity-90 mt-1 leading-relaxed",
          actionButton:
            "px-4 py-2 rounded-md bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity",
          cancelButton:
            "px-4 py-2 rounded-md bg-muted text-muted-foreground font-semibold hover:opacity-90 transition-opacity",
          closeButton:
            "absolute top-2 right-2 left-auto p-1.5 rounded-md hover:bg-muted/60 transition-colors",
          success:
            "bg-green-50 dark:bg-green-900/40 border-green-400 text-green-900 dark:text-green-200",
          error:
            "bg-red-50 dark:bg-red-900/40 border-red-400 text-red-900 dark:text-red-200",
          warning:
            "bg-amber-50 dark:bg-amber-900/40 border-amber-400 text-amber-900 dark:text-amber-200",
          info: "bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-800 dark:text-blue-200",
          default: "bg-card border-border text-foreground",
        },
      }}
      icons={{
        success: <CheckCircle2 className="w-5 h-5 flex-shrink-0" />,
        error: <XCircle className="w-5 h-5 flex-shrink-0" />,
        warning: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
        info: <Info className="w-5 h-5 flex-shrink-0" />,
      }}
      // Mobile positioning: bottom center, desktop: bottom right
      className="z-[100] [&_[data-close-button]]:left-auto [&_[data-close-button]]:right-2 [&_[data-close-button]]:top-2"
      duration={4000}
      closeButton
      richColors={false}
      expand={false}
      visibleToasts={3}
    />
  );
}

/**
 * Toast helper function with app-specific styling
 */
export { toast } from "sonner";
