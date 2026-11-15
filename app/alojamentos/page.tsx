import type { Metadata } from "next";
import Link from "next/link";
import CasaVisual from "../components/CasaVisual";
import PageIntro from "../components/PageIntro";
import { casas } from "../site";

export const metadata: Metadata = {
  title: "Alojamentos",
  description:
    "Kingdom of Stone, quinta com piscina em Olalhas (Tomar), e O Nosso Cantinho, vivenda T4 na Várzea (Santarém). Escolha a sua estadia e peça disponibilidade.",
  alternates: { canonical: "/alojamentos" },
};

export default function AlojamentosPage() {
  return (
    <>
      <PageIntro
        titulo="Alojamentos"
        texto="Duas casas diferentes, o mesmo cuidado. Uma quinta no campo perto de Tomar e uma vivenda às portas de Santarém."
      />

      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        {casas.map((c, i) => (
          <article
            key={c.slug}
            className={`grid items-center gap-8 md:grid-cols-2 md:gap-14 ${
              i > 0 ? "mt-20 border-t border-xisto/15 pt-20" : ""
            }`}
          >
            <CasaVisual
              casa={c}
              sizes="(min-width: 768px) 50vw, 100vw"
              prioridade={i === 0}
              className={`relative aspect-[4/3] ${i % 2 === 1 ? "md:order-2" : ""}`}
            />

            <div>
              <p className="text-ouro-escuro">{c.local}</p>
              <h2 className="mt-2 text-4xl md:text-5xl">{c.nome}</h2>
              <p className="mt-2 font-semibold">{c.tipo}</p>
              <p className="mt-5 max-w-xl text-lg text-cinza">{c.frase}</p>

              <ul className="mt-6 grid max-w-xl gap-x-6 gap-y-2 sm:grid-cols-2">
                {c.destaques.map((d) => (
                  <li key={d} className="flex gap-3">
                    <span aria-hidden="true" className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rotate-45 bg-ouro" />
                    {d}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/alojamentos/${c.slug}`}
                  className="rounded-sm bg-preto px-6 py-3.5 font-semibold text-white transition-colors hover:bg-xisto"
                >
                  Ver {c.nome}
                </Link>
                <Link
                  href={`/alojamentos/${c.slug}#pedido`}
                  className="rounded-sm border border-ouro-escuro px-6 py-3.5 font-semibold text-ouro-escuro transition-colors hover:bg-ouro hover:text-preto"
                >
                  Pedir disponibilidade
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
