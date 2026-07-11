"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown } from "@/components/icons/Crown";
import { DatesIcon } from "@/components/icons/PublicAssetIcons";
import { Sparkles, Gem, Crown as CrownIcon } from "lucide-react";
import GemsPurchase from "./GemsPurchase.jsx";
import PremiumSubscription from "./PremiumSubscription";

export default function StorePage() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState(null); // null, 'dates', 'premium'

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header - Always visible */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Store
            </h1>
            <Crown size="lg" className="text-accent" />
          </div>
          <p className="text-muted-foreground">
            Unlock your full learning potential with exclusive features
          </p>
        </motion.div>

        {/* Show selection cards when no option is selected */}
        {selectedOption === null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                What would you like to do?
              </h2>
              <p className="text-muted-foreground text-sm">
                Choose between purchasing dates or upgrading to premium
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 max-w-4xl">
              {/* Dates Purchase Card */}
              <motion.button
                onClick={() => setSelectedOption("dates")}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="relative group rounded-xl bg-card border border-border hover:border-accent p-6 text-left shadow-sm hover:shadow-md transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                      <DatesIcon size="md" className="text-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-1">
                        Buy Dates
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Purchase dates to unlock specific content
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-md">
                      Instant Access
                    </span>
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-md">
                      One-Time
                    </span>
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-md">
                      4 Packages
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-sm text-muted-foreground">
                      From $2
                    </span>
                    <div className="inline-flex items-center gap-1 text-accent text-sm font-semibold">
                      <span>Select</span>
                      <svg
                        className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.button>

              {/* Premium Subscription Card */}
              <motion.button
                onClick={() => setSelectedOption("premium")}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="relative group rounded-xl bg-card border border-border hover:border-primary p-6 text-left shadow-sm hover:shadow-md transition-all"
              >
                {/* Popular badge */}
                <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-md">
                  RECOMMENDED
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Crown size="md" className="text-primary" />
                    </div>
                    <div className="flex-1 pr-20">
                      <h3 className="text-xl font-bold text-foreground mb-1">
                        Go Premium
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Unlimited access to all premium features
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-md">
                      Unlimited
                    </span>
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-md">
                      No Ads
                    </span>
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-md">
                      All Features
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-sm text-muted-foreground">
                      From $10/mo
                    </span>
                    <div className="inline-flex items-center gap-1 text-primary text-sm font-semibold">
                      <span>Select</span>
                      <svg
                        className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Show Dates Purchase Flow */}
        {selectedOption === "dates" && (
          <GemsPurchase onBack={() => setSelectedOption(null)} />
        )}

        {/* Show Premium Subscription Flow */}
        {selectedOption === "premium" && (
          <PremiumSubscription onBack={() => setSelectedOption(null)} />
        )}
      </div>
    </div>
  );
}
