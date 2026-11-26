// Despesas e banco: listas e tipos usados no servidor e nos formulários (sem base de dados).

export const NIF_EMPRESA = "518785483";
export const GERAL = "Geral"; // despesa que não é de uma casa em particular

export const CATEGORIAS = [
  "Limpeza e lavandaria",
  "Eletricidade",
  "Água",
  "Gás e combustível",
  "Telecomunicações",
  "Seguros",
  "Obras e manutenção",
  "Equipamento e mobiliário",
  "Consumíveis e supermercado",
  "Jardim e piscina",
  "Software e subscrições",
  "Contabilidade",
  "Comissões das plataformas",
  "Banco",
  "Impostos e taxas",
  "Deslocações",
  "Compra de viatura",
  "Refeições",
  "Rendas",
  "Outros",
];

export const ESTADOS_DESPESA = ["Pendente", "Pago pela empresa", "Por repor", "Reposto"] as const;
export type EstadoDespesa = (typeof ESTADOS_DESPESA)[number];

export const PAGO_POR = ["Empresa", "Bruno", "Rúbia"];
/** Onde pode ter ficado um recebimento que não entrou na conta da empresa. */
export const RECEBIDO_POR = ["Conta em comum", "Bruno", "Rúbia"];

/** O que é cada movimento do banco. */
export const CLASSES = [
  "Por classificar",
  "Despesa",
  "Receita Airbnb",
  "Receita Booking",
  "Receita direta",
  "Reposição aos sócios",
  "Entrada dos sócios",
  "Impostos e Estado",
  "Transferência interna",
  "Particular",
  "Outro",
] as const;
export type Classe = (typeof CLASSES)[number];
export const CLASSES_RECEITA: readonly string[] = ["Receita Airbnb", "Receita Booking", "Receita direta"];

export type Despesa = {
  id: number;
  data: string | null;
  fornecedor: string | null;
  nif_fornecedor: string | null;
  documento: string | null;
  nif_cliente: string | null;
  /** Localidade da compra (do extrato, nas compras com cartão, ou da morada na fatura). */
  cidade: string | null;
  casa: string | null;
  categoria: string | null;
  base: number | null;
  iva: number | null;
  /** IVA dedutível quando não é o IVA todo da fatura (vazio = regra normal). */
  iva_dedutivel: number | null;
  total: number;
  pago_por: string;
  estado: EstadoDespesa;
  movimento_id: number | null;
  reposicao_id: number | null;
  ficheiro: string | null;
  notas: string | null;
  origem: string | null;
};

export type Movimento = {
  id: number;
  conta: string;
  data: string;
  data_valor: string | null;
  descricao: string;
  montante: number;
  saldo: number | null;
  classe: Classe;
  categoria: string | null;
  casa: string | null;
  reserva_id: number | null;
  /** Mais uma parte do pagamento desta despesa (a despesa tem várias saídas no banco). */
  parte_de: number | null;
  notas: string | null;
  manual: boolean;
  origem: string | null;
};

export type Regra = {
  id: number;
  texto: string;
  sentido: "entrada" | "saida" | null;
  classe: Classe;
  categoria: string | null;
  casa: string | null;
  ordem: number;
};

export const CORES_ESTADO: Record<EstadoDespesa, string> = {
  Pendente: "bg-[#fde8b8] text-[#7a4b00]",
  "Pago pela empresa": "bg-[#e3f1e5] text-[#1f5f2b]",
  "Por repor": "bg-[#f6e0dd] text-[#8a2b1f]",
  Reposto: "bg-[#e3ecf7] text-[#1f4e79]",
};

/**
 * IVA que a empresa pode deduzir: só faturas com o NIF da empresa; o valor indicado na despesa
 * quando é só uma parte (ex.: viatura ligeira a GPL, 50% — art. 21.º do CIVA).
 */
export const dedutivel = (d: Pick<Despesa, "nif_cliente" | "iva"> & { iva_dedutivel?: number | null }) =>
  (d.nif_cliente ?? "").replace(/\D/g, "") === NIF_EMPRESA ? d.iva_dedutivel ?? d.iva ?? 0 : 0;

