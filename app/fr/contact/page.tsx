import type { Metadata } from "next";
import Contactos from "@/app/components/paginas/Contactos";
import { alternativas } from "@/app/i18n";

// A disponibilidade (Airbnb + Booking) é revista de hora a hora.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez JUST RUBY pour réserver le Kingdom of Stone (Tomar) ou O Nosso Cantinho (Santarém). Demandez les disponibilités par e-mail ou WhatsApp.",
  alternates: alternativas("fr", "contactos"),
};

export default function ContactFrPage() {
  return <Contactos l="fr" />;
}
