import "server-only";
import { AL_DO_SLUG } from "./calendario";
import { garantirTabelas, gravarConfig, lerConfig, sql, temBaseDados } from "./db";
import type { TabelaPrecos } from "@/app/lib/orcamento";

// Preços por noite. O preço do site é o que o Bruno quer receber (reserva direta);
// o do Airbnb e o do Booking calculam-se a partir dele, com a comissão de cada um.
//
// Regras, por esta ordem: período especial (Natal, agosto...) > fim de semana
// (noites de sexta e de sábado) > preço base.

export type PrecosCasa = {
  al: string;
  base: number | null;
  fim_semana: number | null;
  limpeza: number | null;
  noites_min: number;
};
export type Periodo = { id: number; al: string; nome: string | null; inicio: string; fim: string; preco: number; noites_min: number | null };


const hoje = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Lisbon" }).format(new Date());
const somar = (iso: string, n: number) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

export async function lerPrecos(): Promise<{ casas: PrecosCasa[]; periodos: Periodo[] }> {
  await garantirTabelas();
  const linhas = (await sql()`select al, base, fim_semana, limpeza, noites_min from precos`) as unknown as PrecosCasa[];
  const casas = Object.values(AL_DO_SLUG).map(
    (al) => linhas.find((l) => l.al === al) ?? { al, base: null, fim_semana: null, limpeza: null, noites_min: 2 },
  );
  const periodos = (await sql()`
    select id, al, nome, inicio, fim, preco, noites_min from precos_periodos
    where fim > ${hoje()} order by inicio`) as unknown as Periodo[];
  return { casas, periodos };
}

export async function guardarPrecosCasa(p: PrecosCasa) {
  await garantirTabelas();
  await sql()`insert into precos (al, base, fim_semana, limpeza, noites_min, atualizado_em)
    values (${p.al}, ${p.base}, ${p.fim_semana}, ${p.limpeza}, ${p.noites_min}, now())
    on conflict (al) do update set base = excluded.base, fim_semana = excluded.fim_semana,
      limpeza = excluded.limpeza, noites_min = excluded.noites_min, atualizado_em = now()`;
}

export async function criarPeriodo(p: Omit<Periodo, "id">) {
  await garantirTabelas();
  await sql()`insert into precos_periodos (al, nome, inicio, fim, preco, noites_min)
    values (${p.al}, ${p.nome}, ${p.inicio}, ${p.fim}, ${p.preco}, ${p.noites_min})`;
}

export async function apagarPeriodo(id: number) {
  await garantirTabelas();
  await sql()`delete from precos_periodos where id = ${id}`;
}

// ---------- comissões das plataformas ----------

export const COMISSAO_AIRBNB_PADRAO = 15.5; // taxa única do anfitrião
export const COMISSAO_BOOKING_PADRAO = 15;

export async function lerComissoes() {
  await garantirTabelas();
  const [a, b] = await Promise.all([lerConfig("comissao_airbnb"), lerConfig("comissao_booking")]);
  return {
    airbnb: a ? Number(a) : COMISSAO_AIRBNB_PADRAO,
    booking: b ? Number(b) : COMISSAO_BOOKING_PADRAO,
    bookingConfirmada: Boolean(b),
  };
}

export async function guardarComissoes(airbnb: number, booking: number) {
  await gravarConfig("comissao_airbnb", String(airbnb));
  await gravarConfig("comissao_booking", String(booking));
}

export { precoNaPlataforma } from "@/app/lib/orcamento";

// ---------- cálculo por noite ----------

export function precoDaNoite(iso: string, casa: PrecosCasa, periodos: Periodo[]) {
  const p = periodos.find((x) => x.al === casa.al && iso >= x.inicio && iso < x.fim);
  if (p) return { preco: Number(p.preco), minimo: p.noites_min ?? casa.noites_min };
  if (casa.base == null) return null;
  const dia = new Date(`${iso}T12:00:00Z`).getUTCDay(); // 5 = sexta, 6 = sábado
  const fds = (dia === 5 || dia === 6) && casa.fim_semana != null;
  return { preco: Number(fds ? casa.fim_semana : casa.base), minimo: casa.noites_min };
}

/** Preços das próximas noites de cada casa, para o site público (vazio se não houver preços). */
export async function tabelasPrecos(dias = 450): Promise<Record<string, TabelaPrecos>> {
  if (!temBaseDados()) return {};
  try {
    const { casas, periodos } = await lerPrecos();
    const h = hoje();
    const out: Record<string, TabelaPrecos> = {};
    for (const [slug, al] of Object.entries(AL_DO_SLUG)) {
      const casa = casas.find((c) => c.al === al);
      if (!casa) continue;
      const noites: Record<string, number> = {};
      const minimo: Record<string, number> = {};
      for (let i = 0; i < dias; i++) {
        const iso = somar(h, i);
        const p = precoDaNoite(iso, casa, periodos);
        if (!p) continue;
        noites[iso] = p.preco;
        if (p.minimo > 1) minimo[iso] = p.minimo;
      }
      if (Object.keys(noites).length) out[slug] = { noites, minimo, limpeza: Number(casa.limpeza ?? 0) };
    }
    return out;
  } catch (e) {
    console.error("[precos] não consegui ler os preços", e);
    return {};
  }
}
