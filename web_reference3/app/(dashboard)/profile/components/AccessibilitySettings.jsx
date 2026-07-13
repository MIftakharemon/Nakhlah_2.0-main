"use client";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";

export default function AccessibilitySettingsPage({ onBack }) {
  const [accessibility, setAccessibility] = useState({
    listeningExercise: true,
    readingExercise: true,
    writingExercise: true,
    speakingExercise: true,
    animationEffects: true,
    soundEffects: true,
    visualEffects: true,
    hapticResponse: true,
  });

  const toggleAccessibility = (key) => {
    setAccessibility(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const accessibilityItems = [
    { key: "listeningExercise", label: "Listening Exercise" },
    { key: "readingExercise", label: "Reading Exercise" },
    { key: "writingExercise", label: "Writing Exercise" },
    { key: "speakingExercise", label: "Speaking Exercise" },
    { key: "animationEffects", label: "Animation Effects" },
    { key: "soundEffects", label: "Sound Effects" },
    { key: "visualEffects", label: "Visual Effects" },
    { key: "hapticResponse", label: "Haptic Response" },
  ];

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
            <h1 className="text-2xl font-bold text-foreground">Accessibility</h1>
          </div>
        </div>

        {/* Accessibility List */}
        <div className="space-y-1">
          {accessibilityItems.map((item, index) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index, duration: 0.3 }}
              className="flex items-center justify-between p-4 hover:bg-muted/50 transition-all rounded-lg"
            >
              <span className="text-foreground font-medium">{item.label}</span>
              <button
                onClick={() => toggleAccessibility(item.key)}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  accessibility[item.key] ? "bg-accent" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                    accessibility[item.key] ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}