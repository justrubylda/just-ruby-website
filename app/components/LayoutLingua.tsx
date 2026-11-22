import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import WhatsAppButton from "@/app/components/WhatsAppButton";
import { codigo, type Lingua } from "@/app/i18n";

// Cabeçalho, rodapé e botão de WhatsApp das versões noutras línguas (/en, /es, /fr).
// O atributo lang diz aos leitores de ecrã em que língua está a página.
export default function LayoutLingua({ l, children }: { l: Lingua; children: React.ReactNode }) {
  return (
    <div lang={codigo[l]} className="contents">
      <Header l={l} />
      <main id="conteudo" className="flex-1">
        {children}
      </main>
      <Footer l={l} />
      <WhatsAppButton l={l} />
    </div>
  );
}
