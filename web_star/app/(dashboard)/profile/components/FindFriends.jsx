"use client";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FindFriendsPage({ onBack }) {
  const findOptions = [
    {
      icon: "📱",
      title: "Search Contact",
      subtitle: "Find friends by phone number",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: "📘",
      title: "Connect to Facebook",
      subtitle: "Find friends on Facebook",
      color: "from-blue-600 to-blue-700"
    },
    {
      icon: "✉️",
      title: "Invite Friends",
      subtitle: "Invite friends to learn together",
      color: "from-orange-500 to-red-500"
    },
  ];

  const suggestedPeople = [
    { name: "Charlotte Hanlin", avatar: "CH", color: "from-pink-500 to-rose-500" },
    { name: "Darwin Kidsowski", avatar: "DK", color: "from-blue-500 to-cyan-500" },
    { name: "Maryland Winkles", avatar: "MW", color: "from-green-500 to-emerald-500" },
    { name: "Clinton Mccure", avatar: "CM", color: "from-purple-500 to-violet-500" },
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
            <h1 className="text-2xl font-bold text-foreground">Find Friends</h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search email, name, or phone number"
            className="w-full pl-12 pr-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Find Options */}
        <div className="space-y-3 mb-8">
          {findOptions.map((option, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
              className="w-full flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border/30 hover:bg-muted/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center text-2xl`}>
                  {option.icon}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-foreground">{option.title}</div>
                  <div className="text-sm text-muted-foreground">{option.subtitle}</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
            </motion.button>
          ))}
        </div>

        {/* Suggested People */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">People you may know</h3>
            <button className="text-sm text-accent hover:text-accent/80 transition-colors flex items-center gap-1">
              See All
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {suggestedPeople.map((person, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + 0.1 * index, duration: 0.3 }}
                className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border/30 hover:bg-muted/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${person.color} flex items-center justify-center text-white font-bold text-sm`}>
                    {person.avatar}
                  </div>
                  <span className="font-semibold text-foreground">{person.name}</span>
                </div>
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <UserPlus className="w-4 h-4 mr-1" />
                  Follow
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}