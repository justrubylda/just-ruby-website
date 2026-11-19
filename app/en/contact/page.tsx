import type { Metadata } from "next";
import Contactos from "@/app/components/paginas/Contactos";
import { alternativas } from "@/app/i18n";

// A disponibilidade (Airbnb + Booking) é revista de hora a hora.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact JUST RUBY to book Kingdom of Stone (Tomar) or O Nosso Cantinho (Santarém). Ask about availability by email or WhatsApp.",
  alternates: alternativas("en", "contactos"),
};

export default function ContactPage() {
  return <Contactos l="en" />;
}
