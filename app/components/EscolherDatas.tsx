"use client";

import { useMemo, useState } from "react";
import { calendario, escolherDatas, type Lingua } from "../i18n";
import type { Intervalo } from "../lib/disponibilidade";
import { euros, noitesEntre, orcamento, type Orcamento, type TabelaPrecos } from "../lib/orcamento";

// Calendário para escolher a chegada e a partida, como no Airbnb: as noites ocupadas
// aparecem riscadas e não se podem escolher; com preços definidos, cada noite livre
// mostra o preço e, no fim, o total da estadia.
// Cada dia é a noite que começa nesse dia: o dia em que outro hóspede chega pode ser
// o dia de partida.

type Props = {
  l: Lingua;
  escuro: boolean;
  ocupado: Intervalo[];
  precos?: TabelaPrecos;
  chegada: string;
  partida: string;
  onChange: (chegada: string, partida: string) => void;
  semResumo?: boolean; // o total aparece noutro sítio (página da casa)
};

const MESES_A_FRENTE = 12;

function hojeLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function EscolherDatas({ l, escuro, ocupado, precos, chegada, partida, onChange, semResumo }: Props) {
  const t = escolherDatas[l];
  const tc = calendario[l];
  const [hoje] = useState(hojeLocal);
  const [desvio, setDesvio] = useState(() => {
    // abre no mês da chegada já escolhida (ou no mês atual)
    if (!chegada) return 0;
    const [a, m] = chegada.split("-").map(Number);
    const [ha, hm] = hoje.split("-").map(Number);
    return Math.max(0, Math.min(MESES_A_FRENTE, (a - ha) * 12 + (m - hm)));
  });
  const [aviso, setAviso] = useState("");
  const [sobre, setSobre] = useState(""); // dia por baixo do rato, para mostrar o intervalo

  const ocupada = (iso: string) => ocupado.some((i) => iso >= i.inicio && iso < i.fim);
  // Primeira noite ocupada depois da chegada: a partida não pode passar desse dia.
  const limitePartida = useMemo(() => {
    if (!chegada || partida) return null;
    const futuras = ocupado.filter((i) => i.inicio > chegada).map((i) => i.inicio).sort();
    return futuras[0] ?? null;
  }, [chegada, partida, ocupado]);

  const aEscolherPartida = Boolean(chegada && !partida);
  const minimo = (iso: string) => precos?.minimo[iso] ?? 1;

  function escolher(iso: string) {
    setAviso("");
    if (!aEscolherPartida || iso <= chegada) {
      if (ocupada(iso)) return;
      onChange(iso, "");
      return;
    }
    if (limitePartida && iso > limitePartida) {
      setAviso(t.ocupadoPelo);
      return;
    }
    const min = minimo(chegada);
    if (noitesEntre(chegada, iso) < min) {
      setAviso(t.minimo(min));
      return;
    }
    onChange(chegada, iso);
  }

  const fimIntervalo = partida || (aEscolherPartida && sobre > chegada ? sobre : "");
  const noIntervalo = (iso: string) => Boolean(chegada && fimIntervalo && iso > chegada && iso < fimIntervalo);

  const meses = [0, 1].map((k) => {
    const [ha, hm] = hoje.split("-").map(Number);
    const d = new Date(Date.UTC(ha, hm - 1 + desvio + k, 1));
    return { ano: d.getUTCFullYear(), mes: d.getUTCMonth() };
  });

  const orc = semResumo ? null : orcamento(precos, chegada, partida);
  const cor = {
    texto: escuro ? "text-white" : "text-xisto",
    suave: escuro ? "text-nevoa/80" : "text-cinza",
    livre: escuro ? "bg-white/[0.06] hover:ring-1 hover:ring-ouro" : "bg-white hover:ring-1 hover:ring-ouro-escuro",
    intervalo: escuro ? "bg-ouro/30" : "bg-ouro/25",
    seta: escuro
      ? "border-white/25 text-white hover:border-ouro disabled:opacity-30"
      : "border-xisto/25 text-xisto hover:border-ouro-escuro disabled:opacity-30",
  };

  // Função (e não componente) para os botões não serem recriados a cada render.
  const desenharMes = (ano: number, mes: number) => {
    const primeiro = new Date(Date.UTC(ano, mes, 1));
    const dias = new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate();
    const celulas: (string | null)[] = Array((primeiro.getUTCDay() + 6) % 7).fill(null);
    for (let d = 1; d <= dias; d++) celulas.push(`${ano}-${String(mes + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    return (
      <div>
        <p className={`text-center font-semibold capitalize ${cor.texto}`}>
          {tc.meses[mes]} {ano}
        </p>
        <div className="mt-3 grid grid-cols-7 gap-1 text-center" role="grid" aria-label={`${tc.meses[mes]} ${ano}`}>
          {tc.dias.map((d, i) => (
            <span key={i} aria-hidden="true" className={`pb-1 text-xs font-semibold ${cor.suave}`}>
              {d}
            </span>
          ))}
          {celulas.map((iso, i) => {
            if (!iso) return <span key={i} />;
            const passado = iso < hoje;
            const oc = ocupada(iso);
            const ponta = iso === chegada || iso === partida;
            // A escolher a partida: o 1.º dia ocupado depois da chegada serve de partida;
            // antes da chegada pode escolher-se outra chegada (se a noite estiver livre).
            const podePartir = aEscolherPartida && iso > chegada && (!limitePartida || iso <= limitePartida);
            const desativado = passado || (aEscolherPartida && iso > chegada ? !podePartir : oc);
            const preco = precos?.noites[iso];
            const nome = tc.dia(Number(iso.slice(8)), tc.meses[mes]);
            return (
              <button
                key={iso}
                type="button"
                disabled={desativado && !ponta}
                onClick={() => escolher(iso)}
                onMouseEnter={() => setSobre(iso)}
                aria-pressed={ponta}
                aria-label={`${nome}, ${passado ? tc.passado : oc ? t.ocupado : t.livre}${preco && !oc ? `, ${euros(preco, l)}` : ""}`}
                className={`flex min-h-11 flex-col items-center justify-center rounded-sm px-0.5 py-1 text-sm leading-tight transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ouro ${
                  ponta
                    ? "bg-ouro font-semibold text-preto"
                    : noIntervalo(iso)
                      ? `${cor.intervalo} ${cor.texto}`
                      : passado
                        ? `${cor.suave} opacity-40`
                        : desativado && oc
                          ? `${cor.suave} cursor-not-allowed line-through opacity-50`
                          : desativado
                            ? `${cor.suave} opacity-40`
                            : `${cor.livre} ${cor.texto}`
                }`}
              >
                <span>{Number(iso.slice(8))}</span>
                {preco != null && !passado && !oc && (
                  <span className={`text-[0.65rem] ${ponta ? "text-preto/70" : cor.suave}`}>{Math.round(preco)}€</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="@container" onMouseLeave={() => setSobre("")}>
      <div className="flex items-center justify-between gap-3">
        <p className={`text-sm font-semibold ${cor.texto}`} aria-live="polite">
          {chegada && partida
            ? `${t.noites(noitesEntre(chegada, partida))} · ${chegada.split("-").reverse().join("/")} → ${partida.split("-").reverse().join("/")}`
            : aEscolherPartida
              ? t.escolhaPartida
              : t.escolhaChegada}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDesvio((d) => Math.max(0, d - 1))}
            disabled={desvio === 0}
            aria-label={t.anterior}
            className={`grid h-9 w-9 place-items-center rounded-full border ${cor.seta}`}
          >
            <span aria-hidden="true">‹</span>
          </button>
          <button
            type="button"
            onClick={() => setDesvio((d) => Math.min(MESES_A_FRENTE, d + 1))}
            disabled={desvio >= MESES_A_FRENTE}
            aria-label={t.seguinte}
            className={`grid h-9 w-9 place-items-center rounded-full border ${cor.seta}`}
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-6 @[36rem]:grid-cols-2">
        {desenharMes(meses[0].ano, meses[0].mes)}
        <div className="hidden @[36rem]:block">{desenharMes(meses[1].ano, meses[1].mes)}</div>
      </div>

      <div className={`mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs ${cor.suave}`}>
        <span className="flex items-center gap-1.5">
          <span className={`inline-block h-3 w-3 rounded-sm ${escuro ? "bg-white/20" : "bg-white ring-1 ring-xisto/20"}`} />
          {t.Livre}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block text-sm line-through">12</span>
          {t.Ocupado}
        </span>
        {(chegada || partida) && (
          <button type="button" onClick={() => (setAviso(""), onChange("", ""))} className="ml-auto font-semibold underline underline-offset-2">
            {t.limpar}
          </button>
        )}
      </div>

      {aviso && (
        <p role="alert" className={`mt-3 text-sm font-semibold ${escuro ? "text-ouro-claro" : "text-[#9a2b1f]"}`}>
          {aviso}
        </p>
      )}

      {!semResumo && orc && <ResumoPreco orc={orc} l={l} escuro={escuro} />}
    </div>
  );
}


/** Contas da estadia: noites × preço médio, limpeza e total. */
export function ResumoPreco({ orc, l, escuro }: { orc: Orcamento; l: Lingua; escuro: boolean }) {
  const t = escolherDatas[l];
  const texto = escuro ? "text-white" : "text-xisto";
  const linha = escuro ? "border-white/20" : "border-xisto/15";
  return (
    <div className={`mt-4 rounded-sm border p-4 text-sm ${escuro ? "border-white/20" : "border-xisto/15 bg-white"}`}>
      <p className={`flex justify-between gap-3 ${texto}`}>
        <span>{t.estadia(orc.noites, euros(orc.porNoite, l))}</span>
        <span>{euros(orc.estadia, l)}</span>
      </p>
      {orc.limpeza > 0 && (
        <p className={`mt-1 flex justify-between gap-3 ${texto}`}>
          <span>{t.limpeza}</span>
          <span>{euros(orc.limpeza, l)}</span>
        </p>
      )}
      <p className={`mt-2 flex justify-between gap-3 border-t pt-2 text-base font-semibold ${texto} ${linha}`}>
        <span>{t.total}</span>
        <span>{euros(orc.total, l)}</span>
      </p>
      <p className={`mt-2 text-xs ${escuro ? "text-nevoa/80" : "text-cinza"}`}>{t.notaPreco}</p>
    </div>
  );
}
