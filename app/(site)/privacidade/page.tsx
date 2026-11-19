import type { Metadata } from "next";
import Privacidade from "@/app/components/paginas/Privacidade";
import { alternativas } from "@/app/i18n";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description:
    "Como a JUST RUBY trata os dados de quem nos contacta através do site.",
  alternates: alternativas("pt", "privacidade"),
};

export default function PrivacidadePage() {
  return <Privacidade l="pt" />;
}
