import PageIntro from "@/app/components/PageIntro";
import type { Lingua } from "@/app/i18n";
import { site } from "@/app/site";

// Texto-base. Convém revê-lo com o contabilista ou um jurista antes de o dar por final.
const TEXTOS = {
  pt: {
    titulo: "Política de privacidade",
    quem: "Quem trata os dados",
    quemTexto: `${site.empresa}, NIF ${site.nif}, com sede em ${site.sede}. Para qualquer questão sobre os seus dados, escreva para`,
    que: "Que dados recebemos",
    queTexto:
      "O formulário de pedido de disponibilidade prepara uma mensagem no seu email ou WhatsApp e regista no nosso sistema de reservas o alojamento, as datas, o número de pessoas e, se os escrever, o nome e a mensagem, para não perdermos nenhum pedido. Pelo email ou WhatsApp só recebemos o que decidir enviar-nos.",
    para: "Para que os usamos",
    paraTexto:
      "Para responder ao seu pedido e, se reservar, para gerir a estadia e cumprir as obrigações legais do alojamento local, como a comunicação de hóspedes às autoridades e a faturação. Não vendemos nem partilhamos os seus dados para publicidade.",
    cookies: "Cookies",
    cookiesTexto: "O site não usa cookies de publicidade nem de análise.",
    direitos: "Os seus direitos",
    direitosTexto:
      "Pode pedir para consultar, corrigir ou apagar os seus dados a qualquer momento, através do email acima. Se considerar que os seus dados não foram bem tratados, pode apresentar queixa à Comissão Nacional de Proteção de Dados (CNPD).",
  },
  en: {
    titulo: "Privacy policy",
    quem: "Who handles your data",
    quemTexto: `${site.empresa}, tax number (NIF) ${site.nif}, registered office in ${site.sede}, Portugal. For any question about your data, write to`,
    que: "What data we receive",
    queTexto:
      "The availability request form prepares a message in your email or WhatsApp and records in our booking system the house, the dates, the number of guests and, if you write them, your name and message, so that no request gets lost. By email or WhatsApp we only receive what you decide to send us.",
    para: "What we use it for",
    paraTexto:
      "To answer your request and, if you book, to manage your stay and meet the legal obligations of local accommodation in Portugal, such as registering guests with the authorities and invoicing. We do not sell or share your data for advertising.",
    cookies: "Cookies",
    cookiesTexto: "This site does not use advertising or analytics cookies.",
    direitos: "Your rights",
    direitosTexto:
      "You can ask to see, correct or delete your data at any time, using the email address above. If you believe your data has not been handled properly, you can complain to the Portuguese data protection authority (CNPD, Comissão Nacional de Proteção de Dados).",
  },
};

export default function Privacidade({ l }: { l: Lingua }) {
  const t = TEXTOS[l];

  return (
    <>
      <PageIntro titulo={t.titulo} />

      <article className="mx-auto max-w-3xl space-y-10 px-5 py-16 text-lg md:px-8 md:py-24">
        <section>
          <h2 className="text-3xl">{t.quem}</h2>
          <p className="mt-4">
            {t.quemTexto}{" "}
            <a href={`mailto:${site.email}`} className="font-semibold text-ouro-escuro underline underline-offset-4">
              {site.email}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-3xl">{t.que}</h2>
          <p className="mt-4">{t.queTexto}</p>
        </section>

        <section>
          <h2 className="text-3xl">{t.para}</h2>
          <p className="mt-4">{t.paraTexto}</p>
        </section>

        <section>
          <h2 className="text-3xl">{t.cookies}</h2>
          <p className="mt-4">{t.cookiesTexto}</p>
        </section>

        <section>
          <h2 className="text-3xl">{t.direitos}</h2>
          <p className="mt-4">{t.direitosTexto}</p>
        </section>
      </article>
    </>
  );
}
