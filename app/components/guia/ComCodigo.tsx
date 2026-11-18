"use client";

import { useEffect, useState } from "react";

// O código do cofre chega no próprio link, depois do #  (ex.: /guia/kingdom-of-stone#1234).
// O que vem depois do # não sai do telemóvel do hóspede: não chega ao servidor
// nem fica guardado no site.
export function lerCodigo() {
  const m = /^#(\d{3,8})$/.exec(location.hash) || /[?&]codigo=(\d{3,8})/.exec(location.search);
  return m ? m[1] : "";
}

export function useCodigo() {
  const [codigo, setCodigo] = useState("");
  useEffect(() => {
    const atualizar = () => setCodigo(lerCodigo());
    atualizar();
    window.addEventListener("hashchange", atualizar);
    return () => window.removeEventListener("hashchange", atualizar);
  }, []);
  return codigo;
}

/**
 * Mostra as instruções de chegada e entrada (mapa, caminho, cofre) só a quem abrir
 * o link com o código. Sem código, mostra o aviso. Nota: é uma forma de as esconder
 * de quem tenha só o link simples, não um cofre digital.
 */
export default function ComCodigo({
  children,
  aviso = null,
}: {
  children: React.ReactNode;
  aviso?: React.ReactNode;
}) {
  const codigo = useCodigo();
  return <>{codigo ? children : aviso}</>;
}
