"use client";

import { useActionState } from "react";
import { criarCodigo, mudarPalavraPasse } from "../acoes";
import CodigoNovo from "../componentes/CodigoNovo";
import { botao, campo, rotulo } from "../componentes/ui";

function Erro({ texto }: { texto?: string }) {
  if (!texto) return null;
  return (
    <p role="alert" className="text-sm font-semibold text-[#8a2b1f]">
      {texto}
    </p>
  );
}

export function FormMudar() {
  const [estado, acao, aEnviar] = useActionState(mudarPalavraPasse, null);
  return (
    <form action={acao} className="space-y-4">
      <div>
        <label htmlFor="atual-m" className={rotulo}>
          Palavra-passe atual
        </label>
        <input id="atual-m" name="atual" type="password" autoComplete="current-password" required className={campo} />
      </div>
      <div>
        <label htmlFor="nova" className={rotulo}>
          Palavra-passe nova
        </label>
        <input id="nova" name="nova" type="password" autoComplete="new-password" minLength={8} required className={campo} />
        <p className="mt-1 text-xs text-cinza">Pelo menos 8 caracteres.</p>
      </div>
      <div>
        <label htmlFor="repetir" className={rotulo}>
          Repetir a palavra-passe nova
        </label>
        <input id="repetir" name="repetir" type="password" autoComplete="new-password" minLength={8} required className={campo} />
      </div>
      <Erro texto={estado?.erro} />
      {estado?.ok && (
        <p role="status" className="text-sm font-semibold text-[#1f5f2b]">
          {estado.ok}
        </p>
      )}
      <button className={botao} disabled={aEnviar}>
        {aEnviar ? "A gravar…" : "Mudar palavra-passe"}
      </button>
    </form>
  );
}

export function FormCodigo({ temCodigo }: { temCodigo: boolean }) {
  const [estado, acao, aEnviar] = useActionState(criarCodigo, null);
  if (estado?.codigo) return <CodigoNovo codigo={estado.codigo} />;
  return (
    <form action={acao} className="space-y-4">
      <div>
        <label htmlFor="atual-c" className={rotulo}>
          Palavra-passe atual
        </label>
        <input id="atual-c" name="atual" type="password" autoComplete="current-password" required className={campo} />
      </div>
      <Erro texto={estado?.erro} />
      <button className={botao} disabled={aEnviar}>
        {aEnviar ? "A criar…" : temCodigo ? "Criar código novo" : "Criar código de recuperação"}
      </button>
    </form>
  );
}
