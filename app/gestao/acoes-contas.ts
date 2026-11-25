"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirSessao } from "./lib/acesso";
import { sql } from "./lib/db";
import { lerFicheiro } from "./lib/ficheiros";
import { numero } from "./lib/importar";
import { listarAlojamentos } from "./lib/reservas";
import {
  apagarDespesa,
  apagarRegra,
  atualizarDespesa,
  atualizarMovimento,
  classificar,
  conciliarContas,
  criarDespesa,
  criarRegra,
  folhaDeTexto,
  importarContas,
  type RelatorioContas,
} from "./lib/contas";
import { CLASSES, ESTADOS_DESPESA, NIF_EMPRESA, sugerirTextoRegra, type Classe, type EstadoDespesa } from "./lib/contas-comum";

const txt = (f: FormData, k: string) => {
  const v = String(f.get(k) ?? "").trim();
  return v || null;
};
const num = (f: FormData, k: string) => numero(f.get(k));
const atualizar = () => revalidatePath("/gestao", "layout");

// ---------- importar (extrato, faturas, folha de acerto, linhas coladas) ----------

export async function importarContasAcao(_: RelatorioContas | null, f: FormData): Promise<RelatorioContas> {
  await exigirSessao();
  const casas = (await listarAlojamentos()).map((a) => a.nome);
  try {
    const ficheiro = f.get("ficheiro");
    const colado = String(f.get("colado") ?? "").trim();
    let r: RelatorioContas;
    if (ficheiro instanceof File && ficheiro.size > 0) {
      r = await importarContas(lerFicheiro(Buffer.from(await ficheiro.arrayBuffer())), casas, ficheiro.name);
    } else if (colado) {
      r = await importarContas([folhaDeTexto(colado)], casas, "colado");
    } else return { ok: false, titulo: "Escolha um ficheiro ou cole as linhas.", linhas: [] };
    atualizar();
    return r;
  } catch (e) {
    return { ok: false, titulo: (e as Error).message, linhas: [] };
  }
}

export async function conferirContasAcao(): Promise<RelatorioContas> {
  await exigirSessao();
  const n = await classificar();
  const c = await conciliarContas();
  atualizar();
  return { ok: true, titulo: "Conferência feita.", linhas: [`${n} movimento(s) classificados pelas regras.`, ...c.linhas] };
}

// ---------- despesas ----------

export async function guardarDespesaAcao(_: string | null, f: FormData): Promise<string | null> {
  await exigirSessao();
  const total = num(f, "total");
  if (total == null || total === 0) return "Indique o total da fatura (negativo numa nota de crédito).";
  const fornecedor = txt(f, "fornecedor");
  if (!fornecedor) return "Indique o fornecedor.";
  const iva = num(f, "iva");
  const estado = (ESTADOS_DESPESA as readonly string[]).includes(String(f.get("estado"))) ? (String(f.get("estado")) as EstadoDespesa) : "Pendente";
  const pago_por = txt(f, "pago_por") ?? "Empresa";
  const movimento = num(f, "movimento_id");
  const dados = {
    data: txt(f, "data"),
    fornecedor,
    nif_fornecedor: txt(f, "nif_fornecedor")?.replace(/\D/g, "") || null,
    documento: txt(f, "documento"),
    nif_cliente: txt(f, "nif_cliente")?.replace(/\D/g, "") || null,
    casa: txt(f, "casa"),
    categoria: txt(f, "categoria"),
    total,
    iva,
    iva_dedutivel: num(f, "iva_dedutivel"),
    base: iva != null ? Math.round((total - iva) * 100) / 100 : null,
    pago_por,
    estado: pago_por !== "Empresa" && estado === "Pago pela empresa" ? ("Por repor" as EstadoDespesa) : estado,
    movimento_id: movimento ? Math.round(movimento) : null,
    ficheiro: txt(f, "ficheiro"),
    notas: txt(f, "notas"),
  };
  const id = num(f, "id");
  if (id) await atualizarDespesa(id, dados);
  else await criarDespesa({ ...dados, origem: "manual" });
  atualizar();
  redirect(`/gestao/despesas?ano=${(dados.data ?? "").slice(0, 4) || "Todos"}`);
}

