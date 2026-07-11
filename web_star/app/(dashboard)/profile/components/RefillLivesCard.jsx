import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { getSessionToken, isSessionValid } from "@/lib/authUtils";
import { getUserKey } from "@/lib/userKey";
import { refillPalmTrees } from "@/services/api";
import { useProfileStore } from "@/stores/useProfileStore";
import { toast } from "@/components/nakhlah/Toast";

export default function RefillLivesCard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isRefilling, setIsRefilling] = useState(false);
  const fetchProfile = useProfileStore((state) => state.fetchMyProfile);

  const handleRefill = async () => {
    if (!isSessionValid(session)) {
      toast.error("Please login to refill Palm Trees.");
      return;
    }

    const token = getSessionToken(session);
    if (!token) {
      toast.error("Session expired. Please login again.");
      return;
    }

    setIsRefilling(true);
    try {
      const result = await refillPalmTrees(token);

      if (!result.success) {
        toast.error(result.error || "Unable to refill Palm Trees.");
        return;
      }

      await fetchProfile(token, true, getUserKey(session));
      toast.success(result.message || "Palm Trees refilled successfully.");
    } finally {
      setIsRefilling(false);
    }
  };

  return (
    <div className="rounded-2xl bg-card shadow-lg border border-border overflow-hidden p-6">
      <div className="">
        <h3 className="text-xl font-semibold flex items-center gap-2 mb-6">
          {/* <Heart className="w-5 h-5 text-destructive" /> */}
          Refill Palm Trees
        </h3>
      </div>
      <div className="">
        <p className="text-sm text-muted-foreground mb-6">
          Out of Palm Trees? Refill and continue learning without interruptions!
        </p>
        <div className="p-3 bg-muted rounded-lg border border-muted-foreground/50 text-sm mb-4">
          <h5 className="font-medium mb-1">Quick Refill</h5>
          <p>
            Refill your Palm Trees with dates or unlock unlimited Palm Trees
            with Pro
          </p>
        </div>
        <div className="grid gap-2">
          <Button
            onClick={handleRefill}
            variant="outline"
            className="w-full"
            disabled={isRefilling}
          >
            {isRefilling ? "Refilling..." : "Refill with Dates"}
          </Button>
          <Button
            onClick={() => router.push("/store")}
            className="w-full text-accent-foreground"
          >
            Go Pro (Unlimited)
          </Button>
        </div>
      </div>
    </div>
  );
}
