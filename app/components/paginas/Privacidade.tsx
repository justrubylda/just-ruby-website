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
  es: {
    titulo: "Política de privacidad",
    quem: "Quién trata los datos",
    quemTexto: `${site.empresa}, NIF ${site.nif}, con sede en ${site.sede}, Portugal. Para cualquier cuestión sobre sus datos, escriba a`,
    que: "Qué datos recibimos",
    queTexto:
      "El formulario de solicitud de disponibilidad prepara un mensaje en su email o WhatsApp y registra en nuestro sistema de reservas el alojamiento, las fechas, el número de personas y, si los escribe, su nombre y su mensaje, para no perder ninguna solicitud. Por email o WhatsApp solo recibimos lo que usted decida enviarnos.",
    para: "Para qué los usamos",
    paraTexto:
      "Para responder a su solicitud y, si reserva, para gestionar la estancia y cumplir las obligaciones legales del alojamiento local en Portugal, como la comunicación de huéspedes a las autoridades y la facturación. No vendemos ni compartimos sus datos con fines publicitarios.",
    cookies: "Cookies",
    cookiesTexto: "Este sitio no utiliza cookies de publicidad ni de análisis.",
    direitos: "Sus derechos",
    direitosTexto:
      "Puede pedir consultar, corregir o borrar sus datos en cualquier momento, escribiendo al email indicado arriba. Si considera que sus datos no se han tratado correctamente, puede presentar una reclamación ante la autoridad portuguesa de protección de datos (CNPD, Comissão Nacional de Proteção de Dados).",
  },
  fr: {
    titulo: "Politique de confidentialité",
    quem: "Responsable du traitement",
    quemTexto: `${site.empresa}, numéro fiscal (NIF) ${site.nif}, siège à ${site.sede}, Portugal. Pour toute question concernant vos données, écrivez à`,
    que: "Quelles données recevons-nous",
    queTexto:
      "Le formulaire de demande de disponibilités prépare un message dans votre messagerie ou WhatsApp et enregistre dans notre système de réservation l'hébergement, les dates, le nombre de personnes et, si vous les indiquez, votre nom et votre message, afin qu'aucune demande ne se perde. Par e-mail ou WhatsApp, nous recevons uniquement ce que vous choisissez de nous envoyer.",
    para: "À quoi servent-elles",
    paraTexto:
      "À répondre à votre demande et, si vous réservez, à gérer votre séjour et à respecter les obligations légales de l'hébergement local au Portugal, comme la déclaration des voyageurs aux autorités et la facturation. Nous ne vendons ni ne partageons vos données à des fins publicitaires.",
    cookies: "Cookies",
    cookiesTexto: "Ce site n'utilise ni cookies publicitaires ni cookies de mesure d'audience.",
    direitos: "Vos droits",
    direitosTexto:
      "Vous pouvez demander à consulter, corriger ou supprimer vos données à tout moment, à l'adresse e-mail ci-dessus. Si vous estimez que vos données n'ont pas été traitées correctement, vous pouvez adresser une réclamation à l'autorité portugaise de protection des données (CNPD, Comissão Nacional de Proteção de Dados).",
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
