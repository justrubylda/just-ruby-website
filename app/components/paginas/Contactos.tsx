import PageIntro from "@/app/components/PageIntro";
import PedidoForm from "@/app/components/PedidoForm";
import { ui, type Lingua } from "@/app/i18n";
import { ocupacaoTodas } from "@/app/lib/disponibilidade";
import { casasEm, site, whatsappLink } from "@/app/site";

const TEXTOS = {
  pt: {
    titulo: "Contactos",
    texto: "Diga-nos as datas e o número de pessoas. Respondemos com a disponibilidade e o preço.",
    fale: "Fale connosco",
    telefone: "Telefone",
    onde: "Onde estamos",
    morada: "A morada exata segue com a confirmação da reserva.",
  },
  en: {
    titulo: "Contact",
    texto: "Tell us your dates and the number of guests. We'll reply with availability and the price.",
    fale: "Get in touch",
    telefone: "Phone",
    onde: "Where we are",
    morada: "We send the exact address when your booking is confirmed.",
  },
  es: {
    titulo: "Contacto",
    texto: "Díganos las fechas y el número de personas. Le respondemos con la disponibilidad y el precio.",
    fale: "Hable con nosotros",
    telefone: "Teléfono",
    onde: "Dónde estamos",
    morada: "Le enviamos la dirección exacta con la confirmación de la reserva.",
  },
  fr: {
    titulo: "Contact",
    texto: "Indiquez-nous vos dates et le nombre de personnes. Nous vous répondrons avec les disponibilités et le prix.",
    fale: "Nous contacter",
    telefone: "Téléphone",
    onde: "Où nous trouver",
    morada: "Nous vous envoyons l'adresse exacte à la confirmation de la réservation.",
  },
};

export default async function Contactos({ l }: { l: Lingua }) {
  const t = TEXTOS[l];
  const wa = whatsappLink(ui[l].whatsappTexto);

  return (
    <>
      <PageIntro titulo={t.titulo} texto={t.texto} />

      <div className="mx-auto grid max-w-7xl gap-16 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
        <div className="space-y-12">
          <section>
            <h2 className="text-3xl md:text-4xl">{t.fale}</h2>
            <dl className="mt-6 space-y-5 text-lg">
              <div>
                <dt className="text-cinza">Email</dt>
                <dd>
                  <a href={`mailto:${site.email}`} className="break-all font-semibold text-ouro-escuro underline-offset-4 hover:underline">
                    {site.email}
                  </a>
                </dd>
              </div>
              {wa && (
                <div>
                  <dt className="text-cinza">WhatsApp</dt>
                  <dd>
                    <a href={wa} target="_blank" rel="noopener noreferrer" className="font-semibold text-ouro-escuro underline-offset-4 hover:underline">
                      +{site.whatsapp}
                    </a>
                  </dd>
                </div>
              )}
              {site.telefone && (
                <div>
                  <dt className="text-cinza">{t.telefone}</dt>
                  <dd>
                    <a href={`tel:+${site.telefone}`} className="font-semibold text-ouro-escuro underline-offset-4 hover:underline">
                      +{site.telefone}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </section>

          <section>
            <h2 className="text-3xl md:text-4xl">{t.onde}</h2>
            <ul className="mt-6 divide-y divide-xisto/15 border-y border-xisto/15">
              {casasEm(l).map((c) => (
                <li key={c.slug} className="py-5">
                  <p className="font-semibold">{c.nome}</p>
                  <p className="text-cinza">{c.local}</p>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-cinza">{t.morada}</p>
          </section>
        </div>

        <section id="pedido" className="scroll-mt-24 bg-preto p-6 text-white md:p-10">
          <h2 className="text-3xl md:text-4xl">{ui[l].pedir}</h2>
          <div className="mt-8">
            <PedidoForm ocupado={await ocupacaoTodas()} l={l} />
          </div>
        </section>
      </div>
    </>
  );
}
