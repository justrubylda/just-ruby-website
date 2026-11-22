import type { Metadata } from "next";
import Privacidade from "@/app/components/paginas/Privacidade";
import { alternativas } from "@/app/i18n";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Comment JUST RUBY traite les données des personnes qui nous contactent via ce site.",
  alternates: alternativas("fr", "privacidade"),
};

export default function ConfidentialitePage() {
  return <Privacidade l="fr" />;
}
