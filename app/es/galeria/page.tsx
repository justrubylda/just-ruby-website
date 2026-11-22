import type { Metadata } from "next";
import Galeria from "@/app/components/paginas/Galeria";
import { alternativas } from "@/app/i18n";

export const metadata: Metadata = {
  title: "Galería",
  description:
    "Fotos de Kingdom of Stone, en Tomar, y de O Nosso Cantinho, en Santarém, Portugal.",
  alternates: alternativas("es", "galeria"),
};

export default function GaleriaEsPage() {
  return <Galeria l="es" />;
}
