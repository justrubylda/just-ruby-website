import "server-only";
import { calcular, hojeISO } from "./calculos";
import { gravarConfig, lerConfig, sql } from "./db";
import type { Folha } from "./ficheiros";
import { datas, numero } from "./importar";
import { listarReservas } from "./reservas";
import {
  PARAMETROS_BASE,
  PESSOAS,
  percursoPara,
  type Deslocacao,
  type MesFechado,
  type Parametros,
  type Pessoa,
} from "./deslocacoes-comum";

// Mapas de deslocações dos sócios-gerentes. Cada saída de hóspedes faturada gera uma proposta
// (o destino habitual desse alojamento); as outras idas lançam-se à mão. No fim do mês confirma-se,
// fecha-se e imprime-se o mapa. Tabelas: deslocacoes e deslocacoes_meses (criadas em db.ts).

const CHAVE_PARAMETROS = "deslocacoes_parametros";

export async function lerParametros(): Promise<Parametros> {
  const bruto = await lerConfig(CHAVE_PARAMETROS);
  if (!bruto) return PARAMETROS_BASE;
  try {
    const p = JSON.parse(bruto) as Partial<Parametros>;
    return {
      ...PARAMETROS_BASE,
      ...p,
      pessoas: {
        Bruno: { ...PARAMETROS_BASE.pessoas.Bruno, ...p.pessoas?.Bruno },
        Rúbia: { ...PARAMETROS_BASE.pessoas.Rúbia, ...p.pessoas?.Rúbia },
      },
      destinos: p.destinos?.length ? p.destinos : PARAMETROS_BASE.destinos,
    };
  } catch {
    return PARAMETROS_BASE;
  }
}

export async function gravarParametros(p: Parametros) {
  await gravarConfig(CHAVE_PARAMETROS, JSON.stringify(p));
}

export async function listarDeslocacoes(mes?: string): Promise<Deslocacao[]> {
  const linhas = mes
    ? await sql()`select * from deslocacoes where to_char(data, 'YYYY-MM') = ${mes} order by data, pessoa, id`
    : await sql()`select * from deslocacoes order by data, pessoa, id`;
  return linhas as unknown as Deslocacao[];
}

export async function obterDeslocacao(id: number): Promise<Deslocacao | null> {
  const [l] = await sql()`select * from deslocacoes where id = ${id}`;
  return (l as unknown as Deslocacao) ?? null;
}

export async function listarMesesFechados(): Promise<MesFechado[]> {
  return (await sql()`select mes, pessoa, fechado_em::text, pago_em, movimento_id from deslocacoes_meses`) as unknown as MesFechado[];
}

export async function mesFechado(mes: string, pessoa: Pessoa) {
  const [l] = await sql()`select fechado_em from deslocacoes_meses where mes = ${mes} and pessoa = ${pessoa}`;
  return Boolean(l?.fechado_em);
}

async function garantirAberto(data: string, pessoa: Pessoa) {
  if (await mesFechado(data.slice(0, 7), pessoa))
    throw new Error(`O mês de ${pessoa} já está fechado. Reabra-o primeiro para alterar.`);
}

export type NovaDeslocacao = Omit<Deslocacao, "id" | "auto" | "chave" | "reserva_id" | "estado"> & {
  estado?: Deslocacao["estado"];
  reserva_id?: number | null;
  auto?: boolean;
  chave?: string | null;
};

export async function criarDeslocacao(d: NovaDeslocacao) {
  await garantirAberto(d.data, d.pessoa);
  const [l] = await sql()`insert into deslocacoes
    (data, pessoa, saida, regresso, percurso, motivo, matricula, km, almocos, jantares, noites, prova, reserva_id, estado, auto, chave)
    values (${d.data}, ${d.pessoa}, ${d.saida}, ${d.regresso}, ${d.percurso}, ${d.motivo}, ${d.matricula}, ${d.km},
            ${d.almocos}, ${d.jantares}, ${d.noites}, ${d.prova}, ${d.reserva_id ?? null}, ${d.estado ?? "Confirmada"},
            ${d.auto ?? false}, ${d.chave ?? null})
    on conflict do nothing
    returning id`;
  return (l?.id as number | undefined) ?? null;
}

export async function atualizarDeslocacao(id: number, d: Omit<NovaDeslocacao, "pessoa"> & { pessoa: Pessoa }) {
  const antes = await obterDeslocacao(id);
  if (!antes) throw new Error("Deslocação não encontrada.");
  await garantirAberto(antes.data, antes.pessoa);
  await garantirAberto(d.data, d.pessoa);
  await sql()`update deslocacoes set data = ${d.data}, pessoa = ${d.pessoa}, saida = ${d.saida}, regresso = ${d.regresso},
    percurso = ${d.percurso}, motivo = ${d.motivo}, matricula = ${d.matricula}, km = ${d.km}, almocos = ${d.almocos},
    jantares = ${d.jantares}, noites = ${d.noites}, prova = ${d.prova}, estado = 'Confirmada', atualizado_em = now()
    where id = ${id}`;
}

