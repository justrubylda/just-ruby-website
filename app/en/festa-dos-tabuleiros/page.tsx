import type { Metadata } from "next";
import Tabuleiros, { TEXTOS } from "@/app/components/paginas/Tabuleiros";
import { alternativas, localeOG } from "@/app/i18n";

// A disponibilidade (Airbnb + Booking) é revista de hora a hora.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: TEXTOS.en.titulo,
  description: TEXTOS.en.descricao,
  alternates: alternativas("en", "tabuleiros"),
  openGraph: {
    type: "website",
    locale: localeOG.en,
    siteName: "JUST RUBY",
    title: TEXTOS.en.titulo,
    description: TEXTOS.en.descricao,
    images: [{ url: "/fotos/kos-piscina-casa.jpg" }],
  },
};

export default function TabuleirosEnPage() {
  return <Tabuleiros l="en" />;
}
