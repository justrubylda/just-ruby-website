"use client";

import { useState } from "react";
import { botaoSec } from "./ui";

/** Mostra o código de recuperação acabado de criar. Só aparece uma vez. */
export default function CodigoNovo({ codigo }: { codigo: string }) {
  const [copiado, setCopiado] = useState(false);
  async function copiar() {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
    } catch {
      /* sem acesso à área de transferência: o código continua visível para copiar à mão */
    }
  }
  return (
    <div role="status" className="rounded-lg border-2 border-ouro bg-[#fff8e6] p-4">
      <p className="text-sm font-semibold">O seu código de recuperação:</p>
      <p className="mt-2 select-all break-all font-mono text-2xl font-bold tracking-wider">{codigo}</p>
      <button type="button" onClick={copiar} className={`${botaoSec} mt-3`}>
        {copiado ? "Copiado" : "Copiar código"}
      </button>
      <p className="mt-3 text-sm">
        Guarde-o já no telemóvel (por exemplo nas notas). <b>Só aparece agora.</b> Se um dia se esquecer da palavra-passe,
        use-o em &laquo;Esqueci-me da palavra-passe&raquo;, na página de entrada.
      </p>
    </div>
  );
}
