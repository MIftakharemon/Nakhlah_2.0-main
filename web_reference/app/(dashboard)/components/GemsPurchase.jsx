"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const gemPackages = [
  {
    id: 1,
    amount: 500,
    price: "$2",
    emoji: "💎",
    label: "Date Package 1",
  },
  {
    id: 2,
    amount: 1000,
    price: "$10",
    emoji: "💎",
    label: "Date Package 2",
    popular: true,
  },
  {
    id: 3,
    amount: 1500,
    price: "$15",
    emoji: "💎",
    label: "Date Package 3",
  },
];

export function GemsPurchase() {
  const handlePurchase = (packageId, price) => {
    console.log(`Purchase package ${packageId} for ${price}`);
    // Handle purchase logic here
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-6 text-center">Get More Dates</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {gemPackages.map((pkg, index) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative rounded-xl p-5 text-center transition-all ${
              pkg.popular
                ? "bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary ring-2 ring-primary/10 scale-105"
                : "bg-muted/30 border border-border hover:border-primary/50"
            }`}
          >
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>
            )}

            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-4xl">{pkg.emoji}</span>
            </div>

            <h3 className="font-bold text-foreground mb-2">{pkg.label}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {pkg.amount} Dates
            </p>

            <Button
              onClick={() => handlePurchase(pkg.id, pkg.price)}
              className={`w-full font-semibold ${
                pkg.popular
                  ? "bg-primary hover:bg-primary/90"
                  : "bg-accent hover:bg-accent/90"
              }`}
            >
              Buy Now
            </Button>

            <p className="text-lg font-bold mt-3 text-accent">{pkg.price}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>✨ Dates never expire and can be used anytime!</p>
      </div>
    </div>
  );
}
