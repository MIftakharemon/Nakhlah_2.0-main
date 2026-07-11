import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Mascot } from "../Mascot";

export function CountryStep({ title, countries = [], selectedCountry, onSelect, getMediaUrl }) {
  return (
    <div className="w-full max-w-xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex items-center gap-8 justify-center"
      >
        <Mascot mood="happy" size="md" className="" />
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            {title}
          </h1>
          <p className="text-muted-foreground text-lg">Select your country</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {countries.map((country, index) => (
          <motion.button
            key={country.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            onClick={() => onSelect(country.id)}
            className={cn(
              "flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-300",
              "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
              selectedCountry === country.id
                ? "border-accent bg-accent/10 shadow-accent-glow"
                : "border-border bg-card hover:border-primary"
            )}
          >
            <div className="w-12 h-12 rounded-full overflow-hidden bg-muted shrink-0">
              {country?.countryMedia?.url && (
                <img
                  src={getMediaUrl(country.countryMedia.url)}
                  alt={country?.countryMedia?.alt || country.countryName}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <p className="font-bold text-foreground text-lg text-left flex-1">
              {country.countryName}
            </p>
            {selectedCountry === country.id && (
              <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
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
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
