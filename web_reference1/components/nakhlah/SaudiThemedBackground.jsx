"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";

/**
 * SaudiThemedBackground
 *
 * Background that changes color as you scroll through the journey.
 * Desert (orange/gold) at top → City (slate) at bottom.
 */

export function SaudiThemedBackground({ children, className = "" }) {
  // Track global page scroll
  const { scrollYProgress } = useScroll();

  // Smooth the scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  });

  // Background color transitions - Deep, vibrant colors
  const bgColor = useTransform(
    smoothProgress,
    [0, 0.3, 0.6, 1],
    [
      "linear-gradient(to bottom, #FF8C42 0%, #F5A623 50%, #E8853E 100%)", // Desert - Deep orange/gold
      "linear-gradient(to bottom, #E8853E 0%, #D47835 50%, #B85C2B 100%)", // Transition - Rich amber
      "linear-gradient(to bottom, #4A90A4 0%, #2D5A6B 50%, #1A3A4A 100%)", // City transition - Deep teal
      "linear-gradient(to bottom, #1A3A4A 0%, #0D2832 50%, #051A20 100%)", // City - Deep midnight blue
    ],
  );

  const sunY = useTransform(smoothProgress, [0, 1], [0, 200]);
  const sunOpacity = useTransform(smoothProgress, [0, 0.5, 1], [1, 0.6, 0.2]);

  return (
    <div className={`relative ${className}`}>
      {/* Animated background based on global scroll */}
      <motion.div
        className="fixed inset-0 -z-10 w-full h-full"
        style={{ background: bgColor }}
      />

      {/* Animated sun */}
      <motion.div
        className="fixed top-16 right-16 w-20 h-20 md:w-24 md:h-24 -z-10 pointer-events-none"
        style={{ y: sunY, opacity: sunOpacity }}
      >
        <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-400 to-orange-600 shadow-xl shadow-orange-600/50" />
      </motion.div>

      {/* Clouds - fade out as we scroll */}
      <motion.div
        className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
        style={{
          opacity: useTransform(smoothProgress, [0, 0.4, 0.7], [1, 0.5, 0]),
        }}
      >
        <div className="absolute top-24 left-10 w-24 h-8 bg-white/40 rounded-full blur-lg" />
        <div className="absolute top-32 right-20 w-32 h-10 bg-white/30 rounded-full blur-xl" />
        <div className="absolute top-48 left-1/3 w-20 h-6 bg-white/20 rounded-full blur-lg" />
      </motion.div>

      {/* Desert dunes - visible at start */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 h-32 -z-10 pointer-events-none"
        style={{
          opacity: useTransform(smoothProgress, [0, 0.2, 0.4], [0.5, 0.3, 0]),
        }}
      >
        <svg
          viewBox="0 0 1440 120"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            fill="#A65D29"
            d="M0,60 C240,20 480,100 720,60 C960,20 1200,80 1440,40 L1440,120 L0,120 Z"
          />
        </svg>
      </motion.div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
