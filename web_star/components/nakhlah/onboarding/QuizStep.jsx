import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { Mascot } from "../Mascot";

const quizQuestions = [
  {
    id: 1,
    question: "How do you say 'Hello' in Arabic?",
    options: [
      "مرحبا (Marhaba)",
      "شكرا (Shukran)",
      "مع السلامة (Ma'a Salama)",
      "نعم (Na'am)",
    ],
    correct: 0,
    explanation: "مرحبا (Marhaba) means 'Hello' - a common greeting in Arabic!",
  },
  {
    id: 2,
    question: "Which word means 'Thank you'?",
    options: ["لا (La)", "شكرا (Shukran)", "أهلا (Ahlan)", "كيف (Kayf)"],
    correct: 1,
    explanation:
      "شكرا (Shukran) means 'Thank you' - very useful in daily conversations!",
  },
  {
    id: 3,
    question: "What does 'كتاب' (Kitab) mean?",
    options: ["Water", "Food", "Book", "House"],
    correct: 2,
    explanation: "كتاب (Kitab) means 'Book' - an essential word for learners!",
  },
];

export function QuizStep({ onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);

  const question = quizQuestions[currentQuestion];
  const isCorrect = selectedAnswer === question.correct;
  const isLastQuestion = currentQuestion === quizQuestions.length - 1;

  const handleSelectAnswer = (index) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);

    if (index === question.correct) {
      setScore(score + 1);
      setAnswers([...answers, true]);
    } else {
      setAnswers([...answers, false]);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onComplete(score + (isCorrect ? 0 : 0));
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handleSkip = () => {
    onComplete(0);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center gap-8 justify-center"
      >
        <Mascot mood="thinking" size="md" className="w-20 h-20" />
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            Quick Assessment
          </h1>
          <p className="text-muted-foreground text-lg">
            Let&apos;s see where you stand (optional)
          </p>
        </div>
      </motion.div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-2 mb-10">
        {quizQuestions.map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-300",
              index < currentQuestion
                ? answers[index]
                  ? "bg-secondary"
                  : "bg-destructive"
                : index === currentQuestion
                ? "bg-accent w-8"
                : "bg-muted"
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-card rounded-2xl border border-border p-6 shadow-md"
        >
          <p className="text-sm text-muted-foreground mb-2">
            Question {currentQuestion + 1} of {quizQuestions.length}
          </p>
          <h2 className="text-xl font-bold text-foreground mb-6">
            {question.question}
          </h2>

          <div className="flex flex-col gap-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                disabled={showResult}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-300",
                  showResult
                    ? index === question.correct
                      ? "border-secondary bg-secondary/10"
                      : index === selectedAnswer
                      ? "border-destructive bg-destructive/10"
                      : "border-border bg-card opacity-50"
                    : "border-border bg-card hover:border-primary hover:bg-primary/5"
                )}
              >
                <span
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                    showResult && index === question.correct
                      ? "bg-secondary text-secondary-foreground"
                      : showResult && index === selectedAnswer
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="font-medium text-foreground flex-1">
                  {option}
                </span>
                {showResult && index === question.correct && (
                  <CheckCircle2 className="w-5 h-5 text-secondary" />
                )}
                {showResult &&
                  index === selectedAnswer &&
                  index !== question.correct && (
                    <XCircle className="w-5 h-5 text-destructive" />
                  )}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "mt-6 p-4 rounded-xl",
                  isCorrect ? "bg-secondary/10" : "bg-primary/10"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-secondary" />
                      <span className="font-bold text-secondary">Correct!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-destructive" />
                      <span className="font-bold text-destructive">
                        Not quite!
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {question.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between items-center mt-6">
        <Button
          variant="ghost"
          onClick={handleSkip}
          className="text-muted-foreground"
        >
          Skip quiz
        </Button>
        {showResult && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Button
              onClick={handleNext}
              className="bg-accent hover:bg-accent/90"
            >
              {isLastQuestion ? "Continue" : "Next Question"}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
