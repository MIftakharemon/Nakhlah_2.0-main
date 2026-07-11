import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/nakhlah/Mascot";
import Link from "next/link";

export default function GetStartedPage() {
  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-8">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-full max-w-2xl text-center"
      >
        {/* Speech Bubble */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative inline-block mb-8"
        >
          <div className="bg-white dark:bg-gray-800 px-8 py-4 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700">
            <p className="text-xl font-semibold text-foreground">
              Hi there! I&apos;m El!
            </p>
          </div>
          <div className="absolute left-1/2 -bottom-3 -translate-x-1/2 w-0 h-0 border-l-12 border-l-transparent border-r-12 border-r-transparent border-t-12 border-t-white dark:border-t-gray-800" />
        </motion.div>

        {/* Mascot */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.3,
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
          className="mb-12 flex justify-center"
        >
          <Mascot mood="happy" size="xxl" className="w-48 h-48" />
        </motion.div>

        {/* Brand Name */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h1 className="text-6xl font-black text-accent mb-4">Nakhlah</h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto leading-relaxed">
            Learn languages whenever and wherever you want. It&apos;s free and
            forever.
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col gap-4 max-w-md mx-auto mt-10"
        >
          <Link
            href="/onboarding"
            // size="lg"
            className="w-full bg-accent hover:opacity-90 text-white font-bold text-lg py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200"
          >
            GET STARTED
          </Link>

          <Link
            href="/auth/login"
            // size="lg"
            // variant="ghost"
            className="w-full text-accent font-bold text-lg py-4 rounded-2xl hover:bg-accent/10 transition-all duration-200"
          >
            I ALREADY HAVE AN ACCOUNT
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
