/* eslint-disable @next/next/no-img-element */
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Zap,
  Calendar,
  TrendingUp,
  Check,
  Lock,
  Clock,
  Flame,
  ArrowLeft,
  Home,
  Star,
  Mail,
  User,
  CreditCard,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown } from "@/components/icons/Crown";
import { DatesIcon } from "@/components/icons/PublicAssetIcons";
import { Mascot } from "@/components/nakhlah/Mascot";

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

const subscriptionPlans = [
  {
    id: "1month",
    duration: "1 Month",
    price: "$10.00",
    savePercent: null,
  },
  {
    id: "3months",
    duration: "3 Months",
    price: "Save over 40%",
    originalPrice: "$30.00",
    actualPrice: "$25.00",
    savePercent: "40%",
  },
  {
    id: "6months",
    duration: "6 Months",
    price: "Save over 45%",
    originalPrice: "$60.00",
    actualPrice: "$45.00",
    savePercent: "45%",
    popular: true,
  },
  {
    id: "12months",
    duration: "12 Months",
    price: "Save over 50%",
    originalPrice: "$120.00",
    actualPrice: "$80.00",
    savePercent: "50%",
  },
];

const paymentMethods = [
  {
    id: "paypal",
    name: "PayPal",
    logo: "https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg",
    fields: ["email"],
  },
  {
    id: "googlepay",
    name: "Google Pay",
    logo: "https://www.gstatic.com/instantbuy/svg/dark_gpay.svg",
    fields: ["email"],
  },
  {
    id: "applepay",
    name: "Apple Pay",
    logo: "https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg",
    fields: ["email"],
  },
  {
    id: "mastercard",
    name: "Mastercard",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg",
    fields: ["cardNumber", "cardName", "expiry", "cvv"],
  },
  {
    id: "visa",
    name: "Visa",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg",
    fields: ["cardNumber", "cardName", "expiry", "cvv"],
  },
  {
    id: "amex",
    name: "American Express",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg",
    fields: ["cardNumber", "cardName", "expiry", "cvv"],
  },
];

