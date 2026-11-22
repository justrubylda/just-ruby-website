import type { Metadata } from "next";
import LayoutLingua from "@/app/components/LayoutLingua";
import { site } from "@/app/site";

// Versão espanhola do site (/es). Os textos estão em app/components/paginas/ e app/i18n.ts.
export const metadata: Metadata = {
  title: {
    // O "| JUST RUBY" do fim vem do modelo da raiz (app/layout.tsx).
    default: "Casas rurales con piscina cerca de Tomar y Santarém, Portugal",
    template: "%s | JUST RUBY",
  },
  description:
    "Casas rurales con piscina en el centro de Portugal: Kingdom of Stone, finca cerca de Tomar, y O Nosso Cantinho, villa con piscina privada en Santarém.",
  openGraph: {
    type: "website",
    locale: "es_ES",
    alternateLocale: ["pt_PT", "en_GB", "fr_FR"],
    siteName: site.nome,
  },
};

export default function SpanishLayout({ children }: { children: React.ReactNode }) {
  return <LayoutLingua l="es">{children}</LayoutLingua>;
}
