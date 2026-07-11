"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Send, MessageCircle, Info } from "lucide-react";
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
  };

  const current = variants[variant];

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
            "sm:left-auto sm:right-4 sm:bottom-4 sm:w-[360px]"
          )}
        >
          <div
            className={cn(
              "rounded-2xl px-4 py-4 shadow-xl text-white",
              current.bg
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {current.icon}
                <span className="font-bold text-lg">{title}</span>
              </div>

              {/* Utility icons (visual only) */}
              <div className="flex items-center gap-3 opacity-90">
                {/* <Send className="w-4 h-4" />
                <MessageCircle className="w-4 h-4" /> */}
                <Info className="w-4 h-4" />
              </div>
            </div>

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
                "mt-4 w-full rounded-full py-3 font-bold text-sm bg-white",
                current.buttonText
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