/** Texto normalizado para comparar descrições (maiúsculas, sem acentos nem pontuação). */
export function normalizar(s: string | null | undefined) {
  return String(s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .trim();
}

/** A regra aplica-se se o texto aparecer como palavra(s) inteira(s) na descrição. */
export function regraServe(r: Pick<Regra, "texto" | "sentido">, m: Pick<Movimento, "descricao" | "montante">) {
  if (r.sentido === "entrada" && m.montante <= 0) return false;
  if (r.sentido === "saida" && m.montante >= 0) return false;
  const t = normalizar(r.texto);
  if (!t) return false;
  return ` ${normalizar(m.descricao)} `.includes(` ${t} `);
}

const GENERICAS = new Set([
  "COMPRA", "COMPRAS", "TRF", "TRANSF", "TRANSFERENCIA", "P", "DE", "PARA", "DD", "DEB", "DEBITO", "DIRETO", "DIRECTO",
  "PAG", "PAGAMENTO", "PAGAMENTOS", "SERV", "SERVICOS", "MB", "WAY", "MBWAY", "CARTAO", "CRT", "TPA", "LEV", "LEVANTAMENTO",
  "SEPA", "CR", "CRED", "CREDITO", "IMEDIATA", "INST", "ONLINE", "APPLE", "PAY", "GOOGLE", "VISA", "ELECTRON",
]);

/** Sugere o texto de uma regra a partir da descrição (tira palavras como COMPRA, TRF, números do cartão). */
// ---------- localidade das despesas ----------

/** Localidades conhecidas (nome como se escreve) e outras formas de as encontrar no texto (OCR, extrato). */
const LOCALIDADES: [string, RegExp?][] = [
  ["Santarém", /\bSA[MN]TAR(?:E\s?M|\s?M|EN)O?\b/],
  ["Várzea", /\bVAR\s?ZEA\b|\bROMEIRA\b/],
  ["Almeirim", /\bALMEIR?I?M\b/],
  ["Alpiarça", /\bALPIARCA\b/],
  ["Alcanede"],
  ["Perofilho", /\bPEROFI[L]?[I]?HO\b/],
  ["Arneiro de Tremês", /\bARNEIRO DE TREMES\b/],
  ["Cartaxo"],
  ["Rio Maior"],
  ["Aveiras de Cima", /\bAVEIRAS\s+DE\s+CIMA\b/],
  ["Tomar", /\bTOMAR\b|\bTONAR\b/],
  ["Olalhas"],
  ["Ferreira do Zêzere", /\bFE[R]?REIRA\s+C?[DL]?L?O\s+ZEZERE\b/],
  ["Torres Novas"],
  ["Entroncamento"],
  ["Abrantes"],
  ["Ourém", /\bOUREM\b/],
  ["Fátima", /\bFATIMA\b/],
  ["Linda-a-Velha", /\bLINDA A ?VELHA/],
  ["Algés", /\bALGES\b/],
  ["Carnaxide", /\b[CL]ARNAXIDE\b/],
  ["Alfragide"],
  ["Oeiras"],
  ["Paço de Arcos", /\bPACO DE ARCOS\b/],
  ["Queluz"],
  ["Mem Martins"],
  ["Sintra"],
  ["Cascais"],
  ["Carcavelos"],
  ["Golegã", /\bGOLEGA\b/],
  ["Seixal"],
  ["Matosinhos", /\bMATOSINHOS\b|\bSENHORA DA HORA\b/],
  ["Faro"],
  ["Amadora"],
  ["Odivelas"],
  ["Frielas"],
  ["Loures"],
  ["Lisboa", /\b(LISBOA|LTSBOA|ITSBOA|LISTBOA|LISB|LSBO)\b/],
  ["Vila Nova de Gaia", /\bVILA\s+NOVA\s+DE(\s+GA)?|\bGAIA\b/],
  ["Maia"],
  ["Porto"],
  ["Castro Daire"],
  ["Alcobaça", /\bALCOBACA\b/],
  ["Gafanha da Nazaré", /\bGAFANHA DA NAZARE\b/],
  ["Coimbra"],
  ["Leiria"],
  ["Setúbal", /\bSETUBAL\b/],
  ["Almada"],
];

export const NOMES_LOCALIDADES = LOCALIDADES.map(([n]) => n);

/**
 * A localidade conhecida que aparece no texto. Numa morada ("VILA NOVA DE GAIA - PORTO") vale a primeira;
 * no extrato ("LOJA SANTAREM  SANTAREM  PRT") vale a última, que vem depois do nome da loja.
 */
export function cidadeDeTexto(texto: string | null | undefined, lado: "primeira" | "ultima" = "primeira"): string | null {
  const n = normalizar(texto);
  if (!n) return null;
  let melhor: { nome: string; ini: number; fim: number } | null = null;
  for (const [nome, re] of LOCALIDADES) {
    const r = re ?? new RegExp(`\\b${normalizar(nome)}\\b`);
    const todas = [...n.matchAll(new RegExp(r.source, "g"))];
    const m = lado === "ultima" ? todas.at(-1) : todas[0];
    if (!m || m.index == null) continue;
    const ini = m.index;
    const fim = ini + m[0].length;
    const melhorQue = !melhor || (lado === "ultima" ? fim > melhor.fim : ini < melhor.ini) || (ini === melhor.ini && fim > melhor.fim);
    if (melhorQue) melhor = { nome, ini, fim };
  }
  return melhor?.nome ?? null;
}

/** Compras com cartão no extrato do Millennium: "LOJA  CIDADE  PRT". Só estas dizem onde foi a compra. */
export function cidadeDoMovimento(descricao: string | null | undefined) {
  const d = String(descricao ?? "").trim();
  if (!/PRT$/i.test(d)) return null;
  return cidadeDeTexto(d.replace(/\s*PRT$/i, "").slice(-32), "ultima");
}

export function sugerirTextoRegra(descricao: string) {
  const palavras = normalizar(descricao)
    .split(" ")
    .filter((p) => p && !GENERICAS.has(p) && !/^\d+$/.test(p));
  return palavras.slice(0, 2).join(" ");
}
