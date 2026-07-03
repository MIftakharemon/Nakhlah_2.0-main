"use client";
import { motion } from "framer-motion";
import { ChevronLeft, Share2, Heart, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

export default function UserProfilePage({ user, onBack }) {
  const stats = [
    {
      label: "followers",
      value: "1,725",
      onClick: () => console.log("Navigate to followers"),
    },
    {
      label: "following",
      value: "256",
      onClick: () => console.log("Navigate to following"),
    },
    { label: "lifetime Injaz", value: "18,528" },
  ];

  const injazData = [
    { day: "Mon", injaz: 650 },
    { day: "Tue", injaz: 780 },
    { day: "Wed", injaz: 920 },
    { day: "Thu", injaz: 850 },
    { day: "Fri", injaz: 890 },
    { day: "Sat", injaz: 1020 },
    { day: "Sun", injaz: 948 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className=" container mx-auto px-4 py-6 max-w-md lg:max-w-4xl">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-transparent lg:bg-card rounded-none lg:rounded-3xl shadow-none lg:shadow-xl border-0 lg:border lg:border-border p-0 lg:p-6 mb-6"
        >
          {/* Profile Content */}
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8 p-6 lg:p-0">
            {/* Profile Image */}
            <div className="relative">
              <div
                className={`w-28 h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br ${
                  user?.color || "from-purple-500 to-pink-500"
                } p-1`}
              >
                <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-4 border-background lg:border-card overflow-hidden flex items-center justify-center text-3xl lg:text-4xl font-bold text-white">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user?.name || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.avatar || "MW"
                  )}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-base lg:text-lg shadow-xl border-4 border-background lg:border-card">
                {user?.rank || 0}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                {user?.name || "Maryland Winkles"}
              </h1>
              <p className="text-muted-foreground mb-4">
                {user?.email || "maryland.winkles@example.com"}
              </p>
              <p className="text-sm text-muted-foreground">
                Joined since 16 May 2020
              </p>

              {/* Stats Row - Desktop */}
              <div className="hidden lg:flex items-center justify-around mt-6 py-4">
                {stats.map((stat, index) => (
                  <button
                    key={index}
                    onClick={stat.onClick}
                    className={`text-center ${
                      stat.onClick
                        ? "hover:scale-105 transition-transform cursor-pointer"
                        : "cursor-default"
                    }`}
                  >
                    <div className="text-xl lg:text-2xl font-bold text-accent mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs lg:text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </button>
                ))}
              </div>

              {/* Action Buttons - Desktop */}
              <div className="hidden lg:flex gap-3 mt-6">
                <Button className="flex-1 w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  Follow
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-2 border-border hover:bg-muted py-6 text-base font-semibold rounded-2xl"
                >
                  Message
                </Button>
              </div>
            </div>

            {/* Stats - Mobile */}
            <div className="flex lg:hidden justify-around gap-6 w-full py-4 border-t border-border">
              {stats.map((stat, index) => (
                <button
                  key={index}
                  onClick={stat.onClick}
                  className={`text-center ${
                    stat.onClick
                      ? "hover:scale-105 transition-transform cursor-pointer"
                      : "cursor-default"
                  }`}
                >
                  <div className="text-2xl font-bold text-accent mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stat.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons - Mobile */}
          <div className="flex lg:hidden gap-3 p-6 pt-0">
            <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base font-semibold rounded-2xl">
              Follow
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-2 border-border hover:bg-muted py-6 text-base font-semibold rounded-2xl"
            >
              Message
            </Button>
          </div>
        </motion.div>

        {/* Injaz Chart Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-transparent lg:bg-card rounded-none lg:rounded-3xl shadow-none lg:shadow-xl border-0 lg:border lg:border-border p-0 lg:p-6 mb-6"
        >
          <div className="pt-6 px-2 pb-2 lg:p-0">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-foreground mb-1">
                Weekly Activity
              </h3>
              <p className="text-3xl font-bold text-accent">
                {user?.injaz ?? user?.xp ?? 948} Injaz
              </p>
            </div>

            {/* Chart */}
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={injazData}
                  margin={{ top: 10, right: 10, left: 15, bottom: 0 }}
                >
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis width={30} tickLine={false} axisLine={false} />
                  <Line
                    type="monotone"
                    dataKey="injaz"
                    stroke="hsl(var(--accent))"
                    strokeWidth={4}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
