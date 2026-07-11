import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GlowingStar } from "@/components/icons/GlowingStar";

export default function MotivationCard() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="rounded-2xl bg-gradient-accent text-accent-foreground overflow-hidden shadow-lg"
    >
      <div className="p-6">
        <div className="text-center mb-4">
          <GlowingStar size="lg" className="text-center mx-auto pb-2"/>
          <h3 className="text-xl font-bold mb-2">Keep Going!</h3>
          <p className="text-accent-foreground/80 text-sm">
            You&apos;re doing amazing! Keep up the great work and reach new heights.
          </p>
        </div>
        <Button className="w-full bg-card text-accent hover:bg-card/90">
          Continue Learning
        </Button>
      </div>
    </motion.div>
  );
}