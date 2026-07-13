"use client";
import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { useProfileStore } from "@/stores/useProfileStore";

export default function XPChart() {
  const profileData = useProfileStore((state) => state.profile);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Static demo data for chart
  const apData = [
    { day: "Mon", value: 120 },
    { day: "Tue", value: 150 },
    { day: "Wed", value: 100 },
    { day: "Thu", value: 180 },
    { day: "Fri", value: 140 },
    { day: "Sat", value: 160 },
    { day: "Sun", value: 130 },
  ];
  const maxValue = Math.max(...apData.map((d) => d.value), 1);
  const totalInjazThisWeek = apData.reduce((sum, d) => sum + d.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="bg-transparent lg:bg-card rounded-none lg:rounded-2xl shadow-none lg:shadow-lg border-0 lg:border lg:border-border p-0 lg:p-6"
    >
      <div className="lg:p-6 mb-4 lg:mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Your Injaz this week</h3>
          <div className="text-xl lg:text-2xl font-bold text-accent">
            {totalInjazThisWeek} Injaz
          </div>
        </div>
      </div>
      <div className="">
        <div className="h-48 lg:h-64 flex items-end justify-between gap-2 lg:gap-4">
          {apData.map((data, index) => (
            <div
              key={data.date || index}
              className="flex-1 flex flex-col items-center gap-1 lg:gap-2"
            >
              <div
                className="w-full bg-muted rounded-t-lg lg:rounded-t-xl relative overflow-hidden"
                style={{ height: "150px" }}
              >
                <motion.div
                  className={`absolute bottom-0 w-full rounded-t-lg lg:rounded-t-xl bg-gradient-to-t from-accent to-accent/80`}
                  initial={{ height: 0 }}
                  animate={{
                    height:
                      maxValue > 0 ? `${(data.value / maxValue) * 100}%` : "0%",
                  }}
                  transition={{
                    delay: 0.1 * index + 0.3,
                    duration: 0.8,
                    ease: "easeOut",
                  }}
                />
              </div>
              <span className="text-xs lg:text-sm text-muted-foreground font-medium">
                {data.day}
              </span>
              <span
                className={`text-xs lg:text-sm font-bold ${
                  data.completed ? "text-accent" : "text-muted-foreground"
                }`}
              >
                {data.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
