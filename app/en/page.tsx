import type { Metadata } from "next";
import Inicio from "@/app/components/paginas/Inicio";
import { alternativas } from "@/app/i18n";

// A disponibilidade (Airbnb + Booking) é revista de hora a hora.
export const revalidate = 3600;

export const metadata: Metadata = {
  description:
    "Holiday homes with pools in central Portugal: Kingdom of Stone, a country estate near Tomar, and O Nosso Cantinho, a villa with a private pool in Santarém. Book directly with the hosts.",
  alternates: alternativas("en", "inicio"),
};

export default function HomeEn() {
  return <Inicio l="en" />;
}
