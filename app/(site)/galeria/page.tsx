import type { Metadata } from "next";
import Galeria from "@/app/components/paginas/Galeria";
import { alternativas } from "@/app/i18n";

export const metadata: Metadata = {
  title: "Galeria",
  description:
    "Fotografias do Kingdom of Stone, em Tomar, e d'O Nosso Cantinho, em Santarém.",
  alternates: alternativas("pt", "galeria"),
};

export default function GaleriaPage() {
  return <Galeria l="pt" />;
}
