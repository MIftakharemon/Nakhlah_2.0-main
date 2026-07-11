"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/nakhlah/Mascot";
import { useRouter } from "next/navigation";

export default function LeavingDialog({ onCancel, onLeave }) {
  const router = useRouter();

  const handleKeepLearning = () => {
    router.back();
  };

  const handleLeave = () => {
    if (typeof onLeave === "function") {
      onLeave();
      return;
    }

    router.push("/");
  };

  return (
    <div className="absolute inset-0 z-40 bg-background/20 backdrop-blur-sm flex items-center justify-center p-4">
      {" "}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="bg-card rounded-3xl shadow-2xl border border-border p-8 text-center">
          {/* Mascot */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="mb-6"
          >
            <Mascot mood="sad" size="xl" className="w-32 h-32 mx-auto" />
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-3xl font-extrabold text-foreground mb-3"
          >
            Leaving Already?
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground mb-8"
          >
            Are you sure you want to leave the lesson? Your progress won&apos;t
            be saved.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <Button
              onClick={onCancel}
              className="w-full h-12 bg-accent hover:opacity-90 text-accent-foreground font-bold text-lg rounded-xl"
            >
              Keep Learning
            </Button>
            <Button
              onClick={handleLeave}
              variant="ghost"
              className="w-full h-12 text-destructive hover:bg-destructive/10 font-semibold text-lg rounded-xl"
            >
              Yes, Leave Now
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
