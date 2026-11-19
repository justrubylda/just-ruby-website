import type { Metadata } from "next";
import Privacidade from "@/app/components/paginas/Privacidade";
import { alternativas } from "@/app/i18n";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How JUST RUBY handles the data of people who contact us through this website.",
  alternates: alternativas("en", "privacidade"),
};

export default function PrivacyPage() {
  return <Privacidade l="en" />;
}
