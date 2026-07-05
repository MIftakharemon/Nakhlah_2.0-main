"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChallengesHome from "./ChallengesHome";

export default function ChallengesMain() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key="challenge"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ChallengesHome />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
