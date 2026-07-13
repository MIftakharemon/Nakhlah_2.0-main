"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import { getSessionToken } from "@/lib/authUtils";
import { fetchLegalDocuments } from "@/services/api/globals";
import LexicalRenderer from "@/components/nakhlah/LexicalRenderer";

export default function PrivacyRoutePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [content, setContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const token = getSessionToken(session);
      const result = await fetchLegalDocuments({ privacyPolicy: true }, token);
      if (result.success) {
        setContent(result.data?.privacyPolicy ?? null);
      }
      setIsLoading(false);
    };
    load();
  }, [session]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-3xl border border-border shadow-lg p-5 md:p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center justify-center rounded-full hover:bg-muted h-10 w-10 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h1 className="text-3xl font-bold text-foreground">
              Privacy Policy
            </h1>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-muted/40 rounded animate-pulse" />
            ))}
          </div>
        ) : content ? (
          <LexicalRenderer lexicalJson={content} className="text-base" />
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No content available.
          </p>
        )}
      </motion.div>
    </div>
  );
}
