"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LessonsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/lesson");
  }, [router]);

  return null;
}
