import type { Metadata } from "next";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import WhatsAppButton from "@/app/components/WhatsAppButton";
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
    alternateLocale: ["pt_PT"],
    siteName: site.nome,
  },
};

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="en" className="contents">
      <Header l="en" />
      <main id="conteudo" className="flex-1">
        {children}
      </main>
      <Footer l="en" />
      <WhatsAppButton l="en" />
    </div>
  );
}
