import type { Metadata } from "next";
import Zona from "@/app/components/paginas/Zona";
import { alternativas } from "@/app/i18n";

export const metadata: Metadata = {
  title: "O que fazer perto de Tomar e Santarém",
  description:
    "O que visitar perto das nossas casas: o Convento de Cristo em Tomar, a albufeira de Castelo do Bode, o Castelo de Almourol, o centro histórico de Santarém e o Ribatejo.",
  alternates: alternativas("pt", "zona"),
};

export default function ZonaPage() {
  return <Zona l="pt" />;
}