export async function mudarEstado(id: number, estado: Deslocacao["estado"]) {
  const antes = await obterDeslocacao(id);
  if (!antes) return;
  await garantirAberto(antes.data, antes.pessoa);
  // as propostas automáticas não se apagam: ficam "Excluída" para não voltarem a ser propostas
  if (estado === "Excluída" && !antes.auto) {
    await sql()`delete from deslocacoes where id = ${id}`;
    return;
  }
  await sql()`update deslocacoes set estado = ${estado}, atualizado_em = now() where id = ${id}`;
}

export async function confirmarPropostas(mes: string, pessoa: Pessoa) {
  if (await mesFechado(mes, pessoa)) throw new Error("Mês fechado.");
  const r = await sql()`update deslocacoes set estado = 'Confirmada', atualizado_em = now()
    where estado = 'Proposta' and pessoa = ${pessoa} and to_char(data, 'YYYY-MM') = ${mes}`;
  return r.count;
}

/** Uma proposta por cada saída de hóspedes (com fatura ou por faturar) num alojamento com destino definido. */
export async function gerarPropostas(mes: string) {
  const [p, reservas, existentes] = await Promise.all([lerParametros(), listarReservas(), listarDeslocacoes(mes)]);
  const hoje = hojeISO();
  let novas = 0;
  let jaExistiam = 0;
  for (const r of reservas) {
    if (!r.checkout || !r.checkout.startsWith(mes) || r.checkout > hoje) continue;
    const est = calcular(r).estado;
    if (est !== "Faturado" && est !== "Por faturar") continue; // sem fatura ou cancelada: não conta
    const dest = p.destinos.find((d) => d.al === r.al);
    if (!dest) continue;
    if (await mesFechado(mes, dest.pessoa)) continue;
    const igual = existentes.find((e) => e.pessoa === dest.pessoa && e.data === r.checkout && e.percurso.includes(dest.destino));
    if (igual) {
      jaExistiam++;
      continue;
    }
    const prova = [r.plataforma, r.hospede ? `saída ${r.hospede}` : null, r.fatura ? `fatura ${r.fatura}` : "por faturar"]
      .filter(Boolean)
      .join(" · ");
    const id = await criarDeslocacao({
      data: r.checkout,
      pessoa: dest.pessoa,
      saida: dest.saida || null,
      regresso: dest.regresso || null,
      percurso: percursoPara(dest.destino),
      motivo: dest.motivo,
      matricula: p.pessoas[dest.pessoa].matricula || null,
      km: dest.km,
      almocos: dest.almocos,
      jantares: dest.jantares,
      noites: 0,
      prova: `Reserva ${prova}`,
      reserva_id: r.id,
      estado: "Proposta",
      auto: true,
      chave: `res:${r.id}`,
    });
    if (id) {
      novas++;
      existentes.push({ id, data: r.checkout, pessoa: dest.pessoa, percurso: percursoPara(dest.destino) } as Deslocacao);
    } else jaExistiam++;
  }
  return { novas, jaExistiam };
}

/** Dias em que a empresa pagou uma refeição (banco ou fatura de despesa): sem ajuda de custo nesses dias. */
export async function diasComRefeicaoDaEmpresa(mes: string) {
  const [movs, desp] = await Promise.all([
    sql()`select data from movimentos where montante < 0 and categoria = 'Refeições' and to_char(data, 'YYYY-MM') = ${mes}`,
    sql()`select data from despesas where categoria = 'Refeições' and to_char(data, 'YYYY-MM') = ${mes}`,
  ]);
  return new Set([...movs, ...desp].map((l) => l.data as string));
}

export async function fecharMes(mes: string, pessoa: Pessoa) {
  const [{ n }] = await sql()`select count(*)::int as n from deslocacoes
    where estado = 'Proposta' and pessoa = ${pessoa} and to_char(data, 'YYYY-MM') = ${mes}`;
  if (n > 0) throw new Error(`Ainda há ${n} proposta(s) por confirmar ou excluir.`);
  await sql()`insert into deslocacoes_meses (mes, pessoa, fechado_em) values (${mes}, ${pessoa}, now())
    on conflict (mes, pessoa) do update set fechado_em = now()`;
}

export async function reabrirMes(mes: string, pessoa: Pessoa) {
  await sql()`update deslocacoes_meses set fechado_em = null, pago_em = null, movimento_id = null
    where mes = ${mes} and pessoa = ${pessoa}`;
}

