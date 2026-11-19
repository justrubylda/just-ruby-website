"use client";

import { useActionState } from "react";
import { entrar } from "../acoes";
import { botao, campo, rotulo } from "../componentes/ui";

export default function FormEntrar() {
  const [erro, acao, aEnviar] = useActionState(entrar, null);
  return (
    <form action={acao} className="mt-5 space-y-4">
      <div>
        <label htmlFor="palavra" className={rotulo}>
          Palavra-passe
        </label>
        <input id="palavra" name="palavra" type="password" autoComplete="current-password" required className={campo} />
      </div>
      {erro && (
        <p role="alert" className="text-sm font-semibold text-[#8a2b1f]">
          {erro}
        </p>
      )}
      <button className={`${botao} w-full`} disabled={aEnviar}>
        {aEnviar ? "A entrar…" : "Entrar"}
      </button>
    </form>
  );
}
