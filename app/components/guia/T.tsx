import type { L } from "../../guias";

// Texto nas 4 línguas; o CSS mostra só a língua escolhida (ver globals.css).
export default function T({ t }: { t: L }) {
  return (
    <>
      <span lang="pt-PT" className="tl tl-pt">{t.pt}</span>
      <span lang="en" className="tl tl-en">{t.en}</span>
      <span lang="es" className="tl tl-es">{t.es}</span>
      <span lang="fr" className="tl tl-fr">{t.fr}</span>
    </>
  );
}

/** Atalho para escrever as 4 línguas por ordem: pt, en, es, fr. */
export const l = (pt: string, en: string, es: string, fr: string): L => ({ pt, en, es, fr });
