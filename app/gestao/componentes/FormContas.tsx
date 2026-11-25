"use client";

import { useActionState } from "react";
import { conferirContasAcao, importarContasAcao } from "../acoes-contas";
import type { RelatorioContas } from "../lib/contas";
import { botao, botaoSec, campo, rotulo } from "./ui";

function Resultado({ r }: { r: RelatorioContas | null }) {
  if (!r) return null;
  return (
    <div className={`rounded-md p-3 text-sm ${r.ok ? "bg-[#e3f1e5] text-[#1f5f2b]" : "bg-[#fde8b8] text-[#7a4b00]"}`}>
      <p className="font-semibold">{r.titulo}</p>
      {r.linhas.length > 0 && (
        <ul className="mt-1 list-disc pl-5">
          {r.linhas.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Carregar o extrato do banco, uma lista de faturas ou a folha de acerto (ou colar linhas). */
export default function FormContas({ rotuloFicheiro, dicaColar }: { rotuloFicheiro: string; dicaColar: string }) {
  const [r, acao, aImportar] = useActionState<RelatorioContas | null, FormData>(importarContasAcao, null);
  return (
    <form action={acao} className="space-y-3">
      <label className="block">
        <span className={rotulo}>{rotuloFicheiro}</span>
        <input
          name="ficheiro"
          type="file"
          accept=".xlsx,.csv,.xls,.htm,.html,.txt"
          className={`${campo} file:mr-3 file:rounded file:border-0 file:bg-pedra file:px-3 file:py-1`}
        />
      </label>
      <details>
        <summary className="cursor-pointer text-sm font-semibold text-cinza">Ou colar linhas</summary>
        <textarea name="colado" rows={5} placeholder={dicaColar} className={`${campo} font-mono text-xs`} />
      </details>
      <button className={botao} disabled={aImportar}>
        {aImportar ? "A importar…" : "Importar"}
      </button>
      <Resultado r={r} />
    </form>
  );
}

/** Volta a aplicar as regras e a ligar movimentos, faturas e reservas. */
export function BotaoConferir() {
  const [r, acao, aCorrer] = useActionState<RelatorioContas | null>(conferirContasAcao, null);
  return (
    <form action={acao} className="space-y-2">
      <button className={botaoSec} disabled={aCorrer}>
        {aCorrer ? "A conferir…" : "Conferir agora"}
      </button>
      <Resultado r={r} />
    </form>
  );
}
