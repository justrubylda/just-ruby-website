import "server-only";
import { dataPT, diasEntre, eur } from "../lib/calculos";
import type { Despesa, Movimento } from "../lib/contas-comum";

/** Saídas do banco que podem ser o pagamento desta despesa (as mais parecidas primeiro). */
export function opcoesPagamento(d: Partial<Despesa>, movs: Movimento[], ocupados: Set<number>) {
  const saidas = movs.filter((m) => m.montante < 0 && (m.id === d.movimento_id || !ocupados.has(m.id)));
  const ordenadas = d.data
    ? saidas
        .filter((m) => m.id === d.movimento_id || Math.abs(diasEntre(d.data!, m.data)) <= 120)
        .sort((a, b) => {
          const t = d.total ?? 0;
          return Math.abs(-a.montante - t) - Math.abs(-b.montante - t) || Math.abs(diasEntre(d.data!, a.data)) - Math.abs(diasEntre(d.data!, b.data));
        })
    : [...saidas].reverse();
  return ordenadas.slice(0, 40).map((m) => ({ id: m.id, texto: `${dataPT(m.data)} · ${eur(-m.montante)} · ${m.descricao}` }));
}
