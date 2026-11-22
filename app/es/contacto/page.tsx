import type { Metadata } from "next";
import Contactos from "@/app/components/paginas/Contactos";
import { alternativas } from "@/app/i18n";

// A disponibilidade (Airbnb + Booking) é revista de hora a hora.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Contacte con JUST RUBY para reservar Kingdom of Stone (Tomar) u O Nosso Cantinho (Santarém). Consulte la disponibilidad por email o WhatsApp.",
  alternates: alternativas("es", "contactos"),
};

export default function ContactoPage() {
  return <Contactos l="es" />;
}
