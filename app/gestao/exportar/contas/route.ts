import { temSessao } from "../../lib/acesso";
import { dedutivel } from "../../lib/contas-comum";
import { listarDespesas, listarMovimentos } from "../../lib/contas";
import { temBaseDados } from "../../lib/db";
import { listarReservas } from "../../lib/reservas";
import { criarXlsx, type Coluna, type Valor } from "../../lib/xlsx";

// Descarrega as despesas (?tipo=despesas) ou os movimentos do banco (?tipo=banco) em Excel,
// com os mesmos filtros das páginas. Para enviar ao contabilista.
export async function GET(request: Request) {
  if (!(await temSessao())) return new Response("Sem sessão", { status: 401 });
  if (!temBaseDados()) return new Response("Sem base de dados", { status: 503 });
  const u = new URL(request.url);
  const p = (k: string, d: string) => u.searchParams.get(k) || d;
  const tipo = p("tipo", "despesas");
  const ano = p("ano", "Todos");
  const mes = p("mes", "Todos");
  const noPeriodo = (data: string | null) =>
    Boolean(data) && (ano === "Todos" || data!.startsWith(ano)) && (mes === "Todos" || Number(data!.slice(5, 7)) === Number(mes));
  let colunas: Coluna[];
  const linhas: Valor[][] = [];
  let nome: string;

  if (tipo === "banco") {
    const [movs, desp, reservas] = await Promise.all([listarMovimentos(), listarDespesas(), listarReservas()]);
    const docs = new Map<number, string[]>();
    for (const d of desp) {
      if (d.movimento_id) docs.set(d.movimento_id, [...(docs.get(d.movimento_id) ?? []), `${d.fornecedor ?? ""} ${d.documento ?? ""}`.trim()]);
      if (d.reposicao_id) docs.set(d.reposicao_id, [...(docs.get(d.reposicao_id) ?? []), `repõe ${d.fornecedor ?? ""} ${d.documento ?? ""}`.trim()]);
    }
    const res = new Map(reservas.map((r) => [r.id, r]));
    colunas = [
      { titulo: "Data", tipo: "data", largura: 11 },
      { titulo: "Data valor", tipo: "data", largura: 11 },
      { titulo: "Descrição", tipo: "texto", largura: 46 },
      { titulo: "Montante", tipo: "euro", largura: 12, somar: true },
      { titulo: "Saldo", tipo: "euro", largura: 12 },
      { titulo: "Tipo", tipo: "texto", largura: 20 },
      { titulo: "Categoria", tipo: "texto", largura: 24 },
      { titulo: "Casa", tipo: "texto", largura: 17 },
      { titulo: "Fatura de despesa", tipo: "texto", largura: 36 },
      { titulo: "Reserva", tipo: "texto", largura: 30 },
      { titulo: "Fatura da reserva", tipo: "texto", largura: 16 },
      { titulo: "Notas", tipo: "texto", largura: 40 },
    ];
    for (const m of movs) {
      if (!noPeriodo(m.data)) continue;
      const r = m.reserva_id ? res.get(m.reserva_id) : null;
      linhas.push([
        m.data, m.data_valor, m.descricao, m.montante, m.saldo, m.classe, m.categoria, m.casa,
        docs.get(m.id)?.join("; ") ?? null, r ? `${r.hospede ?? ""} (${r.checkin ?? ""})` : null, r?.fatura ?? null, m.notas,
      ]);
    }
    nome = `banco-${ano === "Todos" ? "todos" : ano}${mes !== "Todos" ? `-${mes.padStart(2, "0")}` : ""}`;
  } else {
    const casa = p("casa", "Todas");
    const categoria = p("categoria", "Todas");
    const estado = p("estado", "Todos");
    const q = (u.searchParams.get("q") ?? "").trim().toLowerCase();
    const [desp, movs] = await Promise.all([listarDespesas(), listarMovimentos()]);
    const mov = new Map(movs.map((m) => [m.id, m]));
    colunas = [
      { titulo: "Data", tipo: "data", largura: 11 },
      { titulo: "Fornecedor", tipo: "texto", largura: 32 },
      { titulo: "NIF fornecedor", tipo: "texto", largura: 13 },
      { titulo: "Nº documento", tipo: "texto", largura: 20 },
      { titulo: "NIF na fatura", tipo: "texto", largura: 12 },
      { titulo: "Casa", tipo: "texto", largura: 17 },
      { titulo: "Categoria", tipo: "texto", largura: 24 },
      { titulo: "Base s/ IVA", tipo: "euro", largura: 12, somar: true },
      { titulo: "IVA", tipo: "euro", largura: 10, somar: true },
      { titulo: "IVA dedutível", tipo: "euro", largura: 12, somar: true },
      { titulo: "Total", tipo: "euro", largura: 12, somar: true },
      { titulo: "Pago por", tipo: "texto", largura: 10 },
      { titulo: "Estado", tipo: "texto", largura: 16 },
      { titulo: "Pagamento no banco", tipo: "data", largura: 13 },
      { titulo: "Reposto em", tipo: "data", largura: 11 },
      { titulo: "Ficheiro", tipo: "texto", largura: 36 },
      { titulo: "Notas", tipo: "texto", largura: 40 },
    ];
    for (const d of desp) {
      if (!noPeriodo(d.data)) continue;
      if (casa !== "Todas" && (casa === "Sem casa" ? d.casa : d.casa !== casa)) continue;
      if (categoria !== "Todas" && (categoria === "Sem categoria" ? d.categoria : d.categoria !== categoria)) continue;
      if (estado !== "Todos" && d.estado !== estado) continue;
      if (q && ![d.fornecedor, d.documento, d.nif_fornecedor, d.notas, d.ficheiro].join(" ").toLowerCase().includes(q)) continue;
      linhas.push([
        d.data, d.fornecedor, d.nif_fornecedor, d.documento, d.nif_cliente, d.casa, d.categoria,
        d.base ?? (d.iva != null ? d.total - d.iva : null), d.iva, dedutivel(d) || null, d.total, d.pago_por, d.estado,
        d.movimento_id ? mov.get(d.movimento_id)?.data ?? null : null, d.reposicao_id ? mov.get(d.reposicao_id)?.data ?? null : null,
        d.ficheiro, d.notas,
      ]);
    }
    nome = `despesas-${ano === "Todos" ? "todas" : ano}${mes !== "Todos" ? `-${mes.padStart(2, "0")}` : ""}`;
  }

  const buf = criarXlsx(tipo === "banco" ? "Banco" : "Despesas", colunas, linhas);
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${nome}.xlsx"`,
      "Cache-Control": "private, no-store",
    },
  });
}
