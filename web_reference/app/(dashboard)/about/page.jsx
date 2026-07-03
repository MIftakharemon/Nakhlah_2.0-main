"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useSession } from "next-auth/react";
import { Mascot } from "@/components/nakhlah/Mascot";
import LexicalRenderer from "@/components/nakhlah/LexicalRenderer";
import { getSessionToken } from "@/lib/authUtils";
import { fetchAbout } from "@/services/api/globals";

const SECTION_CONFIG = [
  { key: "about", title: "About" },
  { key: "jobVacancy", title: "Job Vacancy" },
  { key: "fees", title: "Fees" },
  { key: "developers", title: "Developers" },
  { key: "partners", title: "Partners" },
];

const isRichText = (value) => value?.root?.type === "root";

export default function AboutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [aboutData, setAboutData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const sections = SECTION_CONFIG.filter((section) =>
    isRichText(aboutData?.[section.key]),
  );

  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl bg-card rounded-3xl border border-border shadow-lg p-5 md:p-6"
      >
        <div className="flex items-center gap-3 mb-7">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center justify-center rounded-full hover:bg-muted h-10 w-10 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-foreground">About Nakhlah</h1>
        </div>

        <div className="flex justify-center mb-6">
          <Mascot size="xxl" mood="happy" />
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-4 bg-muted/40 rounded animate-pulse"
                style={{ width: `${90 - (i % 6) * 7}%` }}
              />
            ))}
          </div>
        ) : sections.length > 0 ? (
          <div className="space-y-8">
            {sections.map((section) => (
              <section key={section.key}>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  {section.title}
                </h2>
                <LexicalRenderer
                  lexicalJson={aboutData[section.key]}
                  className="text-base"
                />
              </section>
            ))}

            {aboutData?.websiteUrl ? (
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  Website
                </h2>
                <a
                  href={aboutData.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 rounded-lg border border-border hover:bg-muted/40 text-sm font-medium transition-colors"
                >
                  Visit Nakhlah Website
                </a>
              </section>
            ) : null}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No about content available.
          </p>
        )}
      </motion.div>
    </div>
  );
}
