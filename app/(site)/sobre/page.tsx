import type { Metadata } from "next";
import Sobre from "@/app/components/paginas/Sobre";
import { alternativas } from "@/app/i18n";

export const metadata: Metadata = {
  title: "Sobre nós",
  description:
    "A JUST RUBY é uma empresa familiar de turismo rural, sediada na Várzea, em Santarém, com alojamentos em Tomar e Santarém.",
  alternates: alternativas("pt", "sobre"),
};

export default function SobrePage() {
  return <Sobre l="pt" />;
}
