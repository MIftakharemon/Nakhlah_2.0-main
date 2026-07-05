/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mascot } from "@/components/nakhlah/Mascot";
import { PathwayNode } from "./PathwayNode";
import { SectionHeader } from "./SectionHeader";
import { DecorativeElement, ConnectorLine } from "./DecorativeElements";

export default function PathwayCarousel({
  chapters = [],
  current = 1,
  onSelect = () => {},
}) {
  const trackRef = useRef(null);
  const [mascotPos, setMascotPos] = useState({
    top: 0,
    left: 0,
    visible: false,
  });
  const nodeRefs = useRef(new Map());

  const setNodeRef = (id) => (el) => {
    if (el) nodeRefs.current.set(id, el);
    else nodeRefs.current.delete(id);
  };

  const computeMascotPos = () => {
    const track = trackRef.current;
    const activeNode = nodeRefs.current.get(current);
    if (!track || !activeNode) return;

    const rectTrack = track.getBoundingClientRect();
    const rectNode = activeNode.getBoundingClientRect();

    const nodeIndex = chapters.findIndex((c) => c.id === current);
    const isLeftSide = nodeIndex % 2 === 0;

    setMascotPos({
      top: rectNode.top - rectTrack.top - 20,
      left: isLeftSide
        ? rectNode.left - rectTrack.left + rectNode.width + 10
        : rectNode.left - rectTrack.left - 80,
      visible: true,
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => computeMascotPos(), 100);
    return () => clearTimeout(timer);
  }, [current, chapters.length]);

  useEffect(() => {
    window.addEventListener("resize", computeMascotPos);
    return () => window.removeEventListener("resize", computeMascotPos);
  }, [current]);

  const getDecoration = (id, index) => {
    const decorations = ["trophy", "star", "sparkle", "crown", "zap"];
    const mod = id % 5;
    if (mod === 0 || mod === 2 || mod === 4) {
      return {
        type: decorations[mod],
        side: index % 2 === 0 ? "right" : "left",
      };
    }
    return null;
  };

  return (
    <div className="w-full h-screen bg-background flex justify-center overflow-hidden">
      <div className="relative w-full max-w-xl px-4 h-full">
        <div
          ref={trackRef}
          className="relative flex flex-col items-center py-8 md:py-12 h-full overflow-y-auto"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <style jsx global>{`
            .overflow-y-auto::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {chapters.map((chap, idx) => {
            const locked = chap.locked;
            const completed = chap.id < current;
            const active = chap.id === current;
            const isLeftSide = idx % 2 === 0;
            const decoration = getDecoration(chap.id, idx);

            return (
              <div key={chap.id} className="w-full">
                {/* Section Header */}
                {chap.section && (
                  <div className="mb-6 md:mb-8">
                    <SectionHeader
                      title={chap.section.title}
                      subtitle={chap.section.subtitle}
                      colorVariant={chap.section.color}
                    />
                  </div>
                )}

                {/* Connector Line (except first) */}
                {idx !== 0 && !chap.section && (
                  <ConnectorLine completed={completed || active} />
                )}
                {chap.section && idx !== 0 && <div className="h-4" />}

                {/* Node Row */}
                <motion.div
                  className={`
                    relative flex items-center w-full
                    ${
                      isLeftSide
                        ? "justify-start pl-8 md:pl-16"
                        : "justify-end pr-8 md:pr-16"
                    }
                  `}
                  initial={{ opacity: 0, x: isLeftSide ? -30 : 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  {/* Node Container with ref for mascot positioning */}
                  <div ref={setNodeRef(chap.id)} className="relative">
                    <PathwayNode
                      id={chap.id}
                      label={chap.label}
                      completed={completed}
                      active={active}
                      locked={locked}
                      onClick={() => !locked && onSelect(chap)}
                    />

                    {/* Decorative Element */}
                    {decoration && (
                      <DecorativeElement
                        type={decoration.type}
                        position={decoration.side}
                        delay={idx * 0.05 + 0.2}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <motion.p
                    className={`
                      absolute text-sm md:text-base font-semibold text-foreground/80
                      max-w-[120px] md:max-w-[160px]
                      ${
                        isLeftSide
                          ? "left-32 md:left-44 text-left"
                          : "right-32 md:right-44 text-right"
                      }
                    `}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 + 0.1 }}
                  >
                    {chap.label}
                  </motion.p>
                </motion.div>
              </div>
            );
          })}

          {/* Mascot follows active node */}
          {mascotPos.visible && (
            <motion.div
              className="absolute z-50 pointer-events-none hidden md:block"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: 1,
                scale: 1,
                top: mascotPos.top,
                left: mascotPos.left,
              }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <Mascot mood="excited" size="lg" />
            </motion.div>
          )}

          {/* Mobile Mascot - Fixed position */}
          <motion.div
            className="fixed bottom-4 right-4 z-50 md:hidden"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Mascot mood="happy" size="md" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
