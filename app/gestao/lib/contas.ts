import "server-only";
import { garantirTabelas, gravarConfig, lerConfig, sql } from "./db";
import { diasEntre, type Reserva } from "./calculos";
import type { Celula, Folha } from "./ficheiros";
import { datas, numero } from "./importar";
import { listarReservas } from "./reservas";
import {
  CATEGORIAS,
  CLASSES,
  CLASSES_RECEITA,
  GERAL,
  NIF_EMPRESA,
  normalizar,
  regraServe,
  type Classe,
  type Despesa,
  type EstadoDespesa,
  type Movimento,
  type Regra,
} from "./contas-comum";

// Despesas, movimentos do banco e a conferência entre eles e com as reservas.

const r2 = (n: number) => Math.round(n * 100) / 100;
const igual = (a: number, b: number, tol = 0.011) => Math.abs(a - b) <= tol;
const somarDias = (iso: string, n: number) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

// ---------- regras de classificação ----------

type RegraInicial = [texto: string, sentido: Regra["sentido"], classe: Classe, categoria: string | null, casa: string | null, ordem: number];

// Códigos de contrato confirmados nas faturas (conversa de nov/2026) e fornecedores habituais.
const REGRAS_INICIAIS: RegraInicial[] = [
  ["50263888084", null, "Despesa", "Eletricidade", "Torras", 10],
  ["50246141837", null, "Despesa", "Eletricidade", "Nosso Cantinho", 10],
  ["50246141352", null, "Despesa", "Eletricidade", "Kingdom of Stone", 10],
  ["16208740371", null, "Despesa", "Água", "Nosso Cantinho", 10],
  ["16208738722", null, "Despesa", "Água", "Torras", 10],
  ["41541631015", null, "Despesa", "Seguros", "Kingdom of Stone", 10],
  ["16441631073", null, "Despesa", "Seguros", "Nosso Cantinho", 10],
  ["JUSTINO", "saida", "Reposição aos sócios", null, null, 20],
  ["RUBIA", "saida", "Reposição aos sócios", null, null, 20],
  ["JUSTINO", "entrada", "Entrada dos sócios", null, null, 20],
  ["RUBIA", "entrada", "Entrada dos sócios", null, null, 20],
  ["AIRBNB", "entrada", "Receita Airbnb", null, null, 30],
  ["BOOKING", "entrada", "Receita Booking", null, null, 30],
  ["AIRBNB", "saida", "Despesa", "Comissões das plataformas", null, 30],
  ["BOOKING", "saida", "Despesa", "Comissões das plataformas", null, 30],
  ["CONGRAU", "entrada", "Receita direta", null, null, 30],
  ["CONSTRULINE", "entrada", "Receita direta", null, null, 30],
  ["ENDESA", null, "Despesa", "Eletricidade", null, 50],
  ["AGUAS DE SANTAREM", null, "Despesa", "Água", null, 50],
  ["TRANQUILIDADE", null, "Despesa", "Seguros", null, 50],
  ["NOS", "saida", "Despesa", "Telecomunicações", null, 50],
  ["ESPACO VISUAL", null, "Despesa", "Contabilidade", GERAL, 50],
  ["ANTHROPIC", null, "Despesa", "Software e subscrições", GERAL, 50],
  ["CLAUDE AI", null, "Despesa", "Software e subscrições", GERAL, 50],
  ["OPENAI", null, "Despesa", "Software e subscrições", GERAL, 50],
  ["PINGO DOCE", null, "Despesa", "Consumíveis e supermercado", null, 60],
  ["CONTINENTE", null, "Despesa", "Consumíveis e supermercado", null, 60],
  ["MERCADONA", null, "Despesa", "Consumíveis e supermercado", null, 60],
  ["LIDL", null, "Despesa", "Consumíveis e supermercado", null, 60],
  ["AUCHAN", null, "Despesa", "Consumíveis e supermercado", null, 60],
  ["INTERMARCHE", null, "Despesa", "Consumíveis e supermercado", null, 60],
  ["ALDI", null, "Despesa", "Consumíveis e supermercado", null, 60],
  ["MINIPRECO", null, "Despesa", "Consumíveis e supermercado", null, 60],
  ["REPSOL", null, "Despesa", "Gás e combustível", null, 60],
  ["GALP", null, "Despesa", "Gás e combustível", null, 60],
  ["PRIO", null, "Despesa", "Gás e combustível", null, 60],
  ["ECOBRENT", null, "Despesa", "Gás e combustível", null, 60],
  ["LEROY MERLIN", null, "Despesa", "Obras e manutenção", null, 60],
  ["AKI", null, "Despesa", "Obras e manutenção", null, 60],
  ["BRICOMARCHE", null, "Despesa", "Obras e manutenção", null, 60],
  ["IKEA", null, "Despesa", "Equipamento e mobiliário", null, 60],
  ["ACTION", null, "Despesa", "Equipamento e mobiliário", null, 60],
  ["STAPLES", null, "Despesa", "Equipamento e mobiliário", GERAL, 60],
  ["VIA VERDE", null, "Despesa", "Deslocações", null, 60],
  ["IMPOSTO DO SELO", null, "Despesa", "Banco", GERAL, 70],
  ["IMP SELO", null, "Despesa", "Banco", GERAL, 70],
  ["COMISSAO", "saida", "Despesa", "Banco", GERAL, 70],
  ["MANUTENCAO DE CONTA", null, "Despesa", "Banco", GERAL, 70],
  ["AUTORIDADE TRIBUTARIA", null, "Impostos e Estado", "Impostos e taxas", GERAL, 70],
  ["PAGAMENTO AO ESTADO", null, "Impostos e Estado", "Impostos e taxas", GERAL, 70],
  ["PAG ESTADO", null, "Impostos e Estado", "Impostos e taxas", GERAL, 70],
  ["SEGURANCA SOCIAL", null, "Impostos e Estado", "Impostos e taxas", GERAL, 70],
];

