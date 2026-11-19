import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import WhatsAppButton from "@/app/components/WhatsAppButton";

// Cabeçalho, rodapé e botão de WhatsApp de todas as páginas públicas do site.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header l="pt" />
      <main id="conteudo" className="flex-1">
        {children}
      </main>
      <Footer l="pt" />
      <WhatsAppButton l="pt" />
    </>
  );
}
