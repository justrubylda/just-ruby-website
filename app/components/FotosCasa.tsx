"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { pesquisa, type Lingua } from "../i18n";

// Fotografias de uma casa num cartão: desliza-se com o dedo ou com as setas.

export default function FotosCasa({ fotos, l }: { fotos: { src: string; alt: string }[]; l: Lingua }) {
  const t = pesquisa[l];
  const lista = useRef<HTMLDivElement>(null);
  const [atual, setAtual] = useState(0);

  const ir = (i: number) => {
    const el = lista.current;
    if (!el) return;
    const n = (i + fotos.length) % fotos.length;
    el.scrollTo({ left: n * el.clientWidth, behavior: "smooth" });
  };

  const seta =
    "absolute top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-xisto shadow-md transition-opacity hover:bg-white focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-ouro md:opacity-0 md:group-hover:opacity-100";

  return (
    <div className="group relative overflow-hidden rounded-md bg-pedra">
      <div
        ref={lista}
        onScroll={(e) => setAtual(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {fotos.map((f, i) => (
          <div key={f.src} className="relative aspect-[4/3] w-full shrink-0 snap-start" aria-hidden={i !== atual}>
            <Image src={f.src} alt={f.alt} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
          </div>
        ))}
      </div>
      {fotos.length > 1 && (
        <>
          <button type="button" onClick={() => ir(atual - 1)} aria-label={t.anterior} className={`${seta} left-3`}>
            <span aria-hidden="true">‹</span>
          </button>
          <button type="button" onClick={() => ir(atual + 1)} aria-label={t.seguinte} className={`${seta} right-3`}>
            <span aria-hidden="true">›</span>
          </button>
          <p className="sr-only" aria-live="polite">
            {t.foto(atual + 1, fotos.length)}
          </p>
          <div aria-hidden="true" className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {fotos.map((f, i) => (
              <span key={f.src} className={`h-1.5 w-1.5 rounded-full ${i === atual ? "bg-white" : "bg-white/55"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
