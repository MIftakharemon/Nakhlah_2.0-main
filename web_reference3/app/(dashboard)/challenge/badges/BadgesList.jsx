"use client";

import { Search } from "lucide-react";
import BadgeSection from "./BadgeSection";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchGamificationBadges, fetchMyProfile } from "@/services/api";
import { getSessionToken, isSessionValid } from "@/lib/authUtils";

const toTitleCase = (key) =>
  key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (char) => char.toUpperCase());

export default function BadgesList() {
  const { data: session, status } = useSession();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("injaz-asc");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [badges, setBadges] = useState([]);
  const [injazStock, setInjazStock] = useState(0);

  useEffect(() => {
    const loadBadges = async () => {
      if (status === "loading") return;

      if (!isSessionValid(session)) {
        setIsLoading(false);
        setLoadError("Please login to view badges.");
        return;
      }

      const token = getSessionToken(session);
      if (!token) {
        setIsLoading(false);
        setLoadError("No authentication token available.");
        return;
      }

      try {
        setIsLoading(true);
        setLoadError("");

        const [badgesResult, profileResult] = await Promise.all([
          fetchGamificationBadges(token),
          fetchMyProfile(token),
        ]);

        if (!badgesResult.success) {
          throw new Error(badgesResult.error || "Failed to load badges.");
        }

        const resolvedInjaz = Number(
          profileResult?.profile?.gamificationStock?.injazStock,
        );
        if (Number.isFinite(resolvedInjaz)) {
          setInjazStock(resolvedInjaz);
        }

        const normalizedBadges = (badgesResult.badges || []).map((badge) => {
          const injazTarget = Number(badge.target) || 0;
          return {
            key: badge.key,
            title: badge.name || toTitleCase(badge.key || "Badge"),
            injazTarget,
            icon: badge.icon,
            earned:
              (Number.isFinite(resolvedInjaz) ? resolvedInjaz : 0) >=
              injazTarget,
          };
        });

        setBadges(normalizedBadges);
      } catch (error) {
        setLoadError(error?.message || "Unable to load badges.");
      } finally {
        setIsLoading(false);
      }
    };

    loadBadges();
  }, [session, status]);

  const filteredSections = useMemo(() => {
    const filteredBadges = badges
      .filter((badge) =>
        badge.title.toLowerCase().includes(search.toLowerCase()),
      )
      .sort((a, b) => {
        if (sort === "injaz-desc") return b.injazTarget - a.injazTarget;
        if (sort === "injaz-asc") return a.injazTarget - b.injazTarget;
        if (sort === "az") return a.title.localeCompare(b.title);
        return 0;
      });

    return [
      {
        id: "earned",
        title: "Earned",
        description: "Badges already unlocked",
        badges: filteredBadges.filter((badge) => badge.earned),
      },
      {
        id: "locked",
        title: "Locked",
        description: "Reach the Injaz target to unlock",
        badges: filteredBadges.filter((badge) => !badge.earned),
      },
    ].filter((section) => section.badges.length > 0);
  }, [badges, search, sort]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center text-muted-foreground">
        Loading badges...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center text-destructive">
        {loadError}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-center lg:justify-end">
        <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2 min-w-0">
          {/* Search */}
          <div className="relative w-full sm:w-auto min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search badges"
              className="w-full sm:w-52 pl-9 pr-3 h-9 rounded-full bg-card border border-border text-sm focus:outline-none"
            />
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full sm:w-auto h-9 px-4 rounded-full border border-border text-sm bg-card text-muted-foreground focus:outline-none"
          >
            <option value="injaz-desc">Injaz (High → Low)</option>
            <option value="injaz-asc">Injaz (Low → High)</option>
            <option value="az">Title (A → Z)</option>
          </select>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-10">
        {filteredSections.map((section) => (
          <BadgeSection key={section.id} section={section} />
        ))}
        {!filteredSections.length && (
          <div className="rounded-2xl border border-border bg-card p-6 text-center text-muted-foreground">
            No badges found for your search.
          </div>
        )}
      </div>

      <div className="text-sm text-muted-foreground text-center lg:text-right">
        Your current Activity Injaz:{" "}
        <span className="font-semibold text-foreground">
          {injazStock.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
