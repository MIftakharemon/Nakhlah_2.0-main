"use client";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronDown, Search } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { fetchHelpCenter } from "@/services/api/globals";
import { useSession } from "next-auth/react";
import { getSessionToken } from "@/lib/authUtils";

export default function HelpCenterPage({
  onBack,
  onNavigateContact,
  onNavigateLearningTips,
}) {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const token = getSessionToken(session);
      const result = await fetchHelpCenter({ faq: true }, token);
      if (result.success) {
        setFaqs(result.data?.faq ?? []);
      }
      setIsLoading(false);
    };
    load();
  }, [session]);

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const q = searchQuery.toLowerCase();
    return faqs.filter(
      (f) =>
        f.question?.toLowerCase().includes(q) ||
        f.answer?.toLowerCase().includes(q),
    );
  }, [faqs, searchQuery]);

  return (
    <div className="min-h-[calc(100vh-6rem)] px-4 py-6 lg:py-8 lg:flex lg:items-center lg:justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl bg-card rounded-3xl border border-border shadow-lg p-5 md:p-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 md:mb-7">
          <button
            onClick={onBack}
            className="inline-flex items-center justify-center rounded-full hover:bg-muted h-10 w-10 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Help Center</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-5 md:mb-6 flex-wrap">
          <div className="px-4 py-2 rounded-lg font-medium bg-accent text-accent-foreground">
            FAQ
          </div>
          <button
            onClick={() => onNavigateLearningTips && onNavigateLearningTips()}
            className="px-4 py-2 rounded-lg font-medium bg-muted/30 text-muted-foreground hover:bg-muted/50 transition-all"
          >
            Learning Tips &amp; Guides
          </button>
          <button
            onClick={() => onNavigateContact && onNavigateContact()}
            className="px-4 py-2 rounded-lg font-medium bg-muted/30 text-muted-foreground hover:bg-muted/50 transition-all"
          >
            Contact us
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-muted/20 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* FAQ List */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border border-border rounded-xl p-4">
                <div className="h-4 bg-muted/50 rounded animate-pulse w-3/4" />
              </div>
            ))}
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            {searchQuery
              ? "No FAQs match your search."
              : "No FAQs available at the moment."}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFaqs.map((faq, index) => (
              <motion.div
                key={faq.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index, duration: 0.3 }}
                className="border border-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedFaq(expandedFaq === index ? null : index)
                  }
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-all"
                >
                  <span className="text-left font-medium text-foreground">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground flex-shrink-0 ml-2 transition-transform ${
                      expandedFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedFaq === index && (
                  <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
