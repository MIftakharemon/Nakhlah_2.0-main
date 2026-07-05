"use client";
import { useEffect, useState } from "react";
import { Mascot } from "@/components/nakhlah/Mascot";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import LexicalRenderer from "@/components/nakhlah/LexicalRenderer";
import { fetchAbout } from "@/services/api/globals";
import { useSession } from "next-auth/react";
import { getSessionToken } from "@/lib/authUtils";

export default function AboutNakhlahPage({
  onBack,
  onNavigate,
  showNavigationItems = true,
}) {
  const [aboutData, setAboutData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const token = getSessionToken(session);
      const result = await fetchAbout(token);
      if (result.success) {
        setAboutData(result.data);
      }
      setIsLoading(false);
    };
    load();
  }, [session]);

  const aboutItems = [
    ...(showNavigationItems
      ? [
          {
            label: "Terms & Conditions",
            action: () => onNavigate?.("terms-and-conditions"),
          },
          {
            label: "Privacy Policy",
            action: () => onNavigate?.("privacy-policy"),
          },
        ]
      : []),
    ...(aboutData?.websiteUrl
      ? [
          {
            label: "Visit Our Website",
            action: () =>
              window.open(
                aboutData.websiteUrl,
                "_blank",
                "noopener,noreferrer",
              ),
            external: true,
          },
        ]
      : []),
  ];

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
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              About Nakhlah
            </h1>
          </div>
        </div>

        {/* Mascot Logo */}
        <div className="flex justify-center mb-6">
          <div className="rounded-2xl flex items-center justify-center">
            <Mascot size="xxl" mood="happy" />
          </div>
        </div>

        {/* App Info */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-foreground mb-2">
            Nakhlah v2.0.0
          </h2>
          <p className="text-sm text-muted-foreground">
            Learn Arabic with fun and ease
          </p>
        </div>

        {/* About Content */}
        {isLoading ? (
          <div className="space-y-2 mb-8 px-1">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-4 bg-muted/50 rounded animate-pulse"
                style={{ width: `${90 - i * 8}%` }}
              />
            ))}
          </div>
        ) : aboutData?.about ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8 px-1"
          >
            <LexicalRenderer lexicalJson={aboutData.about} />
          </motion.div>
        ) : null}

        {/* Navigation Items */}
        {aboutItems.length > 0 && (
          <div className="space-y-1">
            {aboutItems.map((item, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index, duration: 0.3 }}
                onClick={item.action}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-all rounded-lg group"
              >
                <span className="font-medium text-foreground">
                  {item.label}
                </span>
                {item.external ? (
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                )}
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
