import type { Metadata } from "next";
import LayoutLingua from "@/app/components/LayoutLingua";
import { site } from "@/app/site";

// Versão inglesa do site (/en). Os textos estão em app/components/paginas/ e app/i18n.ts.
export const metadata: Metadata = {
  title: {
    // O "| JUST RUBY" do fim vem do modelo da raiz (app/layout.tsx).
    default: "Holiday Homes with Pools near Tomar and Santarém, Portugal",
    template: "%s | JUST RUBY",
  },
  description:
    "Holiday homes with pools in central Portugal: Kingdom of Stone, a country estate near Tomar, and O Nosso Cantinho, a villa with a private pool in Santarém.",
  openGraph: {
    type: "website",
    locale: "en_GB",
    alternateLocale: ["pt_PT", "es_ES", "fr_FR"],
    siteName: site.nome,
  },
};

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return <LayoutLingua l="en">{children}</LayoutLingua>;
}
