import type { Metadata } from "next";
import Sobre from "@/app/components/paginas/Sobre";
import { alternativas } from "@/app/i18n";

export const metadata: Metadata = {
  title: "Sobre nosotros",
  description:
    "JUST RUBY es una pequeña empresa familiar de turismo con sede en Várzea, Santarém, con casas rurales en Tomar y Santarém, Portugal.",
  alternates: alternativas("es", "sobre"),
};

export default function SobreNosotrosPage() {
  return <Sobre l="es" />;
}
