"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { signOut } from "next-auth/react";

const navItems = [
  { path: "/", label: "Home", icon: "/icons/Home-Icon.127e8555.svg" },
  // { path: "/challenge", label: "Challenges", icon: "/icons/Lesson.svg" },
  {
    path: "/leaderboard",
    label: "Leaderboard",
    icon: "/icons/LEADERBOARD.b7e283d4.svg",
  },
  { path: "/store", label: "Store", icon: "/icons/STORE.9b24d09f.svg" },
  { path: "/profile", label: "Profile", icon: "/icons/Profile.f8f9b305.svg" },
];

export function Navbar() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const handleLogout = () => {
    signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <nav
        className={cn(
          "hidden lg:flex flex-col fixed top-0 left-0 h-full w-64 border-r border-border/50 p-6 overflow-y-auto",
          isHomePage
            ? "bg-transparent backdrop-blur-sm"
            : "bg-card/95 backdrop-blur-md",
        )}
      >
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
                    "relative flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold transition-all",
                    isHomePage
                      ? "text-slate-900 bg-white/30 dark:bg-white/10 backdrop-blur-md border border-white/40 dark:border-white/20 shadow-sm hover:bg-white/40 dark:hover:bg-white/20"
                      : "text-foreground hover:bg-muted/50 dark:hover:bg-muted/20",
                    isActive &&
                      isHomePage &&
                      "bg-white/60 ring-1 ring-white/80",
                    isActive &&
                      !isHomePage &&
                      "bg-muted/60 dark:bg-muted/30 ring-1 ring-border",
                  )}
                >
                  <Image
                    src={item.icon}
                    alt={item.label}
                    width={24}
                    height={24}
                    className="h-6 w-6"
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            {/* Logout - right after Profile with no gap */}
            <button
              onClick={handleLogout}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold transition-all w-full",
                isHomePage
                  ? "text-slate-900 bg-white/30 dark:bg-white/10 backdrop-blur-md border border-white/40 dark:border-white/20 shadow-sm hover:bg-white/40 dark:hover:bg-white/20"
                  : "text-foreground hover:bg-muted/50 dark:hover:bg-muted/20",
              )}
            >
              <Image
                src="/icons/logout.125f3808.svg"
                alt="Logout"
                width={24}
                height={24}
                className="h-6 w-6"
              />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Theme Toggle - Desktop */}
        <div className="mt-auto lg:mx-auto">
          <ThemeToggle size="lg" />
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav
        className={cn(
          "lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t px-2",
          isHomePage
            ? "bg-white/30 dark:bg-white/10 backdrop-blur-md border-white/40 dark:border-white/20"
            : "bg-card/95 backdrop-blur-md border-border",
        )}
      >
        <div className="flex items-center justify-between py-2 gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 transition-all min-w-0",
                  isHomePage
                    ? "text-slate-900 dark:text-white bg-white/30 dark:bg-white/10 backdrop-blur-md border border-white/40 dark:border-white/20"
                    : "text-foreground hover:bg-muted/50",
                  isActive &&
                    isHomePage &&
                    "bg-white/60 dark:bg-white/20 ring-1 ring-white/60 dark:ring-white/30",
                  isActive && !isHomePage && "bg-muted/60 ring-1 ring-border",
                )}
              >
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={24}
                  height={24}
                  className="h-5 w-5"
                />
                <span className="text-[10px] font-medium truncate w-full text-center">
                  {item.label}
                </span>
              </Link>
            );
          })}
          {/* Logout - Mobile */}
          <button
            onClick={handleLogout}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 transition-all min-w-0",
              isHomePage
                ? "text-slate-900 dark:text-white bg-white/30 dark:bg-white/10 backdrop-blur-md border border-white/40 dark:border-white/20"
                : "text-foreground hover:bg-muted/50",
            )}
          >
            <Image
              src="/icons/logout.125f3808.svg"
              alt="Logout"
              width={24}
              height={24}
              className="h-5 w-5"
            />
            <span className="text-[10px] font-medium truncate w-full text-center">
              Logout
            </span>
          </button>
        </div>
      </nav>

      {/* Floating Theme Toggle - Mobile Only */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <div className="bg-white/30 dark:bg-white/10 backdrop-blur-md border border-white/40 dark:border-white/20 rounded-full p-2 shadow-lg">
          <ThemeToggle size="lg" />
        </div>
      </div>
    </>
  );
}
