"use client";

import * as React from "react";
import { Toast } from "./Toast";
import { useToast } from "@/components/ui/use-toast";

export function ToastProvider() {
  const { toasts, dismiss } = useToast();

  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          title={toast.title}
          description={toast.description}
          variant={toast.variant}
          open={toast.open}
          onOpenChange={(open) => !open && dismiss(toast.id)}
        />
      ))}
    </>
  );
}