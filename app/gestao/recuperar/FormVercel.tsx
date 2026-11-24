"use client";

import { useActionState } from "react";
import { reporComVercel } from "../acoes";
import { botao, campo, rotulo } from "../componentes/ui";

/** Reserva: repor com a palavra-passe que está na Vercel (GESTAO_PALAVRA_PASSE). */
export default function FormVercel() {
  const [estado, acao, aEnviar] = useActionState(reporComVercel, null);
  return (
    <form action={acao} className="mt-4 space-y-4">
      <div>
        <label htmlFor="vercel" className={rotulo}>
          Palavra-passe da Vercel
        </label>
        <input id="vercel" name="vercel" type="password" autoComplete="off" required className={campo} />
      </div>
      <div>
        <label htmlFor="nova-v" className={rotulo}>
          Palavra-passe nova
        </label>
        <input id="nova-v" name="nova" type="password" autoComplete="new-password" minLength={8} required className={campo} />
        <p className="mt-1 text-xs text-cinza">Pelo menos 8 caracteres.</p>
      </div>
      <div>
        <label htmlFor="repetir-v" className={rotulo}>
          Repetir a palavra-passe nova
        </label>
        <input id="repetir-v" name="repetir" type="password" autoComplete="new-password" minLength={8} required className={campo} />
      </div>
      {estado?.erro && (
        <p role="alert" className="text-sm font-semibold text-[#8a2b1f]">
          {estado.erro}
        </p>
      )}
      <button className={`${botao} w-full`} disabled={aEnviar}>
        {aEnviar ? "A gravar…" : "Gravar palavra-passe nova"}
      </button>
    </form>
  );
}
