import { temSessao } from "../lib/acesso";
import { calcular, descricaoFatura, hojeISO } from "../lib/calculos";
import { temBaseDados } from "../lib/db";
import { listarAlojamentos, listarReservas } from "../lib/reservas";

// Exporta as reservas filtradas em CSV (abre no Excel), por exemplo para o contabilista.
export async function GET(request: Request) {
  if (!(await temSessao())) return new Response("Sem sessão", { status: 401 });
  if (!temBaseDados()) return new Response("Sem base de dados", { status: 503 });
  const u = new URL(request.url);
  const ano = u.searchParams.get("ano") ?? "Todos";
  const al = u.searchParams.get("al") ?? "Todos";
  const hoje = hojeISO();
  const [todas, als] = await Promise.all([listarReservas(), listarAlojamentos()]);
  const n = (x: number | null) => (x == null ? "" : x.toFixed(2).replace(".", ","));
  const q = (s: unknown) => {
    const t = s == null ? "" : String(s);
    return /[;"\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
  };
  const cab = [
    "Check-in", "Check-out", "Noites", "AL", "Plataforma", "Hóspede / Cliente", "NIF", "Morada / Contacto", "Cód. reserva",
    "Total c/ IVA", "Comissão", "Recebido", "Limpeza", "Taxa IVA", "Base s/ IVA", "IVA", "Líquido", "Nº Fatura", "Nº Recibo",
    "Estado", "Descrição p/ fatura", "Notas",
  ];
  const linhas = [cab.join(";")];
  for (const r of todas) {
    if (ano !== "Todos" && r.checkin?.slice(0, 4) !== ano) continue;
    if (al !== "Todos" && r.al !== al) continue;
    const c = calcular(r, hoje);
    linhas.push(
      [
        r.checkin, r.checkout, c.noites, r.al, r.plataforma, r.hospede, r.nif, r.morada, r.cod_reserva,
        n(r.total), n(r.comissao), n(c.recebido), n(r.limpeza), `${Math.round(r.taxa_iva * 100)}%`, n(c.base), n(c.iva),
        n(c.liquido), r.fatura, r.recibo, c.estado, descricaoFatura(r, als), r.notas,
      ]
        .map(q)
        .join(";")
    );
  }
  return new Response("﻿" + linhas.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="reservas-${ano}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
