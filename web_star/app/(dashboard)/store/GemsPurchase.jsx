/* eslint-disable @next/next/no-img-element */
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mascot } from "@/components/nakhlah/Mascot";
import { DatesIcon } from "@/components/icons/PublicAssetIcons";
import {
  ArrowLeft,
  Home,
  Check,
  Mail,
  User,
  CreditCard,
  Lock,
} from "lucide-react";

const gemPackages = [
  {
    id: 1,
    amount: 500,
    price: "$2",
    emoji: "💎",
    label: "Starter Pack",
    description: "Perfect for beginners",
  },
  {
    id: 2,
    amount: 1000,
    price: "$10",
    emoji: "💎",
    label: "Value Pack",
    description: "Best value for money",
    popular: true,
  },
  {
    id: 3,
    amount: 1500,
    price: "$15",
    emoji: "💎",
    label: "Premium Pack",
    description: "Maximum dates",
  },
  {
    id: 4,
    amount: 3000,
    price: "$25",
    emoji: "💎",
    label: "Ultimate Pack",
    description: "Pro player bundle",
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

export default function GemsPurchase() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1); // 1: select package, 2: payment, 3: success
  const [selectedPackage, setSelectedPackage] = useState(null);
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

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setCurrentStep(3);
  };

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    setCurrentStep(2);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Step 1: Select Date Package */}
      {currentStep === 1 && (
        <motion.div
          key="dates-step1"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.push("/store")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </Button>

          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <DatesIcon size="lg" className="text-accent" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Purchase Dates
              </h2>
            </div>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
              Boost your learning with dates to unlock premium content and
              features
            </p>
          </div>

          {/* Date Packages Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {gemPackages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-2xl p-6 transition-all cursor-pointer ${
                  pkg.popular
                    ? "bg-card border border-border hover:border-accent/50 scale-105 shadow-lg hover:shadow-xl"
                    : "bg-card border border-border hover:border-accent/50 hover:shadow-md"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    ⭐ POPULAR
                  </div>
                )}

                <div className="text-center space-y-4">
                  {/* Emoji */}
                  <div className="text-5xl">{pkg.emoji}</div>

                  {/* Amount */}
                  <div>
                    <p className="text-3xl font-bold text-accent">
                      {pkg.amount}
                    </p>
                    <p className="text-sm text-muted-foreground">Dates</p>
                  </div>

                  {/* Package Info */}
                  <div>
                    <h3 className="font-bold text-foreground text-base mb-1">
                      {pkg.label}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {pkg.description}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-border"></div>

                  {/* Price */}
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {pkg.price}
                    </p>
                  </div>

                  {/* Button */}
                  <Button
                    onClick={() => handlePackageSelect(pkg)}
                    className={`w-full font-semibold h-10 ${
                      pkg.popular
                        ? "bg-accent hover:to-accent/90"
                        : "bg-accent hover:bg-accent/90"
                    }`}
                  >
                    Buy Now
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Step 2: Payment */}
      {currentStep === 2 && (
        <motion.div
          key="dates-step2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => setCurrentStep(1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {/* Selected Package Summary */}
          <div className="max-w-md mx-auto bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">{selectedPackage?.emoji}</div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {selectedPackage?.label}
            </h3>
            <p className="text-3xl font-bold text-accent mb-1">
              {selectedPackage?.amount} Dates
            </p>
            <p className="text-xl font-semibold text-foreground">
              {selectedPackage?.price}
            </p>
          </div>

          {/* Payment Method Selection */}
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Select payment method
            </h2>
            <p className="text-muted-foreground">
              Choose your preferred payment option
            </p>
          </div>

          {/* Payment Methods Grid */}
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

          {/* Payment Form */}
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
                  {/* Email field for digital wallets */}
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

                  {/* Card fields for credit/debit cards */}
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

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full mt-8 bg-accent hover:bg-accent/90 text-accent-foreground py-6 text-lg font-semibold"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Confirm Payment
                </Button>

                {/* Security Note */}
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

      {/* Step 3: Success */}
      {currentStep === 3 && (
        <motion.div
          key="dates-step3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8 text-center py-12 max-w-3xl mx-auto"
        >
          <div className="space-y-6">
            <div className="flex justify-center mb-8">
              <Mascot mood="celebrating" size="xxxl" message="Dates added!" />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Purchase successful!
              </h2>
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/20 to-accent/20 px-6 py-3 rounded-full mb-6">
                <DatesIcon size="md" className="text-accent" />
                <span className="text-2xl font-bold text-accent">
                  +{selectedPackage?.amount} Dates
                </span>
              </div>
              <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto leading-relaxed">
                Your dates have been added to your account! Use them to unlock
                premium content and enhance your learning experience.
              </p>
            </div>
          </div>

          <div className="pt-8 flex gap-4 justify-center">
            <Button
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => router.push("/")}
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCurrentStep(1);
                setSelectedPackage(null);
                setSelectedPayment(null);
              }}
            >
              Buy More Dates
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
