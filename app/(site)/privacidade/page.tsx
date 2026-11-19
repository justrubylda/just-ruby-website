import type { Metadata } from "next";
import PageIntro from "@/app/components/PageIntro";
import { site } from "@/app/site";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description: "Como a JUST RUBY trata os dados de quem nos contacta através do site.",
  alternates: { canonical: "/privacidade" },
};

// Texto-base. Convém revê-lo com o contabilista ou um jurista antes de o dar por final.
export default function PrivacidadePage() {
  return (
    <>
      <PageIntro titulo="Política de privacidade" />

      <article className="mx-auto max-w-3xl space-y-10 px-5 py-16 text-lg md:px-8 md:py-24">
        <section>
          <h2 className="text-3xl">Quem trata os dados</h2>
          <p className="mt-4">
            {site.empresa}, NIF {site.nif}, com sede em {site.sede}. Para qualquer questão sobre
            os seus dados, escreva para{" "}
            <a href={`mailto:${site.email}`} className="font-semibold text-ouro-escuro underline underline-offset-4">
              {site.email}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-3xl">Que dados recebemos</h2>
          <p className="mt-4">
            O formulário de pedido de disponibilidade prepara uma mensagem no seu email ou
            WhatsApp e regista no nosso sistema de reservas o alojamento, as datas, o número de
            pessoas e, se os escrever, o nome e a mensagem, para não perdermos nenhum pedido. Pelo
            email ou WhatsApp só recebemos o que decidir enviar-nos.
          </p>
        </section>

        <section>
          <h2 className="text-3xl">Para que os usamos</h2>
          <p className="mt-4">
            Para responder ao seu pedido e, se reservar, para gerir a estadia e cumprir as
            obrigações legais do alojamento local, como a comunicação de hóspedes às
            autoridades e a faturação. Não vendemos nem partilhamos os seus dados para
            publicidade.
          </p>
        </section>

        <section>
          <h2 className="text-3xl">Cookies</h2>
          <p className="mt-4">
            O site não usa cookies de publicidade nem de análise.
          </p>
        </section>

        <section>
          <h2 className="text-3xl">Os seus direitos</h2>
          <p className="mt-4">
            Pode pedir para consultar, corrigir ou apagar os seus dados a qualquer momento,
            através do email acima. Se considerar que os seus dados não foram bem tratados,
            pode apresentar queixa à Comissão Nacional de Proteção de Dados (CNPD).
          </p>
        </section>
      </article>
    </>
  );
}
