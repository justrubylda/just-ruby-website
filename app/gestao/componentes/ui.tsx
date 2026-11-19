import type { Estado } from "../lib/calculos";

export const cartao = "rounded-lg border border-black/5 bg-white p-4 shadow-sm sm:p-5";
export const botao =
  "inline-flex items-center justify-center rounded-md bg-preto px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rocha disabled:opacity-50";
export const botaoSec =
  "inline-flex items-center justify-center rounded-md border border-black/15 bg-white px-4 py-2.5 text-sm font-semibold text-xisto transition-colors hover:border-black/40";
export const campo =
  "mt-1 block w-full rounded-md border border-black/15 bg-white px-3 py-2.5 text-base text-xisto [color-scheme:light] focus:border-ouro focus:outline-none";
export const rotulo = "block text-xs font-semibold uppercase tracking-wide text-cinza";

const CORES: Record<Estado, string> = {
  Faturado: "bg-[#e3f1e5] text-[#1f5f2b]",
  "Por faturar": "bg-[#fde8b8] text-[#7a4b00]",
  Futura: "bg-[#e3ecf7] text-[#1f4e79]",
  "Sem fatura": "bg-[#ecebe8] text-cinza",
  Cancelada: "bg-[#f6e0dd] text-[#8a2b1f] line-through",
};

export function Etiqueta({ estado }: { estado: Estado }) {
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${CORES[estado]}`}>{estado}</span>;
}

export function Titulo({ children, sub }: { children: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h1 className="font-display text-3xl">{children}</h1>
      {sub && <p className="mt-1 text-sm text-cinza">{sub}</p>}
    </div>
  );
}

export function SemBaseDados() {
  return (
    <div className={`${cartao} max-w-2xl`}>
      <h1 className="font-display text-2xl">Falta ligar a base de dados</h1>
      <p className="mt-3">
        As reservas ficam guardadas numa base de dados Neon, ligada pela Vercel (o código do site é público, por isso os
        dados nunca ficam no GitHub).
      </p>
      <ol className="mt-4 list-decimal space-y-2 pl-5">
        <li>Na Vercel, abra o projeto do site e escolha <b>Storage</b> → <b>Create Database</b> → <b>Neon</b>.</li>
        <li>Plano gratuito, região Europa (Frankfurt). Em “Connect to project”, marque Production e Preview.</li>
        <li>Volte a publicar (Redeploy). A variável DATABASE_URL é criada sozinha.</li>
      </ol>
    </div>
  );
}
