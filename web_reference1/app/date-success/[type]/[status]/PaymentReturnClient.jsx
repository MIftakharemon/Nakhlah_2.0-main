"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCharacterVideo } from "@/lib/characterVideos";
import { getSessionToken, isSessionValid } from "@/lib/authUtils";
import { captureDatePaymentOrder } from "@/services/api";
import { toast } from "@/components/nakhlah/Toast";
import { Home, RefreshCw, ShoppingBag } from "lucide-react";

export default function PaymentReturnClient() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();
  const hasCapturedRef = useRef(false);
  const type = String(params?.type || "");
  const status = String(params?.status || "");
  const orderId = searchParams.get("token") || "";
  const payerId = searchParams.get("PayerID") || "";
  const isDatePayment = type === "dates";
  const isCanceled = status === "payment-canceled";
  const characterVideo = useCharacterVideo(isCanceled ? "sad" : "happy");
  const [captureAttempt, setCaptureAttempt] = useState(0);
  const [captureState, setCaptureState] = useState({
    status: isCanceled ? "canceled" : "loading",
    message: isCanceled
      ? "Your PayPal checkout was canceled, so no charge was completed."
      : "Confirming your PayPal payment...",
  });

  useEffect(() => {
    if (!isDatePayment || isCanceled) return;
    if (sessionStatus === "loading" || hasCapturedRef.current) return;

    const capturePayment = async () => {
      if (!orderId) {
        setCaptureState({
          status: "error",
          message: "Missing PayPal order token. Please contact support.",
        });
        return;
      }

      if (!isSessionValid(session)) {
        setCaptureState({
          status: "error",
          message: "Please log in again so we can confirm this payment.",
        });
        return;
      }

      hasCapturedRef.current = true;
      const result = await captureDatePaymentOrder(
        orderId,
        getSessionToken(session),
      );

      if (!result.success) {
        hasCapturedRef.current = false;
        setCaptureState({
          status: "error",
          message: result.error || "Unable to confirm your PayPal payment.",
        });
        toast.error(result.error || "Unable to confirm PayPal payment.");
        return;
      }

      setCaptureState({
        status: "success",
        message:
          result.message ||
          "Payment confirmed successfully. Your dates have been added.",
      });
      toast.success(result.message || "Payment confirmed successfully.");
    };

    capturePayment();
  }, [
    captureAttempt,
    isCanceled,
    isDatePayment,
    orderId,
    session,
    sessionStatus,
  ]);

  const retryCapture = () => {
    hasCapturedRef.current = false;
    setCaptureState({
      status: "loading",
      message: "Confirming your PayPal payment...",
    });
    setCaptureAttempt((attempt) => attempt + 1);
  };

  const isLoading = captureState.status === "loading";
  const isSuccess = captureState.status === "success";
  const title = isCanceled
    ? "Payment canceled"
    : isLoading
      ? "Confirming payment"
      : isSuccess
        ? "Payment successful!"
        : "Payment needs attention";

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
            {isSuccess
              ? "Your dates are on the way!"
              : isCanceled
                ? "Maybe next time!"
                : "Confirming your payment..."}
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
              {isLoading ? (
                <RefreshCw className="w-8 h-8 animate-spin" />
              ) : (
                <ShoppingBag className="w-8 h-8" />
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-foreground">
              {title}
            </h1>

            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl mx-auto">
              {captureState.message}
            </p>

            {orderId && (
              <p className="text-xs text-muted-foreground">
                PayPal token: {orderId}
                {payerId ? ` · Payer ID: ${payerId}` : ""}
              </p>
            )}
          </div>

          <div className="pt-8 flex flex-col sm:flex-row gap-3 justify-center">
            {captureState.status === "error" && isDatePayment && (
              <Button
                onClick={retryCapture}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Confirming Again
              </Button>
            )}

            <Button
              variant={isSuccess ? "default" : "outline"}
              className={
                isSuccess
                  ? "bg-accent hover:bg-accent/90 text-accent-foreground"
                  : ""
              }
              onClick={() => router.push("/")}
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                router.push(isCanceled ? "/store?refetch=dates" : "/store")
              }
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              {isCanceled ? "Choose Another Package" : "Buy More Dates"}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