const gr = globalThis as unknown as { __jrRegrasLimpas?: boolean };

export async function garantirRegras() {
  await garantirTabelas();
  if (await lerConfig("regras_banco_iniciais")) {
    // dois pedidos ao mesmo tempo na primeira utilização podem ter gravado as regras duas vezes
    if (!gr.__jrRegrasLimpas) {
      await sql()`delete from regras_banco a using regras_banco b where a.id > b.id and a.texto = b.texto
        and coalesce(a.sentido, '') = coalesce(b.sentido, '') and a.classe = b.classe
        and coalesce(a.categoria, '') = coalesce(b.categoria, '') and coalesce(a.casa, '') = coalesce(b.casa, '')`;
      gr.__jrRegrasLimpas = true;
    }
    return;
  }
  await gravarConfig("regras_banco_iniciais", new Date().toISOString());
  const s = sql();
  for (const [texto, sentido, classe, categoria, casa, ordem] of REGRAS_INICIAIS) {
    await s`insert into regras_banco (texto, sentido, classe, categoria, casa, ordem)
      values (${texto}, ${sentido}, ${classe}, ${categoria}, ${casa}, ${ordem})`;
  }
}

export async function listarRegras(): Promise<Regra[]> {
  await garantirRegras();
  return (await sql()`select * from regras_banco order by ordem, id`) as unknown as Regra[];
}

export async function criarRegra(r: Omit<Regra, "id">) {
  await garantirRegras();
  await sql()`insert into regras_banco (texto, sentido, classe, categoria, casa, ordem)
    values (${r.texto}, ${r.sentido}, ${r.classe}, ${r.categoria}, ${r.casa}, ${r.ordem})`;
}

export async function apagarRegra(id: number) {
  await garantirTabelas();
  await sql()`delete from regras_banco where id = ${id}`;
}

/**
 * Aplica as regras aos movimentos que não foram classificados à mão nem estão ligados a uma
 * fatura de despesa (aí manda a fatura). Sem regra que sirva, o movimento fica como está.
 */
export async function classificar() {
  const regras = await listarRegras();
  const movs = (await sql()`select * from movimentos m where not manual
    and not exists (select 1 from despesas d where d.movimento_id = m.id)`) as unknown as Movimento[];
  let mudados = 0;
  for (const m of movs) {
    const r = regras.find((x) => regraServe(x, m));
    if (!r) continue;
    const classe: Classe = r.classe;
    const categoria = r.categoria ?? (classe === m.classe ? m.categoria : null);
    const casa = r.casa ?? (classe === m.classe ? m.casa : null);
    if (classe !== m.classe || categoria !== m.categoria || casa !== m.casa) {
      await sql()`update movimentos set classe = ${classe}, categoria = ${categoria}, casa = ${casa} where id = ${m.id}`;
      mudados++;
    }
  }
  return mudados;
}

// ---------- despesas ----------

export const CAMPOS_DESPESA = [
  "data", "fornecedor", "nif_fornecedor", "documento", "nif_cliente", "casa", "categoria", "base", "iva", "total",
  "pago_por", "estado", "movimento_id", "reposicao_id", "ficheiro", "notas", "origem",
] as const;
export type NovaDespesa = Partial<Pick<Despesa, (typeof CAMPOS_DESPESA)[number]>>;

export async function listarDespesas(): Promise<Despesa[]> {
  await garantirTabelas();
  return (await sql()`select * from despesas order by data nulls last, id`) as unknown as Despesa[];
}

export async function obterDespesa(id: number): Promise<Despesa | null> {
  await garantirTabelas();
  const [d] = await sql()`select * from despesas where id = ${id}`;
  return (d as unknown as Despesa) ?? null;
}

function chaveDespesa(d: NovaDespesa) {
  const doc = normalizar(d.documento);
  const nif = (d.nif_fornecedor ?? "").replace(/\D/g, "");
  if (doc && nif) return `${nif}|${doc}`;
  if (doc && d.total != null) return `${doc}|${r2(d.total)}`;
  if (doc) return `${normalizar(d.fornecedor)}|${doc}`;
  if (d.data && d.total != null) return `${d.data}|${r2(d.total)}|${normalizar(d.fornecedor)}`;
  return null;
}

function limparDespesa(d: NovaDespesa) {
  const o: Record<string, unknown> = {};
  for (const k of CAMPOS_DESPESA) if (k in d) o[k] = (d as Record<string, unknown>)[k] ?? null;
  if ("base" in o || "iva" in o || "total" in o) {
    const total = (o.total as number | null) ?? d.total ?? null;
    const iva = (o.iva as number | null) ?? null;
    if (total != null && iva != null && o.base == null) o.base = r2(total - iva);
  }
  return o;
}

