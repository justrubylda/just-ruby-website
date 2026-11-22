import type { Metadata } from "next";
import Tabuleiros, { TEXTOS } from "@/app/components/paginas/Tabuleiros";
import { alternativas, localeOG } from "@/app/i18n";

// A disponibilidade (Airbnb + Booking) é revista de hora a hora.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: TEXTOS.es.titulo,
  description: TEXTOS.es.descricao,
  alternates: alternativas("es", "tabuleiros"),
  openGraph: {
    type: "website",
    locale: localeOG.es,
    siteName: "JUST RUBY",
    title: TEXTOS.es.titulo,
    description: TEXTOS.es.descricao,
    images: [{ url: "/fotos/kos-piscina-casa.jpg" }],
  },
};

export default function TabuleirosEsPage() {
  return <Tabuleiros l="es" />;
}
