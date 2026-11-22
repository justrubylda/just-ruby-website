import type { Metadata } from "next";
import Galeria from "@/app/components/paginas/Galeria";
import { alternativas } from "@/app/i18n";

export const metadata: Metadata = {
  title: "Galerie",
  description:
    "Photos du Kingdom of Stone à Tomar et d'O Nosso Cantinho à Santarém, au Portugal.",
  alternates: alternativas("fr", "galeria"),
};

export default function GaleriePage() {
  return <Galeria l="fr" />;
}
