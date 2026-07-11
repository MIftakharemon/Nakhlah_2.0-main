"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, ChevronLeft, Lightbulb } from "lucide-react";
import { useSession } from "next-auth/react";
import { getSessionToken } from "@/lib/authUtils";
import { fetchHelpCenter } from "@/services/api/globals";
import LexicalRenderer from "@/components/nakhlah/LexicalRenderer";

export default function TipsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [guide, setGuide] = useState(null);
  const [tips, setTips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const token = getSessionToken(session);
      const result = await fetchHelpCenter(
        { learningGuide: true, learningTips: true },
        token,
      );

      if (result.success) {
        setGuide(result.data?.learningGuide ?? null);
        setTips(result.data?.learningTips ?? []);
      }
      setIsLoading(false);
    };

    load();
  }, [session]);

  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl bg-card rounded-3xl border border-border shadow-lg p-5 md:p-6"
      >
        <div className="flex items-center gap-3 mb-7">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center justify-center rounded-full hover:bg-muted h-10 w-10 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-foreground">
            Learning Tips &amp; Guides
          </h1>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-muted/40 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {guide && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-accent" />
                  <h2 className="text-xl font-semibold">Guide</h2>
                </div>
                <LexicalRenderer lexicalJson={guide} className="text-base" />
              </section>
            )}

            {tips.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  <h2 className="text-xl font-semibold">Tips</h2>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {tips.map((tip, index) => (
                    <div
                      key={tip.id || index}
                      className="p-4 rounded-xl border border-amber-300/40 bg-amber-50/60 dark:bg-amber-900/10"
                    >
                      <p className="text-sm leading-relaxed text-foreground/90">
                        {tip.tip}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