export async function criarDespesa(d: NovaDespesa) {
  await garantirTabelas();
  const o = { ...limparDespesa(d), chave: chaveDespesa(d) };
  const [r] = await sql()`insert into despesas ${sql()(o)} returning id`;
  return r.id as number;
}

export async function atualizarDespesa(id: number, d: NovaDespesa) {
  await garantirTabelas();
  const o: Record<string, unknown> = { ...limparDespesa(d), atualizado_em: new Date() };
  // a chave (fornecedor + nº) acompanha as correções, para a fatura não entrar duas vezes numa importação
  const atual = await obterDespesa(id);
  if (atual) {
    const chave = chaveDespesa({ ...atual, ...d });
    const ocupada = chave ? (await sql()`select 1 from despesas where chave = ${chave} and id <> ${id}`).length > 0 : true;
    if (!ocupada) o.chave = chave;
  }
  await sql()`update despesas set ${sql()(o)} where id = ${id}`;
}

export async function apagarDespesa(id: number) {
  await garantirTabelas();
  await sql()`delete from despesas where id = ${id}`;
}

/** Junta despesas sem duplicar (mesmo fornecedor e nº de documento): completa o que faltar. */
export async function importarDespesasLote(lista: NovaDespesa[], origem: string) {
  await garantirTabelas();
  let novas = 0;
  let existentes = 0;
  for (const d of lista) {
    const chave = chaveDespesa(d);
    // a fatura que faltava: completa a despesa criada a partir do extrato, em vez de a duplicar
    if (d.documento && d.data && d.total != null) {
      const ph = await sql()`select id from despesas where origem = 'banco' and documento is null
        and abs(total - ${d.total}) < 0.011 and data between ${d.data}::date - 7 and ${d.data}::date + 75 limit 2`;
      const jaExiste = chave ? (await sql()`select 1 from despesas where chave = ${chave}`).length > 0 : false;
      if (ph.length === 1 && !jaExiste) {
        const resto: NovaDespesa = { ...d };
        delete resto.estado;
        delete resto.pago_por;
        delete resto.movimento_id;
        await sql()`update despesas set ${sql()({ ...limparDespesa(resto), chave, origem, atualizado_em: new Date() })} where id = ${ph[0].id}`;
        existentes++;
        continue;
      }
    }
    // a mesma fatura já registada de outra forma (ex.: na folha de acerto, sem nº ou com outro nome):
    // mesmo valor, até 3 dias de diferença, mesmo fornecedor (ou NIF) e nº igual ou em falta → completa-a
    if (d.data && d.total != null) {
      const cands = (await sql()`select * from despesas where abs(total - ${d.total}) < 0.011
        and data between ${d.data}::date - 3 and ${d.data}::date + 3`) as unknown as Despesa[];
      const f1 = normalizar(d.fornecedor).slice(0, 4);
      const nif = (d.nif_fornecedor ?? "").replace(/\D/g, "");
      const iguais = cands.filter(
        (c) =>
          (!c.documento || !d.documento || normalizar(c.documento) === normalizar(d.documento)) &&
          ((f1 && normalizar(c.fornecedor).slice(0, 4) === f1) || (nif && c.nif_fornecedor === nif))
      );
      if (iguais.length === 1) {
        const c = iguais[0];
        await sql()`update despesas set
          documento = coalesce(documento, ${d.documento ?? null}),
          nif_fornecedor = coalesce(nif_fornecedor, ${d.nif_fornecedor ?? null}),
          nif_cliente = coalesce(nif_cliente, ${d.nif_cliente ?? null}),
          iva = coalesce(iva, ${d.iva ?? null}),
          base = coalesce(base, ${d.iva != null ? r2(d.total - d.iva) : null}),
          casa = coalesce(casa, ${d.casa ?? null}),
          categoria = coalesce(categoria, ${d.categoria ?? null}),
          ficheiro = coalesce(ficheiro, ${d.ficheiro ?? null}),
          atualizado_em = now()
          where id = ${c.id}`;
        existentes++;
        continue;
      }
    }
    const o = { ...limparDespesa({ ...d, origem }), chave };
    const [r] = await sql()`insert into despesas ${sql()(o)}
      on conflict (chave) where chave is not null do update set
        casa = coalesce(despesas.casa, excluded.casa),
        categoria = coalesce(despesas.categoria, excluded.categoria),
        iva = coalesce(despesas.iva, excluded.iva),
        base = coalesce(despesas.base, excluded.base),
        nif_fornecedor = coalesce(despesas.nif_fornecedor, excluded.nif_fornecedor),
        nif_cliente = coalesce(despesas.nif_cliente, excluded.nif_cliente),
        ficheiro = coalesce(despesas.ficheiro, excluded.ficheiro),
        notas = coalesce(despesas.notas, excluded.notas)
      returning (xmax = 0) as nova`;
    if (r?.nova) novas++;
    else existentes++;
  }
  return { novas, existentes };
}

// ---------- movimentos ----------

export async function listarMovimentos(): Promise<Movimento[]> {
  await garantirTabelas();
  return (await sql()`select * from movimentos order by data, id`) as unknown as Movimento[];
}

export async function atualizarMovimento(
  id: number,
  m: Partial<Pick<Movimento, "classe" | "categoria" | "casa" | "reserva_id" | "notas" | "manual">>
) {
  await garantirTabelas();
  await sql()`update movimentos set ${sql()(m as Record<string, unknown>)} where id = ${id}`;
}

