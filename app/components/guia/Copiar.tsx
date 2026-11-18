"use client";

import { useState } from "react";
import { useLingua } from "./Lingua";

const TXT = {
  copiar: { pt: "Copiar", en: "Copy", es: "Copiar", fr: "Copier" },
  copiado: { pt: "Copiado", en: "Copied", es: "Copiado", fr: "Copié" },
  manual: { pt: "Copie à mão", en: "Copy by hand", es: "Copie a mano", fr: "Copiez à la main" },
};

export default function Copiar({ valor, escuro = false }: { valor: string; escuro?: boolean }) {
  const { lingua } = useLingua();
  const [estado, setEstado] = useState<"copiar" | "copiado" | "manual">("copiar");

  async function copiar() {
    try {
      await navigator.clipboard.writeText(valor);
      setEstado("copiado");
    } catch {
      setEstado("manual");
    }
    setTimeout(() => setEstado("copiar"), 1800);
  }

  return (
    <button
      type="button"
      onClick={copiar}
      aria-live="polite"
      className={`rounded-sm px-3.5 py-2 text-sm font-semibold ring-1 ring-inset transition-colors ${
        escuro
          ? "text-ouro-claro ring-ouro/60 hover:bg-ouro hover:text-preto"
          : "text-ouro-escuro ring-ouro-escuro/50 hover:bg-ouro hover:text-preto"
      }`}
    >
      {TXT[estado][lingua]}
    </button>
  );
}
