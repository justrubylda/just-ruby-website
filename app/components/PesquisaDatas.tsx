"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { pesquisa, type Lingua } from "../i18n";
import type { Ocupacao } from "../lib/disponibilidade";
import type { TabelaPrecos } from "../lib/orcamento";
import EscolherDatas from "./EscolherDatas";

// Barra da página inicial, como no Airbnb: casa, datas e pessoas. Leva à página da
// casa com as datas já escolhidas no calendário.

type CasaCurta = { slug: string; nome: string; cidade: string; href: string };

const LOCALE = { pt: "pt-PT", en: "en-GB", es: "es-ES", fr: "fr-FR" } as const;

export default function PesquisaDatas({
  l,
  casas,
  ocupado,
  precos,
}: {
  l: Lingua;
  casas: CasaCurta[];
  ocupado: Ocupacao;
  precos: Record<string, TabelaPrecos>;
}) {
  const t = pesquisa[l];
  const router = useRouter();
  const id = useId();
  const caixa = useRef<HTMLFormElement>(null);
  const [casa, setCasa] = useState("");
  const [chegada, setChegada] = useState("");
  const [partida, setPartida] = useState("");
  const [pessoas, setPessoas] = useState(2);
  const [aberto, setAberto] = useState(false);

  // Fecha o calendário ao clicar fora ou com Esc.
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => {
      if (caixa.current && !caixa.current.contains(e.target as Node))
        setAberto(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    document.addEventListener("pointerdown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  const curta = (iso: string) =>
    new Intl.DateTimeFormat(LOCALE[l], {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }).format(new Date(`${iso}T12:00:00Z`));

  function escolherCasa(slug: string) {
    setCasa(slug);
    setChegada("");
    setPartida("");
  }

  function ver(e: React.FormEvent) {
    e.preventDefault();
    const c = casas.find((x) => x.slug === casa);
    if (!c) return setAberto(true);
    const q = new URLSearchParams();
    if (chegada && partida) {
      q.set("chegada", chegada);
      q.set("partida", partida);
    }
    q.set("pessoas", String(pessoas));
    // Com datas escolhidas, vai direto ao pedido (logo abaixo do calendário da casa).
    router.push(`${c.href}?${q}#${chegada && partida ? "pedido" : "disponibilidade"}`);
  }

  const segmento = "block px-5 py-3 text-left";
  const divisoria = "border-b border-xisto/10 md:border-b-0 md:border-r";

  return (
    <form ref={caixa} onSubmit={ver} className="relative">
      <div className="grid overflow-hidden rounded-md bg-white text-xisto shadow-2xl shadow-preto/40 md:grid-cols-[1.15fr_1.5fr_1fr_auto]">
        <label
          className={`${segmento} ${divisoria} cursor-pointer hover:bg-pedra/40`}
        >
          <span className="block text-xs font-semibold">{t.alojamento}</span>
          <select
            value={casa}
            onChange={(e) => escolherCasa(e.target.value)}
            className="-ml-1 mt-0.5 w-full cursor-pointer bg-transparent text-base focus:outline-none"
          >
            <option value="">{t.escolher}</option>
            {casas.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => setAberto((a) => !a)}
          aria-expanded={aberto}
          aria-controls={`${id}-datas`}
          className={`${segmento} ${divisoria} hover:bg-pedra/40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ouro`}
        >
          <span className="block text-xs font-semibold">{t.datas}</span>
          <span className={`mt-0.5 block ${chegada ? "" : "text-cinza"}`}>
            {chegada
              ? `${curta(chegada)} – ${partida ? curta(partida) : "…"}`
              : t.escolherDatas}
          </span>
        </button>

        <div
          className={`flex items-center justify-between gap-4 px-5 py-3 ${divisoria}`}
        >
          <div>
            <span className="block text-xs font-semibold">{t.pessoas}</span>
            <span className="mt-0.5 block" aria-live="polite">
              {pessoas}
            </span>
          </div>
          <div className="flex gap-2">
            {[
              { rotulo: t.menos, sinal: "−", delta: -1, off: pessoas <= 1 },
              { rotulo: t.mais, sinal: "+", delta: 1, off: pessoas >= 8 },
            ].map((b) => (
              <button
                key={b.sinal}
                type="button"
                aria-label={b.rotulo}
                disabled={b.off}
                onClick={() => setPessoas((p) => p + b.delta)}
                className="grid h-8 w-8 place-items-center rounded-full border border-xisto/30 text-lg leading-none hover:border-xisto disabled:opacity-30"
              >
                <span aria-hidden="true">{b.sinal}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-2">
          <button
            type="submit"
            className="h-full w-full rounded-sm bg-ouro px-6 py-3 font-semibold text-preto transition-colors hover:bg-ouro-claro"
          >
            {t.ver}
          </button>
        </div>
      </div>

      {aberto && (
        <div
          id={`${id}-datas`}
          className="mt-2 rounded-md bg-white p-5 text-xisto shadow-2xl shadow-preto/40 md:absolute md:inset-x-0 md:bottom-full md:z-30 md:mb-2 md:mt-0 md:p-6"
        >
          {casa ? (
            <EscolherDatas
              key={casa}
              l={l}
              escuro={false}
              ocupado={ocupado[casa] ?? []}
              precos={precos[casa]}
              chegada={chegada}
              partida={partida}
              onChange={(c, p) => {
                setChegada(c);
                setPartida(p);
              }}
            />
          ) : (
            <div>
              <p className="font-semibold">{t.escolhaCasaPrimeiro}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {casas.map((c) => (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => escolherCasa(c.slug)}
                    className="rounded-sm border border-xisto/25 px-4 py-2.5 font-semibold hover:border-ouro-escuro"
                  >
                    {c.nome}{" "}
                    <span className="font-normal text-cinza">· {c.cidade}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => setAberto(false)}
              className="text-sm font-semibold underline underline-offset-2"
            >
              {t.fechar}
            </button>
            {casa && chegada && partida && (
              <button
                type="submit"
                className="rounded-sm bg-ouro px-6 py-3 font-semibold text-preto transition-colors hover:bg-ouro-claro"
              >
                {t.avancar}
              </button>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