export async function apagarDespesaAcao(f: FormData) {
  await exigirSessao();
  const id = num(f, "id");
  if (id) await apagarDespesa(id);
  atualizar();
  redirect("/gestao/despesas");
}

/** Despesa sem pagamento no banco: foi paga por um sócio e a empresa tem de a repor. */
export async function marcarPorReporAcao(f: FormData) {
  await exigirSessao();
  const id = num(f, "id");
  const quem = txt(f, "quem") === "Rúbia" ? "Rúbia" : "Bruno";
  if (id) await atualizarDespesa(id, { estado: "Por repor", pago_por: quem, movimento_id: null });
  atualizar();
}

// ---------- movimentos do banco ----------

export async function guardarMovimentoAcao(f: FormData) {
  await exigirSessao();
  const id = num(f, "id");
  if (!id) return;
  const classe = (CLASSES as readonly string[]).includes(String(f.get("classe"))) ? (String(f.get("classe")) as Classe) : "Por classificar";
  const categoria = txt(f, "categoria");
  const casa = txt(f, "casa");
  const reserva = num(f, "reserva_id");
  await atualizarMovimento(id, {
    classe,
    categoria,
    casa,
    notas: txt(f, "notas"),
    reserva_id: reserva ? Math.round(reserva) : null,
    manual: classe !== "Por classificar",
  });

  const despesa = num(f, "despesa_id");
  const s = sql();
  if (classe === "Reposição aos sócios") {
    if (despesa) await s`update despesas set reposicao_id = ${id}, estado = 'Reposto', atualizado_em = now() where id = ${despesa}`;
  } else if (despesa) {
    await s`update despesas set movimento_id = null, estado = 'Pendente' where movimento_id = ${id} and id <> ${despesa}`;
    const [d] = await s`select movimento_id from despesas where id = ${despesa}`;
    const outro = d?.movimento_id && d.movimento_id !== id ? (await s`select 1 from movimentos where id = ${d.movimento_id}`).length > 0 : false;
    if (outro) {
      // a fatura já tem um pagamento: este é mais uma parte (sinal, prestação, resto)
      await s`update movimentos set parte_de = ${despesa} where id = ${id}`;
    } else {
      await s`update movimentos set parte_de = null where id = ${id}`;
      await s`update despesas set movimento_id = ${id}, estado = 'Pago pela empresa', pago_por = 'Empresa',
        casa = coalesce(casa, ${casa}), categoria = coalesce(categoria, ${categoria}), atualizado_em = now() where id = ${despesa}`;
    }
  } else if (f.get("despesa_id") === "0") {
    await s`update despesas set movimento_id = null, estado = 'Pendente' where movimento_id = ${id}`;
    await s`update movimentos set parte_de = null where id = ${id}`;
  }

  if (f.get("regra") === "on") {
    const texto = txt(f, "regra_texto");
    const sentido = txt(f, "regra_sentido");
    if (texto && classe !== "Por classificar")
      await criarRegra({
        texto,
        sentido: sentido === "entrada" || sentido === "saida" ? sentido : null,
        classe,
        categoria,
        casa,
        ordem: 40,
      });
    await classificar();
  }
  atualizar();
}

/** Fatura de despesa nova a partir de um movimento do banco (quando a fatura ainda não chegou). */
export async function despesaDoMovimentoAcao(f: FormData) {
  await exigirSessao();
  const id = num(f, "id");
  if (!id) return;
  const [m] = await sql()`select * from movimentos where id = ${id}`;
  if (!m || Number(m.montante) >= 0) return;
  const nova = await criarDespesa({
    data: m.data as string,
    fornecedor: txt(f, "fornecedor") ?? (sugerirTextoRegra(String(m.descricao)) || String(m.descricao)),
    nif_cliente: NIF_EMPRESA,
    casa: (m.casa as string | null) ?? null,
    categoria: (m.categoria as string | null) ?? null,
    total: Math.abs(Number(m.montante)),
    pago_por: "Empresa",
    estado: "Pago pela empresa",
    movimento_id: id,
    notas: "Criada a partir do extrato — falta a fatura",
    origem: "banco",
  });
  atualizar();
  redirect(`/gestao/despesas/${nova}`);
}

export async function apagarRegraAcao(f: FormData) {
  await exigirSessao();
  const id = num(f, "id");
  if (id) await apagarRegra(id);
  atualizar();
}
