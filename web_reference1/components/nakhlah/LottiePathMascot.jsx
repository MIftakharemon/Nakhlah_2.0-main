"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useEffect, useRef, useState } from "react";

/**
 * LottiePathMascot
 *
 * Lazy-loads each animation: the DotLottieReact player is only mounted once
 * the element is within 300px of the viewport (via IntersectionObserver).
 * Until then a transparent placeholder of the same size holds the layout.
 * Once mounted, the player stays mounted (no unmount on scroll away).
 *
 * Props:
 *   slotIndex {number} - determines which animation to show (cycles through ANIMATION_SRCS)
 *   size      {string} - "sm"|"md"|"lg"|"xl"|"xxl"|"xxxl" (mirrors Mascot sizes)
 *   message   {string} - optional speech bubble text
 *   className {string}
 */

const SIZE_MAP = {
  sm: 108,
  md: 144,
  lg: 180,
  xl: 225,
  xxl: 288,
  xxxl: 360,
};

const ANIMATION_SRCS = [
  "/animations/Camel.json",
  "/animations/teapot and cup.json",
  "https://lottie.host/9dad0b61-3e8b-4c04-b43d-fd3c329c82fb/qb8JRdu0sJ.lottie",
];

const MOBILE_MAX_SIZE = 200;
const MOBILE_BREAKPOINT = 1024;

function useResponsiveDimensions(desktopSize) {
  const [dimensions, setDimensions] = useState(() => {
    if (typeof window === "undefined") return desktopSize;
    return window.innerWidth < MOBILE_BREAKPOINT
      ? Math.min(desktopSize, MOBILE_MAX_SIZE)
      : desktopSize;
  });

  useEffect(() => {
    const update = () => {
      setDimensions(
        window.innerWidth < MOBILE_BREAKPOINT
          ? Math.min(desktopSize, MOBILE_MAX_SIZE)
          : desktopSize,
      );
    };
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [desktopSize]);

  return dimensions;
}

export function LottiePathMascot({
  slotIndex = 0,
  size = "xxl",
  message,
  className = "",
}) {
  const desktopSize = SIZE_MAP[size] ?? SIZE_MAP.xxl;
  const dimensions = useResponsiveDimensions(desktopSize);
  const src = ANIMATION_SRCS[slotIndex % ANIMATION_SRCS.length];
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex flex-col items-center ${className}`}
    >
      {isVisible ? (
        <DotLottieReact
          src={src}
          loop
          autoplay
          style={{ width: dimensions, height: dimensions }}
        />
      ) : (
        <div style={{ width: dimensions, height: dimensions }} />
      )}

      {message && (
        <div className="mt-3 relative">
          <div className="bg-card border-2 border-border rounded-2xl px-4 py-2 shadow-md max-w-[200px]">
            <p className="text-sm font-semibold text-foreground text-center">
              {message}
            </p>
          </div>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-card border-l-2 border-t-2 border-border rotate-45" />
        </div>
      )}
    </div>
  );
}
