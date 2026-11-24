"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { Lingua } from "../i18n";
import type { Intervalo } from "../lib/disponibilidade";
import type { TabelaPrecos } from "../lib/orcamento";
import EscolherDatas from "./EscolherDatas";

// Na página de cada casa, o calendário grande (coluna principal) e o pedido
// (coluna do lado) partilham as mesmas datas, como no Airbnb. Quem vem da barra da
// página inicial traz as datas e as pessoas no endereço (?chegada=…&partida=…&pessoas=…).

type Datas = {
  chegada: string;
  partida: string;
  pessoas: number | null;
  mudar: (chegada: string, partida: string) => void;
  mudarPessoas: (n: number) => void;
};

const Contexto = createContext<Datas | null>(null);

export function DatasPartilhadas({ children }: { children: React.ReactNode }) {
  const [datas, setDatas] = useState({ chegada: "", partida: "" });
  const [pessoas, setPessoas] = useState<number | null>(null);
  return (
    <Contexto.Provider
      value={{
        ...datas,
        pessoas,
        mudar: (chegada, partida) => setDatas({ chegada, partida }),
        mudarPessoas: setPessoas,
      }}
    >
      {children}
    </Contexto.Provider>
  );
}

export const useDatasPartilhadas = () => useContext(Contexto);

const DATA = /^\d{4}-\d{2}-\d{2}$/;

function hojeLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function CalendarioDaCasa({ l, ocupado, precos }: { l: Lingua; ocupado: Intervalo[]; precos?: TabelaPrecos }) {
  const d = useDatasPartilhadas();
  const lido = useRef(false);
  const [versao, setVersao] = useState(0);

  // Datas vindas da página inicial: só se aceitam se estiverem livres.
  useEffect(() => {
    if (lido.current || !d) return;
    lido.current = true;
    const q = new URLSearchParams(window.location.search);
    const n = Number(q.get("pessoas"));
    const c = q.get("chegada") ?? "";
    const p = q.get("partida") ?? "";
    const livres = !ocupado.some((i) => c < i.fim && p > i.inicio);
    queueMicrotask(() => {
      if (Number.isInteger(n) && n >= 1 && n <= 30) d.mudarPessoas(n);
      if (DATA.test(c) && DATA.test(p) && p > c && c >= hojeLocal() && livres) {
        d.mudar(c, p);
        setVersao(1); // volta a abrir o calendário no mês da chegada
      }
    });
  }, [d, ocupado]);

  if (!d) return null;
  return (
    <EscolherDatas
      key={versao}
      l={l}
      escuro={false}
      ocupado={ocupado}
      precos={precos}
      chegada={d.chegada}
      partida={d.partida}
      onChange={d.mudar}
      semResumo
    />
  );
}
