"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mascot } from "@/components/nakhlah/Mascot";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { forgotPassword } from "@/services/api/auth";
import { toast } from "@/components/nakhlah/Toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const handleContinue = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const result = await forgotPassword(email);

      if (!result.success) {
        toast.error(result.error || "Failed to send reset email");
        setIsLoading(false);
        return;
      }

      toast.success(result.message || "Reset link sent to your email");
      router.push("/auth/reset-password");
    } catch (error) {
      console.error("Forgot password error:", error);
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
          <Mascot mood="thinking" size="xxxl" className="mb-6" />
          <h2 className="text-2xl font-bold text-foreground text-center max-w-md">
            Don&apos;t worry, we&apos;ll help you reset your password!
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
            {/* Back Button */}
            <div className="mb-6">
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
                  Forgot Password 🔑
                </h1>
                <p className="text-muted-foreground">
                  Enter your email address to receive a password reset link
                </p>
              </motion.div>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-foreground font-semibold"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="andrew.ainsley@yourdomain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-background border-border text-foreground"
                  disabled={isLoading}
                />
              </div>

              {/* Continue Button */}
              <div className="hidden sm:block">
                <Button
                  onClick={handleContinue}
                  disabled={isLoading}
                  className="w-full h-12 bg-accent hover:opacity-90 text-accent-foreground font-bold text-lg rounded-xl"
                >
                  {isLoading ? "SENDING..." : "CONTINUE"}
                </Button>
              </div>
            </div>
          </div>
          <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-background border-t border-border p-4">
            <Button
              onClick={handleContinue}
              disabled={isLoading}
              className="w-full h-12 bg-accent hover:opacity-90 text-accent-foreground font-bold text-lg rounded-xl"
            >
              {isLoading ? "SENDING..." : "CONTINUE"}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
