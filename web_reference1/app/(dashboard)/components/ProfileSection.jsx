"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { CardMenuOptions } from "@/components/nakhlah/CardMenuOptions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useRef } from "react";
import { getSessionToken, isSessionValid } from "@/lib/authUtils";
import { Medal } from "@/components/icons/Medal";
import { getUserKey } from "@/lib/userKey";
import { useProfileStore } from "@/stores/useProfileStore";
import { useAchievementsStore } from "@/stores/useAchievementsStore";
import { useBadgesStore } from "@/stores/useBadgesStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const getMediaUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (!API_URL) return url;
  return `${API_URL}${url}`;
};

const formatJoinedDate = (dateInput) => {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
};

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/store", label: "Store" },
  { href: "/tips", label: "Learning tips and guides" },
  { href: "/faq", label: "FAQ" },
  { href: "/terms-and-conditions", label: "Terms and Conditions" },
  { href: "/privacy", label: "Privacy Policy" },
];

export function ProfileSection() {
  const { data: session, status } = useSession();
  const isSignedIn = status === "authenticated";
  const router = useRouter();
  const badgeDictionary = useBadgesStore((state) => state.badges);
  const fetchBadges = useBadgesStore((state) => state.fetchBadges);
  const clearBadges = useBadgesStore((state) => state.clear);
  const profileData = useProfileStore((state) => state.profile);
  const fetchProfile = useProfileStore((state) => state.fetchMyProfile);
  const clearProfile = useProfileStore((state) => state.clear);
  const achievements = useAchievementsStore((state) => state.achievements);
  const fetchAchievements = useAchievementsStore(
    (state) => state.fetchAchievements,
  );
  const clearAchievements = useAchievementsStore((state) => state.clear);
  const lastUserKeyRef = useRef(null);

  useEffect(() => {
    const loadProfileData = async () => {
      if (status === "loading") return;
      if (!isSessionValid(session)) {
        clearProfile();
        clearAchievements();
        clearBadges();
        lastUserKeyRef.current = null;
        return;
      }

      const token = getSessionToken(session);
      if (!token) return;

      const userKey = getUserKey(session);

      const promises = [];

      if (lastUserKeyRef.current !== userKey || !profileData) {
        lastUserKeyRef.current = userKey;
        promises.push(fetchProfile(token, false, userKey));
        promises.push(fetchAchievements({ token, userKey }));
      }

      promises.push(fetchBadges({ token, userKey }));

      await Promise.all(promises);
    };

    loadProfileData();
  }, [
    clearProfile,
    clearAchievements,
    clearBadges,
    fetchProfile,
    fetchAchievements,
    fetchBadges,
    session,
    status,
  ]);

  const rawProfileImage = getMediaUrl(
    profileData?.profilePicture?.url || session?.user?.image || "",
  );
  // Ignore the old GitHub placeholder so it never shows as the user's avatar
  const profileImage = rawProfileImage?.includes("github.com/shadcn.png")
    ? ""
    : rawProfileImage;
  const fallbackInitial = (
    profileData?.fullName ||
    session?.user?.name ||
    session?.user?.email ||
    "U"
  )
    .trim()
    .charAt(0)
    .toUpperCase();
  const displayName =
    profileData?.fullName || session?.user?.name || "Name not set";
  const joinedLabel = formatJoinedDate(profileData?.createdAt);

  const earnedBadgeIcons = useMemo(() => {
    const resolvedInjaz = Number(profileData?.gamificationStock?.injazStock);
    const currentInjaz = Number.isFinite(resolvedInjaz) ? resolvedInjaz : 0;

    return badgeDictionary
      .filter((badge) => currentInjaz >= (Number(badge.target) || 0))
      .map((badge) => ({
        key: `badge-${badge.key}`,
        iconUrl: getMediaUrl(badge?.icon?.url || badge?.icon),
        label:
          badge?.title || badge?.name || badge?.label || badge?.key || "Badge",
        fallback: "badge",
      }));
  }, [badgeDictionary, profileData]);

  const earnedAchievementIcons = useMemo(() => {
    return achievements
      .filter((achievement) => achievement?.achieved)
      .map((achievement) => ({
        key: `achievement-${achievement.id || achievement.achievementTitle || achievement.unitOrder}`,
        iconUrl: getMediaUrl(
          achievement?.unitIcon?.url || achievement?.unitIcon || "",
        ),
        label:
          achievement?.achievementTitle ||
          achievement?.title ||
          achievement?.unitTitle ||
          "Achievement",
        fallback: achievement?.unitOrder || "-",
      }));
  }, [achievements]);

  const earnedIcons = useMemo(() => {
    return [...earnedBadgeIcons, ...earnedAchievementIcons].slice(0, 10);
  }, [earnedBadgeIcons, earnedAchievementIcons]);

  const handleLogout = () => {
    router.push("/auth/login");
  };

  const menuOptions = [
    {
      label: "View Full Profile",
      onClick: () => router.push("/profile"),
    },
  ];

  return (
    <div className="p-4 rounded-xl bg-white/30 dark:bg-white/10 backdrop-blur-md border border-white/40 dark:border-white/20 shadow-sm space-y-4">
      {isSignedIn ? (
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="ring-2 ring-primary ring-offset-2">
                <AvatarImage src={profileImage} />
                <AvatarFallback className="bg-slate-200 text-slate-800">
                  {fallbackInitial || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-bold text-slate-900">{displayName}</p>
                <p className="text-sm text-slate-700">
                  {joinedLabel ? `Joined ${joinedLabel}` : "Your profile"}
                </p>
              </div>
            </div>
            <CardMenuOptions options={menuOptions} />
          </div>
          <div className="mt-4">
            <TooltipProvider>
              <div className="flex flex-wrap gap-2 mt-2">
                {earnedIcons.length ? (
                  earnedIcons.map((item) => (
                    <Tooltip key={item.key}>
                      <TooltipTrigger asChild>
                        <div className="w-9 h-9 rounded-full bg-white/40 flex items-center justify-center overflow-hidden border border-white/30 cursor-help transition-colors hover:border-primary/50">
                          {item.iconUrl ? (
                            <img
                              src={item.iconUrl}
                              alt={item.label}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full text-xs font-bold text-slate-700">
                              {item.fallback === "badge" ? (
                                <Medal size="sm" />
                              ) : (
                                `U${item.fallback}`
                              )}
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        sideOffset={6}
                        collisionPadding={24}
                        align="center"
                        avoidCollisions
                        className="bg-foreground text-background max-w-[200px] break-words"
                      >
                        <p className="text-sm font-medium">{item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))
                ) : (
                  <p className="text-sm text-slate-700">
                    No earned badges yet.
                  </p>
                )}
              </div>
            </TooltipProvider>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <h3 className="text-lg font-bold text-slate-900">
            Create a profile to save your progress!
          </h3>
          <div className="flex flex-col gap-2">
            <Button size="lg" className="w-full" asChild>
              <Link href="/onboarding">Create a Profile</Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      )}
      <div className="!mt-8 hidden lg:flex flex-wrap justify-center gap-x-4 gap-y-2">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-xs font-bold uppercase text-slate-700 hover:text-primary"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
