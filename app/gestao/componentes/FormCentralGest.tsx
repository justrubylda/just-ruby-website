"use client";

import { useActionState } from "react";
import { conferirCentralGest, type ResultadoCG } from "../acoes";
import { botao, campo, rotulo } from "./ui";

export default function FormCentralGest() {
  const [r, acao, aConferir] = useActionState<ResultadoCG | null, FormData>(conferirCentralGest, null);
  return (
    <form action={acao} className="space-y-3">
      <label className="block">
        <span className={rotulo}>Lista de Vendas do CentralGest</span>
        <textarea
          name="vendas"
          required
          rows={4}
          placeholder="No CentralGest: Clientes → Vendas → 50 por página → selecionar a lista (Ctrl+A) → copiar e colar aqui."
          className={`${campo} font-mono text-xs`}
        />
      </label>
      <button className={botao} disabled={aConferir}>
        {aConferir ? "A conferir…" : "Conferir"}
      </button>
      {r && (
        <p className={`rounded-md p-3 text-sm ${r.ok ? "bg-[#e3f1e5] text-[#1f5f2b]" : "bg-[#fde8b8] text-[#7a4b00]"}`}>{r.texto}</p>
      )}
    </form>
  );
}
