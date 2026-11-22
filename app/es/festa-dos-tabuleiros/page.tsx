import type { Metadata } from "next";
import Destino, { metadadosDestino } from "@/app/components/paginas/Destino";

// A disponibilidade (Airbnb + Booking) é revista de hora a hora.
export const revalidate = 3600;

export const metadata: Metadata = metadadosDestino("tabuleiros", "es");

export default function TabuleirosEsPage() {
  return <Destino pagina="tabuleiros" l="es" />;
}
