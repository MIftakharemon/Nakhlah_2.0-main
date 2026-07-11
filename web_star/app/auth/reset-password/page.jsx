"use client";

import { Suspense, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mascot } from "@/components/nakhlah/Mascot";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/services/api/auth";
import { toast } from "@/components/nakhlah/Toast";

function CreatePasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setResetToken(tokenFromUrl);
    }
  }, [searchParams]);

  const handleContinue = async () => {
    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!resetToken) {
      toast.error("Invalid or missing reset token");
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword(resetToken, password);

      if (!result.success) {
        toast.error(result.error || "Failed to reset password");
        setIsLoading(false);
        return;
      }

      toast.success(result.message || "Password reset successfully!");
      router.push("/auth/welcome-back");
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-start sm:items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Mascot */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="hidden lg:flex flex-col items-center justify-center"
        >
          <Mascot mood="happy" size="xxxl" className="mb-6" />
          <h2 className="text-2xl font-bold text-foreground text-center max-w-md">
            Create a strong password to keep your account secure!
          </h2>
        </motion.div>
        {/* Right Side - Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto pt-6 lg:pt-0"
        >
          <div className="bg-transparent lg:bg-card rounded-none lg:rounded-3xl shadow-none lg:shadow-lg border-0 lg:border lg:border-border p-0 lg:p-8">
            <div className="mb-6">
              {/* Back button only on mobile */}
              <button
                type="button"
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 text-foreground hover:text-accent transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-semibold">Back</span>
              </button>
            </div>

            {/* Header */}
            <div className="mb-8">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-3xl font-extrabold text-foreground mb-2">
                  Create new password 🔒
                </h1>
                <p className="text-muted-foreground">
                  Save your new password in a safe place
                </p>
              </motion.div>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* Create Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-foreground font-semibold"
                >
                  Create a new password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 bg-background border-border text-foreground pr-12"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-foreground font-semibold"
                >
                  Confirm new password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 bg-background border-border text-foreground pr-12"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={setRememberMe}
                />
                <Label
                  htmlFor="remember"
                  className="text-sm text-foreground cursor-pointer"
                >
                  Stay logged in
                </Label>
              </div>

              {/* Continue Button */}
              <div className="hidden sm:block">
                <Button
                  onClick={handleContinue}
                  disabled={isLoading}
                  className="w-full h-12 bg-accent hover:opacity-90 text-accent-foreground font-bold text-lg rounded-xl"
                >
                  {isLoading ? "RESETTING PASSWORD..." : "CONTINUE"}
                </Button>
              </div>
            </div>
          </div>
          {/*Mobile Continue Button */}
          <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-background border-t border-border p-4">
            <Button
              onClick={handleContinue}
              disabled={isLoading}
              className="w-full h-12 bg-accent hover:opacity-90 text-accent-foreground font-bold text-lg rounded-xl"
            >
              {isLoading ? "RESETTING PASSWORD..." : "CONTINUE"}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function CreatePasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <CreatePasswordContent />
    </Suspense>
  );
}
