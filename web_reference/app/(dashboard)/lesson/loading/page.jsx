"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LessonLoadingView from "./LessonLoadingView";
import { useLessonStore } from "@/stores/useLessonStore";

const lessonSequence = ["/lesson"];

export default function LessonLoading() {
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const [error] = useState(null);
  const selectedLessonId = useLessonStore((state) => state.selectedLessonId);
  const setSelectedLesson = useLessonStore((state) => state.setSelectedLesson);

  useEffect(() => {
    const lessonId =
      (selectedLessonId || "").trim() ||
      sessionStorage.getItem("selectedLessonId")?.trim();

    if (!lessonId) {
      console.error("No lesson ID found");
      router.push("/");
      return;
    }

    sessionStorage.setItem("currentLessonIndex", "0");
    sessionStorage.setItem("selectedLessonId", lessonId);
    setSelectedLesson({ lessonId });

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            router.push(lessonSequence[0]);
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [router, selectedLessonId, setSelectedLesson]);

  return <LessonLoadingView progress={progress} error={error} />;
}
