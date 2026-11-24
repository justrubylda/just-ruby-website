"use client";

import { createContext, useContext, useState } from "react";
import type { Lingua } from "../i18n";
import type { Intervalo } from "../lib/disponibilidade";
import type { TabelaPrecos } from "../lib/orcamento";
import EscolherDatas from "./EscolherDatas";

// Na página de cada casa, o calendário grande (coluna principal) e o pedido
// (coluna do lado) partilham as mesmas datas, como no Airbnb.

type Datas = { chegada: string; partida: string; mudar: (chegada: string, partida: string) => void };

const Contexto = createContext<Datas | null>(null);

export function DatasPartilhadas({ children }: { children: React.ReactNode }) {
  const [datas, setDatas] = useState({ chegada: "", partida: "" });
  return (
    <Contexto.Provider value={{ ...datas, mudar: (chegada, partida) => setDatas({ chegada, partida }) }}>
      {children}
    </Contexto.Provider>
  );
}

export const useDatasPartilhadas = () => useContext(Contexto);

export function CalendarioDaCasa({ l, ocupado, precos }: { l: Lingua; ocupado: Intervalo[]; precos?: TabelaPrecos }) {
  const d = useDatasPartilhadas();
  if (!d) return null;
  return (
    <EscolherDatas
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
