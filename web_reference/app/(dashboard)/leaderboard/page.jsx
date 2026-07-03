"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UserProfilePage from "./UserProfile";
import Leaderboard from "./LeaderBoardPage";

export default function LeaderboardMain() {
  const [activeView, setActiveView] = useState("leaderboard");
  const [selectedUser, setSelectedUser] = useState(null);

  const handleViewProfile = (user) => {
    setSelectedUser(user);
    setActiveView("profile");
  };

  const handleBack = () => {
    setActiveView("leaderboard");
    setSelectedUser(null);
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <AnimatePresence mode="wait">
        {activeView === "leaderboard" ? (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Leaderboard onViewProfile={handleViewProfile} />
          </motion.div>
        ) : (
          <motion.div
            key="profile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <UserProfilePage user={selectedUser} onBack={handleBack} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
