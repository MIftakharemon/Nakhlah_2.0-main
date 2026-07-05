"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const hideNavbar =
    pathname === "/onboarding" ||
    pathname === "/get-started" ||
    pathname.startsWith("/auth/") ||
    pathname === "/lesson" ||
    pathname.startsWith("/lesson/") ||
    pathname === "/lessons" ||
    pathname.startsWith("/lessons/");

  if (hideNavbar) return null;

  return <Navbar />;
}
