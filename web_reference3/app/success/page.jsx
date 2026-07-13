import { Suspense } from "react";
import SubscriptionSuccessClient from "./SubscriptionSuccessClient";

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SubscriptionSuccessClient />
    </Suspense>
  );
}