type NovoMovimento = Omit<Movimento, "id" | "conta" | "reserva_id"> & { chave: string };

async function gravarMovimentos(lista: NovoMovimento[]) {
  let novos = 0;
  let existentes = 0;
  for (const m of lista) {
    // o mesmo movimento vindo de outra exportação (texto um pouco diferente): data, valor e saldo iguais
    if (m.saldo != null) {
      const [igual] = await sql()`select id from movimentos where data = ${m.data} and montante = ${m.montante}
        and saldo = ${m.saldo} and chave <> ${m.chave} limit 1`;
      if (igual) {
        existentes++;
        continue;
      }
    }
    const [r] = await sql()`insert into movimentos ${sql()(m as unknown as Record<string, unknown>)}
      on conflict (chave) do update set
        saldo = coalesce(movimentos.saldo, excluded.saldo),
        data_valor = coalesce(movimentos.data_valor, excluded.data_valor),
        classe = case when excluded.manual and not movimentos.manual then excluded.classe else movimentos.classe end,
        categoria = case when excluded.manual and not movimentos.manual then excluded.categoria else movimentos.categoria end,
        casa = case when excluded.manual and not movimentos.manual then excluded.casa else movimentos.casa end,
        notas = coalesce(movimentos.notas, excluded.notas),
        manual = movimentos.manual or excluded.manual
      returning (xmax = 0) as novo`;
    if (r?.novo) novos++;
    else existentes++;
  }
  return { novos, existentes };
}

// ---------- leitura de folhas (extrato do Millennium e folha de acerto) ----------

const txt = (c: Celula | undefined) => (c?.v == null ? "" : String(c.v).replace(/\s+/g, " ").trim());
const chaveCab = (c: Celula | undefined) => normalizar(txt(c)).toLowerCase();

type Testes = Record<string, RegExp>;

/** Procura a linha de cabeçalho (nas primeiras 30) que tem as colunas obrigatórias. */
function acharCabecalho(f: Folha, obrigatorias: Testes, opcionais: Testes) {
  for (let i = 0; i < Math.min(f.linhas.length, 30); i++) {
    const cab = (f.linhas[i] ?? []).map(chaveCab);
    const col: Record<string, number> = {};
    const usar = (nome: string, re: RegExp) => {
      const j = cab.findIndex((t, k) => t && re.test(t) && !Object.values(col).includes(k));
      if (j >= 0) col[nome] = j;
    };
    for (const [n, re] of Object.entries(obrigatorias)) usar(n, re);
    if (Object.keys(obrigatorias).every((n) => n in col)) {
      for (const [n, re] of Object.entries(opcionais)) usar(n, re);
      return { linha: i, col };
    }
  }
  return null;
}

const dataDe = (c: Celula | undefined) => datas(c?.v)[0] ?? null;
const numDe = (c: Celula | undefined) => numero(c?.v);

function classeDeTexto(t: string, montante: number, descricao = ""): Classe | null {
  const s = normalizar(t);
  const d = normalizar(descricao);
  if (!s || /^(A CONFIRMAR|POR CLASSIFICAR|NAO IDENTIFICADO|PENDENTE)$/.test(s)) return null;
  const exata = CLASSES.find((c) => normalizar(c) === s);
  if (exata) return exata;
  if (/CANCEL|ANULAD|ESTORN/.test(s)) return "Outro";
  if (/SUPRIMENT|CAPITAL/.test(s)) return montante < 0 ? "Reposição aos sócios" : "Entrada dos sócios";
  // folha de acerto: "Movimento Particular↔Empresa" = dinheiro entre os sócios e a empresa
  if (/PARTICULAR EMPRESA|EMPRESA PARTICULAR|SOCIO/.test(s)) {
    if (montante > 0) return "Entrada dos sócios";
    if (/JUSTINO|RUBIA|BRUNO/.test(d)) return "Reposição aos sócios";
    return "Particular";
  }
  if (/REPOSI|TRF P/.test(s)) return montante < 0 ? "Reposição aos sócios" : "Entrada dos sócios";
  if (/PARTICULAR|PESSOAL/.test(s)) return "Particular";
  if (/RECEITA|CLIENTE|ESTADIA|RECEBIMENTO|AIRBNB|BOOKING/.test(s) && montante > 0) {
    if (/AIRBNB/.test(d) || /AIRBNB/.test(s)) return "Receita Airbnb";
    if (/BOOKING/.test(d) || /BOOKING/.test(s)) return "Receita Booking";
    return "Receita direta";
  }
  if (/IMPOSTO|ESTADO|\bIVA\b|SEG SOCIAL|SEGURANCA SOCIAL|\bAT\b/.test(s)) return "Impostos e Estado";
  if (/INTERNA|ENTRE CONTAS/.test(s)) return "Transferência interna";
  if (/DESPESA|FORNECEDOR|COMPRA/.test(s)) return "Despesa";
  return "Outro";
}

export function casaDeTexto(t: string, casas: string[]): string | null {
  const s = normalizar(t);
  if (!s) return null;
  if (/KINGDOM|\bKOS\b|TOMAR|OLALHAS/.test(s)) return "Kingdom of Stone";
  if (/CANTINHO|VARZEA/.test(s)) return "Nosso Cantinho";
  if (/TORRAS/.test(s)) return "Torras";
  if (/GERAL|EMPRESA|COMUM|TODAS|AMBAS/.test(s)) return GERAL;
  return casas.find((c) => normalizar(c) === s) ?? txtOriginal(t);
}
const txtOriginal = (t: string) => t.trim() || null;

