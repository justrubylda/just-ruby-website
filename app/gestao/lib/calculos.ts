// Contas da faturação (as mesmas da folha Excel). Sem acesso à base de dados:
// usado no servidor e no formulário (para mostrar os valores enquanto se escreve).

export const PLATAFORMAS = ["Airbnb", "Booking", "Site", "Direto", "Contrato", "VRBO", "Homeway", "Outro", "N/D"];
export const TAXAS_IVA = [0.06, 0, 0.13, 0.23];
export const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export type Reserva = {
  id: number;
  checkin: string | null;
  checkout: string | null;
  noites: number | null; // escrito à mão; vazio = calculado pelas datas
  al: string | null;
  plataforma: string | null;
  hospede: string | null;
  nif: string | null;
  morada: string | null;
  cod_reserva: string | null;
  hospedes: number | null;
  total: number | null; // valor da estadia c/ IVA (o que se fatura)
  comissao: number | null;
  recebido: number | null; // escrito à mão; vazio = total − comissão
  limpeza: number | null;
  taxa_iva: number;
  fatura: string | null;
  recibo: string | null;
  notas: string | null;
  origem: string | null;
  fonte: string | null;
  ical_uid: string | null;
  pedido_id: number | null;
  cancelada: boolean;
  /** Quem recebeu o pagamento quando não entrou na conta da empresa (ex.: "Bruno"); "Empresa" = ainda sem extrato. */
  recebido_por?: string | null;
  /** false: quem recebeu é só uma referência, ainda por confirmar. */
  recebido_confirmado?: boolean;
};

export type Estado = "Faturado" | "Por faturar" | "Futura" | "Sem fatura" | "Cancelada";

export type Alojamento = {
  nome: string;
  ordem: number;
  antes_entrada: string;
  antes_saida: string;
  final: string;
  wifi_rede?: string;
  wifi_senha?: string;
};

export type Calculo = {
  noites: number;
  recebido: number;
  base: number;
  iva: number;
  liquido: number;
  porNoite: number | null;
  estado: Estado;
  ano: number | null;
  mes: number | null;
  faltaValor: boolean;
};

const r2 = (n: number) => Math.round(n * 100) / 100;

export function diasEntre(a: string, b: string) {
  return Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86_400_000);
}

export function hojeISO() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Lisbon" }).format(new Date());
}

export const semFatura = (f: string | null | undefined) => (f ?? "").trim().toLowerCase() === "sem fatura";

export function calcular(r: Reserva, hoje = hojeISO()): Calculo {
  const noites =
    r.noites ?? (r.checkin && r.checkout ? Math.max(0, diasEntre(r.checkin, r.checkout)) : 0);
  const total = r.total ?? 0;
  const comissao = r.comissao ?? 0;
  const recebido = r.recebido ?? total - comissao;
  const base = total / (1 + (r.taxa_iva ?? 0));
  const iva = total - base;
  const liquido = recebido - iva - (r.limpeza ?? 0);
  let estado: Estado;
  if (r.cancelada) estado = "Cancelada";
  else if (semFatura(r.fatura)) estado = "Sem fatura";
  else if ((r.fatura ?? "").trim()) estado = "Faturado";
  else if ((r.checkout ?? r.checkin ?? "9999") > hoje || (r.checkin ?? "9999") > hoje) estado = "Futura";
  else estado = "Por faturar";
  return {
    noites,
    recebido: r2(recebido),
    base: r2(base),
    iva: r2(iva),
    liquido: r2(liquido),
    porNoite: noites > 0 && r.total != null ? r2(total / noites) : null,
    estado,
    ano: r.checkin ? Number(r.checkin.slice(0, 4)) : null,
    mes: r.checkin ? Number(r.checkin.slice(5, 7)) : null,
    faltaValor: r.total == null && !r.cancelada,
  };
}

export const dataPT = (iso: string | null | undefined) => (iso ? iso.split("-").reverse().join("/") : "");

/** Texto pronto a copiar para a fatura, montado com os textos do alojamento. */
export function descricaoFatura(r: Pick<Reserva, "al" | "checkin" | "checkout">, als: Alojamento[]) {
  const a = als.find((x) => x.nome === r.al);
  if (!a || !r.checkin) return "";
  let t = `${a.antes_entrada} ${dataPT(r.checkin)}`;
  if (r.checkout) t += `${a.antes_saida} ${dataPT(r.checkout)}`;
  return t + a.final;
}

// ---------- CentralGest Cloud (programa de faturação) ----------
// Sem API no plano atual: a fatura emite-se lá à mão, com estes dados copiados da gestão.

export const CENTRALGEST_VENDAS = "https://espaco-visual.centralgestcloud.com:9000/#/portal/erp/vendas";

