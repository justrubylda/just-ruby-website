import type { Metadata } from "next";
import Inicio from "@/app/components/paginas/Inicio";
import { alternativas } from "@/app/i18n";

// A disponibilidade (Airbnb + Booking) é revista de hora a hora.
export const revalidate = 3600;

export const metadata: Metadata = {
  description:
    "Casas rurales con piscina en el centro de Portugal: Kingdom of Stone, finca cerca de Tomar, y O Nosso Cantinho, villa con piscina privada en Santarém. Reserve directamente con los anfitriones.",
  alternates: alternativas("es", "inicio"),
};

export default function HomeEs() {
  return <Inicio l="es" />;
}
