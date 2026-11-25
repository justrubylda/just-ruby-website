import "server-only";
import { garantirTabelas, gravarConfig, sql } from "./db";
import { diasEntre, type Reserva } from "./calculos";
import { numero } from "./importar";

// Conferência com o CentralGest Cloud (sem API): a lista de vendas copiada do
// CentralGest (Clientes → Vendas, ou a lista lida pelo Claude) é guardada aqui e
// cruzada com as reservas, para cada estadia ter o seu nº de fatura e nenhuma ser
// faturada duas vezes. O nome na fatura pode ser outro (ex.: a empresa que o
// hóspede pediu por mensagem no Airbnb/Booking), por isso o cruzamento faz-se
// sobretudo pelo valor e pelas datas; o nome e o NIF só ajudam a desempatar.

export type DocCG = {
  doc: string;
  data: string; // AAAA-MM-DD
  cliente: string;
  nif: string | null;
  total: number;
  por_receber: number | null;
  estado: string | null;
  reserva_id?: number | null;
  ligacao?: string | null;
};

const RE_DOC = /^(?:FR|FT|FS|NC|ND|RG|FA)\s+[\w.]+\/\d+$/i;
const RE_DATA = /^(\d{2})\/(\d{2})\/(\d{4})$/;

/** Lê o texto da grelha de Vendas do CentralGest (copiado da página ou de um ficheiro). */
export function lerVendas(texto: string): DocCG[] {
  const docs = new Map<string, DocCG>();
  for (const linha of texto.split(/\r?\n/)) {
    const c = linha
      .split(/\t|\s{3,}|\|/)
      .map((x) => x.trim())
      .filter(Boolean);
    const i = c.findIndex((x) => RE_DOC.test(x));
    if (i < 0) continue;
    const m = c[i + 1]?.match(RE_DATA);
    if (!m) continue;
    const resto = c.slice(i + 2);
    // números no fim: [por receber, total] seguidos de moeda / data de criação
    const nums = resto.map((x) => (/^-?[\d\s\u00a0\u202f]+,\d{2}$/.test(x) ? numero(x.replace(/[\s\u00a0\u202f]/g, "")) : null));
    const idxNums = nums.map((n, k) => (n == null ? -1 : k)).filter((k) => k >= 0);
    if (!idxNums.length) continue;
    const total = nums[idxNums[idxNums.length - 1]]!;
    const porReceber = idxNums.length > 1 ? nums[idxNums[idxNums.length - 2]] : null;
    const textos = resto.slice(0, idxNums[0]);
    const nifTxt = (textos[1] ?? "").replace(/\s/g, "");
    const doc = c[i].replace(/\s+/g, " ").toUpperCase();
    docs.set(doc, {
      doc,
      data: `${m[3]}-${m[2]}-${m[1]}`,
      cliente: textos[0] ?? "",
      nif: /^\d{9}$/.test(nifTxt) && nifTxt !== "999999990" ? nifTxt : null,
      total,
      por_receber: porReceber,
      estado: textos.slice(2).join(" ") || null,
    });
  }
  return [...docs.values()];
}

export type ReciboCG = { doc: string; data: string; cliente: string; total: number; anulado: boolean };

const RE_RG = /^RG\s+[\w.]+\/\d+$/i;

/**
 * Lê a grelha de Recebimentos do CentralGest (Nº recibo, Conta, Cliente, Data, Total…).
 * Um recibo anulado tem de vir marcado com a palavra "anulado" na linha.
 */
export function lerRecibos(texto: string): ReciboCG[] {
  const out = new Map<string, ReciboCG>();
  for (const linha of texto.split(/\r?\n/)) {
    const c = linha
      .split(/\t|\s{3,}|\|/)
      .map((x) => x.trim())
      .filter(Boolean);
    const i = c.findIndex((x) => RE_RG.test(x));
    if (i < 0) continue;
    const j = c.findIndex((x, k) => k > i && RE_DATA.test(x));
    if (j < 0) continue;
    const m = c[j].match(RE_DATA)!;
    const num = c.slice(j + 1).find((x) => /^-?[\d\s\u00a0\u202f]+,\d{2}$/.test(x));
    if (!num) continue;
    const cliente = c.slice(i + 1, j).filter((x) => !/^\d{6,}$/.test(x)).join(" ");
    const doc = c[i].replace(/\s+/g, " ").toUpperCase();
    out.set(doc, {
      doc,
      data: `${m[3]}-${m[2]}-${m[1]}`,
      cliente,
      total: numero(num.replace(/[\s\u00a0\u202f]/g, "")) ?? 0,
      anulado: /anulad/i.test(linha),
    });
  }
  return [...out.values()];
}

export async function guardarRecibos(lista: ReciboCG[]) {
  await garantirTabelas();
  for (const r of lista) {
    await sql()`insert into recibos_cg (doc, data, cliente, total, anulado)
      values (${r.doc}, ${r.data}, ${r.cliente}, ${r.total}, ${r.anulado})
      on conflict (doc) do update set data = excluded.data, cliente = excluded.cliente, total = excluded.total,
        anulado = excluded.anulado, atualizado_em = now()`;
  }
}

export async function listarRecibos(): Promise<ReciboCG[]> {
  await garantirTabelas();
  return (await sql()`select * from recibos_cg order by data desc, doc desc`) as unknown as ReciboCG[];
}

