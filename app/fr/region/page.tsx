import type { Metadata } from "next";
import Zona from "@/app/components/paginas/Zona";
import { alternativas } from "@/app/i18n";

export const metadata: Metadata = {
  title: "Que faire près de Tomar et Santarém",
  description:
    "À voir près de nos maisons : le couvent du Christ à Tomar, le lac de Castelo do Bode, le château d'Almourol, la vieille ville gothique de Santarém et le Ribatejo.",
  alternates: alternativas("fr", "zona"),
};

export default function RegionPage() {
  return <Zona l="fr" />;
}
