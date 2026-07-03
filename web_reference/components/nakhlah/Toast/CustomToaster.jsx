"use client";

import { useEffect } from "react";
import { Toaster as Sonner, toast } from "sonner";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { CheckCircle2, XCircle, Info, AlertCircle } from "lucide-react";

const NAVIGATION_TOAST_KEY = "nakhlah:pending-navigation-toast";
const NAVIGATION_TOAST_MAX_AGE_MS = 30000;

export function queueToastAfterNavigation(type, message) {
  if (typeof window === "undefined" || !message) return;

  sessionStorage.setItem(
    NAVIGATION_TOAST_KEY,
    JSON.stringify({
      type,
      message,
      createdAt: Date.now(),
    }),
  );
}

export function CustomToaster() {
  const { theme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const rawToast = sessionStorage.getItem(NAVIGATION_TOAST_KEY);
    if (!rawToast) return undefined;

    sessionStorage.removeItem(NAVIGATION_TOAST_KEY);

    try {
      const pendingToast = JSON.parse(rawToast);
      const isFresh =
        Date.now() - Number(pendingToast?.createdAt || 0) <
        NAVIGATION_TOAST_MAX_AGE_MS;
      const toastType = pendingToast?.type || "message";
      const toastMessage = pendingToast?.message;

      if (!isFresh || !toastMessage) return undefined;

      const timerId = window.setTimeout(() => {
        if (typeof toast[toastType] === "function") {
          toast[toastType](toastMessage);
          return;
        }

        toast(toastMessage);
      }, 150);

      return () => window.clearTimeout(timerId);
    } catch {
      return undefined;
    }
  }, [pathname]);

  return (
    <Sonner
      theme={theme}
      position="bottom-right"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "group relative grid grid-cols-[auto_1fr] items-center gap-3 w-[min(380px,calc(100vw-2rem))] min-h-[64px] rounded-md border px-4 py-3.5 pr-10 shadow-lg backdrop-blur-sm transition-all",
          icon: "flex flex-shrink-0 items-center justify-center",
          content: "min-w-0",
          title: "text-[15px] font-semibold leading-5 tracking-normal",
          description: "mt-1 text-sm opacity-90 leading-relaxed",
          actionButton:
            "px-4 py-2 rounded-md bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity",
          cancelButton:
            "px-4 py-2 rounded-md bg-muted text-muted-foreground font-semibold hover:opacity-90 transition-opacity",
          closeButton:
            "absolute right-2 top-2 left-auto grid h-6 w-6 place-items-center rounded-none border-0 bg-transparent p-0 text-current opacity-70 shadow-none transition-opacity hover:bg-transparent hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
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
      className="z-[100] [&_[data-close-button]]:!left-auto [&_[data-close-button]]:!right-2 [&_[data-close-button]]:!top-2 [&_[data-close-button]]:!translate-x-0 [&_[data-close-button]]:!translate-y-0 [&_[data-close-button]]:!border-0 [&_[data-close-button]]:!bg-transparent [&_[data-close-button]]:!shadow-none [&_[data-close-button]>svg]:h-3.5 [&_[data-close-button]>svg]:w-3.5"
      duration={6000}
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