const PALAVRAS_CATEGORIA: [RegExp, string][] = [
  [/LIMPEZ|LAVAND|ENGOMAD/, "Limpeza e lavandaria"],
  [/ELETRIC|ELECTRIC|\bLUZ\b|ENDESA|\bEDP\b|IBERDROLA|GOLDENERGY/, "Eletricidade"],
  [/\bAGUA|AGUAS|TEJO AMBIENTE|SANEAMENTO/, "Água"],
  [/COMBUST|GASOLEO|GASOLINA|\bGPL\b|\bGAS\b|REPSOL|GALP|ECOBRENT|\bPRIO\b/, "Gás e combustível"],
  [/TELECOM|INTERNET|\bNOS\b|\bMEO\b|VODAFONE|DIGI\b/, "Telecomunicações"],
  [/SEGURO|TRANQUILIDADE|FIDELIDADE|ALLIANZ|GENERALI/, "Seguros"],
  [/OBRA|MANUTEN|REPARA|ELETRICISTA|CANALIZ|PINTUR|LEROY|\bAKI\b|BRICO|MATERIAIS/, "Obras e manutenção"],
  [/MOBIL|EQUIPAMENT|ELETRODOM|IKEA|ACTION|WORTEN|DECATHLON|COLCHA|ROUPA DE CAMA|TOALHA/, "Equipamento e mobiliário"],
  [/SUPERMERC|CONSUMIV|PINGO|CONTINENTE|MERCADONA|LIDL|AUCHAN|INTERMARCHE|ALDI|MINIPRECO|DETERGENT|HIGIENE/, "Consumíveis e supermercado"],
  [/JARDIM|PISCINA|CLORO|REGA/, "Jardim e piscina"],
  [/SOFTWARE|SUBSCRI|ANTHROPIC|OPENAI|CLAUDE|MICROSOFT|GOOGLE|VERCEL|DOMINIO|ALOJAMENTO WEB/, "Software e subscrições"],
  [/CONTAB|ESPACO VISUAL|CONTABILISTA/, "Contabilidade"],
  [/COMISS.*(AIRBNB|BOOKING)|(AIRBNB|BOOKING).*(TAXA|COMISS|SERVICO)/, "Comissões das plataformas"],
  [/\bBANC|COMISSAO|IMPOSTO DO SELO|MILLENNIUM/, "Banco"],
  [/IMPOST|\bTAXA|\bIUC\b|\bIMI\b|FINANCAS|CERTIDAO|REGISTO|\bAT\b/, "Impostos e taxas"],
  [/DESLOC|PORTAGE|VIA VERDE|ESTACIONA|COMBOIO|CP\b|UBER|BOLT/, "Deslocações"],
  [/REFEI|RESTAUR|PASTELAR|PADARIA|CAFE|BURGER|MCDONALD/, "Refeições"],
  [/\bRENDA|ARRENDA/, "Rendas"],
];

/** Escolhe a categoria pela palavra escrita (ou pelo fornecedor). */
export function categoriaDeTexto(t: string): string | null {
  const s = normalizar(t);
  if (!s) return null;
  const exata = CATEGORIAS.find((c) => normalizar(c) === s);
  if (exata) return exata;
  for (const [re, cat] of PALAVRAS_CATEGORIA) if (re.test(s)) return cat;
  return null;
}

export function estadoDeTexto(t: string): EstadoDespesa | null {
  const s = normalizar(t);
  if (!s) return null;
  if (/REPOSTO|REEMBOLSAD/.test(s)) return "Reposto";
  if (/POR REPOR|A REPOR|REPOR/.test(s)) return "Por repor";
  if (/PAGO|PAGA|NAO APLICAVEL/.test(s)) return "Pago pela empresa";
  if (/PENDENTE|CONFERIR|CONFIRMAR/.test(s)) return "Pendente";
  return null;
}

