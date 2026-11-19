import type { Metadata } from "next";
import Galeria from "@/app/components/paginas/Galeria";
import { alternativas } from "@/app/i18n";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Photos of Kingdom of Stone in Tomar and O Nosso Cantinho in Santarém, Portugal.",
  alternates: alternativas("en", "galeria"),
};

export default function GalleryPage() {
  return <Galeria l="en" />;
}
