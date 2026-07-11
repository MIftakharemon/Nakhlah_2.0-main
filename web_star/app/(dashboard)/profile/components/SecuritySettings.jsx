"use client";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function SecuritySettingsPage({ onBack }) {
  const [security, setSecurity] = useState({
    rememberMe: true,
    biometricId: false,
    faceId: false,
  });

  const toggleSecurity = (key) => {
    setSecurity((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-transparent lg:bg-card rounded-none lg:rounded-2xl shadow-none lg:shadow-lg border-0 lg:border lg:border-border p-0 lg:p-6"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center justify-center rounded-full hover:bg-muted h-10 w-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Security</h1>
          </div>
        </div>

        {/* Security Options */}
        <div className="space-y-1 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05, duration: 0.3 }}
            className="flex items-center justify-between p-4 hover:bg-muted/50 transition-all rounded-lg"
          >
            <span className="text-foreground font-medium">Remember me</span>
            <button
              onClick={() => toggleSecurity("rememberMe")}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                security.rememberMe ? "bg-accent" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                  security.rememberMe ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="flex items-center justify-between p-4 hover:bg-muted/50 transition-all rounded-lg"
          >
            <span className="text-foreground font-medium">Biometric ID</span>
            <button
              onClick={() => toggleSecurity("biometricId")}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                security.biometricId ? "bg-accent" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                  security.biometricId ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="flex items-center justify-between p-4 hover:bg-muted/50 transition-all rounded-lg"
          >
            <span className="text-foreground font-medium">Face ID</span>
            <button
              onClick={() => toggleSecurity("faceId")}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                security.faceId ? "bg-accent" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                  security.faceId ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-all rounded-lg group"
          >
            <span className="text-foreground font-medium">
              Two-Factor Authentication
            </span>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
          </motion.button>
        </div>

        {/* Change Password Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Button className="w-full bg-gradient-accent hover:bg-gradient-accent/90 text-accent-foreground">
            Change Password
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
