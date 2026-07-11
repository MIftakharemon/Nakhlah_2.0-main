import { motion } from "framer-motion";
import { Mascot } from "@/components/nakhlah/Mascot";

export function CompletionStep({ onComplete }) {
  return (
    <div className="w-full max-w-[520px] mx-auto text-center">
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        className="bg-gradient-to-b from-card/95 to-card/70 p-8 rounded-3xl border border-border shadow-lg"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 2.4 }}
          className="flex justify-center"
        >
          <Mascot mood="proud" size="xxxl" className="mx-auto" />
        </motion.div>

        <div className="mt-6 space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">You&apos;re ready</h1>
          <p className="text-muted-foreground">Start your first lesson now ✨</p>
        </div>

        <button
          type="button"
          onClick={onComplete}
          className="mt-8 w-full h-12 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold"
        >
          Start Learning
        </button>
      </motion.div>
    </div>
  );
}
