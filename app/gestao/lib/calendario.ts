import "server-only";
import { randomUUID } from "node:crypto";
import { casas } from "@/app/site";
import { garantirTabelas, gravarConfig, lerConfig, sql, temBaseDados } from "./db";

// O site é o calendário principal dos bloqueios.
//
// Os bloqueios (contratos, uso próprio, obras...) e as reservas que não vêm do Airbnb
// nem do Booking (diretas, do site, contratos...) ficam na base de dados. O site publica
// um calendário iCal privado por casa (/api/calendario/<casa>?t=...), que o Airbnb e o
// Booking importam para fecharem essas datas.
// As reservas do Airbnb e do Booking NÃO entram neste calendário: as plataformas já
// trocam essas entre si, e mandá-las de volta só criava voltas e duplicados.

export const AL_DO_SLUG: Record<string, string> = {
  "o-nosso-cantinho": "Nosso Cantinho",
  "kingdom-of-stone": "Kingdom of Stone",
};

export const slugDoAl = (al: string) => Object.keys(AL_DO_SLUG).find((s) => AL_DO_SLUG[s] === al) ?? null;

const PLATAFORMAS_EXTERNAS = ["Airbnb", "Booking"];

export type Bloqueio = { id: number; al: string; inicio: string; fim: string; motivo: string | null };
export type Ocupado = { inicio: string; fim: string; resumo: string; uid: string };

const hoje = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Lisbon" }).format(new Date());

export async function listarBloqueios(incluirPassados = false): Promise<Bloqueio[]> {
  await garantirTabelas();
  const desde = incluirPassados ? "1900-01-01" : hoje();
  return (await sql()`
    select id, al, inicio, fim, motivo from bloqueios
    where fim > ${desde} order by inicio, al`) as unknown as Bloqueio[];
}

export async function criarBloqueio(b: Omit<Bloqueio, "id">) {
  await garantirTabelas();
  const [l] = await sql()`
    insert into bloqueios (al, inicio, fim, motivo)
    values (${b.al}, ${b.inicio}, ${b.fim}, ${b.motivo}) returning id`;
  return l.id as number;
}

export async function apagarBloqueio(id: number) {
  await garantirTabelas();
  await sql()`delete from bloqueios where id = ${id}`;
}

/** Datas ocupadas por bloqueios e por reservas que não são do Airbnb nem do Booking. */
export async function ocupadoNoSite(al: string): Promise<Ocupado[]> {
  await garantirTabelas();
  const h = hoje();
  const bloqueios = (await sql()`
    select id, inicio, fim, motivo from bloqueios
    where al = ${al} and fim > ${h} order by inicio`) as unknown as { id: number; inicio: string; fim: string; motivo: string | null }[];
  const reservas = (await sql()`
    select id, checkin, checkout, plataforma from reservas
    where al = ${al} and cancelada = false and checkin is not null and checkout is not null
      and checkout > ${h} and checkout > checkin
      and coalesce(plataforma, '') not in ${sql()(PLATAFORMAS_EXTERNAS)}
    order by checkin`) as unknown as { id: number; checkin: string; checkout: string; plataforma: string | null }[];
  return [
    ...bloqueios.map((b) => ({ inicio: b.inicio, fim: b.fim, resumo: "Bloqueado", uid: `bloqueio-${b.id}@justruby.pt` })),
    ...reservas.map((r) => ({ inicio: r.checkin, fim: r.checkout, resumo: "Reservado", uid: `reserva-${r.id}@justruby.pt` })),
  ];
}

/** Igual a `ocupadoNoSite`, mas pelo slug e sem nunca falhar (para as páginas públicas). */
export async function ocupadoNoSitePorSlug(slug: string): Promise<{ inicio: string; fim: string }[]> {
  const al = AL_DO_SLUG[slug];
  if (!al || !temBaseDados()) return [];
  try {
    return (await ocupadoNoSite(al)).map(({ inicio, fim }) => ({ inicio, fim }));
  } catch (e) {
    console.error("[calendario] não consegui ler os bloqueios", e);
    return [];
  }
}

/** Código secreto dos links de exportação (criado na primeira utilização). */
export async function codigoCalendario() {
  await garantirTabelas();
  let t = await lerConfig("calendario_codigo");
  if (!t) {
    t = randomUUID().replace(/-/g, "");
    await gravarConfig("calendario_codigo", t);
  }
  return t;
}

export async function codigoCerto(t: string | null) {
  if (!t || !temBaseDados()) return false;
  const certo = await lerConfig("calendario_codigo");
  return Boolean(certo) && t === certo;
}

const dataIcs = (iso: string) => iso.replace(/-/g, "");
const escapar = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

/** Ficheiro iCal (RFC 5545) com as datas ocupadas no site, para o Airbnb e o Booking importarem. */
export function gerarIcs(nomeCasa: string, ocupado: Ocupado[]) {
  const agora = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const linhas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//JUST RUBY//justruby.pt//PT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapar(`${nomeCasa} · JUST RUBY`)}`,
  ];
  for (const o of ocupado) {
    linhas.push(
      "BEGIN:VEVENT",
      `UID:${o.uid}`,
      `DTSTAMP:${agora}`,
      `DTSTART;VALUE=DATE:${dataIcs(o.inicio)}`,
      `DTEND;VALUE=DATE:${dataIcs(o.fim)}`,
      `SUMMARY:${escapar(o.resumo)}`,
      "TRANSP:OPAQUE",
      "END:VEVENT",
    );
  }
  linhas.push("END:VCALENDAR");
  return linhas.join("\r\n") + "\r\n";
}

export const casaDoSlug = (slug: string) => casas.find((c) => c.slug === slug);

/** Wi-Fi da casa para o guia do hóspede (escrito em /gestao/alojamentos, nunca no código). */
export async function wifiDaCasa(slug: string): Promise<{ rede: string; senha: string } | null> {
  const al = AL_DO_SLUG[slug];
  if (!al || !temBaseDados()) return null;
  try {
    await garantirTabelas();
    const [l] = await sql()`select wifi_rede, wifi_senha from alojamentos where nome = ${al}`;
    const rede = String(l?.wifi_rede ?? "").trim();
    return rede ? { rede, senha: String(l?.wifi_senha ?? "").trim() } : null;
  } catch (e) {
    console.error("[guia] não consegui ler o Wi-Fi", e);
    return null;
  }
}