/** Lê movimentos de uma folha (extrato do banco ou "Extrato Classificado" da folha de acerto). */
function lerMovimentosDaFolha(f: Folha, casas: string[], origem: string): NovoMovimento[] | null {
  const cab =
    acharCabecalho(
      f,
      { data: /^data( de)?( (lanc|mov|operacao|contab))?/, descricao: /descri|^movimento|historico|^detalhe/, montante: /^montante|^valor( eur| em euros)?$|^importancia/ },
      { dataValor: /data valor|^valor$/, saldo: /saldo/, classe: /classifica|^tipo/, estado: /^estado|situacao/, casa: /^casa|alojamento|^al$/, categoria: /categoria/, notas: /observa|^notas?$|comentar/ }
    ) ??
    acharCabecalho(
      f,
      { data: /^data( de)?( (lanc|mov|operacao|contab))?/, descricao: /descri|^movimento|historico|^detalhe/, debito: /debito/, credito: /credito/ },
      { dataValor: /data valor/, saldo: /saldo/, classe: /classifica|^tipo/, estado: /^estado|situacao/, casa: /^casa|alojamento|^al$/, categoria: /categoria/, notas: /observa|^notas?$|comentar/ }
    );
  if (!cab) return null;
  const { linha, col } = cab;
  const vistos = new Map<string, number>();
  const lista: NovoMovimento[] = [];
  for (const l of f.linhas.slice(linha + 1)) {
    const data = dataDe(l[col.data]);
    const descricao = txt(l[col.descricao]);
    let montante = col.montante != null ? numDe(l[col.montante]) : null;
    if (col.debito != null) {
      const d = numDe(l[col.debito]);
      const c = numDe(l[col.credito]);
      if (d == null && c == null) montante = null;
      else montante = r2((c ?? 0) - Math.abs(d ?? 0));
    }
    if (!data || montante == null || !descricao) continue;
    montante = r2(montante);
    const base = `${data}|${montante.toFixed(2)}|${normalizar(descricao)}`;
    const n = (vistos.get(base) ?? 0) + 1;
    vistos.set(base, n);
    const tClasse = col.classe != null ? txt(l[col.classe]) : "";
    const tEstado = col.estado != null ? txt(l[col.estado]) : "";
    const tNotas = col.notas != null ? txt(l[col.notas]) : "";
    const tCasa = col.casa != null ? txt(l[col.casa]) : "";
    const tCat = col.categoria != null ? txt(l[col.categoria]) : "";
    const classe = classeDeTexto(tClasse, montante, descricao);
    const notas = [tClasse && classe !== tClasse ? tClasse : "", tEstado, tNotas].filter(Boolean).join(" · ") || null;
    lista.push({
      data,
      data_valor: col.dataValor != null ? dataDe(l[col.dataValor]) : null,
      descricao,
      montante,
      saldo: col.saldo != null ? numDe(l[col.saldo]) : null,
      classe: classe ?? "Por classificar",
      categoria: categoriaDeTexto(tCat) ?? (tCat || null),
      casa: casaDeTexto(tCasa, casas),
      notas,
      manual: Boolean(classe),
      origem,
      chave: `${base}|${n}`,
    });
  }
  return lista;
}

/** Lê despesas de uma folha (lista de faturas da folha de acerto ou linhas coladas). */
function lerDespesasDaFolha(f: Folha, casas: string[]): NovaDespesa[] | null {
  const cab = acharCabecalho(
    f,
    { fornecedor: /fornecedor|entidade|emitente|comerciante|^empresa$/, total: /^total|^valor|^montante/ },
    {
      data: /^data/,
      documento: /^n (doc|fatura|documento)|^documento|^fatura|^n$|^numero/,
      nifCliente: /nif.*(cliente|adquir|fatura|empresa)/,
      nifFornecedor: /nif/,
      iva: /^iva/,
      base: /^base|incidencia|s iva|sem iva/,
      casa: /^casa|alojamento|^al$/,
      categoria: /categoria|^tipo/,
      estado: /^estado|situacao/,
      pagoPor: /pago por|pagador|quem pagou|meio de pagamento/,
      ficheiro: /ficheiro|^pdf|anexo|^caminho/,
      notas: /observa|^notas?$|comentar|reparo/,
      descricao: /^descri/,
    }
  );
  if (!cab) return null;
  const { linha, col } = cab;
  const lista: NovaDespesa[] = [];
  for (const l of f.linhas.slice(linha + 1)) {
    const fornecedor = txt(l[col.fornecedor]);
    const total = numDe(l[col.total]);
    if (!fornecedor || total == null || total === 0 || /^total/i.test(fornecedor)) continue;
    const g = (k: string) => (col[k] != null ? txt(l[col[k]]) : "");
    const estado = estadoDeTexto(g("estado"));
    const pagoPor = normalizar(g("pagoPor"));
    const nifCliente = g("nifCliente").replace(/\D/g, "") || null;
    lista.push({
      data: col.data != null ? dataDe(l[col.data]) : null,
      fornecedor,
      nif_fornecedor: g("nifFornecedor").replace(/\D/g, "") || null,
      documento: /sem n/i.test(g("documento")) ? null : g("documento") || null,
      nif_cliente: nifCliente ?? NIF_EMPRESA,
      casa: casaDeTexto(g("casa"), casas),
      categoria:
        categoriaDeTexto(g("categoria")) ?? categoriaDeTexto(`${fornecedor} ${g("descricao")}`) ?? (g("categoria") || null),
      base: col.base != null ? numDe(l[col.base]) : null,
      iva: col.iva != null ? numDe(l[col.iva]) : null,
      total: r2(total), // negativo = nota de crédito
      pago_por: /RUBIA/.test(pagoPor)
        ? "Rúbia"
        : /BRUNO|PESSOAL|PARTICULAR/.test(pagoPor) || estado === "Por repor" || estado === "Reposto"
          ? "Bruno"
          : "Empresa",
      estado: estado ?? "Pendente",
      ficheiro: g("ficheiro") || null,
      notas: [g("descricao"), g("notas")].filter(Boolean).join(" — ") || null,
    });
  }
  return lista;
}

export type RelatorioContas = { ok: boolean; titulo: string; linhas: string[] };

