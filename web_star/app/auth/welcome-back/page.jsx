"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/nakhlah/Mascot";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export default function WelcomeBackPage() {
  const router = useRouter();

  const handleContinue = () => {
    router.push("/");
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
            <Mascot mood="happy" size="xxxl" className="mx-auto" />
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-extrabold text-accent mb-3">
              Welcome back!
            </h1>
            <p className="text-lg text-muted-foreground">
              You have successfully reset and created a new password
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
              CONTINUE TO HOME
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
