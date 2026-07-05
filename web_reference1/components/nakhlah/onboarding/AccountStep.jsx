"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCharacterVideo } from "@/lib/characterVideos";

export function AccountStep({ email, password = "", onChange }) {
  const happyVideoSrc = useCharacterVideo("happy");
  const [localEmail, setLocalEmail] = useState(email || "");
  const [localPassword, setLocalPassword] = useState(password || "");

  useEffect(() => {
    onChange({
      email: localEmail,
      password: localPassword,
    });
  }, [localEmail, localPassword, onChange]);

  return (
    <div className="w-full max-w-[520px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex items-center gap-6 justify-center"
      >
        <video
          src={happyVideoSrc}
          autoPlay
          loop
          muted
          playsInline
          className="w-32 h-32 shrink-0"
        />
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">
            Just a few details
          </h1>
          <p className="text-muted-foreground">
            We’ll use these to personalize your experience
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="space-y-4"
      >
        <div className="bg-card border border-border p-4 rounded-2xl">
          <label className="block text-sm text-muted-foreground mb-1">
            Email
          </label>
          <input
            value={localEmail}
            onChange={(e) => setLocalEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-transparent outline-none"
            placeholder="you@example.com"
            type="email"
          />
        </div>

        <div className="bg-card border border-border p-4 rounded-2xl">
          <label className="block text-sm text-muted-foreground mb-1">
            Create a password
          </label>
          <input
            value={localPassword}
            onChange={(e) => setLocalPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-transparent outline-none"
            placeholder="Choose a secure password"
            type="password"
          />
        </div>

        <div className="text-sm text-muted-foreground">
          <p>
            By continuing you agree to our{" "}
            <span className="text-foreground font-medium">Terms</span> and{" "}
            <span className="text-foreground font-medium">Privacy Policy</span>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
