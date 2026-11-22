import type { Metadata } from "next";
import Tabuleiros, { TEXTOS } from "@/app/components/paginas/Tabuleiros";
import { alternativas, localeOG } from "@/app/i18n";

// A disponibilidade (Airbnb + Booking) é revista de hora a hora.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: TEXTOS.pt.titulo,
  description: TEXTOS.pt.descricao,
  alternates: alternativas("pt", "tabuleiros"),
  openGraph: {
    type: "website",
    locale: localeOG.pt,
    siteName: "JUST RUBY",
    title: TEXTOS.pt.titulo,
    description: TEXTOS.pt.descricao,
    images: [{ url: "/fotos/kos-piscina-casa.jpg" }],
  },
};

export default function TabuleirosPage() {
  return <Tabuleiros l="pt" />;
}
