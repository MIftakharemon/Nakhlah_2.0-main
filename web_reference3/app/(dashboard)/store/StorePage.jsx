"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useSession } from "next-auth/react";
import { Calendar } from "@/components/icons/Calendar";
import { NotoStopwatch } from "@/components/icons/NotoStopwatch";
import { FreshDateMascot } from "@/components/nakhlah/DateMascot";
import { useSearchParams } from "next/navigation";
import { getSessionToken, isSessionValid } from "@/lib/authUtils";
import { useDatePackagesStore } from "@/stores/useDatePackagesStore";
import { useSubscriptionPlansStore } from "@/stores/useSubscriptionPlansStore";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/components/nakhlah/Toast";
import {
  createDatePaymentOrder,
  createSubscriptionPayment,
  cancelSubscription,
  switchSubscription,
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
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [showSubscriptionDetails, setShowSubscriptionDetails] = useState(false);
  const shouldRefetchDates = searchParams.get("refetch") === "dates";

  const loadCurrentSubscription = async () => {
    if (!isSessionValid(session)) return;
    const result = await fetchCurrentSubscription(getSessionToken(session));
    if (result.success) {
      setCurrentSubscription(result.subscription);
    }
  };

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
      loadCurrentSubscription().then(() => setIsLoadingCurrent(false));
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

    const canSwitch =
      currentSubscription && currentSubscription.status !== "cancelled";

    if (canSwitch && currentSubscription.plan?.id === plan.id) {
      if (currentSubscription.cancelAtPeriodEnd) {
        toast.info(
          `You can resubscribe to this plan after ${new Date(
            currentSubscription.currentPeriodEnd,
          ).toLocaleDateString()}.`,
        );
      } else {
        toast.info("You already have this plan.");
      }
      return;
    }

    if (canSwitch && currentSubscription.plan?.id !== plan.id) {
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

    const switchResult = await switchSubscription(pendingSwitchPlan.id, token);

    if (!switchResult.success) {
      setIsCanceling(false);
      setCheckoutId(null);
      toast.error(switchResult.error || "Failed to switch plan.");
      return;
    }

    const approvalUrl = switchResult.data?.approvalUrl;
    if (approvalUrl) {
      window.location.assign(approvalUrl);
      return;
    }

    toast.success(switchResult.message || "Plan switched successfully.");
    await loadCurrentSubscription();
    setIsCanceling(false);
    setPendingSwitchPlan(null);
  };

  const isSubscriptionActive =
    currentSubscription &&
    currentSubscription.status !== "cancelled" &&
    !currentSubscription.cancelAtPeriodEnd;

  const isSubscriptionCancelling =
    currentSubscription &&
    currentSubscription.status !== "cancelled" &&
    currentSubscription.cancelAtPeriodEnd;

  const promptCancelSubscription = () => {
    if (!requireAuth()) return;
    if (!currentSubscription?.id) {
      toast.error("No active subscription found.");
      return;
    }
    setShowConfirmCancel(true);
  };

  const confirmCancelSubscription = async () => {
    if (!requireAuth()) return;
    const subscriptionId = currentSubscription?.id;
    if (!subscriptionId) {
      toast.error("No active subscription found.");
      return;
    }

    setShowConfirmCancel(false);
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

  const handleResubscribe = async (plan) => {
    if (!requireAuth()) return;

    const newPlanId = plan?.id || currentSubscription?.plan?.id;
    if (!newPlanId) {
      toast.error("No plan selected.");
      return;
    }

    // Fully cancelled subscriptions need a fresh checkout, not a switch.
    setCheckoutId(`premium:${newPlanId}`);
    const result = await createSubscriptionPayment(
      plan || currentSubscription?.plan,
      getSessionToken(session),
    );

    if (!result.success) {
      setCheckoutId(null);
      toast.error(result.error || "Unable to resubscribe.");
      return;
    }

    window.location.assign(result.approvalUrl);
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
                        currentSubscription?.status !== "cancelled" &&
                        !currentSubscription?.cancelAtPeriodEnd;
                      const isCancelledPlan =
                        currentSubscription?.plan?.id === plan.id &&
                        currentSubscription?.status === "cancelled";
                      const isCancellingPlan =
                        currentSubscription?.plan?.id === plan.id &&
                        currentSubscription?.status !== "cancelled" &&
                        currentSubscription?.cancelAtPeriodEnd;
                      const isInteractive =
                        isCurrentPlan || isCancellingPlan || isCancelledPlan;
                      const tooltipText = isCurrentPlan
                        ? "Click to manage your current plan"
                        : isCancellingPlan
                          ? "Click to view cancellation details"
                          : isCancelledPlan
                            ? "Click to view ended subscription"
                            : "";

                      const planCard = (
                        <div
                          onClick={() =>
                            isInteractive && setShowSubscriptionDetails(true)
                          }
                          className={`rounded-2xl border-2 p-4 w-full min-w-0 flex flex-col items-center gap-2 transition-colors ${
                            isCurrentPlan
                              ? "border-emerald-600 bg-emerald-600/10 dark:border-emerald-500 dark:bg-emerald-950/30 text-foreground"
                              : isCancellingPlan
                                ? "border-amber-600 bg-amber-600/10 dark:border-amber-500 dark:bg-amber-950/30 text-foreground"
                                : isCancelledPlan
                                  ? "border-slate-600 bg-slate-600/10 dark:border-slate-500 dark:bg-slate-950/30 text-foreground"
                                  : "border-border bg-card hover:border-violet-600 text-foreground"
                          } ${isInteractive ? "cursor-pointer" : ""}`}
                        >
                          {isCurrentPlan ? (
                            <span className="rounded-full px-5 py-2 text-[10px] font-extrabold tracking-widest uppercase bg-emerald-600 text-white dark:bg-emerald-600 dark:text-white min-w-[92px] text-center">
                              Current
                            </span>
                          ) : isCancellingPlan ? (
                            <span className="rounded-full px-5 py-2 text-[10px] font-extrabold tracking-widest uppercase bg-amber-600 text-white dark:bg-amber-600 dark:text-white min-w-[92px] text-center">
                              Cancels
                            </span>
                          ) : isCancelledPlan ? (
                            <span className="rounded-full px-5 py-2 text-[10px] font-extrabold tracking-widest uppercase bg-slate-600 text-white dark:bg-slate-600 dark:text-white min-w-[92px] text-center">
                              Cancelled
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSubscriptionCheckout(plan)}
                              disabled={checkoutId !== null || isLoadingCurrent}
                              className="rounded-full px-5 py-2 text-[10px] font-extrabold tracking-widest uppercase bg-accent text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50 min-w-[92px]"
                            >
                              Subscribe
                            </button>
                          )}
                          <p className="text-2xl font-black leading-tight flex items-center justify-center min-h-[2rem] w-full text-center truncate">
                            {checkoutId === `premium:${plan.id}` ? (
                              <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              plan.price
                            )}
                          </p>
                        </div>
                      );

                      return (
                        <div key={plan.id} className="relative flex-1 min-w-0">
                          {isInteractive ? (
                            <TooltipProvider delayDuration={200}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  {planCard}
                                </TooltipTrigger>
                                <TooltipContent
                                  side="bottom"
                                  sideOffset={6}
                                  collisionPadding={24}
                                  align="center"
                                  avoidCollisions
                                  className="bg-foreground text-background max-w-[200px] break-words"
                                >
                                  <p className="text-sm font-medium">
                                    {tooltipText}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            planCard
                          )}
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

        <AlertDialog
          open={showConfirmCancel}
          onOpenChange={setShowConfirmCancel}
        >
          <AlertDialogContent className="relative">
            <AlertDialogCancel
              disabled={isCanceling}
              className="absolute right-4 top-4 h-4 w-4 p-0 border-0 bg-transparent text-foreground opacity-70 hover:opacity-100 hover:bg-transparent focus:ring-0 focus:ring-offset-0 disabled:pointer-events-none"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </AlertDialogCancel>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel subscription?</AlertDialogTitle>
              <AlertDialogDescription>
                Your{" "}
                <span className="font-semibold text-foreground">
                  {currentSubscription?.plan?.name || "Premium"}
                </span>{" "}
                subscription will be canceled, but you&apos;ll keep full access
                until{" "}
                <span className="font-semibold text-foreground">
                  {currentSubscription?.currentPeriodEnd
                    ? new Date(
                        currentSubscription.currentPeriodEnd,
                      ).toLocaleDateString()
                    : "the end of your current billing period"}
                </span>
                .
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isCanceling}>
                Keep Subscription
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  confirmCancelSubscription();
                }}
                disabled={isCanceling}
                className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
              >
                {isCanceling ? "Canceling..." : "Yes, Cancel"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog
          open={showSubscriptionDetails}
          onOpenChange={setShowSubscriptionDetails}
        >
          <DialogContent className="sm:rounded-3xl border-2 border-border p-0 overflow-hidden max-w-2xl">
            <div
              className={`p-6 pb-0 ${
                currentSubscription?.status === "cancelled"
                  ? "bg-gradient-to-br from-slate-100 via-background to-background dark:from-slate-900 dark:via-background dark:to-background"
                  : currentSubscription?.cancelAtPeriodEnd
                    ? "bg-gradient-to-br from-amber-50 via-background to-background dark:from-amber-950/40 dark:via-background dark:to-background"
                    : "bg-gradient-to-br from-emerald-50 via-background to-background dark:from-emerald-950/30 dark:via-background dark:to-background"
              }`}
            >
              <div>
                <DialogTitle className="text-2xl font-bold text-foreground">
                  {currentSubscription?.plan?.name || "Premium"}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground mt-1">
                  Subscription details
                </DialogDescription>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-sm ${
                    currentSubscription?.status === "cancelled"
                      ? "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
                      : currentSubscription?.cancelAtPeriodEnd
                        ? "bg-amber-200 text-amber-900 dark:bg-amber-800 dark:text-amber-100"
                        : "bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full animate-pulse ${
                      currentSubscription?.status === "cancelled"
                        ? "bg-slate-600"
                        : currentSubscription?.cancelAtPeriodEnd
                          ? "bg-amber-600"
                          : "bg-emerald-600"
                    }`}
                  />
                  {currentSubscription?.status === "cancelled"
                    ? "Cancelled"
                    : currentSubscription?.cancelAtPeriodEnd
                      ? "Cancels at period end"
                      : "Active"}
                </span>
              </div>

              <div className="flex justify-center -mb-10 mt-4">
                <FreshDateMascot
                  mood={
                    currentSubscription?.status === "cancelled"
                      ? "sad"
                      : currentSubscription?.cancelAtPeriodEnd
                        ? "thinking"
                        : "proud"
                  }
                  size="xxl"
                />
              </div>
            </div>

            <div className="pt-12 px-6 pb-6 space-y-4 bg-background">
              <div className="rounded-2xl border-2 border-border bg-card p-4 space-y-3 shadow-sm">
                {currentSubscription?.currentPeriodStart && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar size="xs" />
                      <span className="text-sm font-medium">Started</span>
                    </div>
                    <span className="font-bold text-sm text-foreground">
                      {new Date(
                        currentSubscription.currentPeriodStart,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {currentSubscription?.currentPeriodEnd && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <NotoStopwatch size="xs" />
                      <span className="text-sm font-medium">
                        {currentSubscription?.cancelAtPeriodEnd
                          ? "Access until"
                          : "Renews on"}
                      </span>
                    </div>
                    <span className="font-bold text-sm text-foreground">
                      {new Date(
                        currentSubscription.currentPeriodEnd,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {currentSubscription?.cancelledAt && (
                  <div className="flex items-center justify-between pt-2 border-t-2 border-border">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar size="xs" />
                      <span className="text-sm font-medium">Cancelled on</span>
                    </div>
                    <span className="font-bold text-sm text-foreground">
                      {new Date(
                        currentSubscription.cancelledAt,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {currentSubscription?.cancelAtPeriodEnd && (
                <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-900 p-4">
                  <p className="text-sm text-amber-900 dark:text-amber-100 font-semibold mb-1">
                    You still have access
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                    Your subscription is canceled but your premium benefits stay
                    active until{" "}
                    {currentSubscription?.currentPeriodEnd
                      ? new Date(
                          currentSubscription.currentPeriodEnd,
                        ).toLocaleDateString()
                      : "the end of your billing period"}
                    . Want to keep going? Resubscribe anytime before it ends.
                  </p>
                </div>
              )}

              {currentSubscription?.status === "cancelled" && (
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/30 border-2 border-slate-200 dark:border-slate-800 p-4 space-y-3">
                  <div>
                    <p className="text-sm text-slate-900 dark:text-slate-100 font-semibold mb-1">
                      Subscription ended
                    </p>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      Your plan has ended. Resubscribe to unlock unlimited lives
                      and premium features again.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setShowSubscriptionDetails(false);
                      handleResubscribe(currentSubscription.plan);
                    }}
                    disabled={
                      checkoutId !== null || !currentSubscription?.plan?.id
                    }
                    className="w-full bg-slate-700 hover:bg-slate-800 text-white dark:bg-slate-200 dark:hover:bg-white dark:text-slate-900"
                  >
                    {checkoutId === `premium:${currentSubscription?.plan?.id}`
                      ? "Resubscribing..."
                      : "Resubscribe Now"}
                  </Button>
                </div>
              )}

              {currentSubscription?.status !== "cancelled" &&
                !currentSubscription?.cancelAtPeriodEnd && (
                  <div className="rounded-2xl bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-900 p-4 space-y-3">
                    <div>
                      <p className="text-sm text-red-900 dark:text-red-100 font-semibold mb-1">
                        Cancel subscription
                      </p>
                      <p className="text-xs text-red-800 dark:text-red-200 leading-relaxed">
                        If you cancel, you will keep premium access until{" "}
                        {currentSubscription?.currentPeriodEnd
                          ? new Date(
                              currentSubscription.currentPeriodEnd,
                            ).toLocaleDateString()
                          : "the end of your billing period"}
                        . After that, your subscription will not renew.
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        setShowSubscriptionDetails(false);
                        promptCancelSubscription();
                      }}
                      disabled={isCanceling}
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                      {isCanceling ? "Canceling..." : "Cancel Subscription"}
                    </Button>
                  </div>
                )}

              {/* {currentSubscription?.cancelAtPeriodEnd &&
                currentSubscription?.status !== "cancelled" && (
                  <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-900 p-4">
                    <p className="text-sm text-amber-900 dark:text-amber-100 font-semibold mb-1">
                      Want to keep premium access?
                    </p>
                    <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                      You can switch to a different billing interval anytime
                      before{" "}
                      {currentSubscription?.currentPeriodEnd
                        ? new Date(
                            currentSubscription.currentPeriodEnd,
                          ).toLocaleDateString()
                        : "the end of your billing period"}
                      . Just select the other plan card above.
                    </p>
                  </div>
                )} */}
            </div>
          </DialogContent>
        </Dialog>

        {/* Switch plan confirmation modal */}
        <Dialog
          open={!!pendingSwitchPlan}
          onOpenChange={(open) => {
            if (!open) {
              setPendingSwitchPlan(null);
              setIsCanceling(false);
              setCheckoutId(null);
            }
          }}
        >
          <DialogContent className="sm:rounded-3xl border-2 border-border p-0 overflow-hidden max-w-md">
            <div className="p-6 text-center">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-foreground">
                  Switch plan?
                </DialogTitle>
                <DialogDescription className="text-muted-foreground mt-2">
                  You currently have the{" "}
                  <span className="font-semibold text-foreground">
                    {currentSubscription?.plan?.name || "current"}
                  </span>{" "}
                  plan. We&apos;ll cancel it and start checkout for the{" "}
                  <span className="font-semibold text-foreground">
                    {pendingSwitchPlan?.duration}
                  </span>{" "}
                  plan.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-6 flex-col sm:flex-row gap-3 sm:justify-center">
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
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
