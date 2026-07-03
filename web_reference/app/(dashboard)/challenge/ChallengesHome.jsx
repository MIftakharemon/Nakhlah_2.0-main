"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import DailyMissions from "./target/DailyMissions";
import BadgesList from "./badges/BadgesList";
import { LockKey } from "@/components/icons/Lock-Key";

export default function ChallengesHome() {
  const [activeTab, setActiveTab] = useState("target");

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            Challenges
          </h1>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center">
            <LockKey />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 mb-8 mx-auto justify-center lg:justify-start"
      >
        {[
          { id: "target", label: "Target" },
          { id: "badges", label: "Badges" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all w-full lg:w-fit ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-lg"
                : "bg-card text-muted-foreground hover:bg-muted border border-border"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {activeTab === "target" ? <DailyMissions /> : <BadgesList />}
      </motion.div>
    </div>
  );
}
