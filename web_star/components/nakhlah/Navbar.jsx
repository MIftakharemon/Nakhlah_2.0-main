"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Trophy, User, Crown } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { StreakCounter } from "./StreakCounter";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchLearnerStreak } from "@/services/api";
import { getSessionToken, isSessionValid } from "@/lib/authUtils";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/challenge", label: "Challenges", icon: BookOpen },
  { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { path: "/store", label: "Store", icon: Crown },
  { path: "/profile", label: "Profile", icon: User },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [streakCount, setStreakCount] = useState(0);

  useEffect(() => {
    const loadStreak = async () => {
      if (status === "loading") return;
      if (!isSessionValid(session)) {
        setStreakCount(0);
        return;
      }

      const token = getSessionToken(session);
      if (!token) return;

      const result = await fetchLearnerStreak(token);
      if (result.success) {
        setStreakCount(Number(result.streak?.currentStreak) || 0);
      }
    };

    loadStreak();
  }, [session, status]);

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col fixed top-0 left-0 h-full w-64 border-r border-border bg-card/95 backdrop-blur-md p-6 overflow-y-auto">
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <Link href="/" className="flex w-full items-center justify-center">
            <Image
              src="/Nakhlah_Logo.webp"
              alt="Nakhlah logo"
              width={80}
              height={80}
              className="h-20 w-20 rounded-lg object-cover"
              priority
            />
          </Link>

          {/* Nav Links */}
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "relative flex items-center gap-3 rounded-lg px-4 py-3 text-base font-semibold transition-colors",
                    isActive
                      ? "text-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  <item.icon className="h-6 w-6" />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 rounded-lg bg-accent/10 -z-10"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-auto flex flex-col sm:flex-row lg:mx-auto gap-4">
          <StreakCounter count={streakCount} />
          <ThemeToggle />
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md">
        <div className="flex items-center justify-evenly py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "relative flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-colors",
                  isActive ? "text-accent" : "text-muted-foreground",
                )}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
