import type { Metadata } from "next";
import Privacidade from "@/app/components/paginas/Privacidade";
import { alternativas } from "@/app/i18n";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Cómo trata JUST RUBY los datos de quienes nos contactan a través de este sitio.",
  alternates: alternativas("es", "privacidade"),
};

export default function PrivacidadPage() {
  return <Privacidade l="es" />;
}
