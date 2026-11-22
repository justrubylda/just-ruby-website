import type { Metadata } from "next";
import Zona from "@/app/components/paginas/Zona";
import { alternativas } from "@/app/i18n";

export const metadata: Metadata = {
  title: "Qué hacer cerca de Tomar y Santarém",
  description:
    "Qué visitar cerca de nuestras casas: el Convento de Cristo en Tomar, el embalse de Castelo do Bode, el castillo de Almourol, el centro gótico de Santarém y el Ribatejo.",
  alternates: alternativas("es", "zona"),
};

export default function ZonaEsPage() {
  return <Zona l="es" />;
}
