"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/nakhlah/Mascot";
import Link from "next/link";
import { ArrowLeft, Delete } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OTPVerificationPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [showMobileDialer, setShowMobileDialer] = useState(false);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    // Check if mobile screen
    const checkMobile = () => {
      setShowMobileDialer(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleResend = () => {
    setTimeLeft(120);
    setCanResend(false);
    setOtp(["", "", "", ""]);
    // Call resend OTP API here
  };

  const handleChange = (index, value) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleNumberClick = (num) => {
    // Find first empty slot
    const emptyIndex = otp.findIndex((digit) => digit === "");
    if (emptyIndex !== -1) {
      handleChange(emptyIndex, num.toString());
    }
  };

  const handleDelete = () => {
    // Find last filled slot
    const lastFilledIndex = otp
      .map((digit, i) => (digit ? i : -1))
      .filter((i) => i !== -1)
      .pop();

    if (lastFilledIndex !== undefined) {
      const newOtp = [...otp];
      newOtp[lastFilledIndex] = "";
      setOtp(newOtp);
    }
  };

  const handleConfirm = () => {
    // OTP verification will be implemented later
    // For now, just navigate to reset-password
    console.log("OTP:", otp.join(""));
    router.push("/auth/reset-password");
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
            Check your inbox for the verification code!
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
            <Link
              href="/auth/forgot-password"
              className="inline-flex items-center gap-2 text-foreground hover:text-accent mb-6 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-semibold">Back</span>
            </Link>

            {/* Header */}
            <div className="mb-8">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-3xl font-extrabold text-foreground mb-2">
                  You&apos;ve got mail 📬
                </h1>
                <p className="text-muted-foreground">
                  We have sent the OTP verification code to your email address.
                  Check your email and enter the code below
                </p>
              </motion.div>
            </div>

            {/* OTP Inputs */}
            <div className="space-y-6">
              <div className="flex gap-4 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    inputMode={showMobileDialer ? "none" : "numeric"}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    readOnly={showMobileDialer}
                    className="w-16 h-16 text-center text-2xl font-bold bg-background border-2 border-border rounded-xl focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                  />
                ))}
              </div>

              {/* Resend Code */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Didn&apos;t receive email?
                </p>
                {canResend ? (
                  <button
                    onClick={handleResend}
                    className="text-sm text-accent hover:underline font-semibold"
                  >
                    Resend code
                  </button>
                ) : (
                  <p className="text-sm text-muted-foreground font-semibold">
                    You can resend code in {formatTime(timeLeft)}
                  </p>
                )}
              </div>

              {/* Mobile Number Dialer - ONLY ON MOBILE */}
              {showMobileDialer && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-3 gap-4 pt-4"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleNumberClick(num)}
                      className="h-16 text-2xl font-medium text-foreground bg-transparent hover:bg-muted rounded-lg transition-colors active:scale-95"
                    >
                      {num}
                    </button>
                  ))}

                  {/* Decimal point (disabled) */}
                  <button
                    disabled
                    className="h-16 text-2xl font-medium text-muted-foreground bg-transparent rounded-lg"
                  >
                    •
                  </button>

                  {/* Zero button */}
                  <button
                    onClick={() => handleNumberClick(0)}
                    className="h-16 text-2xl font-medium text-foreground bg-transparent hover:bg-muted rounded-lg transition-colors active:scale-95"
                  >
                    0
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={handleDelete}
                    className="h-14 flex items-center justify-center text-foreground bg-transparent hover:bg-muted rounded-lg transition-colors active:scale-95"
                  >
                    <Delete className="h-5 w-5" />
                  </button>
                </motion.div>
              )}
            </div>
          </div>
          {/* Confirm Button */}
          <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-background border-t border-border p-4">
            <Button
              onClick={handleConfirm}
              className="w-full h-12 bg-accent hover:opacity-90 text-accent-foreground font-bold text-lg rounded-xl"
            >
              CONFIRM
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
