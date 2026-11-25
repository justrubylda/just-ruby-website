"use client";

import { escolherDatas, formulario, type Lingua } from "../i18n";
import { orcamento, type TabelaPrecos } from "../lib/orcamento";
import { ResumoPreco } from "./EscolherDatas";

/** Na página da casa: as duas datas escolhidas no calendário e o total, como no cartão do Airbnb. */
export default function ResumoDatas({
  chegada,
  partida,
  precos,
  l,
  escuro,
}: {
  chegada: string;
  partida: string;
  precos?: TabelaPrecos;
  l: Lingua;
  escuro: boolean;
}) {
  const t = formulario[l];
  const te = escolherDatas[l];
  const data = (iso: string) => (iso ? iso.split("-").reverse().join("/") : "");
  const orc = orcamento(precos, chegada, partida);
  const caixa = `block px-3 py-2.5 ${escuro ? "text-white" : "text-xisto"}`;
  return (
    <>
      <a
        href="#disponibilidade"
        className={`grid grid-cols-2 rounded-sm border transition-colors ${
          escuro ? "border-white/25 hover:border-ouro" : "border-xisto/25 bg-white hover:border-ouro-escuro"
        }`}
      >
        <span className={caixa}>
          <span className="block text-xs font-semibold">{t.chegada}</span>
          <span className={chegada ? "" : "text-cinza"}>{data(chegada) || te.escolher}</span>
        </span>
        <span className={`${caixa} border-l ${escuro ? "border-white/25" : "border-xisto/25"}`}>
          <span className="block text-xs font-semibold">{t.partida}</span>
          <span className={partida ? "" : "text-cinza"}>{data(partida) || te.escolher}</span>
        </span>
      </a>
      {orc ? (
        <ResumoPreco orc={orc} l={l} escuro={escuro} />
      ) : (
        <p className={`mt-2 text-sm ${escuro ? "text-nevoa/80" : "text-cinza"}`}>{te.noCalendario}</p>
      )}
    </>
  );
}
