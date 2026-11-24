"use client";

import Link from "next/link";
import { useActionState } from "react";
import { recuperar } from "../acoes";
import CodigoNovo from "../componentes/CodigoNovo";
import { botao, campo, rotulo } from "../componentes/ui";

export default function FormRecuperar() {
  const [estado, acao, aEnviar] = useActionState(recuperar, null);

  if (estado?.codigo)
    return (
      <div className="mt-5 space-y-4">
        <p className="text-sm font-semibold text-[#1f5f2b]">Palavra-passe nova gravada. Já está dentro da gestão.</p>
        <p className="text-sm">O código que usou deixou de servir. Este é o novo:</p>
        <CodigoNovo codigo={estado.codigo} />
        <Link href="/gestao" className={`${botao} w-full`}>
          Já guardei o código, continuar
        </Link>
      </div>
    );

  return (
    <form action={acao} className="mt-5 space-y-4">
      <div>
        <label htmlFor="codigo" className={rotulo}>
          Código de recuperação
        </label>
        <input
          id="codigo"
          name="codigo"
          type="text"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="XXXX-XXXX-XXXX-XXXX"
          required
          className={`${campo} font-mono`}
        />
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
