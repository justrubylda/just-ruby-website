import "server-only";
import { garantirTabelas, sql } from "./db";
import type { Alojamento, Reserva } from "./calculos";

export const CAMPOS = [
  "checkin", "checkout", "noites", "al", "plataforma", "hospede", "nif", "morada", "cod_reserva",
  "hospedes", "total", "comissao", "recebido", "limpeza", "taxa_iva", "fatura", "recibo", "notas",
  "origem", "fonte", "ical_uid", "pedido_id", "cancelada",
] as const;
export type Campo = (typeof CAMPOS)[number];
export type NovaReserva = Partial<Pick<Reserva, Campo>>;

export async function listarReservas(): Promise<Reserva[]> {
  await garantirTabelas();
  return (await sql()`select * from reservas order by checkin nulls last, id`) as unknown as Reserva[];
}

export async function obterReserva(id: number): Promise<Reserva | null> {
  await garantirTabelas();
  const [r] = await sql()`select * from reservas where id = ${id}`;
  return (r as unknown as Reserva) ?? null;
}

export async function listarAlojamentos(): Promise<Alojamento[]> {
  await garantirTabelas();
  return (await sql()`select * from alojamentos order by ordem, nome`) as unknown as Alojamento[];
}

function limpar(dados: NovaReserva) {
  const o: Record<string, unknown> = {};
  for (const k of CAMPOS) if (k in dados) o[k] = (dados as Record<string, unknown>)[k] ?? null;
  return o;
}

export async function criarReserva(dados: NovaReserva) {
  await garantirTabelas();
  const o = limpar(dados);
  const [r] = await sql()`insert into reservas ${sql()(o)} returning id`;
  return r.id as number;
}

export async function atualizarReserva(id: number, dados: NovaReserva) {
  await garantirTabelas();
  const o = { ...limpar(dados), atualizado_em: new Date() };
  await sql()`update reservas set ${sql()(o)} where id = ${id}`;
}

export async function apagarReserva(id: number) {
  await garantirTabelas();
  await sql()`delete from reservas where id = ${id}`;
}

// ---------- juntar dados vindos de fora (Excel, CSV, calendários, site) ----------

export type ResultadoLote = { novas: number; completadas: number; existentes: number; ignoradas: number; avisos: string[] };

function diaSeguinte(iso: string) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}
const fimDe = (r: NovaReserva | Reserva) =>
  r.checkout && r.checkin && r.checkout > r.checkin ? r.checkout : diaSeguinte(r.checkin!);
const sobrepoe = (a: NovaReserva | Reserva, b: NovaReserva | Reserva) =>
  Boolean(a.checkin && b.checkin) && a.checkin! < fimDe(b) && b.checkin! < fimDe(a);

const ehEsboco = (x: Reserva) => x.fonte === "ical" && x.total == null && !x.fatura;

/** Procura uma reserva que já exista para os mesmos dados (para não duplicar). */
export function encontrar(nova: NovaReserva, existentes: Reserva[]): Reserva | undefined {
  const ativas = existentes.filter((e) => !e.cancelada);
  // esboço criado pelo calendário (só datas) para a mesma estadia
  const esboco = () =>
    nova.al && nova.checkin ? ativas.find((x) => ehEsboco(x) && x.al === nova.al && sobrepoe(x, nova)) : undefined;
  if (nova.origem) {
    // linhas do Excel: cada uma tem a sua origem (folha e linha) — só se juntam a esboços do calendário
    return existentes.find((x) => x.origem === nova.origem) ?? esboco();
  }
  if (nova.ical_uid) {
    const e = existentes.find((x) => x.ical_uid === nova.ical_uid);
    if (e) return e;
  }
  if (nova.cod_reserva) {
    const e = ativas.find((x) => x.cod_reserva && x.cod_reserva.toUpperCase() === nova.cod_reserva!.toUpperCase());
    if (e) return e;
  }
  if (nova.al && nova.checkin) {
    const mesmoDia = ativas.find((x) => x.al === nova.al && x.checkin === nova.checkin);
    if (mesmoDia) return mesmoDia;
    // do calendário ou do CSV: reservas do mesmo alojamento que se sobrepõem são a mesma estadia
    if (nova.fonte === "ical" || nova.fonte?.startsWith("csv")) return ativas.find((x) => x.al === nova.al && sobrepoe(x, nova));
  }
  return undefined;
}

/** Campos que uma importação pode completar numa reserva já existente (só se estiverem vazios). */
const COMPLETAVEIS: Campo[] = [
  "checkout", "hospede", "nif", "morada", "cod_reserva", "hospedes", "total", "comissao", "limpeza", "ical_uid", "plataforma",
];

export async function importarLote(novas: NovaReserva[], substituirNomeGenerico = true): Promise<ResultadoLote> {
  await garantirTabelas();
  const existentes = await listarReservas();
  const res: ResultadoLote = { novas: 0, completadas: 0, existentes: 0, ignoradas: 0, avisos: [] };
  const inserir: Record<string, unknown>[] = [];
  for (const n of novas) {
    if (!n.checkin && !n.hospede) {
      res.ignoradas++;
      continue;
    }
    const e = encontrar(n, existentes);
    if (!e) {
      const o = limpar(n);
      inserir.push(o);
      existentes.push({ ...(o as unknown as Reserva), id: -1, cancelada: false, taxa_iva: n.taxa_iva ?? 0.06 });
      continue;
    }
    const mudar: Record<string, unknown> = {};
    const igual = (a: unknown, b: unknown) => (a ?? "") === (b ?? "") || (typeof a === "number" && Number(a) === Number(b));
    if (ehEsboco(e)) {
      // o esboço do calendário só tinha datas: fica com tudo o que vem de novo
      for (const k of CAMPOS) {
        const novo = (n as Record<string, unknown>)[k];
        if (novo == null || novo === "" || k === "ical_uid" || k === "cancelada") continue;
        if (!igual((e as Record<string, unknown>)[k], novo)) mudar[k] = novo;
      }
    } else {
      for (const k of COMPLETAVEIS) {
        const atual = (e as Record<string, unknown>)[k];
        const novo = (n as Record<string, unknown>)[k];
        if (novo == null || novo === "" || igual(atual, novo)) continue;
        const generico = k === "hospede" && substituirNomeGenerico && typeof atual === "string" && /^Hóspede (Airbnb|Booking)/.test(atual);
        const plataformaND = k === "plataforma" && (atual === "N/D" || atual == null);
        if (atual == null || atual === "" || generico || plataformaND) mudar[k] = novo;
      }
      if (n.fonte?.startsWith("csv") && e.fonte === "ical" && n.checkout && n.checkout !== e.checkout) mudar.checkout = n.checkout;
    }
    if (Object.keys(mudar).length && e.id > 0) {
      await atualizarReserva(e.id, mudar as NovaReserva);
      Object.assign(e, mudar);
      res.completadas++;
    } else {
      res.existentes++;
    }
  }
  // inserir em blocos (mais rápido com muitas linhas)
  const colunas = [...CAMPOS] as string[];
  for (let i = 0; i < inserir.length; i += 200) {
    const bloco = inserir.slice(i, i + 200).map((o) => {
      const l: Record<string, unknown> = {};
      for (const c of colunas) l[c] = o[c] ?? (c === "taxa_iva" ? 0.06 : c === "cancelada" ? false : null);
      return l;
    });
    await sql()`insert into reservas ${sql()(bloco, colunas)}`;
    res.novas += bloco.length;
  }
  return res;
}
