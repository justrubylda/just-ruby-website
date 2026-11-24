// Contas do preço de uma estadia (corre no servidor e no navegador do hóspede).

/** Preço e mínimo de noites de cada noite (AAAA-MM-DD), mais a limpeza. */
export type TabelaPrecos = { noites: Record<string, number>; minimo: Record<string, number>; limpeza: number };

export function somarDias(iso: string, n: number) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function noitesEntre(chegada: string, partida: string) {
  return Math.round((Date.parse(`${partida}T12:00:00Z`) - Date.parse(`${chegada}T12:00:00Z`)) / 86_400_000);
}

export type Orcamento = { noites: number; estadia: number; limpeza: number; total: number; porNoite: number };

/** Total da estadia [chegada, partida). Null se faltar o preço de alguma noite. */
export function orcamento(tabela: TabelaPrecos | undefined, chegada: string, partida: string): Orcamento | null {
  if (!tabela || !chegada || !partida || partida <= chegada) return null;
  const n = noitesEntre(chegada, partida);
  let estadia = 0;
  for (let i = 0; i < n; i++) {
    const p = tabela.noites[somarDias(chegada, i)];
    if (p == null) return null;
    estadia += p;
  }
  const limpeza = tabela.limpeza || 0;
  return { noites: n, estadia, limpeza, total: estadia + limpeza, porNoite: Math.round((estadia / n) * 100) / 100 };
}

/** Preço mais baixo por noite nos próximos meses ("desde"). */
export function precoDesde(tabela: TabelaPrecos | undefined) {
  if (!tabela) return null;
  const v = Object.values(tabela.noites);
  return v.length ? Math.min(...v) : null;
}

/** "120 €" ou, com cêntimos, "95,50 €". */
export const euros = (n: number, l: string) => {
  const cents = Math.abs(n - Math.round(n)) >= 0.005 ? 2 : 0;
  return new Intl.NumberFormat(l === "en" ? "en-GB" : l === "es" ? "es-ES" : l === "fr" ? "fr-FR" : "pt-PT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: cents,
    maximumFractionDigits: cents,
  }).format(n);
};

/** Preço a pôr no Airbnb/Booking para receber o mesmo que numa reserva direta. */
export const precoNaPlataforma = (preco: number, comissao: number) => Math.ceil(preco / (1 - comissao / 100));
