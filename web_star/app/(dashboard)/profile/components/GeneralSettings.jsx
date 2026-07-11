import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function GeneralSettingsPage({ onBack }) {
  const generalSettings = [
    { label: "Language", value: "English (US)" },
    { label: "Country", value: "United States" },
    { label: "Time Zone", value: "GMT-5 (EST)" },
    { label: "Currency", value: "USD ($)" },
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
            className="inline-flex items-center justify-center rounded-full hover:bg-muted h-10 w-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">General</h1>
          </div>
        </div>

        {/* General Settings List */}
        <div className="space-y-1">
          {generalSettings.map((setting, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index, duration: 0.3 }}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-all rounded-lg group"
            >
              <div className="text-left">
                <div className="font-medium text-foreground">{setting.label}</div>
                <div className="text-sm text-muted-foreground">{setting.value}</div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}