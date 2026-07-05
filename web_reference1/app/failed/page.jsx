import { Suspense } from "react";
import SubscriptionFailedClient from "./SubscriptionFailedClient";

export default function SubscriptionFailedPage() {
  return (
    <Suspense fallback={null}>
      <SubscriptionFailedClient />
    </Suspense>
  );
}
