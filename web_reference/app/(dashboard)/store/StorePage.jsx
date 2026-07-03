"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import GemsPurchase from "./GemsPurchase.jsx";
import PremiumSubscription from "./PremiumSubscription";

const datePackages = [
  {
    id: "refill",
    label: "DATE REFILL",
    price: "$3",
    amount: 500,
    description: "Refill 500 Dates to keep learning without interruption.",
    buttonLabel: "REFILL DATES",
    popular: false,
  },
  {
    id: "boost",
    label: "DATE BOOST",
    price: "$5",
    amount: 1000,
    description: "Boost your progress with 1000 Dates for extended practice.",
    buttonLabel: "BOOST NOW",
    popular: true,
  },
  {
    id: "surge",
    label: "DATE SURGE",
    price: "$10",
    amount: 2500,
    description: "Surge ahead — 2500 Dates to power through every lesson.",
    buttonLabel: "SURGE AHEAD",
    popular: false,
  },
];

export default function StorePage() {
  const [selectedOption, setSelectedOption] = useState(null);

  if (selectedOption?.type === "dates") {
    return (
      <GemsPurchase
        initialPackage={selectedOption.pkg}
        onBack={() => setSelectedOption(null)}
      />
    );
  }

  if (selectedOption?.type === "premium") {
    return (
      <PremiumSubscription
        initialPlan={selectedOption.plan}
        onBack={() => setSelectedOption(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 max-w-5xl space-y-14">
        {/* ── Date Packages ── */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
            {datePackages.map((pkg, i) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`relative rounded-2xl border-2 p-6 pb-8 flex flex-col items-center gap-5 bg-background text-center ${
                  pkg.popular
                    ? "border-accent shadow-xl pt-10"
                    : "border-border shadow-sm"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-[10px] font-extrabold tracking-widest px-4 py-1 rounded-full uppercase whitespace-nowrap">
                    Most Popular
                  </div>
                )}

                {/* Upper section: label + price centered, icon top-right */}
                <div className="relative w-full flex flex-col items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://res.cloudinary.com/dqdeoobeb/image/upload/v1782640272/date_for_store_pylv32.png"
                    alt="dates"
                    className={`absolute top-0 right-0 object-contain select-none ${pkg.popular ? "w-12 h-12" : "w-10 h-10"}`}
                  />
                  <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-1">
                    {pkg.label}
                  </p>
                  <p className="text-5xl font-black text-foreground">
                    {pkg.price}
                  </p>
                </div>

                <hr className="w-full border-border" />

                {/* Amount pill */}
                <span className="bg-accent text-accent-foreground text-sm font-bold px-5 rounded-full inline-flex items-center justify-center h-7 pt-[3px]">
                  {pkg.amount}
                </span>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-snug">
                  {pkg.description}
                </p>

                {/* CTA */}
                <button
                  onClick={() => setSelectedOption({ type: "dates", pkg })}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-xs font-extrabold tracking-widest py-2.5 px-4 rounded-lg uppercase transition-colors"
                >
                  {pkg.buttonLabel}
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Get Unlimited Lives ── */}
        <section className="pt-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative rounded-3xl border-2 border-accent bg-background overflow-visible"
          >
            {/* Section header banner */}
            <div className="flex justify-center -mt-5 mb-0">
              <div className="relative">
                <div className="bg-accent text-accent-foreground text-xl font-black px-10 py-2 rounded-xl shadow-lg">
                  Get Unlimited Lives
                </div>
                {/* GO PREMIUM tag - bottom-right like BEST VALUE */}
                <div className="absolute -top-2 -right-5 bg-secondary text-secondary-foreground text-[10px] font-black tracking-wider px-2 py-0.5 rounded-full rotate-12 shadow whitespace-nowrap">
                  GO PREMIUM
                </div>
              </div>
            </div>

            <div className="pt-8 pb-6 px-6 sm:px-8 grid grid-cols-1 sm:grid-cols-3 gap-8 items-center">
              {/* Feature list */}
              <ul className="space-y-2 text-base text-foreground font-medium">
                {[
                  "Unlimited palms",
                  "Ad-free learning",
                  "Progress Tracking",
                  "Advanced Analytics",
                  "Personalized dashboard",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Palm trees illustration — center column */}
              <div className="flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://res.cloudinary.com/dqdeoobeb/image/upload/v1782640272/palm_tree_for_store_t59245.png"
                  alt="palm trees"
                  className="w-52 h-52 object-contain select-none"
                />
              </div>

              {/* Plan cards */}
              <div className="flex flex-row gap-3 justify-center sm:justify-end pb-4">
                {/* Monthly */}
                <div className="relative flex-1">
                  <button
                    onClick={() =>
                      setSelectedOption({ type: "premium", plan: "monthly" })
                    }
                    className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl p-4 w-full text-center transition-colors"
                  >
                    <p className="text-[10px] font-extrabold tracking-widest uppercase mb-1.5">
                      Monthly
                    </p>
                    <p className="text-2xl font-black leading-tight">
                      $9.99<span className="text-sm font-semibold">/mo</span>
                    </p>
                  </button>
                </div>

                {/* Yearly */}
                <div className="relative flex-1">
                  <button
                    onClick={() =>
                      setSelectedOption({ type: "premium", plan: "yearly" })
                    }
                    className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl p-4 w-full text-center transition-colors"
                  >
                    <p className="text-[10px] font-extrabold tracking-widest uppercase mb-1.5">
                      Yearly
                    </p>
                    <p className="text-2xl font-black leading-tight">
                      $89.99<span className="text-sm font-semibold">/yr</span>
                    </p>
                  </button>
                  <div className="absolute -bottom-3 -right-5 bg-secondary text-secondary-foreground text-[10px] font-black tracking-wider px-2 py-0.5 rounded-full -rotate-12 shadow whitespace-nowrap">
                    BEST VALUE
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