export async function marcarPago(mes: string, pessoa: Pessoa, data: string | null, movimentoId: number | null) {
  await sql()`update deslocacoes_meses set pago_em = ${data}, movimento_id = ${movimentoId}
    where mes = ${mes} and pessoa = ${pessoa}`;
}

/** Transferências para os sócios que podem ser o pagamento deste mapa (mesmo valor, até 90 dias depois). */
export async function pagamentosCandidatos(mes: string, total: number) {
  if (!total) return [];
  const inicio = `${mes}-01`;
  return (await sql()`select id, data, descricao, montante from movimentos
    where montante < 0 and abs(abs(montante) - ${total}) < 0.01
      and data >= ${inicio}::date and data <= (${inicio}::date + interval '4 months')
    order by data`) as unknown as { id: number; data: string; descricao: string; montante: number }[];
}

// ---------- importar os mapas em Excel já feitos (uma folha por mês e por pessoa) ----------

const semAcentos = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function hora(v: unknown): string | null {
  if (v == null || v === "") return null;
  if (typeof v === "number") {
    const f = v % 1;
    const min = Math.round(f * 24 * 60);
    return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
  }
  const m = String(v).match(/(\d{1,2})[:h](\d{2})/);
  return m ? `${m[1].padStart(2, "0")}:${m[2]}` : null;
}

export async function importarMapas(folhas: Folha[]) {
  const linhas: string[] = [];
  let novas = 0;
  let repetidas = 0;
  for (const f of folhas) {
    const nome = semAcentos(f.nome);
    if (nome.includes("exemplo")) continue;
    const pessoaFolha = PESSOAS.find((p) => nome.includes(semAcentos(p)));
    const iCab = f.linhas.findIndex(
      (l) => semAcentos(String(l[0]?.v ?? "")) === "data" && l.some((c) => semAcentos(String(c?.v ?? "")).includes("percurso"))
    );
    if (iCab < 0) continue;
    const cab = f.linhas[iCab].map((c) => semAcentos(String(c?.v ?? "")));
    const col = (...t: string[]) => cab.findIndex((c) => t.some((x) => c.includes(x)));
    const C = {
      data: 0,
      saida: col("saida"),
      regresso: col("regresso"),
      percurso: col("percurso"),
      motivo: col("motivo"),
      matricula: col("matricula"),
      km: cab.findIndex((c) => c === "km"),
      alm: col("almoc"),
      jan: col("jantar"),
      noites: col("noites"),
      prova: col("prova"),
      pessoa: col("pessoa", "socio"),
    };
    // sem a pessoa no nome da folha (ex.: Excel descarregado do site ou CSV), lê-se a coluna Sócio-gerente
    if (!pessoaFolha && C.pessoa < 0) continue;
    let nestaFolha = 0;
    for (const l of f.linhas.slice(iCab + 1)) {
      const v = (i: number) => (i >= 0 ? l[i]?.v ?? null : null);
      const data = datas(v(C.data))[0];
      if (!data) {
        if (semAcentos(String(v(C.motivo) ?? v(5) ?? "")).includes("totais")) break;
        continue;
      }
      const percurso = String(v(C.percurso) ?? "").trim();
      if (!percurso) continue;
      const pessoa = pessoaFolha ?? PESSOAS.find((p) => semAcentos(String(v(C.pessoa) ?? "")).includes(semAcentos(p)));
      if (!pessoa) continue;
      if (await mesFechado(data.slice(0, 7), pessoa)) {
        repetidas++;
        continue;
      }
      const id = await criarDeslocacao({
        data,
        pessoa,
        saida: hora(v(C.saida)),
        regresso: hora(v(C.regresso)),
        percurso,
        motivo: String(v(C.motivo) ?? "").trim(),
        matricula: String(v(C.matricula) ?? "").trim() || null,
        km: numero(v(C.km)) ?? 0,
        almocos: numero(v(C.alm)) ?? 0,
        jantares: numero(v(C.jan)) ?? 0,
        noites: numero(v(C.noites)) ?? 0,
        prova: String(v(C.prova) ?? "").trim() || null,
        estado: "Confirmada",
        chave: `xls:${pessoa}:${data}:${percurso}:${String(v(C.motivo) ?? "").slice(0, 40)}`,
      });
      if (id) {
        novas++;
        nestaFolha++;
      } else repetidas++;
    }
    if (nestaFolha) linhas.push(`${pessoaFolha ? f.nome : "Ficheiro"}: ${nestaFolha} deslocação(ões).`);
  }
  if (!novas && !repetidas)
    return { ok: false, titulo: "Não encontrei mapas neste ficheiro (folhas \"Jul Bruno\", \"Ago Rúbia\"… ou uma coluna Sócio-gerente).", linhas };
  return { ok: true, titulo: `${novas} deslocação(ões) importadas, ${repetidas} já existiam.`, linhas };
}
