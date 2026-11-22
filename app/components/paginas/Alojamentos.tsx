import Link from "next/link";
import Avaliacao from "@/app/components/Avaliacao";
import CasaVisual from "@/app/components/CasaVisual";
import PageIntro from "@/app/components/PageIntro";
import { rotaCasa, ui, type Lingua } from "@/app/i18n";
import { casasEm } from "@/app/site";

const TEXTOS = {
  pt: {
    titulo: "Alojamentos",
    texto:
      "Duas casas diferentes, o mesmo cuidado. Uma quinta no campo perto de Tomar e uma vivenda às portas de Santarém.",
  },
  en: {
    titulo: "Accommodation",
    texto:
      "Two different houses, the same care. A country estate near Tomar and a villa on the edge of Santarém.",
  },
  es: {
    titulo: "Alojamientos",
    texto:
      "Dos casas distintas, el mismo cuidado. Una finca en el campo cerca de Tomar y una villa a las puertas de Santarém.",
  },
  fr: {
    titulo: "Hébergements",
    texto:
      "Deux maisons différentes, le même soin. Un domaine à la campagne près de Tomar et une villa aux portes de Santarém.",
  },
};

export default function Alojamentos({ l }: { l: Lingua }) {
  const t = TEXTOS[l];
  const casas = casasEm(l);

  return (
    <>
      <PageIntro titulo={t.titulo} texto={t.texto} />

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
              {c.avaliacao && <Avaliacao avaliacao={c.avaliacao} l={l} className="mt-3" />}
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
                  href={rotaCasa(l, c.slug)}
                  className="rounded-sm bg-preto px-6 py-3.5 font-semibold text-white transition-colors hover:bg-xisto"
                >
                  {ui[l].ver(c.nome)}
                </Link>
                <Link
                  href={`${rotaCasa(l, c.slug)}#pedido`}
                  className="rounded-sm border border-ouro-escuro px-6 py-3.5 font-semibold text-ouro-escuro transition-colors hover:bg-ouro hover:text-preto"
                >
                  {ui[l].pedir}
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
