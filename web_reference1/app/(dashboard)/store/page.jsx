import { Suspense } from "react";
import StorePage from "./StorePage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <StorePage />
    </Suspense>
  );
}
