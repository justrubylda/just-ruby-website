"use client";

import { useEffect, useState } from "react";
import Copiar from "./Copiar";
import { useLingua } from "./Lingua";

// O código chega no próprio link, depois do #  (ex.: /guia/kingdom-of-stone#1234).
// O que vem depois do # não sai do telemóvel do hóspede: não chega ao servidor
// nem fica no código do site.
function lerCodigo() {
  const m = /^#(\d{3,8})$/.exec(location.hash) || /[?&]codigo=(\d{3,8})/.exec(location.search);
  return m ? m[1] : "";
}

const TXT = {
  titulo: { pt: "Código do cofre", en: "Key safe code", es: "Código de la caja", fr: "Code de la boîte à clés" },
  falta: {
    pt: "Enviado por mensagem antes da chegada.",
    en: "Sent to you by message before arrival.",
    es: "Se envía por mensaje antes de la llegada.",
    fr: "Envoyé par message avant votre arrivée.",
  },
};

export default function CodigoCofre() {
  const { lingua } = useLingua();
  const [codigo, setCodigo] = useState("");

  useEffect(() => {
    const atualizar = () => setCodigo(lerCodigo());
    atualizar();
    window.addEventListener("hashchange", atualizar);
    return () => window.removeEventListener("hashchange", atualizar);
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border border-dashed border-ouro bg-preto px-5 py-5 text-white">
      <div>
        <p className="text-sm text-nevoa">{TXT.titulo[lingua]}</p>
        {codigo ? (
          <p className="font-display text-5xl leading-tight tracking-[0.2em] text-ouro-claro tabular-nums">{codigo}</p>
        ) : (
          <p className="mt-1 text-lg">{TXT.falta[lingua]}</p>
        )}
      </div>
      {codigo && <Copiar valor={codigo} escuro />}
    </div>
  );
}
