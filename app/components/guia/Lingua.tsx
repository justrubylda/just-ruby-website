"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { LINGUAS, type Lingua } from "../../guias";

const NOMES: Record<Lingua, string> = { pt: "Português", en: "English", es: "Español", fr: "Français" };
const CHAVE = "jr-lingua";

const Ctx = createContext<{ lingua: Lingua; mudar: (l: Lingua) => void }>({ lingua: "pt", mudar: () => {} });
export const useLingua = () => useContext(Ctx);

// Corre antes de a página aparecer, para não piscar na língua errada.
const ESCOLHER = `(function(){try{var L=${JSON.stringify(LINGUAS)};var q=(location.search.match(/[?&]lang=([a-z]{2})/)||[])[1];var s=null;try{s=localStorage.getItem("${CHAVE}")}catch(e){}var n=(navigator.language||"pt").slice(0,2).toLowerCase();var l=[q,s,n].filter(function(x){return x&&L.indexOf(x)>-1})[0]||"en";document.getElementById("guia").setAttribute("data-lingua",l);document.documentElement.lang=l==="pt"?"pt-PT":l}catch(e){}})();`;

function detetar(): Lingua {
  const el = typeof document !== "undefined" ? document.getElementById("guia") : null;
  const l = el?.getAttribute("data-lingua") as Lingua | null;
  return l && LINGUAS.includes(l) ? l : "pt";
}

export function LinguaProvider({ children }: { children: React.ReactNode }) {
  const [lingua, setLingua] = useState<Lingua>("pt");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a língua só se conhece no navegador
    setLingua(detetar());
  }, []);

  const mudar = (l: Lingua) => {
    setLingua(l);
    document.documentElement.lang = l === "pt" ? "pt-PT" : l;
    try {
      localStorage.setItem(CHAVE, l);
    } catch {}
  };

  return (
    <Ctx.Provider value={{ lingua, mudar }}>
      <div id="guia" data-lingua={lingua} suppressHydrationWarning className="flex min-h-full flex-1 flex-col">
        <script dangerouslySetInnerHTML={{ __html: ESCOLHER }} />
        {children}
      </div>
    </Ctx.Provider>
  );
}

export function SeletorLingua() {
  const { lingua, mudar } = useLingua();
  return (
    <div role="group" aria-label="Idioma / Language" className="flex flex-wrap gap-1.5">
      {LINGUAS.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          title={NOMES[l]}
          aria-pressed={lingua === l}
          onClick={() => mudar(l)}
          className={`rounded-sm px-2.5 py-1.5 text-sm font-semibold uppercase transition-colors ${
            lingua === l ? "bg-ouro text-preto" : "text-white/80 ring-1 ring-inset ring-white/25 hover:text-ouro-claro"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
