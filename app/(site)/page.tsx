import type { Metadata } from "next";
import Link from "next/link";
import CasaVisual from "@/app/components/CasaVisual";
import PedidoForm from "@/app/components/PedidoForm";
import { ocupacaoTodas } from "@/app/lib/disponibilidade";
import { casas, site } from "@/app/site";

// A disponibilidade (Airbnb + Booking) é revista de hora a hora.
export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  return (
    <>
      {/* Abertura: o título e, logo abaixo, as duas casas lado a lado. */}
      <section className="bg-preto text-white">
        <div className="mx-auto max-w-7xl px-5 pb-12 pt-14 md:px-8 md:pb-16 md:pt-20">
          <h1 className="max-w-4xl text-5xl md:text-7xl lg:text-[5.25rem]">
            Duas casas para abrandar no centro de Portugal
          </h1>
          <span className="filete mt-8" aria-hidden="true" />
          <p className="mt-8 max-w-2xl text-lg text-nevoa md:text-xl">
            Uma quinta perto de Tomar e uma vivenda na Várzea, em Santarém, ambas com
            piscina. Cuidamos de cada uma pessoalmente.
          </p>
        </div>

        <div className="grid md:grid-cols-2">
          {casas.map((c, i) => (
            <Link
              key={c.slug}
              href={`/alojamentos/${c.slug}`}
              className={`group relative block min-h-[26rem] md:min-h-[34rem] lg:min-h-[38rem] ${
                i > 0 ? "border-t border-ouro/40 md:border-l md:border-t-0" : ""
              }`}
            >
              <CasaVisual
                casa={c}
                sizes="(min-width: 768px) 50vw, 100vw"
                prioridade
                className="absolute inset-0"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-preto/85 via-preto/20 to-transparent"
              />
              <div className="relative flex h-full min-h-[inherit] flex-col justify-end p-8 md:p-12">
                <p className="text-ouro-claro">{c.cidade}</p>
                <h2 className="mt-2 text-4xl md:text-5xl">{c.nome}</h2>
                <p className="mt-3 max-w-md text-nevoa">{c.frase}</p>
                <span className="mt-6 inline-block self-start border-b border-ouro pb-1 font-semibold text-white transition-colors group-hover:border-ouro-claro group-hover:text-ouro-claro">
                  {c.verLabel}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quem recebe */}
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:grid-cols-[1fr_1.4fr] md:gap-16 md:px-8 md:py-28">
        <h2 className="text-4xl md:text-5xl">Uma casa de família, aberta a quem chega</h2>
        <div className="max-w-2xl space-y-5 text-lg">
          <p>
            Somos {site.anfitrioes}. A JUST RUBY é a nossa empresa e estas são as casas de
            que cuidamos: preparamos cada uma antes de chegar e estamos contactáveis durante
            toda a estadia.
          </p>
          <p>
            Ao reservar connosco fala diretamente com quem conhece a casa, o caminho até lá e
            os melhores sítios à volta.
          </p>
          <Link
            href="/sobre"
            className="inline-block border-b border-ouro-escuro pb-1 font-semibold text-ouro-escuro hover:text-xisto"
          >
            Conhecer a JUST RUBY
          </Link>
        </div>
      </section>

      {/* A região à volta de cada casa */}
      <section className="bg-pedra">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <h2 className="max-w-3xl text-4xl md:text-5xl">O que fica perto</h2>
          <div className="mt-12 grid gap-14 md:grid-cols-2 md:gap-16">
            {casas.map((c) => (
              <div key={c.slug}>
                <h3 className="border-b border-ouro/60 pb-3 text-3xl">{c.cidade}</h3>
                <ul className="mt-6 space-y-5">
                  {c.perto.map((p) => (
                    <li key={p.nome}>
                      <p className="font-semibold">{p.nome}</p>
                      <p className="text-cinza">{p.nota}</p>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/alojamentos/${c.slug}`}
                  className="mt-8 inline-block border-b border-ouro-escuro pb-1 font-semibold text-ouro-escuro hover:text-xisto"
                >
                  Ver {c.nome}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pedido de disponibilidade */}
      <section id="pedido" className="scroll-mt-20 bg-preto text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-[1fr_1.3fr] md:gap-16 md:px-8 md:py-28">
          <div>
            <h2 className="text-4xl md:text-5xl">Tem datas em mente?</h2>
            <p className="mt-6 max-w-md text-lg text-nevoa">
              Diga-nos quando quer vir e quantas pessoas são. Respondemos com a
              disponibilidade e o preço.
            </p>
          </div>
          <PedidoForm ocupado={await ocupacaoTodas()} />
        </div>
      </section>
    </>
  );
}
