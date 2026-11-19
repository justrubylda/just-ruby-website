import "server-only";
import { sql, garantirTabelas } from "./db";
import { PLATAFORMAS, diasEntre } from "./calculos";
import type { Celula, Folha } from "./ficheiros";
import { importarLote, type NovaReserva, type ResultadoLote } from "./reservas";

// Converte ficheiros exportados (Excel JUST RUBY, Airbnb, Booking) em reservas.

export type Tipo = "excel" | "airbnb" | "booking";

const norm = (s: unknown) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9%]+/g, " ")
    .trim();

const texto = (c: Celula | undefined) => {
  const v = c?.v;
  if (v == null) return "";
  return String(v).replace(/\s+/g, " ").trim();
};

export function numero(v: unknown): number | null {
  if (v == null || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  let s = String(v).replace(/[^\d,.\-]/g, "");
  if (!s || s === "-") return null;
  if (s.includes(",") && s.includes(".")) {
    s = s.lastIndexOf(",") > s.lastIndexOf(".") ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  } else if (s.includes(",")) s = s.replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

const MESES: Record<string, number> = {
  jan: 1, fev: 2, feb: 2, mar: 3, abr: 4, apr: 4, mai: 5, may: 5, jun: 6, jul: 7, ago: 8, aug: 8,
  set: 9, sep: 9, out: 10, oct: 10, nov: 11, dez: 12, dec: 12,
};
const iso = (y: number, m: number, d: number) => {
  if (y < 100) y += 2000;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
    ? dt.toISOString().slice(0, 10)
    : null;
};

/** Devolve as leituras possíveis de uma data (dd/mm e mm/dd quando é ambíguo). */
export function datas(v: unknown): string[] {
  if (v == null || v === "") return [];
  if (typeof v === "number") {
    if (v > 20000 && v < 80000) return [new Date(Date.UTC(1899, 11, 30) + Math.round(v) * 86_400_000).toISOString().slice(0, 10)];
    return [];
  }
  const s = norm(v);
  let m = s.match(/(\d{4}) (\d{1,2}) (\d{1,2})/);
  if (m) return [iso(+m[1], +m[2], +m[3])].filter(Boolean) as string[];
  m = s.match(/(\d{1,2}) (\d{1,2}) (\d{2,4})/);
  if (m) {
    const a = +m[1], b = +m[2], y = +m[3];
    return [...new Set([iso(y, b, a), iso(y, a, b)].filter(Boolean) as string[])];
  }
  m = s.match(/(\d{1,2}) (?:de )?([a-z]{3})[a-z]* (?:de )?(\d{4})/);
  if (m && MESES[m[2]]) return [iso(+m[3], MESES[m[2]], +m[1])].filter(Boolean) as string[];
  m = s.match(/([a-z]{3})[a-z]* (\d{1,2}) (\d{4})/);
  if (m && MESES[m[1]]) return [iso(+m[3], MESES[m[1]], +m[2])].filter(Boolean) as string[];
  return [];
}

/** Escolhe as datas de entrada/saída coerentes com as noites (resolve dd/mm vs mm/dd). */
function escolherDatas(a: string[], b: string[], noites: number | null): [string | null, string | null] {
  let melhor: [string | null, string | null] = [a[0] ?? null, b[0] ?? null];
  let pior = Infinity;
  for (const x of a.length ? a : [null]) {
    for (const y of b.length ? b : [null]) {
      let custo = 0;
      if (x && y) {
        const d = diasEntre(x, y);
        custo = d <= 0 ? 1000 : noites ? Math.abs(d - noites) : 0;
      }
      if (custo < pior) {
        pior = custo;
        melhor = [x, y];
      }
    }
  }
  if (melhor[0] && !melhor[1] && noites) {
    const d = new Date(`${melhor[0]}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + noites);
    melhor[1] = d.toISOString().slice(0, 10);
  }
  return melhor;
}

/** Descobre o alojamento a partir do nome do anúncio. */
export function alDeTexto(t: string, nomes: string[]): string | null {
  const n = norm(t);
  if (!n) return null;
  for (const nome of nomes) if (n.includes(norm(nome))) return nome;
  if (/kingdom|stone|tomar|olalhas/.test(n)) return nomes.find((x) => /kingdom/i.test(x)) ?? null;
  if (/cantinho|varzea|santarem|nosso/.test(n)) return nomes.find((x) => /cantinho/i.test(x)) ?? null;
  if (/torras|grainho/.test(n)) return nomes.find((x) => /torras/i.test(x)) ?? null;
  return null;
}

// ---------- detetar o tipo de ficheiro ----------

type Cabecalho = { linha: number; col: Map<string, number> };

function procurarCabecalho(f: Folha, obrigatorios: string[][]): Cabecalho | null {
  for (let i = 0; i < Math.min(f.linhas.length, 15); i++) {
    const col = new Map<string, number>();
    f.linhas[i]?.forEach((c, j) => {
      const k = norm(c.v);
      if (k && !col.has(k)) col.set(k, j);
    });
    if (obrigatorios.every((alts) => alts.some((a) => col.has(a)))) return { linha: i, col };
  }
  return null;
}

const pegar = (cab: Cabecalho, linha: Celula[], nomes: string[]) => {
  for (const n of nomes) {
    const j = cab.col.get(n);
    if (j != null) return linha[j];
  }
  return undefined;
};

const H = {
  excel: { checkin: ["check in"], hospede: ["hospede cliente"], total: ["total c iva"] },
  airbnb: {
    codigo: ["confirmation code", "codigo de confirmacao", "codigo de confirmacao da reserva", "codigo da reserva"],
    tipo: ["type", "tipo"],
    inicio: ["start date", "data de inicio", "data de check in", "check in"],
    fim: ["end date", "data de termino", "data de fim", "data de saida", "data de check out", "check out"],
    noites: ["nights", "noites"],
    hospede: ["guest", "hospede"],
    anuncio: ["listing", "anuncio"],
    valor: ["amount", "montante", "valor", "quantia"],
    taxa: ["service fee", "host fee", "taxa de servico", "taxa de servico do anfitriao", "comissao"],
    limpeza: ["cleaning fee", "taxa de limpeza"],
    bruto: ["gross earnings", "ganhos brutos", "rendimentos brutos", "receita bruta"],
  },
  booking: {
    numero: ["book number", "reservation number", "numero da reserva", "n da reserva", "numero de reserva"],
    reservadoPor: ["booked by", "reservado por"],
    hospede: ["guest name s", "guest name", "guest names", "nome s do s hospede s", "nome do hospede", "nomes dos hospedes", "hospede"],
    entrada: ["check in", "chegada", "data de chegada"],
    saida: ["check out", "partida", "data de partida", "saida"],
    estado: ["status", "estado"],
    preco: ["price", "preco", "valor", "total"],
    comissao: ["commission amount", "valor da comissao", "comissao", "montante da comissao"],
    noites: ["duration nights", "duracao noites", "noites"],
    pessoas: ["persons", "people", "pessoas"],
    propriedade: ["property name", "nome da propriedade", "propriedade", "unit type", "tipo de unidade"],
    morada: ["address", "morada", "endereco"],
    telefone: ["phone number", "numero de telefone", "telefone"],
  },
};

export function detetar(folhas: Folha[]): { tipo: Tipo; folha: Folha; cab: Cabecalho } | null {
  for (const f of folhas) {
    const c = procurarCabecalho(f, [H.excel.checkin, H.excel.hospede, H.excel.total]);
    if (c) return { tipo: "excel", folha: f, cab: c };
  }
  for (const f of folhas) {
    const c = procurarCabecalho(f, [H.airbnb.codigo, H.airbnb.valor]);
    if (c) return { tipo: "airbnb", folha: f, cab: c };
    const b = procurarCabecalho(f, [H.booking.numero, H.booking.entrada]);
    if (b) return { tipo: "booking", folha: f, cab: b };
  }
  return null;
}

// ---------- conversores ----------

function deExcel(f: Folha, cab: Cabecalho): NovaReserva[] {
  const g = (l: Celula[], h: string) => pegar(cab, l, [h]);
  const out: NovaReserva[] = [];
  for (const l of f.linhas.slice(cab.linha + 1)) {
    if (!l) continue;
    const checkin = datas(g(l, "check in")?.v)[0] ?? null;
    const hospede = texto(g(l, "hospede cliente"));
    if (!checkin && !hospede) continue;
    const noitesC = g(l, "noites");
    const recebC = g(l, "recebido");
    const fatura = texto(g(l, "n fatura"));
    const taxa = numero(g(l, "taxa iva")?.v);
    out.push({
      checkin,
      checkout: datas(g(l, "check out")?.v)[0] ?? null,
      noites: noitesC && !noitesC.f ? numero(noitesC.v) : null,
      al: texto(g(l, "al")) || null,
      plataforma: texto(g(l, "plataforma")) || null,
      hospede: hospede || null,
      nif: texto(g(l, "nif")) || null,
      morada: texto(g(l, "morada contacto")) || null,
      cod_reserva: texto(g(l, "cod reserva")) || null,
      total: numero(g(l, "total c iva")?.v),
      comissao: numero(g(l, "comissao")?.v),
      recebido: recebC && !recebC.f ? numero(recebC.v) : null,
      limpeza: numero(g(l, "limpeza")?.v),
      taxa_iva: taxa == null ? 0.06 : taxa > 1 ? taxa / 100 : taxa,
      fatura: fatura || null,
      recibo: texto(g(l, "n recibo")) || null,
      notas: texto(g(l, "notas")) || null,
      origem: texto(g(l, "origem")) || null,
      fonte: "excel",
    });
  }
  return out;
}

function deAirbnb(f: Folha, cab: Cabecalho, alForcado: string | null, nomesAL: string[], avisos: string[]): NovaReserva[] {
  const A = H.airbnb;
  const porCodigo = new Map<string, NovaReserva>();
  for (const l of f.linhas.slice(cab.linha + 1)) {
    if (!l) continue;
    const codigo = texto(pegar(cab, l, A.codigo)).toUpperCase();
    const tipo = norm(pegar(cab, l, A.tipo)?.v);
    if (!codigo || (tipo && !/reserv/.test(tipo))) continue;
    const noites = numero(pegar(cab, l, A.noites)?.v);
    const [checkin, checkout] = escolherDatas(datas(pegar(cab, l, A.inicio)?.v), datas(pegar(cab, l, A.fim)?.v), noites);
    const valor = numero(pegar(cab, l, A.valor)?.v) ?? 0;
    const taxa = Math.abs(numero(pegar(cab, l, A.taxa)?.v) ?? 0);
    const bruto = numero(pegar(cab, l, A.bruto)?.v);
    const al = alForcado ?? alDeTexto(texto(pegar(cab, l, A.anuncio)), nomesAL);
    const ant = porCodigo.get(codigo);
    if (ant) {
      // ajustes/alterações à mesma reserva somam-se
      ant.total = (ant.total ?? 0) + (bruto ?? valor + taxa);
      ant.comissao = (ant.comissao ?? 0) + taxa;
      continue;
    }
    if (!al) avisos.push(`Airbnb ${codigo}: não consegui saber o alojamento pelo anúncio — escolha-o no formulário.`);
    porCodigo.set(codigo, {
      checkin,
      checkout,
      noites: checkin && checkout && noites && diasEntre(checkin, checkout) !== noites ? noites : null,
      al,
      plataforma: "Airbnb",
      hospede: texto(pegar(cab, l, A.hospede)) || null,
      cod_reserva: codigo,
      total: bruto ?? valor + taxa,
      comissao: taxa || null,
      limpeza: null,
      taxa_iva: 0.06,
      fonte: "csv-airbnb",
      notas: "Importada do CSV do Airbnb",
    });
  }
  return [...porCodigo.values()];
}

function deBooking(f: Folha, cab: Cabecalho, alForcado: string | null, nomesAL: string[], avisos: string[]): NovaReserva[] {
  const B = H.booking;
  const out: NovaReserva[] = [];
  for (const l of f.linhas.slice(cab.linha + 1)) {
    if (!l) continue;
    const numeroReserva = texto(pegar(cab, l, B.numero));
    if (!numeroReserva) continue;
    if (/cancel/.test(norm(pegar(cab, l, B.estado)?.v))) continue;
    const noites = numero(pegar(cab, l, B.noites)?.v);
    const [checkin, checkout] = escolherDatas(datas(pegar(cab, l, B.entrada)?.v), datas(pegar(cab, l, B.saida)?.v), noites);
    const al = alForcado ?? alDeTexto(texto(pegar(cab, l, B.propriedade)), nomesAL);
    if (!al) avisos.push(`Booking ${numeroReserva}: escolha o alojamento no formulário (o ficheiro não o indica).`);
    const telefone = texto(pegar(cab, l, B.telefone));
    out.push({
      checkin,
      checkout,
      al,
      plataforma: "Booking",
      hospede: texto(pegar(cab, l, B.hospede)) || texto(pegar(cab, l, B.reservadoPor)) || null,
      morada: [texto(pegar(cab, l, B.morada)), telefone].filter(Boolean).join(" · ") || null,
      cod_reserva: numeroReserva,
      hospedes: numero(pegar(cab, l, B.pessoas)?.v),
      total: numero(pegar(cab, l, B.preco)?.v),
      comissao: numero(pegar(cab, l, B.comissao)?.v),
      taxa_iva: 0.06,
      fonte: "csv-booking",
      notas: "Importada da exportação do Booking",
    });
  }
  return out;
}

/** Textos das faturas na folha "Listas" do Excel (alojamento, antes do check-in, antes do check-out, final). */
async function importarListas(folhas: Folha[]) {
  const f = folhas.find((x) => norm(x.nome) === "listas");
  if (!f) return 0;
  let n = 0;
  for (let i = 4; i < Math.min(f.linhas.length, 30); i++) {
    const l = f.linhas[i] ?? [];
    const nome = texto(l[0]);
    if (!nome || norm(nome) === "plataformas") continue;
    const [a, b, c] = [l[1], l[2], l[3]].map((x) => (x?.v == null ? "" : String(x.v)));
    if (!a) continue;
    await sql()`insert into alojamentos (nome, ordem, antes_entrada, antes_saida, final)
      values (${nome}, ${i}, ${a}, ${b}, ${c})
      on conflict (nome) do update set antes_entrada = excluded.antes_entrada,
        antes_saida = excluded.antes_saida, final = excluded.final`;
    n++;
  }
  return n;
}

export async function importarFolhas(
  folhas: Folha[],
  alForcado: string | null,
  nomesAL: string[]
): Promise<ResultadoLote & { tipo: Tipo; lidas: number }> {
  await garantirTabelas();
  const d = detetar(folhas);
  if (!d)
    throw new Error(
      "Não reconheci o ficheiro. Aceito: o Excel Faturacao_JustRuby.xlsx, o CSV de ganhos do Airbnb ou a lista de reservas exportada do Booking."
    );
  const avisos: string[] = [];
  let novas: NovaReserva[];
  if (d.tipo === "excel") {
    novas = deExcel(d.folha, d.cab);
    const t = await importarListas(folhas);
    if (t) avisos.push(`Textos das faturas atualizados para ${t} alojamento(s).`);
  } else if (d.tipo === "airbnb") novas = deAirbnb(d.folha, d.cab, alForcado, nomesAL, avisos);
  else novas = deBooking(d.folha, d.cab, alForcado, nomesAL, avisos);
  for (const n of novas) if (n.plataforma && !PLATAFORMAS.includes(n.plataforma)) n.plataforma = "Outro";
  const r = await importarLote(novas);
  return { ...r, avisos: [...avisos.slice(0, 15), ...r.avisos], tipo: d.tipo, lidas: novas.length };
}