/** Importa um ficheiro: extrato do banco, lista de faturas, ou a folha de acerto (as duas coisas). */
export async function importarContas(folhas: Folha[], casas: string[], origem: string): Promise<RelatorioContas> {
  await garantirRegras();
  const linhas: string[] = [];
  let algum = false;
  for (const f of folhas) {
    // folha de faturas ou de movimentos? pelo nome da folha; sem pistas, pelo saldo/débito do extrato
    const nome = normalizar(f.nome);
    const cabF = acharCabecalho(f, { fornecedor: /fornecedor|entidade|emitente|comerciante|^empresa$/, total: /^total|^valor|^montante/ }, {});
    const linhaCab = cabF ? (f.linhas[cabF.linha] ?? []).map(chaveCab).join("|") : "";
    const pareceFaturas =
      /FATURA|DESPESA|FORNECEDOR/.test(nome) ||
      (!/EXTRATO|BANCO|MOVIMENT/.test(nome) && Boolean(cabF) && !/saldo|debito|credito/.test(linhaCab));
    const movs = pareceFaturas ? null : lerMovimentosDaFolha(f, casas, origem);
    if (movs?.length) {
      const r = await gravarMovimentos(movs);
      const de = movs.reduce((m, x) => (x.data < m ? x.data : m), "9999");
      const ate = movs.reduce((m, x) => (x.data > m ? x.data : m), "0000");
      linhas.push(`${f.nome}: ${movs.length} movimento(s) de ${de.split("-").reverse().join("/")} a ${ate.split("-").reverse().join("/")} — ${r.novos} novo(s), ${r.existentes} já estavam.`);
      algum = true;
      continue;
    }
    const desp = lerDespesasDaFolha(f, casas);
    if (desp?.length) {
      const r = await importarDespesasLote(desp, origem);
      linhas.push(`${f.nome}: ${desp.length} fatura(s) de despesa — ${r.novas} nova(s), ${r.existentes} já estavam.`);
      algum = true;
    }
  }
  if (!algum)
    return {
      ok: false,
      titulo: "Não encontrei movimentos nem faturas neste ficheiro.",
      linhas: ["O extrato precisa das colunas Data, Descrição e Montante (ou Débito/Crédito); a lista de faturas, de Fornecedor e Total."],
    };
  const classificados = await classificar();
  const c = await conciliarContas();
  linhas.push(`${classificados} movimento(s) classificados pelas regras.`, ...c.linhas);
  return { ok: true, titulo: "Importado.", linhas };
}

/** Linhas coladas (separadas por tabulações ou ponto e vírgula), com cabeçalho. */
export function folhaDeTexto(texto: string): Folha {
  const linhasTxt = texto.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
  const sep = linhasTxt[0]?.includes("\t") ? "\t" : linhasTxt[0]?.includes(";") ? ";" : ",";
  return {
    nome: "Colado",
    linhas: linhasTxt.map((l) => l.split(sep).map((v) => ({ v: v.trim().replace(/^"|"$/g, ""), f: false }))),
  };
}

// ---------- conferência ----------

/** Valor que a reserva deve trazer ao banco (o recebido ou o total). */
function valoresReserva(r: Reserva) {
  const total = r.total ?? 0;
  const recebido = r.recebido ?? total - (r.comissao ?? 0);
  return [...new Set([r2(recebido), r2(total)].filter((v) => v > 0))];
}

/** Soma exata com um único conjunto de despesas (até 18 candidatas). */
function subconjuntoUnico(valor: number, cand: Despesa[]) {
  const c = cand.slice(0, 18);
  const alvo = Math.round(valor * 100);
  const cent = c.map((d) => Math.round(d.total * 100));
  let achado: number[] | null = null;
  let quantos = 0;
  const passo = (i: number, soma: number, escolha: number[]) => {
    if (quantos > 1 || soma > alvo) return;
    if (soma === alvo && escolha.length) {
      quantos++;
      achado = [...escolha];
      return;
    }
    if (i >= c.length) return;
    escolha.push(i);
    passo(i + 1, soma + cent[i], escolha);
    escolha.pop();
    passo(i + 1, soma, escolha);
  };
  passo(0, 0, []);
  return quantos === 1 && achado ? (achado as number[]).map((i) => c[i]) : null;
}

export type Conferencia = { despesasPagas: number; reposicoes: number; entradas: number; linhas: string[] };

/**
 * Liga o que não deixa dúvida:
 *  1. saídas do banco ↔ faturas de despesa (mesmo valor, até 7 dias antes e 75 depois da fatura);
 *  2. transferências para os sócios ↔ despesas por repor (um só conjunto de faturas com essa soma);
 *  3. entradas ↔ reservas (valor recebido ou total, de 90 dias antes da entrada a 60 depois da saída).
 */
