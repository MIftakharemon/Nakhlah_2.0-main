"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, BookOpen, Lightbulb } from "lucide-react";
import LexicalRenderer from "@/components/nakhlah/LexicalRenderer";
import { fetchHelpCenter } from "@/services/api/globals";
import { useSession } from "next-auth/react";
import { getSessionToken } from "@/lib/authUtils";

export default function LearningTipsGuidesPage({ onBack }) {
  const [guide, setGuide] = useState(null);
  const [tips, setTips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session } = useSession();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const token = getSessionToken(session);
      const result = await fetchHelpCenter(
        {
          learningGuide: true,
          learningTips: true,
        },
        token,
      );
      if (result.success) {
        setGuide(result.data?.learningGuide ?? null);
        setTips(result.data?.learningTips ?? []);
      } else {
        setError(result.error);
      }
      setIsLoading(false);
    };
    load();
  }, [session]);

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-transparent lg:bg-card rounded-none lg:rounded-2xl shadow-none lg:shadow-lg border-0 lg:border lg:border-border p-0 lg:p-6"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center justify-center rounded-full hover:bg-muted h-10 w-10 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-500 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Learning Tips &amp; Guides
            </h1>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted/50 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-muted/50 rounded animate-pulse w-full" />
                <div className="h-4 bg-muted/50 rounded animate-pulse w-5/6" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            <p>Failed to load content. Please try again later.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="space-y-8"
          >
            {/* Learning Guide (rich text) */}
            {guide && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-accent" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Guide
                  </h2>
                </div>
                <LexicalRenderer lexicalJson={guide} />
              </section>
            )}

            {/* Learning Tips */}
            {tips.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Tips
                  </h2>
                </div>
                <div className="space-y-3">
                  {tips.map((item, index) => (
                    <motion.div
                      key={item.id || index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index, duration: 0.3 }}
                      className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl"
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-400 dark:bg-amber-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                        {index + 1}
                      </span>
                      <p className="text-sm text-foreground/90 leading-relaxed">
                        {item.tip}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {!guide && tips.length === 0 && (
              <div className="py-8 text-center text-muted-foreground text-sm">
                <p>No content available at the moment.</p>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
