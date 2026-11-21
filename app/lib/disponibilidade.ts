// Disponibilidade das casas, lida dos calendários (iCal) do Airbnb e do Booking.
//
// Os links de exportação do calendário são privados, por isso NÃO ficam no código
// (o repositório é público). Ficam em variáveis de ambiente na Vercel:
//   ICAL_KINGDOM_OF_STONE  = "link-do-airbnb link-do-booking"
//   ICAL_O_NOSSO_CANTINHO  = "link-do-airbnb link-do-booking"
// (vários links separados por espaço ou vírgula). Sem a variável, o calendário não aparece.
//
// Só se usam as datas: nomes, códigos de reserva e telefones que venham no iCal
// são ignorados e nunca chegam ao site.

import { casas } from "../site";
import { ocupadoNoSitePorSlug } from "../gestao/lib/calendario";
import { temBaseDados } from "../gestao/lib/db";

/** Noites ocupadas: de `inicio` (dia de chegada) até `fim` (dia de saída, livre para nova entrada). */
export type Intervalo = { inicio: string; fim: string };
export type Ocupacao = Record<string, Intervalo[]>;

const ATUALIZAR_SEGUNDOS = 3600;

export const variavelIcal = (slug: string) => `ICAL_${slug.toUpperCase().replace(/-/g, "_")}`;

export function linksDe(slug: string): string[] {
  const valor = process.env[variavelIcal(slug)] ?? "";
  return valor
    .split(/[\s,]+/)
    .map((l) => l.trim().replace(/^webcal:\/\//i, "https://"))
    .filter((l) => /^https?:\/\//i.test(l));
}

/** Há calendário a mostrar: links do Airbnb/Booking ou a base de dados da gestão (bloqueios do site). */
export function temCalendario(slug: string) {
  return linksDe(slug).length > 0 || temBaseDados();
}

const isoDe = (yyyymmdd: string) =>
  `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;

export function somarDias(iso: string, dias: number) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** Hoje em Portugal continental (as casas estão lá, seja qual for o servidor). */
export function hojePT() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Lisbon" }).format(new Date());
}

/** Lê os eventos de um ficheiro iCal e devolve as noites ocupadas. */
export function lerIcal(texto: string): Intervalo[] {
  // Linhas "dobradas" (que começam por espaço) continuam a anterior.
  const linhas = texto.replace(/\r?\n[ \t]/g, "").split(/\r?\n/);
  const intervalos: Intervalo[] = [];
  let inicio = "";
  let fim = "";
  let dentro = false;
  for (const linha of linhas) {
    if (linha.startsWith("BEGIN:VEVENT")) {
      dentro = true;
      inicio = fim = "";
    } else if (linha.startsWith("END:VEVENT")) {
      if (dentro && inicio) intervalos.push({ inicio, fim: fim > inicio ? fim : somarDias(inicio, 1) });
      dentro = false;
    } else if (dentro) {
      const m = linha.match(/^(DTSTART|DTEND)[^:]*:(\d{8})/);
      if (m) {
        if (m[1] === "DTSTART") inicio = isoDe(m[2]);
        else fim = isoDe(m[2]);
      }
    }
  }
  return intervalos;
}

/** Junta intervalos sobrepostos ou encostados e descarta o que já passou. */
export function juntar(intervalos: Intervalo[], hoje = hojePT()): Intervalo[] {
  const ordenados = intervalos.filter((i) => i.fim > hoje).sort((a, b) => a.inicio.localeCompare(b.inicio));
  const juntos: Intervalo[] = [];
  for (const i of ordenados) {
    const ultimo = juntos[juntos.length - 1];
    if (ultimo && i.inicio <= ultimo.fim) {
      if (i.fim > ultimo.fim) ultimo.fim = i.fim;
    } else {
      juntos.push({ ...i });
    }
  }
  return juntos;
}

async function lerLink(link: string): Promise<Intervalo[]> {
  try {
    const r = await fetch(link, {
      next: { revalidate: ATUALIZAR_SEGUNDOS },
      headers: { "User-Agent": "justruby.pt (calendario)" },
    });
    if (!r.ok) {
      console.error(`[disponibilidade] ${r.status} ao ler um calendário`);
      return [];
    }
    return lerIcal(await r.text());
  } catch (e) {
    console.error("[disponibilidade] falha ao ler um calendário", e);
    return [];
  }
}

/** Noites ocupadas de uma casa: Airbnb, Booking e os bloqueios/reservas diretas do próprio site. */
export async function ocupacaoDe(slug: string): Promise<Intervalo[]> {
  const listas = await Promise.all([...linksDe(slug).map(lerLink), ocupadoNoSitePorSlug(slug)]);
  return juntar(listas.flat());
}

/** Ocupação de todas as casas que têm calendário ligado. */
export async function ocupacaoTodas(): Promise<Ocupacao> {
  const pares = await Promise.all(
    casas.filter((c) => temCalendario(c.slug)).map(async (c) => [c.slug, await ocupacaoDe(c.slug)] as const)
  );
  return Object.fromEntries(pares);
}

/** As datas pedidas [chegada, partida) chocam com alguma reserva? */
export function choca(intervalos: Intervalo[], chegada: string, partida: string) {
  return intervalos.some((i) => chegada < i.fim && partida > i.inicio);
}
