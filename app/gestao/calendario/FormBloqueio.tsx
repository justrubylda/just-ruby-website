"use client";

import { useActionState } from "react";
import { criarBloqueioAcao } from "../acoes";
import { botao, campo, rotulo } from "../componentes/ui";

export default function FormBloqueio({ casas, hoje }: { casas: string[]; hoje: string }) {
  const [erro, acao, aEnviar] = useActionState(criarBloqueioAcao, null);
  return (
    <form action={acao} className="grid gap-4 sm:grid-cols-2">
      <label className="block">
        <span className={rotulo}>Casa</span>
        <select name="al" required defaultValue="" className={campo}>
          <option value="" disabled>
            Escolher…
          </option>
          {casas.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className={rotulo}>Motivo (só para si)</span>
        <input name="motivo" placeholder="Contrato, uso próprio, obras…" className={campo} />
      </label>
      <label className="block">
        <span className={rotulo}>Primeira noite bloqueada</span>
        <input name="inicio" type="date" min={hoje} required className={campo} />
      </label>
      <label className="block">
        <span className={rotulo}>Fica livre a partir de</span>
        <input name="fim" type="date" min={hoje} required className={campo} />
        <span className="mt-1 block text-xs text-cinza">Como um check-out: neste dia já pode entrar outro hóspede.</span>
      </label>
      {erro && (
        <p role="alert" className="text-sm font-semibold text-[#8a2b1f] sm:col-span-2">
          {erro}
        </p>
      )}
      <div className="sm:col-span-2">
        <button className={botao} disabled={aEnviar}>
          {aEnviar ? "A bloquear…" : "Bloquear datas"}
        </button>
      </div>
    </form>
  );
}
