"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCharacterVideo } from "@/lib/characterVideos";
import { Home, RefreshCw, ShoppingBag } from "lucide-react";

export default function SubscriptionFailedClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subscriptionId = searchParams.get("subscription_id") || "";
  const baToken = searchParams.get("ba_token") || "";
  const token = searchParams.get("token") || "";
  const characterVideo = useCharacterVideo("sad");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="hidden lg:flex flex-col items-center justify-center"
        >
          <video
            src={characterVideo}
            autoPlay
            loop
            muted
            playsInline
            className="w-72 h-72 mb-6"
          />
          <h2 className="text-2xl font-bold text-foreground text-center max-w-md">
            Don&apos;t worry, you can try again anytime.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card border border-border rounded-3xl p-8 md:p-12 text-center shadow-sm"
        >
          <div className="lg:hidden flex justify-center mb-6">
            <video
              src={characterVideo}
              autoPlay
              loop
              muted
              playsInline
              className="w-48 h-48"
            />
          </div>

          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 text-accent">
              <RefreshCw className="w-8 h-8" />
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-foreground">
              Payment not completed
            </h1>

            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl mx-auto">
              Your PayPal subscription checkout was canceled or failed, so no
              charge was completed. You can choose a plan again whenever
              you&apos;re ready.
            </p>

            {(subscriptionId || baToken || token) && (
              <p className="text-xs text-muted-foreground">
                {subscriptionId && `Subscription: ${subscriptionId}`}
                {baToken && ` · BA token: ${baToken}`}
                {token && ` · Token: ${token}`}
              </p>
            )}
          </div>

          <div className="pt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Button>

            <Button
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => router.push("/store")}
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Choose a Plan
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