export async function conciliarContas(): Promise<Conferencia> {
  const [movs, desp, reservas] = await Promise.all([listarMovimentos(), listarDespesas(), listarReservas()]);
  const s = sql();

  // 1. pagamentos de despesas
  const movPagou = new Set(desp.map((d) => d.movimento_id).filter(Boolean));
  const saidas = movs.filter(
    (m) => m.montante < 0 && !movPagou.has(m.id) && (m.classe === "Despesa" || m.classe === "Por classificar")
  );
  const semPag = desp.filter((d) => !d.movimento_id && d.data && d.estado !== "Reposto" && d.estado !== "Por repor");
  const parD = new Map<number, Movimento[]>();
  for (const d of semPag) {
    const l = saidas.filter((m) => igual(-m.montante, d.total) && diasEntre(d.data!, m.data) >= -7 && diasEntre(d.data!, m.data) <= 75);
    // dois pagamentos iguais (ex.: duas compras no mesmo supermercado): fica o dos 3 dias da fatura, se for só um
    const perto = l.filter((m) => Math.abs(diasEntre(d.data!, m.data)) <= 3);
    parD.set(d.id, l.length > 1 && perto.length === 1 ? perto : l);
  }
  const parM = new Map<number, number>();
  for (const l of parD.values()) for (const m of l) parM.set(m.id, (parM.get(m.id) ?? 0) + 1);
  let despesasPagas = 0;
  for (const d of semPag) {
    const l = parD.get(d.id)!;
    if (l.length !== 1 || parM.get(l[0].id) !== 1) continue;
    const m = l[0];
    await s`update despesas set movimento_id = ${m.id}, estado = 'Pago pela empresa', pago_por = 'Empresa', atualizado_em = now() where id = ${d.id}`;
    await s`update movimentos set
      classe = case when classe = 'Por classificar' then 'Despesa' else classe end,
      categoria = coalesce(categoria, ${d.categoria}),
      casa = coalesce(casa, ${d.casa})
      where id = ${m.id}`;
    despesasPagas++;
  }

  // 2. reposições aos sócios
  const movRepos = new Set(desp.map((d) => d.reposicao_id).filter(Boolean));
  const porRepor = desp.filter((d) => d.estado === "Por repor" && !d.reposicao_id && d.data);
  let reposicoes = 0;
  const usadas = new Set<number>();
  for (const m of movs.filter((x) => x.classe === "Reposição aos sócios" && x.montante < 0 && !movRepos.has(x.id))) {
    const cand = porRepor
      .filter((d) => !usadas.has(d.id) && d.data! <= m.data && diasEntre(d.data!, m.data) <= 400)
      .sort((a, b) => (a.data! < b.data! ? 1 : -1));
    const conj = subconjuntoUnico(-m.montante, cand);
    if (!conj) continue;
    for (const d of conj) {
      usadas.add(d.id);
      await s`update despesas set reposicao_id = ${m.id}, estado = 'Reposto', atualizado_em = now() where id = ${d.id}`;
    }
    reposicoes++;
  }

  // 3. recebimentos das reservas
  const resLigadas = new Set(movs.map((m) => m.reserva_id).filter(Boolean));
  const entradas = movs.filter(
    (m) => m.montante > 0 && !m.reserva_id && (m.classe === "Por classificar" || CLASSES_RECEITA.includes(m.classe))
  );
  const livres = reservas.filter((r) => !r.cancelada && !resLigadas.has(r.id) && r.checkin && (r.total ?? 0) > 0);
  const parE = new Map<number, Reserva[]>();
  for (const m of entradas)
    parE.set(
      m.id,
      livres.filter((r) => {
        const fim = r.checkout ?? r.checkin!;
        return (
          valoresReserva(r).some((v) => igual(v, m.montante, 0.05)) &&
          m.data >= somarDias(r.checkin!, -90) &&
          m.data <= somarDias(fim, 60) &&
          (m.classe === "Receita Airbnb" ? r.plataforma === "Airbnb" : m.classe === "Receita Booking" ? r.plataforma === "Booking" : true)
        );
      })
    );
  const parR = new Map<number, number>();
  for (const l of parE.values()) for (const r of l) parR.set(r.id, (parR.get(r.id) ?? 0) + 1);
  let ligadasE = 0;
  for (const m of entradas) {
    const l = parE.get(m.id)!;
    if (l.length !== 1 || parR.get(l[0].id) !== 1) continue;
    const r = l[0];
    const classe: Classe =
      m.classe !== "Por classificar" ? m.classe : r.plataforma === "Airbnb" ? "Receita Airbnb" : r.plataforma === "Booking" ? "Receita Booking" : "Receita direta";
    await s`update movimentos set reserva_id = ${r.id}, classe = ${classe}, casa = coalesce(casa, ${r.al}) where id = ${m.id}`;
    ligadasE++;
  }

  const linhas = [
    `${despesasPagas} fatura(s) de despesa ligadas ao pagamento no banco.`,
    `${reposicoes} transferência(s) para os sócios ligadas às despesas que repõem.`,
    `${ligadasE} entrada(s) ligadas a reservas.`,
  ];
  return { despesasPagas, reposicoes, entradas: ligadasE, linhas };
}

// ---------- listas para a conferência à mão ----------

/** Despesas que podem corresponder a uma saída do banco (por proximidade de valor e data). */
export function despesasCandidatas(m: Movimento, desp: Despesa[]) {
  return desp
    .filter((d) => d.data && Math.abs(diasEntre(d.data, m.data)) <= 120)
    .map((d) => ({ d, dif: Math.abs(d.total + m.montante), dias: Math.abs(diasEntre(d.data!, m.data)) }))
    .sort((a, b) => a.dif - b.dif || a.dias - b.dias)
    .slice(0, 8)
    .map((x) => x.d);
}

/** Reservas que podem corresponder a uma entrada (por proximidade de valor e data). */
export function reservasCandidatas(m: Movimento, reservas: Reserva[]) {
  return reservas
    .filter((r) => !r.cancelada && r.checkin && m.data >= somarDias(r.checkin, -120) && m.data <= somarDias(r.checkout ?? r.checkin, 90))
    .map((r) => ({ r, dif: Math.min(...valoresReserva(r).map((v) => Math.abs(v - m.montante)), Infinity) }))
    .sort((a, b) => a.dif - b.dif)
    .slice(0, 8)
    .map((x) => x.r);
}