/** Artigos tal como estão no CentralGest (Artigos), todos com IVA a 6 %. */
export function artigoCentralGest(al: string | null | undefined) {
  if (al === "Kingdom of Stone") return { codigo: "000001", nome: "Estadia Kingdom" };
  if (al === "Nosso Cantinho") return { codigo: "000002", nome: "Estadia Nosso Cantinho" };
  if (al === "Torras") return { codigo: "004", nome: "Cedencia" };
  return { codigo: "003", nome: "Estadia" };
}

/** Número à portuguesa, sem símbolo (para colar nos campos do CentralGest). */
export const numPT = (n: number, casas = 2) =>
  new Intl.NumberFormat("pt-PT", { minimumFractionDigits: casas, maximumFractionDigits: casas, useGrouping: false }).format(n);

/** Preço sem IVA com 4 casas, para o total da fatura bater certo com o valor recebido. */
export const precoSemIva = (r: Pick<Reserva, "total" | "taxa_iva">) =>
  r.total == null ? null : Math.round((r.total / (1 + (r.taxa_iva ?? 0))) * 10_000) / 10_000;

export const eur = (n: number | null | undefined, casas = 2) =>
  n == null
    ? "—"
    : new Intl.NumberFormat("pt-PT", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: casas,
        maximumFractionDigits: casas,
      }).format(n);

export const inteiro = (n: number) => new Intl.NumberFormat("pt-PT").format(n);
export const pct = (n: number | null) =>
  n == null ? "—" : new Intl.NumberFormat("pt-PT", { style: "percent", maximumFractionDigits: 1 }).format(n);

// ---------- resumos para o painel ----------

export type Linha = { reservas: number; noites: number; total: number; comissao: number; recebido: number; iva: number; limpeza: number; liquido: number };
const vazia = (): Linha => ({ reservas: 0, noites: 0, total: 0, comissao: 0, recebido: 0, iva: 0, limpeza: 0, liquido: 0 });

function somar(l: Linha, r: Reserva, c: Calculo) {
  l.reservas += 1;
  l.noites += c.noites;
  l.total += r.total ?? 0;
  l.comissao += r.comissao ?? 0;
  l.recebido += r.total == null && r.recebido == null ? 0 : c.recebido;
  l.iva += c.iva;
  l.limpeza += r.limpeza ?? 0;
  l.liquido += r.total == null && r.recebido == null ? 0 : c.liquido;
}

export type Resumo = {
  geral: Linha;
  meses: Linha[];
  plataformas: { nome: string; l: Linha }[];
  alojamentos: { nome: string; l: Linha }[];
  anos: { ano: number; l: Linha }[];
  porFaturar: { r: Reserva; c: Calculo }[];
};

export function resumir(todas: Reserva[], ano: number, al: string, nomesAL: string[]): Resumo {
  const hoje = hojeISO();
  const comCalc = todas.filter((r) => !r.cancelada).map((r) => ({ r, c: calcular(r, hoje) }));
  const doAL = (r: Reserva) => al === "Todos" || r.al === al;
  const geral = vazia();
  const meses = Array.from({ length: 12 }, vazia);
  const plat = new Map<string, Linha>(PLATAFORMAS.map((p) => [p, vazia()]));
  const als = new Map<string, Linha>(nomesAL.map((n) => [n, vazia()]));
  const anosMap = new Map<number, Linha>();
  const porFaturar: { r: Reserva; c: Calculo }[] = [];
  for (const { r, c } of comCalc) {
    if (c.ano == null) continue;
    if (doAL(r)) {
      if (!anosMap.has(c.ano)) anosMap.set(c.ano, vazia());
      somar(anosMap.get(c.ano)!, r, c);
    }
    if (c.ano !== ano) continue;
    const nomeAL = r.al || "(sem alojamento)";
    if (!als.has(nomeAL)) als.set(nomeAL, vazia());
    somar(als.get(nomeAL)!, r, c);
    if (!doAL(r)) continue;
    somar(geral, r, c);
    somar(meses[(c.mes ?? 1) - 1], r, c);
    const p = r.plataforma || "N/D";
    if (!plat.has(p)) plat.set(p, vazia());
    somar(plat.get(p)!, r, c);
    if (c.estado === "Por faturar") porFaturar.push({ r, c });
  }
  return {
    geral,
    meses,
    plataformas: [...plat].map(([nome, l]) => ({ nome, l })),
    alojamentos: [...als].map(([nome, l]) => ({ nome, l })),
    anos: [...anosMap].sort((a, b) => a[0] - b[0]).map(([ano, l]) => ({ ano, l })),
    porFaturar,
  };
}
