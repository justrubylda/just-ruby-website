"use client";

import { useCodigo } from "./ComCodigo";
import Copiar from "./Copiar";
import { useLingua } from "./Lingua";

const TITULO = { pt: "Código do cofre", en: "Key safe code", es: "Código de la caja", fr: "Code de la boîte à clés" };

// Só é mostrado dentro de <ComCodigo>, ou seja, quando o link traz o código.
export default function CodigoCofre() {
  const { lingua } = useLingua();
  const codigo = useCodigo();
  if (!codigo) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border border-dashed border-ouro bg-preto px-5 py-5 text-white">
      <div>
        <p className="text-sm text-nevoa">{TITULO[lingua]}</p>
        <p className="font-display text-5xl leading-tight tracking-[0.2em] text-ouro-claro tabular-nums">{codigo}</p>
      </div>
      <Copiar valor={codigo} escuro />
    </div>
  );
}
