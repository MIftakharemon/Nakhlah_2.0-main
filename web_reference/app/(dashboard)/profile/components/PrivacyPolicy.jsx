"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import LexicalRenderer from "@/components/nakhlah/LexicalRenderer";
import { fetchLegalDocuments } from "@/services/api/globals";
import { useSession } from "next-auth/react";
import { getSessionToken } from "@/lib/authUtils";

export default function PrivacyPolicyPage({ onBack }) {
  const [content, setContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session } = useSession();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const token = getSessionToken(session);
      const result = await fetchLegalDocuments({ privacyPolicy: true }, token);
      if (result.success) {
        setContent(result.data?.privacyPolicy ?? null);
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
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Privacy Policy
            </h1>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-4 bg-muted/50 rounded animate-pulse"
                style={{ width: `${85 - i * 5}%` }}
              />
            ))}
          </div>
        ) : error ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            <p>Failed to load content. Please try again later.</p>
          </div>
        ) : content ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <LexicalRenderer lexicalJson={content} />
          </motion.div>
        ) : (
          <div className="py-8 text-center text-muted-foreground text-sm">
            <p>No content available at the moment.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
