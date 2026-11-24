"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { pesquisa, type Lingua } from "../i18n";

// Fotografias grandes da abertura da página inicial, a passar devagar de uma casa
// para a outra. Para quem pede menos movimento, fica só a primeira.

export type FotoRotativa = { src: string; alt: string; legenda: string };

const INTERVALO = 6500;

export default function FotosRotativas({ fotos, l }: { fotos: FotoRotativa[]; l: Lingua }) {
  const t = pesquisa[l];
  const [atual, setAtual] = useState(0);
  const [parado, setParado] = useState(false);

  useEffect(() => {
    if (parado || fotos.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const relogio = setInterval(() => setAtual((i) => (i + 1) % fotos.length), INTERVALO);
    return () => clearInterval(relogio);
  }, [parado, fotos.length]);

  return (
    <>
      <div className="absolute inset-0 overflow-hidden bg-preto">
        {fotos.map((f, i) => (
          <Image
            key={f.src}
            src={f.src}
            alt={i === atual ? f.alt : ""}
            aria-hidden={i !== atual}
            fill
            priority={i === 0}
            sizes="100vw"
            className={`object-cover transition-opacity duration-[1600ms] ease-out motion-reduce:transition-none ${
              i === atual ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>
      <div className="absolute right-4 top-4 z-10 flex items-center gap-3 text-sm text-white md:right-8 md:top-6">
        <span className="hidden rounded-sm bg-preto/45 px-2.5 py-1 backdrop-blur-sm sm:inline">{fotos[atual]?.legenda}</span>
        {fotos.length > 1 && (
          <button
            type="button"
            onClick={() => setParado((p) => !p)}
            aria-label={parado ? t.continuar : t.pausar}
            className="grid h-8 w-8 place-items-center rounded-full bg-preto/45 backdrop-blur-sm transition-colors hover:bg-preto/70 focus-visible:outline-2 focus-visible:outline-ouro"
          >
            <span aria-hidden="true" className="text-xs">
              {parado ? "▶" : "❚❚"}
            </span>
          </button>
        )}
      </div>
    </>
  );
}
