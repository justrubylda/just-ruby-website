import type { Metadata } from "next";
import Contactos from "@/app/components/paginas/Contactos";
import { alternativas } from "@/app/i18n";

// A disponibilidade (Airbnb + Booking) é revista de hora a hora.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Contactos",
  description:
    "Fale com a JUST RUBY para reservas no Kingdom of Stone (Tomar) e n'O Nosso Cantinho (Santarém). Peça disponibilidade por email ou WhatsApp.",
  alternates: alternativas("pt", "contactos"),
};

export default function ContactosPage() {
  return <Contactos l="pt" />;
}
