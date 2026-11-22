import type { Metadata } from "next";
import Alojamentos from "@/app/components/paginas/Alojamentos";
import { alternativas } from "@/app/i18n";

export const metadata: Metadata = {
  title: "Hébergements",
  description:
    "Kingdom of Stone, domaine avec piscine à Olalhas (Tomar), et O Nosso Cantinho, villa de quatre chambres avec piscine privée à Várzea (Santarém). Choisissez votre séjour et demandez les disponibilités.",
  alternates: alternativas("fr", "alojamentos"),
};

export default function HebergementsPage() {
  return <Alojamentos l="fr" />;
}
