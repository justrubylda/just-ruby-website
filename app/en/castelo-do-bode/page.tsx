import type { Metadata } from "next";
import Destino, { metadadosDestino } from "@/app/components/paginas/Destino";

// A disponibilidade (Airbnb + Booking) é revista de hora a hora.
export const revalidate = 3600;

export const metadata: Metadata = metadadosDestino("castelo", "en");

export default function CasteloDoBodeEnPage() {
  return <Destino pagina="castelo" l="en" />;
}
