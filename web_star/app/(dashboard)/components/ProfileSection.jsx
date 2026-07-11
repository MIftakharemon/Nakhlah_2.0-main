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
import { useEffect, useMemo, useState } from "react";
import { getSessionToken, isSessionValid } from "@/lib/authUtils";
import {
  fetchGamificationBadges,
  fetchQuestionnaireAchievements,
} from "@/services/api";
import { Medal } from "@/components/icons/Medal";
import { getUserKey } from "@/lib/userKey";
import { useProfileStore } from "@/stores/useProfileStore";

const DEFAULT_PROFILE_IMAGE = "https://github.com/shadcn.png";
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
  const [badgeDictionary, setBadgeDictionary] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const profileData = useProfileStore((state) => state.profile);
  const fetchProfile = useProfileStore((state) => state.fetchMyProfile);
  const clearProfile = useProfileStore((state) => state.clear);

  useEffect(() => {
    const loadProfileData = async () => {
      if (status === "loading") return;
      if (!isSessionValid(session)) {
        clearProfile();
        setBadgeDictionary([]);
        setAchievements([]);
        return;
      }

      const token = getSessionToken(session);
      if (!token) return;

      const [_, badgesResult, achievementsResult] = await Promise.all([
        fetchProfile(token, false, getUserKey(session)),
        fetchGamificationBadges(token),
        fetchQuestionnaireAchievements(token),
      ]);

      if (badgesResult.success) {
        setBadgeDictionary(badgesResult.badges || []);
      }

      if (achievementsResult.success) {
        setAchievements(achievementsResult.achievements || []);
      }
    };

    loadProfileData();
  }, [clearProfile, fetchProfile, session, status]);

  const profileImage =
    getMediaUrl(profileData?.profilePicture?.url || session?.user?.image) ||
    DEFAULT_PROFILE_IMAGE;
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
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      {isSignedIn ? (
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={profileImage} />
                <AvatarFallback>{fallbackInitial || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{displayName}</p>
                <p className="text-sm text-muted-foreground">
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
                        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border/50 cursor-help transition-colors hover:border-foreground/30">
                          {item.iconUrl ? (
                            <img
                              src={item.iconUrl}
                              alt={item.label}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full text-xs font-bold text-muted-foreground">
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
                        side="top"
                        className="bg-foreground text-background"
                      >
                        <p className="text-sm font-medium">{item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No earned badges yet.
                  </p>
                )}
              </div>
            </TooltipProvider>
          </div>

          {/* Logout Button */}
          <div className="mt-4 pt-4 border-t border-border">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/50"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <h3 className="text-lg font-bold">
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
            className="text-xs font-bold uppercase text-muted-foreground hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
