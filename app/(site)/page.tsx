import type { Metadata } from "next";
import Inicio from "@/app/components/paginas/Inicio";
import { alternativas } from "@/app/i18n";

// A disponibilidade (Airbnb + Booking) é revista de hora a hora.
export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: alternativas("pt", "inicio"),
};

export default function Home() {
  return <Inicio l="pt" />;
}
