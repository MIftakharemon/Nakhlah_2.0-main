"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "@/components/nakhlah/Toast";
import { logoutUser } from "@/services/api/auth";
import { useRouter } from "next/navigation";

export function LogoutButton({
  variant = "ghost",
  className = "",
  redirectTo = "/auth/login",
  showIcon = true,
  children = "Logout",
}) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutUser();
      await signOut({ redirect: false });
      toast.success("Logged out successfully");
      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleLogout}
      className={className}
    >
      {showIcon && <LogOut className="w-4 h-4 mr-2" />}
      {children}
    </Button>
  );
}
