import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Mascot } from "../Mascot";

const languages = [
  { value: "arabic", label: "Arabic", native: "العربية", icon: "🇸🇦" },
  { value: "english", label: "English", native: "English", icon: "🇬🇧" },
  { value: "french", label: "French", native: "Français", icon: "🇫🇷" },
  { value: "spanish", label: "Spanish", native: "Español", icon: "🇪🇸" },
  { value: "german", label: "German", native: "Deutsch", icon: "🇩🇪" },
  { value: "urdu", label: "Urdu", native: "اردو", icon: "🇵🇰" },
];

export function LanguageStep({ selectedLanguage, onSelect }) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex items-center gap-8 justify-center"
      >
        <Mascot mood="proud" size="md" className="w-20 h-20" />
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            What you want to learn?
          </h1>
          <p className="text-muted-foreground text-lg">
            Choose the language you want to master
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {languages.map((lang, index) => (
          <motion.button
            key={lang.value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect(lang.value)}
            className={cn(
              "flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-300",
              "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
              selectedLanguage === lang.value
                ? "border-accent bg-accent/10 shadow-accent-glow"
                : "border-border bg-card hover:border-primary"
            )}
          >
            <span className="text-4xl">{lang.icon}</span>
            <div className="text-left">
              <p className="font-bold text-foreground text-lg">{lang.label}</p>
              <p className="text-muted-foreground text-sm">{lang.native}</p>
            </div>
            {selectedLanguage === lang.value && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-auto w-6 h-6 rounded-full bg-accent flex items-center justify-center"
              >
                <svg
                  className="w-4 h-4 text-accent-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
