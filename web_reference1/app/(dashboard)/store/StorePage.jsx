"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { getSessionToken, isSessionValid } from "@/lib/authUtils";
import { useDatePackagesStore } from "@/stores/useDatePackagesStore";
import { useSubscriptionPlansStore } from "@/stores/useSubscriptionPlansStore";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/nakhlah/Toast";
import {
  createDatePaymentOrder,
  createSubscriptionPayment,
  cancelSubscription,
  fetchCurrentSubscription,
} from "@/services/api";

export default function StorePage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [checkoutId, setCheckoutId] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [isLoadingCurrent, setIsLoadingCurrent] = useState(true);
  const [pendingSwitchPlan, setPendingSwitchPlan] = useState(null);
  const [isCanceling, setIsCanceling] = useState(false);
  const shouldRefetchDates = searchParams.get("refetch") === "dates";

  const requireAuth = () => {
    if (!isSessionValid(session)) {
      toast.error("Please login to continue.");
      return false;
    }
    return true;
  };

  const redirectToPayPal = (approvalUrl) => {
    window.location.assign(approvalUrl);
  };

  const datePackages = useDatePackagesStore((state) => state.packages);
  const subscriptionPlans = useSubscriptionPlansStore((state) => state.plans);
  const fetchDatePackages = useDatePackagesStore(
    (state) => state.fetchDatePackages,
  );
  const fetchSubscriptionPlans = useSubscriptionPlansStore(
    (state) => state.fetchSubscriptionPlans,
  );
  const isLoadingDates = useDatePackagesStore((state) => state.isLoading);
  const isLoadingPlans = useSubscriptionPlansStore((state) => state.isLoading);
  const datesError = useDatePackagesStore((state) => state.error);

  useEffect(() => {
    fetchDatePackages({ forceRefresh: shouldRefetchDates });
    fetchSubscriptionPlans({ forceRefresh: shouldRefetchDates });

    if (isSessionValid(session)) {
      fetchCurrentSubscription(getSessionToken(session)).then((result) => {
        if (result.success) {
          setCurrentSubscription(result.subscription);
        }
        setIsLoadingCurrent(false);
      });
    } else {
      setIsLoadingCurrent(false);
    }
  }, [fetchDatePackages, fetchSubscriptionPlans, shouldRefetchDates, session]);

  const handleDateCheckout = async (pkg) => {
    if (!requireAuth()) return;

    setCheckoutId(`dates:${pkg.id}`);
    const result = await createDatePaymentOrder(
      pkg.id,
      getSessionToken(session),
    );

    if (!result.success) {
      setCheckoutId(null);
      toast.error(result.error || "Unable to start PayPal checkout.");
      return;
    }

    redirectToPayPal(result.approvalUrl);
  };

  const handleSubscriptionCheckout = async (plan) => {
    if (!requireAuth()) return;

    if (
      currentSubscription &&
      currentSubscription.status !== "cancelled" &&
      currentSubscription.plan?.id === plan.id
    ) {
      toast.info("You already have this plan.");
      return;
    }

    if (
      currentSubscription &&
      currentSubscription.status !== "cancelled" &&
      currentSubscription.plan?.id !== plan.id
    ) {
      setPendingSwitchPlan(plan);
      return;
    }

    await startSubscriptionCheckout(plan);
  };

  const startSubscriptionCheckout = async (plan) => {
    setCheckoutId(`premium:${plan.id}`);
    const result = await createSubscriptionPayment(
      plan,
      getSessionToken(session),
    );

    if (!result.success) {
      setCheckoutId(null);
      toast.error(result.error || "Unable to start PayPal subscription.");
      return;
    }

    redirectToPayPal(result.approvalUrl);
  };

  const handleConfirmSwitch = async () => {
    if (!pendingSwitchPlan) return;

    const token = getSessionToken(session);
    setIsCanceling(true);
    setCheckoutId(`premium:${pendingSwitchPlan.id}`);

    const cancelResult = await cancelSubscription(
      currentSubscription?.id,
      token,
    );

    if (!cancelResult.success) {
      setIsCanceling(false);
      setCheckoutId(null);
      toast.error(cancelResult.error || "Failed to cancel current plan.");
      return;
    }

    await startSubscriptionCheckout(pendingSwitchPlan);
    setIsCanceling(false);
    setPendingSwitchPlan(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 max-w-5xl space-y-14">
        {/* ── Date Packages ── */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
            {isLoadingDates ? (
              [...Array(3)].map((_, i) => (
                <div
                  key={`date-skeleton-${i}`}
                  className="rounded-2xl border-2 border-border p-6 pb-8 flex flex-col items-center gap-5 bg-background h-72 animate-pulse"
                />
              ))
            ) : datePackages.length === 0 ? (
              <div className="col-span-full rounded-2xl border-2 border-border p-8 text-center bg-background">
                <p className="text-muted-foreground mb-4">
                  {datesError
                    ? "Unable to load date packages."
                    : "No date packages available."}
                </p>
                <button
                  onClick={() => fetchDatePackages({ forceRefresh: true })}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs font-extrabold tracking-widest py-2.5 px-4 rounded-lg uppercase transition-colors"
                >
                  RETRY
                </button>
              </div>
            ) : (
              datePackages.map((pkg, i) => (
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
                    onClick={() => handleDateCheckout(pkg)}
                    disabled={checkoutId !== null}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-xs font-extrabold tracking-widest py-2.5 px-4 rounded-lg uppercase transition-colors flex items-center justify-center"
                  >
                    {checkoutId === `dates:${pkg.id}` ? (
                      <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      pkg.buttonLabel
                    )}
                  </button>
                </motion.div>
              ))
            )}
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
                {isLoadingPlans
                  ? [...Array(2)].map((_, i) => (
                      <div
                        key={`plan-skeleton-${i}`}
                        className="flex-1 rounded-2xl border-2 border-border bg-card h-24 animate-pulse"
                      />
                    ))
                  : subscriptionPlans.map((plan) => {
                      const isCurrentPlan =
                        currentSubscription?.plan?.id === plan.id &&
                        currentSubscription?.status !== "cancelled";
                      return (
                        <div key={plan.id} className="relative flex-1">
                          <button
                            onClick={() =>
                              !isCurrentPlan && handleSubscriptionCheckout(plan)
                            }
                            disabled={
                              isCurrentPlan ||
                              checkoutId !== null ||
                              isLoadingCurrent
                            }
                            className={`rounded-2xl border-2 p-4 w-full flex flex-col items-center gap-2 transition-colors ${
                              isCurrentPlan
                                ? "border-secondary bg-secondary/10 text-foreground cursor-default"
                                : "border-border bg-card hover:border-accent text-foreground"
                            }`}
                          >
                            <span
                              className={`rounded-full px-6 py-2 text-[10px] font-extrabold tracking-widest uppercase ${
                                isCurrentPlan
                                  ? "bg-secondary text-secondary-foreground"
                                  : "bg-accent text-accent-foreground"
                              }`}
                            >
                              {isCurrentPlan ? "Current" : "Subscribe"}
                            </span>
                            <p className="text-2xl font-black leading-tight flex items-center justify-center min-h-[2rem]">
                              {checkoutId === `premium:${plan.id}` ? (
                                <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : (
                                plan.price
                              )}
                            </p>
                          </button>
                          {plan.popular && (
                            <div className="absolute -bottom-3 -right-5 bg-secondary text-secondary-foreground text-[10px] font-black tracking-wider px-2 py-0.5 rounded-full -rotate-12 shadow whitespace-nowrap">
                              BEST VALUE
                            </div>
                          )}
                        </div>
                      );
                    })}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Switch plan confirmation modal */}
        {pendingSwitchPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-xl text-center">
              <h3 className="text-xl font-bold text-foreground mb-2">
                Switch plan?
              </h3>
              <p className="text-muted-foreground mb-6">
                You currently have the{" "}
                <span className="font-semibold text-foreground">
                  {currentSubscription?.plan?.name || "current"}
                </span>{" "}
                plan. We&apos;ll cancel it and start checkout for the{" "}
                <span className="font-semibold text-foreground">
                  {pendingSwitchPlan.duration}
                </span>{" "}
                plan.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setPendingSwitchPlan(null);
                    setIsCanceling(false);
                    setCheckoutId(null);
                  }}
                >
                  Keep Current
                </Button>
                <Button
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                  onClick={handleConfirmSwitch}
                  disabled={isCanceling}
                >
                  {isCanceling ? (
                    <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Switch Plan"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
