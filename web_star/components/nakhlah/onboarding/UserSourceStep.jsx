"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mascot } from "../Mascot";

export function UserSourceStep({ title, sources = [], userSource, onSelect, getMediaUrl }) {
  const [selectedSource, setSelectedSource] = useState(userSource || "");

  const handleSourceSelect = (value) => {
    setSelectedSource(value);
    onSelect({ userSource: value });
  };

  return (
    <div className="w-full max-w-[520px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex items-center gap-8 justify-center"
      >
        <Mascot mood="curious" size="md" className="" />
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">
            {title}
          </h1>
          <p className="text-muted-foreground">
            Help us understand how you discovered Nakhlah
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="space-y-6"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {sources.map((option) => {
            return (
              <button
                key={option.id}
                onClick={() => handleSourceSelect(option.id)}
                className={`
                  p-4 rounded-2xl border-2 transition-all
                  ${
                    selectedSource === option.id
                      ? "border-accent bg-accent/10"
                      : "border-border bg-card hover:border-accent/50"
                  }
                `}
              >
                {option?.sourcePicture?.url ? (
                  <img
                    src={getMediaUrl(option.sourcePicture.url)}
                    alt={option?.sourcePicture?.alt || option.sourceName}
                    className="w-6 h-6 mx-auto mb-2 object-contain"
                  />
                ) : (
                  <div className="w-6 h-6 mx-auto mb-2 rounded-full bg-muted" />
                )}
                <p
                  className={`text-sm font-semibold ${
                    selectedSource === option.id
                      ? "text-accent"
                      : "text-foreground"
                  }`}
                >
                  {option.sourceName}
                </p>
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
