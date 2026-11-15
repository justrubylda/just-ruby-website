import type { Metadata } from "next";
import PageIntro from "../components/PageIntro";
import PedidoForm from "../components/PedidoForm";
import { casas, site, whatsappLink } from "../site";

export const metadata: Metadata = {
  title: "Contactos",
  description:
    "Fale com a JUST RUBY para reservas no Kingdom of Stone (Tomar) e n'O Nosso Cantinho (Santarém). Peça disponibilidade por email ou WhatsApp.",
  alternates: { canonical: "/contactos" },
};

export default function ContactosPage() {
  const wa = whatsappLink();

  return (
    <>
      <PageIntro
        titulo="Contactos"
        texto="Diga-nos as datas e o número de pessoas. Respondemos com a disponibilidade e o preço."
      />

      <div className="mx-auto grid max-w-7xl gap-16 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
        <div className="space-y-12">
          <section>
            <h2 className="text-3xl md:text-4xl">Fale connosco</h2>
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
                  <dt className="text-cinza">Telefone</dt>
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
            <h2 className="text-3xl md:text-4xl">Onde estamos</h2>
            <ul className="mt-6 divide-y divide-xisto/15 border-y border-xisto/15">
              {casas.map((c) => (
                <li key={c.slug} className="py-5">
                  <p className="font-semibold">{c.nome}</p>
                  <p className="text-cinza">{c.local}</p>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-cinza">A morada exata segue com a confirmação da reserva.</p>
          </section>
        </div>

        <section id="pedido" className="scroll-mt-24 bg-preto p-6 text-white md:p-10">
          <h2 className="text-3xl md:text-4xl">Pedir disponibilidade</h2>
          <div className="mt-8">
            <PedidoForm />
          </div>
        </section>
      </div>
    </>
  );
}
