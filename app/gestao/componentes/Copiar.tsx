"use client";

import { useState } from "react";

export default function Copiar({ texto, rotulo = "Copiar" }: { texto: string; rotulo?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      disabled={!texto}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(texto);
          setOk(true);
          setTimeout(() => setOk(false), 1500);
        } catch {
          /* sem permissão para a área de transferência */
        }
      }}
      className="shrink-0 rounded-md border border-black/15 bg-white px-3 py-1.5 text-xs font-semibold hover:border-black/40 disabled:opacity-40"
    >
      {ok ? "Copiado ✓" : rotulo}
    </button>
  );
}
