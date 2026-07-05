"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Zap,
  Calendar,
  TrendingUp,
  Check,
  Clock,
  Flame,
  ArrowLeft,
  Star,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Crown } from "@/components/icons/Crown";
import { DatesIcon } from "@/components/icons/PublicAssetIcons";
import { Mascot } from "@/components/nakhlah/Mascot";
import { getSessionToken, isSessionValid } from "@/lib/authUtils";
import { useSubscriptionPlansStore } from "@/stores/useSubscriptionPlansStore";
import {
  createSubscriptionPayment,
  fetchCurrentSubscription,
  cancelSubscription,
} from "@/services/api";
import { toast } from "@/components/nakhlah/Toast";

const premiumFeatures = [
  {
    id: 1,
    name: "Unlimited Dates",
    description: "Get unlimited dates to unlock premium content",
    icon: BookOpen,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: 2,
    name: "Lessons Reminder",
    description: "Get daily lesson reminders to keep on track of learning",
    icon: Calendar,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    id: 3,
    name: "Learning Calendar",
    description:
      "Visualizing your streak, practicing and activities in calendar",
    icon: Calendar,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    id: 4,
    name: "Boost Your Injaz",
    description: "Unlock more Injaz from every single lesson finished",
    icon: Zap,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
  },
  {
    id: 5,
    name: "Learning E-Book",
    description: "Unlock all e-books to boost your learning experience",
    icon: BookOpen,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    id: 6,
    name: "Learn Better",
    description: "Get learning progress to improve your learning",
    icon: TrendingUp,
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
  },
  {
    id: 7,
    name: "No Waiting Time",
    description: "Get your quiz result without any waiting time",
    icon: Clock,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
  {
    id: 8,
    name: "Free and No ads",
    description: "Enjoy learning with no interruptions from ads",
    icon: Flame,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
];

export default function PremiumSubscription({ onBack, initialPlan }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(initialPlan ? 2 : 1);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [checkoutPlanId, setCheckoutPlanId] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [isLoadingCurrent, setIsLoadingCurrent] = useState(true);
  const [isCanceling, setIsCanceling] = useState(false);
  const [showConfirmSwitch, setShowConfirmSwitch] = useState(false);
  const [pendingSwitchPlan, setPendingSwitchPlan] = useState(null);

  const subscriptionPlans = useSubscriptionPlansStore((state) => state.plans);
  const fetchSubscriptionPlans = useSubscriptionPlansStore(
    (state) => state.fetchSubscriptionPlans,
  );
  const isLoadingPlans = useSubscriptionPlansStore((state) => state.isLoading);

  const loadCurrentSubscription = useCallback(async () => {
    if (!isSessionValid(session)) {
      setIsLoadingCurrent(false);
      return;
    }
    const result = await fetchCurrentSubscription(getSessionToken(session));
    if (result.success) {
      setCurrentSubscription(result.subscription);
    }
    setIsLoadingCurrent(false);
  }, [session]);

  useEffect(() => {
    fetchSubscriptionPlans();
    loadCurrentSubscription();
  }, [fetchSubscriptionPlans, loadCurrentSubscription]);

  const requireAuth = () => {
    if (!isSessionValid(session)) {
      toast.error("Please login to continue.");
      return false;
    }
    return true;
  };

  const initialPlanInterval = initialPlan === "monthly" ? "month" : "year";
  const defaultSelectedPlan =
    (initialPlan
      ? subscriptionPlans.find((plan) => plan.interval === initialPlanInterval)
      : subscriptionPlans[0]) || subscriptionPlans[0];
  const selectedPlanId = selectedPlan || defaultSelectedPlan?.id || null;
  const selectedPlanDetails = subscriptionPlans.find(
    (plan) => plan.id === selectedPlanId,
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const handleBack = () => {
    if (currentStep > 1 && !initialPlan) {
      setCurrentStep(currentStep - 1);
    } else if (onBack) {
      onBack();
    } else {
      router.push("/store");
    }
  };

  const startSubscriptionCheckout = async (plan) => {
    if (!requireAuth()) return;

    if (!plan) {
      toast.error("Please select a subscription plan.");
      return;
    }

    setCheckoutPlanId(plan.id);
    const result = await createSubscriptionPayment(
      plan,
      getSessionToken(session),
    );

    if (!result.success) {
      setCheckoutPlanId(null);
      toast.error(result.error || "Unable to start PayPal subscription.");
      return;
    }

    window.location.assign(result.approvalUrl);
  };

  const handleCancelSubscription = async () => {
    if (!requireAuth()) return;

    const subscriptionId =
      currentSubscription?.paypalSubscriptionId || currentSubscription?.id;
    if (!subscriptionId) {
      toast.error("No active subscription found.");
      return;
    }

    setIsCanceling(true);
    const result = await cancelSubscription(
      subscriptionId,
      getSessionToken(session),
    );

    if (!result.success) {
      setIsCanceling(false);
      toast.error(result.error || "Unable to cancel subscription.");
      return;
    }

    toast.success(result.message || "Subscription canceled successfully.");
    await loadCurrentSubscription();
    setIsCanceling(false);
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan.id);
  };

  const promptSwitch = (plan) => {
    setPendingSwitchPlan(plan);
    setShowConfirmSwitch(true);
  };

  const handleConfirmSwitch = async () => {
    if (!pendingSwitchPlan) return;

    setShowConfirmSwitch(false);

    const subscriptionId =
      currentSubscription?.paypalSubscriptionId || currentSubscription?.id;
    if (subscriptionId) {
      setIsCanceling(true);
      const cancelResult = await cancelSubscription(
        subscriptionId,
        getSessionToken(session),
      );
      setIsCanceling(false);

      if (!cancelResult.success) {
        toast.error(cancelResult.error || "Unable to switch plan.");
        return;
      }

      toast.success("Previous subscription canceled. Starting new checkout...");
    }

    await startSubscriptionCheckout(pendingSwitchPlan);
    setPendingSwitchPlan(null);
  };

  const handleSubscriptionCheckout = async () => {
    if (!selectedPlanDetails) {
      toast.error("Please select a subscription plan.");
      return;
    }

    if (
      currentSubscription &&
      currentSubscription.status !== "cancelled" &&
      currentSubscription.plan?.id === selectedPlanDetails.id
    ) {
      toast.info("You already have this plan.");
      return;
    }

    if (currentSubscription && currentSubscription.status !== "cancelled") {
      promptSwitch(selectedPlanDetails);
      return;
    }

    startSubscriptionCheckout(selectedPlanDetails);
  };

  const handleNext = () => {
    if (!requireAuth()) return;

    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }

    handleSubscriptionCheckout();
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {currentStep === 1 && (
        <motion.div
          key="premium-step1"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Store
            </h1>
            <Crown className="text-accent" />
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-accent p-6 text-center shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
              <div className="flex-shrink-0">
                <Mascot mood="excited" size="xxl" />
              </div>

              <div className="flex-1 max-w-2xl">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Get a better & super fast learning up to 5x
                </h2>
                <p className="text-white/90 text-sm md:text-base">
                  Unlock all premium channels and accelerate your learning
                  journey with exclusive content
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
            {premiumFeatures.map((feature) => (
              <div
                key={feature.id}
                className="flex flex-row md:flex-col items-center md:items-center gap-4 p-3 md:p-6 rounded-xl md:rounded-2xl bg-card border border-border transition-all duration-300 text-left md:text-center"
              >
                <div
                  className={`shrink-0 p-3 md:p-4 rounded-xl md:rounded-2xl ${feature.iconBg} shadow-sm group-hover:shadow-md transition-shadow`}
                >
                  <feature.icon
                    className={`w-5 h-5 md:w-8 md:h-8 ${feature.iconColor}`}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-foreground text-sm md:text-base mb-0.5 md:mb-2 leading-tight">
                    {feature.name}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground leading-snug md:leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <motion.div
            variants={itemVariants}
            className="relative rounded-xl border border-border p-6 bg-accent/10 hover:border-accent/50 transition-all cursor-pointer group"
            onClick={() => router.push("/store")}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg transition-colors">
                <DatesIcon size="lg" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground mb-1">
                  Want to buy more dates?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Get dates to unlock lessons and boost your progress
                </p>
              </div>
              <div className="text-accent">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
          </motion.div>

          <div className="flex justify-center pt-4">
            <Button
              className="w-full max-w-md bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={handleNext}
            >
              Go Premium Now
            </Button>
          </div>
        </motion.div>
      )}

      {currentStep === 2 && (
        <motion.div
          key="premium-step2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <Button variant="ghost" onClick={handleBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <motion.div variants={itemVariants} className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Choose a subscription plan
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
              Select a plan and we’ll open PayPal checkout directly.
            </p>
          </motion.div>

          {!isLoadingCurrent && currentSubscription && (
            <motion.div
              variants={itemVariants}
              className={`max-w-lg mx-auto rounded-2xl border-2 p-6 text-center ${
                currentSubscription.status === "cancelled"
                  ? "border-muted bg-muted/30"
                  : "border-accent bg-accent/10"
              }`}
            >
              <p className="text-sm text-muted-foreground mb-1">Current plan</p>
              <p className="text-2xl font-bold text-foreground mb-2">
                {currentSubscription.plan?.name || "Premium"}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Status:{" "}
                <span className="font-semibold capitalize">
                  {currentSubscription.status}
                </span>
                {currentSubscription.currentPeriodEnd && (
                  <span className="block mt-1">
                    Active until{" "}
                    {new Date(
                      currentSubscription.currentPeriodEnd,
                    ).toLocaleDateString()}
                  </span>
                )}
              </p>
              {currentSubscription.status !== "cancelled" && (
                <Button
                  variant="outline"
                  onClick={handleCancelSubscription}
                  disabled={isCanceling}
                  className="w-full"
                >
                  {isCanceling ? "Canceling..." : "Cancel Subscription"}
                </Button>
              )}
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-lg mx-auto">
            {isLoadingPlans
              ? [...Array(2)].map((_, i) => (
                  <div
                    key={`plan-skeleton-${i}`}
                    className="rounded-2xl p-6 bg-card border border-border h-80 animate-pulse"
                  />
                ))
              : subscriptionPlans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => handlePlanSelect(plan)}
                    disabled={checkoutPlanId !== null || isCanceling}
                    className={`relative p-6 rounded-2xl border-2 transition-all text-center shadow-md hover:shadow-2xl ${
                      selectedPlanId === plan.id
                        ? "border-accent bg-gradient-to-br from-accent/10 via-accent/5 to-accent/10 shadow-xl"
                        : "border-border bg-card hover:border-accent/30"
                    } ${plan.popular ? "lg:scale-110" : ""}`}
                  >
                    {plan.popular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white border-0 shadow-lg px-4 py-1">
                        <Star className="w-3 h-3 mr-1 inline" /> Most Popular
                      </Badge>
                    )}

                    <div className="space-y-4 pt-2">
                      <div
                        className={`w-16 h-16 mx-auto rounded-full border-3 flex items-center justify-center transition-all ${
                          selectedPlanId === plan.id
                            ? "border-accent bg-accent scale-110"
                            : "border-border bg-muted"
                        }`}
                      >
                        {selectedPlanId === plan.id ? (
                          <Check
                            className="w-8 h-8 text-white"
                            strokeWidth={3}
                          />
                        ) : (
                          <Crown className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>

                      <div>
                        <p className="font-bold text-foreground text-xl mb-1">
                          {plan.duration}
                        </p>
                        {plan.savePercent && (
                          <p className="text-sm text-accent font-semibold mb-2">
                            {plan.price}
                          </p>
                        )}
                      </div>

                      <div className="py-4 border-t border-border">
                        {plan.actualPrice ? (
                          <>
                            <p className="text-sm text-muted-foreground line-through mb-1">
                              {plan.originalPrice}
                            </p>
                            <p className="text-3xl md:text-4xl font-bold text-accent">
                              {plan.actualPrice}
                            </p>
                          </>
                        ) : (
                          <p className="text-3xl md:text-4xl font-bold text-foreground">
                            {plan.price}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          per billing cycle
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
          </div>

          <div className="flex justify-center pt-4">
            <Button
              className="w-full max-w-md bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={handleSubscriptionCheckout}
              disabled={
                !selectedPlanDetails || checkoutPlanId !== null || isCanceling
              }
            >
              {checkoutPlanId
                ? "Opening PayPal..."
                : currentSubscription &&
                    currentSubscription.status !== "cancelled" &&
                    currentSubscription.plan?.id !== selectedPlanDetails?.id
                  ? "Switch Plan"
                  : "Continue with PayPal"}
            </Button>
          </div>

          {showConfirmSwitch && pendingSwitchPlan && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
              <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full shadow-xl text-center">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Switch subscription plan?
                </h3>
                <p className="text-muted-foreground mb-6">
                  You already have an active{" "}
                  <span className="font-semibold">
                    {currentSubscription?.plan?.name || "subscription"}
                  </span>
                  . Switching will cancel it and start a new{" "}
                  <span className="font-semibold">
                    {pendingSwitchPlan.duration}
                  </span>{" "}
                  plan.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowConfirmSwitch(false);
                      setPendingSwitchPlan(null);
                    }}
                  >
                    Keep Current
                  </Button>
                  <Button
                    className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                    onClick={handleConfirmSwitch}
                    disabled={isCanceling}
                  >
                    {isCanceling ? "Switching..." : "Switch Plan"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
