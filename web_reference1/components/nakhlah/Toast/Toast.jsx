"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function Toast({
  id,
  title,
  description,
  variant,
  open,
  actionLabel = "CONTINUE",
  onAction,
  onOpenChange,
}) {
  const variants = {
    success: {
      bg: "bg-emerald-500",
      icon: <CheckCircle2 className="w-5 h-5 text-white" />,
      buttonText: "text-emerald-600",
    },
    error: {
      bg: "bg-rose-500",
      icon: <XCircle className="w-5 h-5 text-white" />,
      buttonText: "text-rose-600",
    },
    warning: {
      bg: "bg-amber-500",
      icon: <AlertCircle className="w-5 h-5 text-white" />,
      buttonText: "text-amber-600",
    },
    default: {
      bg: "bg-sky-500",
      icon: <Info className="w-5 h-5 text-white" />,
      buttonText: "text-sky-600",
    },
  };

  const current = variants[variant] || variants.default;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key={id}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={cn(
            "fixed z-50",
            // Mobile
            "bottom-0 left-0 right-0 mx-3 mb-3",
            // Desktop
            "sm:left-auto sm:right-4 sm:bottom-4 sm:w-[360px]",
          )}
        >
          <div
            className={cn(
              "relative rounded-md px-4 py-3.5 pr-10 shadow-xl text-white",
              current.bg,
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {current.icon}
                <span className="font-bold text-lg">{title}</span>
              </div>
            </div>

            {/* Close button */}
            <button
              aria-label="Close"
              onClick={() => onOpenChange?.(false)}
              className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-none border-0 bg-transparent p-0 text-white/80 shadow-none transition-opacity hover:bg-transparent hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {/* Description */}
            {description && (
              <p className="mt-3 text-sm leading-relaxed opacity-95">
                {description}
              </p>
            )}

            {/* Action */}
            <button
              onClick={() => {
                onAction?.();
                onOpenChange?.(false);
              }}
              className={cn(
                "mt-4 w-full rounded-md py-3 font-bold text-sm bg-white",
                current.buttonText,
              )}
            >
              {actionLabel}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
