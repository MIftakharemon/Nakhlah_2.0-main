"use client";

import { ChevronRight } from "lucide-react";
import { Medal } from "@/components/icons/Medal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const getIconUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (!API_URL) return url;
  return `${API_URL}${url}`;
};

export default function BadgeCard({ badge }) {
  const iconUrl = getIconUrl(badge.icon?.url || badge.icon);
  const injazTarget = Number(badge.injazTarget ?? badge.xp) || 0;
  const isEarned = Boolean(badge.earned);

  return (
    <div
      className={`group relative rounded-2xl border bg-card shadow-md transition-all ${
        isEarned
          ? "border-border hover:shadow-lg hover:scale-[1.02] cursor-pointer"
          : "border-border/60 opacity-80"
      }`}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Badge Icon */}
        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-accent shadow-lg overflow-hidden">
          {iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={iconUrl}
              alt={badge.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Medal size="md" className="text-white" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <p className="font-bold text-foreground mb-1">{badge.title}</p>

          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-accent">
              {injazTarget.toLocaleString()} Injaz
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              {isEarned ? "Unlocked" : "Target"}
            </span>
          </div>
        </div>

        {/* Hover affordance */}
        {isEarned ? (
          <ChevronRight className="w-5 h-5 text-muted-foreground mr-2 transition-opacity opacity-0 group-hover:opacity-100" />
        ) : null}
      </div>
    </div>
  );
}
