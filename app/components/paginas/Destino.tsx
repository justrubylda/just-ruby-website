import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CasaVisual from "@/app/components/CasaVisual";
import PageIntro from "@/app/components/PageIntro";
import PedidoForm from "@/app/components/PedidoForm";
import { getDestino } from "@/app/destinos";
import { alternativas, localeOG, rota, rotaCasa, ui, type Lingua, type Pagina } from "@/app/i18n";
import { ocupacaoTodas } from "@/app/lib/disponibilidade";
import { casaEm, getCasa, site } from "@/app/site";

// Páginas "onde ficar" (Festa dos Tabuleiros, Castelo do Bode, CNEMA).
// Os textos estão em app/destinos.ts.

export function metadadosDestino(p: Pagina, l: Lingua): Metadata {
  const d = getDestino(p);
  if (!d) return {};
  const t = d.textos[l];
  return {
    title: t.titulo,
    description: t.descricao,
    alternates: alternativas(l, p),
    openGraph: {
      type: "website",
      locale: localeOG[l],
      siteName: site.nome,
      title: t.titulo,
      description: t.descricao,
      url: rota(l, p),
      images: [{ url: d.imagem }],
    },
  };
}

const marca = <span aria-hidden="true" className="mt-[0.75em] h-1.5 w-1.5 shrink-0 rotate-45 bg-ouro" />;

export default async function Destino({ pagina, l }: { pagina: Pagina; l: Lingua }) {
  const d = getDestino(pagina);
  if (!d) notFound();
  const t = d.textos[l];
  const casas = Object.keys(t.casas)
    .map((s) => getCasa(s))
    .filter((c) => c !== undefined)
    .map((c) => casaEm(c, l));

  return (
    <>
      <PageIntro titulo={t.h1} texto={t.intro} />

      <div className="mx-auto grid max-w-7xl gap-14 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
        <div className="space-y-14">
          {t.seccoes.map((s) => (
            <section key={s.titulo}>
              <h2 className="text-3xl md:text-4xl">{s.titulo}</h2>
              {s.paragrafos && (
                <div className="mt-6 max-w-2xl space-y-5 text-lg">
                  {s.paragrafos.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              )}
              {s.lista && (
                <ul className="mt-6 max-w-2xl space-y-3">
                  {s.lista.map((c) => (
                    <li key={c} className="flex gap-3 text-lg">
                      {marca}
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
          <Link
            href={`${rota(l, "zona")}#${d.zona}`}
            className="inline-block border-b border-ouro-escuro pb-1 font-semibold text-ouro-escuro hover:text-xisto"
          >
            {t.maisZona}
          </Link>
        </div>

        <aside id="pedido" className="scroll-mt-24 self-start bg-pedra p-6 md:p-8 lg:sticky lg:top-24">
          <h2 className="text-3xl">{t.pedirTitulo}</h2>
          <p className="mt-3 text-cinza">{t.pedirTexto}</p>
          <div className="mt-6">
            <PedidoForm casaInicial={d.casaInicial} tema="claro" ocupado={await ocupacaoTodas()} l={l} />
          </div>
        </aside>
      </div>

      <section className="bg-preto text-white">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-24">
          <h2 className="text-4xl md:text-5xl">{t.ondeFicar}</h2>
          <div className="mt-12 grid gap-12 md:grid-cols-2">
            {casas.map((c) => (
              <article key={c.slug}>
                <Link href={rotaCasa(l, c.slug)} className="group block">
                  <CasaVisual casa={c} sizes="(min-width: 768px) 50vw, 100vw" className="relative aspect-[4/3]" />
                  <p className="mt-5 text-ouro-claro">{c.local}</p>
                  <h3 className="mt-1 text-3xl group-hover:text-ouro-claro md:text-4xl">{c.nome}</h3>
                </Link>
                <p className="mt-3 max-w-xl text-nevoa">{t.casas[c.slug]}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={rotaCasa(l, c.slug)}
                    className="rounded-sm bg-ouro px-5 py-3 font-semibold text-preto transition-colors hover:bg-ouro-claro"
                  >
                    {ui[l].ver(c.nome)}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