export async function guardarDocs(docs: DocCG[]) {
  await garantirTabelas();
  for (const d of docs) {
    await sql()`insert into faturas_cg (doc, data, cliente, nif, total, por_receber, estado)
      values (${d.doc}, ${d.data}, ${d.cliente}, ${d.nif}, ${d.total}, ${d.por_receber}, ${d.estado})
      on conflict (doc) do update set data = excluded.data, cliente = excluded.cliente, nif = excluded.nif,
        total = excluded.total, por_receber = excluded.por_receber, estado = excluded.estado, atualizado_em = now()`;
  }
  await gravarConfig("cg_conferido_em", new Date().toISOString());
}

export async function listarDocs(): Promise<DocCG[]> {
  await garantirTabelas();
  return (await sql()`select * from faturas_cg order by data desc, doc desc`) as unknown as DocCG[];
}

// ---------- cruzamento ----------

const palavras = (s: string | null | undefined) =>
  new Set(
    String(s ?? "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 2 && !["lda", "unipessoal", "s.a", "sa", "consumidor", "final"].includes(w))
  );
const nomeParecido = (a: string | null | undefined, b: string | null | undefined) => {
  const x = palavras(a);
  for (const w of palavras(b)) if (x.has(w)) return true;
  return false;
};

/** Números de fatura escritos numa reserva (ex.: "FR 2.1/19 + FR 2.1/51"). */
export const docsDaReserva = (f: string | null | undefined) =>
  (String(f ?? "").toUpperCase().match(/(?:FR|FT|FS|NC|ND|RG|FA)\s*[\w.]+\/\d+/g) ?? []).map((d) => d.replace(/\s+/g, " "));

/** A fatura pode ser emitida antes da entrada (contratos) ou semanas depois da saída. */
function naJanela(d: DocCG, r: Reserva) {
  if (!r.checkin) return false;
  const fim = r.checkout ?? r.checkin;
  return diasEntre(r.checkin, d.data) >= -90 && diasEntre(fim, d.data) <= 150;
}

/** Faturas do CentralGest que podem corresponder a uma reserva ainda sem nº. */
export function candidatas(r: Reserva, livres: DocCG[]) {
  if (r.total == null) return [];
  return livres
    .filter((d) => d.total > 0 && Math.abs(d.total - r.total!) < 0.05 && naJanela(d, r))
    .sort((a, b) => {
      const pa = (r.nif && a.nif === r.nif ? 2 : 0) + (nomeParecido(a.cliente, r.hospede) ? 1 : 0);
      const pb = (r.nif && b.nif === r.nif ? 2 : 0) + (nomeParecido(b.cliente, r.hospede) ? 1 : 0);
      return pb - pa || Math.abs(diasEntre(r.checkout ?? r.checkin!, a.data)) - Math.abs(diasEntre(r.checkout ?? r.checkin!, b.data));
    });
}

export type Conferencia = {
  ligadas: { doc: string; reserva: Reserva }[];
  porConfirmar: { doc: DocCG; reservas: Reserva[] }[];
  semReserva: DocCG[];
  repetidas: { doc: string; reservas: Reserva[] }[];
};

/**
 * Liga cada fatura do CentralGest à sua reserva. Só escreve o nº na reserva quando
 * não há dúvida (um único par valor + datas, ou o NIF/nome a desempatar); o resto
 * fica "por confirmar" na página Por faturar.
 */
export async function conciliar(reservas: Reserva[]): Promise<Conferencia> {
  const docs = (await listarDocs()).filter((d) => d.total > 0);
  const ativas = reservas.filter((r) => !r.cancelada);
  const res: Conferencia = { ligadas: [], porConfirmar: [], semReserva: [], repetidas: [] };

  // 1) nº já escrito na reserva
  const usados = new Map<string, Reserva[]>();
  for (const r of ativas) for (const d of docsDaReserva(r.fatura)) usados.set(d, [...(usados.get(d) ?? []), r]);
  for (const [doc, rs] of usados) if (rs.length > 1) res.repetidas.push({ doc, reservas: rs });

  // 2) faturas ainda sem reserva: procurar a estadia pelo valor e datas
  const semNumero = ativas.filter((r) => !(r.fatura ?? "").trim());
  const livres = docs.filter((d) => !usados.has(d.doc));
  const ocupadas = new Set<number>();
  for (const d of livres.sort((a, b) => a.data.localeCompare(b.data))) {
    const cands = semNumero.filter(
      (r) => !ocupadas.has(r.id) && r.total != null && Math.abs(r.total - d.total) < 0.05 && naJanela(d, r)
    );
    if (!cands.length) {
      res.semReserva.push(d);
      continue;
    }
    const fortes = cands.filter((r) => (d.nif && r.nif === d.nif) || nomeParecido(d.cliente, r.hospede));
    const escolhida = cands.length === 1 ? cands[0] : fortes.length === 1 ? fortes[0] : null;
    if (!escolhida) {
      res.porConfirmar.push({ doc: d, reservas: cands });
      continue;
    }
    ocupadas.add(escolhida.id);
    const nota = `Fatura ${d.doc} ligada automaticamente pela conferência com o CentralGest (${d.cliente}).`;
    await sql()`update reservas set fatura = ${d.doc},
      notas = case when coalesce(notas, '') = '' then ${nota} else notas || E'\n' || ${nota} end,
      atualizado_em = now() where id = ${escolhida.id} and coalesce(fatura, '') = ''`;
    escolhida.fatura = d.doc;
    res.ligadas.push({ doc: d.doc, reserva: escolhida });
  }
  return res;
}
