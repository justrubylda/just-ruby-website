import { temSessao } from "../lib/acesso";
import { calcular, descricaoFatura, hojeISO } from "../lib/calculos";
import { temBaseDados } from "../lib/db";
import { listarAlojamentos, listarReservas } from "../lib/reservas";
import { criarXlsx, type Coluna, type Valor } from "../lib/xlsx";

// Descarrega as reservas (com os mesmos filtros da página Reservas) em Excel (.xlsx)
// ou, com ?formato=csv, em CSV.
export async function GET(request: Request) {
  if (!(await temSessao())) return new Response("Sem sessão", { status: 401 });
  if (!temBaseDados()) return new Response("Sem base de dados", { status: 503 });
  const u = new URL(request.url);
  const p = (k: string, d: string) => u.searchParams.get(k) || d;
  const ano = p("ano", "Todos");
  const al = p("al", "Todos");
  const estado = p("estado", "Todos");
  const plataforma = p("plataforma", "Todas");
  const q = (u.searchParams.get("q") ?? "").trim().toLowerCase();
  const formato = p("formato", "xlsx");
  const hoje = hojeISO();
  const [todas, als] = await Promise.all([listarReservas(), listarAlojamentos()]);

  const colunas: Coluna[] = [
    { titulo: "Check-in", tipo: "data", largura: 11 },
    { titulo: "Check-out", tipo: "data", largura: 11 },
    { titulo: "Noites", tipo: "numero", largura: 8, somar: true },
    { titulo: "AL", tipo: "texto", largura: 17 },
    { titulo: "Plataforma", tipo: "texto", largura: 11 },
    { titulo: "Hóspede / Cliente", tipo: "texto", largura: 34 },
    { titulo: "NIF", tipo: "texto", largura: 11 },
    { titulo: "Morada / Contacto", tipo: "texto", largura: 30 },
    { titulo: "Cód. reserva", tipo: "texto", largura: 14 },
    { titulo: "Total c/ IVA", tipo: "euro", largura: 13, somar: true },
    { titulo: "Comissão", tipo: "euro", largura: 11, somar: true },
    { titulo: "Recebido", tipo: "euro", largura: 12, somar: true },
    { titulo: "Limpeza", tipo: "euro", largura: 10, somar: true },
    { titulo: "Taxa IVA", tipo: "percentagem", largura: 9 },
    { titulo: "Base s/ IVA", tipo: "euro", largura: 12, somar: true },
    { titulo: "IVA", tipo: "euro", largura: 10, somar: true },
    { titulo: "Líquido", tipo: "euro", largura: 12, somar: true },
    { titulo: "Nº Fatura", tipo: "texto", largura: 16 },
    { titulo: "Nº Recibo", tipo: "texto", largura: 12 },
    { titulo: "Estado", tipo: "texto", largura: 12 },
    { titulo: "Descrição p/ fatura", tipo: "texto", largura: 60 },
    { titulo: "Notas", tipo: "texto", largura: 40 },
  ];

  const linhas: Valor[][] = [];
  for (const r of todas) {
    const c = calcular(r, hoje);
    if (ano !== "Todos" && r.checkin?.slice(0, 4) !== ano) continue;
    if (al !== "Todos" && r.al !== al) continue;
    if (estado !== "Todos" && c.estado !== estado) continue;
    if (plataforma !== "Todas" && r.plataforma !== plataforma) continue;
    if (q && ![r.hospede, r.nif, r.fatura, r.cod_reserva, r.notas, r.morada].join(" ").toLowerCase().includes(q)) continue;
    const temValor = r.total != null || r.recebido != null;
    linhas.push([
      r.checkin, r.checkout, c.noites, r.al, r.plataforma, r.hospede, r.nif, r.morada, r.cod_reserva,
      r.total, r.comissao, temValor ? c.recebido : null, r.limpeza, r.taxa_iva, r.total == null ? null : c.base,
      r.total == null ? null : c.iva, temValor ? c.liquido : null, r.fatura, r.recibo, c.estado, descricaoFatura(r, als), r.notas,
    ]);
  }

  const nome = `reservas-${ano === "Todos" ? "todas" : ano}${al !== "Todos" ? `-${al.replace(/\s+/g, "-")}` : ""}`;
  const cabecalhos = (tipo: string, ext: string) => ({
    "Content-Type": tipo,
    "Content-Disposition": `attachment; filename="${nome}.${ext}"`,
    "Cache-Control": "private, no-store",
  });

  if (formato === "csv") {
    const q2 = (s: Valor) => {
      const t = s == null ? "" : typeof s === "number" ? String(s).replace(".", ",") : s;
      return /[;"\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
    };
    const csv = [colunas.map((c) => c.titulo).join(";"), ...linhas.map((l) => l.map(q2).join(";"))].join("\r\n");
    return new Response("﻿" + csv, { headers: cabecalhos("text/csv; charset=utf-8", "csv") });
  }

  const buf = criarXlsx("Reservas", colunas, linhas);
  return new Response(new Uint8Array(buf), {
    headers: cabecalhos("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx"),
  });
}
