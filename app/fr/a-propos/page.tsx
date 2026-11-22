import type { Metadata } from "next";
import Sobre from "@/app/components/paginas/Sobre";
import { alternativas } from "@/app/i18n";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "JUST RUBY est une petite entreprise familiale de tourisme basée à Várzea, Santarém, avec des maisons de vacances à Tomar et Santarém, au Portugal.",
  alternates: alternativas("fr", "sobre"),
};

export default function AProposPage() {
  return <Sobre l="fr" />;
}
