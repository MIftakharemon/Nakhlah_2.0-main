"use client";

import { FreshDateMascot } from "@/components/nakhlah/DateMascot";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function WelcomeBackPage() {
  const router = useRouter();

  const handleContinue = () => {
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg mx-auto text-center"
      >
        <div className="bg-transparent lg:bg-card rounded-none lg:rounded-3xl shadow-none lg:shadow-lg border-0 lg:border lg:border-border p-0 lg:p-8">
          {/* Mascot */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-6"
          >
            <FreshDateMascot mood="celebrating" size="xxxl" />
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-6"
          >
            {/* <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
              <Lock className="w-8 h-8 text-accent" />
            </div> */}
            <h1 className="text-4xl font-extrabold text-accent mb-3">
              Password reset!
            </h1>
            <p className="text-lg text-muted-foreground">
              You have successfully created a new password. Please log in to
              continue.
            </p>
          </motion.div>

          {/* Continue Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Button
              onClick={handleContinue}
              className="w-full h-12 bg-accent hover:opacity-90 text-accent-foreground font-bold text-lg rounded-xl"
            >
              CONTINUE TO LOGIN
            </Button>
          </motion.div>

          {/* Decorative Elements */}
          <div className="mt-8 flex justify-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0 }}
              className="w-2 h-2 rounded-full bg-accent"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.2 }}
              className="w-2 h-2 rounded-full bg-accent/70"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.4 }}
              className="w-2 h-2 rounded-full bg-accent"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
