import type { Metadata } from "next";
import Zona from "@/app/components/paginas/Zona";
import { alternativas } from "@/app/i18n";

export const metadata: Metadata = {
  title: "Things to do near Tomar and Santarém",
  description:
    "What to see near our houses: the Convent of Christ in Tomar, the Castelo do Bode reservoir, Almourol Castle, Santarém's Gothic old town and the Ribatejo.",
  alternates: alternativas("en", "zona"),
};

export default function AreaPage() {
  return <Zona l="en" />;
}
