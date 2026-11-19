"use client";

import { useActionState } from "react";
import { importarFicheiro, type Relatorio } from "../acoes";
import { botao, campo, rotulo } from "./ui";

export default function FormImportar({ als }: { als: string[] }) {
  const [r, acao, aImportar] = useActionState<Relatorio | null, FormData>(importarFicheiro, null);
  return (
    <form action={acao} className="space-y-4">
      <label className="block">
        <span className={rotulo}>Ficheiro (.xlsx, .csv ou .xls do Booking)</span>
        <input name="ficheiro" type="file" accept=".xlsx,.csv,.xls,.htm,.html,.txt" required className={`${campo} file:mr-3 file:rounded file:border-0 file:bg-pedra file:px-3 file:py-1`} />
      </label>
      <label className="block max-w-sm">
        <span className={rotulo}>Alojamento das reservas</span>
        <select name="al" defaultValue="" className={campo}>
          <option value="">Descobrir pelo ficheiro</option>
          {als.map((a) => (
            <option key={a} value={a}>
              Todas são do {a}
            </option>
          ))}
        </select>
        <span className="mt-0.5 block text-xs text-cinza">Use quando o ficheiro é de um só alojamento (ex.: exportação do Booking).</span>
      </label>
      <button className={botao} disabled={aImportar}>
        {aImportar ? "A importar…" : "Importar"}
      </button>
      {r && (
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
      )}
    </form>
  );
}
