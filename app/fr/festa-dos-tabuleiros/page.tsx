import type { Metadata } from "next";
import Tabuleiros, { TEXTOS } from "@/app/components/paginas/Tabuleiros";
import { alternativas, localeOG } from "@/app/i18n";

// A disponibilidade (Airbnb + Booking) é revista de hora a hora.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: TEXTOS.fr.titulo,
  description: TEXTOS.fr.descricao,
  alternates: alternativas("fr", "tabuleiros"),
  openGraph: {
    type: "website",
    locale: localeOG.fr,
    siteName: "JUST RUBY",
    title: TEXTOS.fr.titulo,
    description: TEXTOS.fr.descricao,
    images: [{ url: "/fotos/kos-piscina-casa.jpg" }],
  },
};

export default function TabuleirosFrPage() {
  return <Tabuleiros l="fr" />;
}
