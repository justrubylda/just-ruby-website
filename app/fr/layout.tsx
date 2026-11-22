import type { Metadata } from "next";
import LayoutLingua from "@/app/components/LayoutLingua";
import { site } from "@/app/site";

// Versão francesa do site (/fr). Os textos estão em app/components/paginas/ e app/i18n.ts.
export const metadata: Metadata = {
  title: {
    // O "| JUST RUBY" do fim vem do modelo da raiz (app/layout.tsx).
    default: "Maisons de vacances avec piscine près de Tomar et Santarém, Portugal",
    template: "%s | JUST RUBY",
  },
  description:
    "Maisons de vacances avec piscine au cœur du Portugal : le Kingdom of Stone, domaine près de Tomar, et O Nosso Cantinho, villa avec piscine privée à Santarém.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    alternateLocale: ["pt_PT", "en_GB", "es_ES"],
    siteName: site.nome,
  },
};

export default function FrenchLayout({ children }: { children: React.ReactNode }) {
  return <LayoutLingua l="fr">{children}</LayoutLingua>;
}