export default function PremiumSubscription({ onBack }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState("6months");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentData, setPaymentData] = useState({
    email: "",
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });

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

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setCurrentStep(4);
  };

  const handleInputChange = (field, value) => {
    setPaymentData((prev) => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, "");
    const formatted = cleaned.match(/.{1,4}/g);
    return formatted ? formatted.join(" ") : cleaned;
  };

  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Step 1: Features Overview */}
      {currentStep === 1 && (
        <motion.div
          key="premium-step1"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Store
            </h1>
            <Crown className="text-accent" />
          </div>

          {/* Hero Card */}
          <div className="relative overflow-hidden rounded-3xl bg-accent p-6 text-center shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
              {/* Mascot */}
              <div className="flex-shrink-0">
                <Mascot mood="excited" size="xxl" />
              </div>

              {/* Text Content */}
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

          {/* Features Grid */}
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

          {/* Dates CTA Card */}
          <motion.div
            variants={itemVariants}
            className="relative rounded-xl border border-border p-6 bg-accent/10 hover:border-accent/50 transition-all cursor-pointer group"
            onClick={() => router.push("/store/dates")}
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

          {/* Action Button */}
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

      {/* Step 2: Subscription Plans */}
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
              Select the perfect plan for your learning journey and save more
              with longer subscriptions
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {subscriptionPlans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative p-6 rounded-2xl border-2 transition-all text-center shadow-md hover:shadow-2xl ${
                  selectedPlan === plan.id
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
                      selectedPlan === plan.id
                        ? "border-accent bg-accent scale-110"
                        : "border-border bg-muted"
                    }`}
                  >
                    {selectedPlan === plan.id ? (
                      <Check className="w-8 h-8 text-white" strokeWidth={3} />
                    ) : (
                      <Crown
                        className={`w-8 h-8 ${selectedPlan === plan.id ? "text-white" : "text-muted-foreground"}`}
                      />
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
              onClick={handleNext}
            >
              Continue to Payment
            </Button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Payment Method */}
      {currentStep === 3 && (
        <motion.div
          key="premium-step3"
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
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Select payment method
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
              Choose your preferred payment option to complete your subscription
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedPayment(method.id)}
                className={`relative p-3 sm:p-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-lg min-h-[110px] sm:min-h-[140px] ${
                  selectedPayment === method.id
                    ? "border-accent bg-gradient-to-br from-accent/10 via-accent/5 to-accent/10 shadow-md scale-[1.02] sm:scale-105"
                    : "border-border bg-card hover:border-accent/30"
                }`}
              >
                {selectedPayment === method.id && (
                  <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-accent flex items-center justify-center shadow-lg">
                    <Check
                      className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                      strokeWidth={3}
                    />
                  </div>
                )}

                <div className="w-full flex items-center justify-center">
                  <img
                    src={method.logo}
                    alt={method.name}
                    className="max-w-[50px] max-h-[50px] sm:max-w-[80px] sm:max-h-[80px] object-contain"
                  />
                </div>

                <span className="font-semibold text-foreground text-xs sm:text-sm text-center leading-tight">
                  {method.name}
                </span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {selectedPayment && (
              <motion.form
                key={selectedPayment}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handlePaymentSubmit}
                className="max-w-2xl mx-auto bg-card border border-border rounded-2xl p-6 md:p-8 shadow-lg"
              >
                <h3 className="text-xl font-bold text-foreground mb-6">
                  Enter{" "}
                  {paymentMethods.find((m) => m.id === selectedPayment)?.name}{" "}
                  Details
                </h3>

                <div className="space-y-5">
                  {["paypal", "googlepay", "applepay"].includes(
                    selectedPayment,
                  ) && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={paymentData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        placeholder="your.email@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                      />
                    </div>
                  )}

                  {["mastercard", "visa", "amex"].includes(selectedPayment) && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Card Number
                        </label>
                        <input
                          type="text"
                          required
                          value={paymentData.cardNumber}
                          onChange={(e) => {
                            const formatted = formatCardNumber(e.target.value);
                            if (formatted.replace(/\s/g, "").length <= 16) {
                              handleInputChange("cardNumber", formatted);
                            }
                          }}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all font-mono"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          required
                          value={paymentData.cardName}
                          onChange={(e) =>
                            handleInputChange("cardName", e.target.value)
                          }
                          placeholder="John Doe"
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-foreground">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            required
                            value={paymentData.expiry}
                            onChange={(e) => {
                              const formatted = formatExpiry(e.target.value);
                              if (formatted.length <= 5) {
                                handleInputChange("expiry", formatted);
                              }
                            }}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all font-mono"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            CVV
                          </label>
                          <input
                            type="text"
                            required
                            value={paymentData.cvv}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              if (value.length <= 4) {
                                handleInputChange("cvv", value);
                              }
                            }}
                            placeholder="123"
                            maxLength={4}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all font-mono"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full mt-8 bg-accent hover:bg-accent/90 text-accent-foreground py-6 text-lg font-semibold"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Confirm Payment
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4 flex items-center justify-center gap-2">
                  <Lock className="w-3 h-3" />
                  Your payment information is secure and encrypted
                </p>
              </motion.form>
            )}
          </AnimatePresence>

          {!selectedPayment && (
            <div className="flex justify-center pt-4">
              <p className="text-muted-foreground text-center">
                Please select a payment method to continue
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Step 4: Success */}
      {currentStep === 4 && (
        <motion.div
          key="premium-step4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8 text-center py-12 max-w-3xl mx-auto"
        >
          <div className="space-y-6">
            <div className="flex justify-center mb-8">
              <Mascot mood="proud" size="xxxl" message="You're awesome!" />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Payment successful!
              </h2>
              <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto leading-relaxed">
                Congratulations on your purchase! Your premium subscription is
                now live & active. You can use all exclusive features whenever
                you need. Enjoy your enhanced learning journey!
              </p>
            </div>
          </div>

          <div className="pt-8">
            <Button
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => router.push("/")}
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
