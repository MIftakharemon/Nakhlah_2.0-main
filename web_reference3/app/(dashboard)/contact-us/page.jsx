"use client";

import { useRouter } from "next/navigation";
import ContactUsPage from "../profile/components/ContactUs";

export default function ContactUsRoutePage() {
  const router = useRouter();

  return <ContactUsPage onBack={() => router.push("/faq")} />;
}
