import type { Metadata } from "next";
import Inicio from "@/app/components/paginas/Inicio";
import { alternativas } from "@/app/i18n";

// A disponibilidade (Airbnb + Booking) é revista de hora a hora.
export const revalidate = 3600;

export const metadata: Metadata = {
  description:
    "Maisons de vacances avec piscine au cœur du Portugal : le Kingdom of Stone, domaine près de Tomar, et O Nosso Cantinho, villa avec piscine privée à Santarém. Réservez directement auprès des hôtes.",
  alternates: alternativas("fr", "inicio"),
};

export default function HomeFr() {
  return <Inicio l="fr" />;
}
