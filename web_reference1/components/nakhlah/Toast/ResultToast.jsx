import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Volume2, X, Check, X as XIcon } from "lucide-react";

// Reusable Result Toast Component
const ResultToast = ({
  isCorrect,
  isVisible,
  onContinue,
  correctAnswer,
  buttonText,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`fixed bottom-0 left-0 right-0 z-50 border-t-4 ${
            isCorrect
              ? "border-green-500 bg-green-50 dark:bg-green-950"
              : "border-red-500 bg-red-50 dark:bg-red-950"
          }`}
        >
          <div className="container max-w-4xl mx-auto px-4 py-4 md:py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 md:gap-4">
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCorrect ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {isCorrect ? (
                    <Check className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  ) : (
                    <XIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  )}
                </div>
                <div>
                  <h3
                    className={`text-lg md:text-xl font-bold ${
                      isCorrect
                        ? "text-green-700 dark:text-green-400"
                        : "text-red-700 dark:text-red-400"
                    }`}
                  >
                    {isCorrect ? "Correct!" : "Wrong!"}
                  </h3>
                  {!isCorrect && correctAnswer && (
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {correctAnswer}
                    </p>
                  )}
                </div>
              </div>
              <Button
                onClick={onContinue}
                className={`w-full sm:w-auto sm:min-w-[160px] md:min-w-[200px] h-12 md:h-14 font-bold text-base md:text-lg rounded-xl ${
                  isCorrect
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                {buttonText || (isCorrect ? "CONTINUE" : "TRY AGAIN")}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ResultToast;
