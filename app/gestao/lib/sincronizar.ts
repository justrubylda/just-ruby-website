import "server-only";
import { casas } from "@/app/site";
import { linksDe } from "@/app/lib/disponibilidade";
import { diasEntre, hojeISO } from "./calculos";
import { AL_DO_SLUG, MAX_NOITES_RESERVA_BOOKING, importarBloqueiosDasPlataformas } from "./calendario";
import { garantirTabelas, gravarConfig, lerConfig, sql } from "./db";
import { importarLote, type NovaReserva, type ResultadoLote } from "./reservas";

// Lê os calendários (iCal) do Airbnb e do Booking — os mesmos que o site já usa para a
// disponibilidade (variáveis ICAL_... na Vercel) — e cria as reservas que faltam.
// O iCal só traz datas (e, no Airbnb, o código da reserva): o valor e o nome
// completam-se à mão ou ao importar o CSV da plataforma.


type Evento = { uid: string; inicio: string; fim: string; resumo: string; descricao: string };

const isoDe = (s: string) => `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;

export function lerEventos(texto: string): Evento[] {
  const linhas = texto.replace(/\r?\n[ \t]/g, "").split(/\r?\n/);
  const out: Evento[] = [];
  let e: Partial<Evento> | null = null;
  for (const l of linhas) {
    if (l.startsWith("BEGIN:VEVENT")) e = {};
    else if (l.startsWith("END:VEVENT")) {
      if (e?.inicio) out.push({ uid: e.uid ?? "", inicio: e.inicio, fim: e.fim ?? e.inicio, resumo: e.resumo ?? "", descricao: e.descricao ?? "" });
      e = null;
    } else if (e) {
      const m = l.match(/^([A-Z-]+)(?:;[^:]*)?:(.*)$/);
      if (!m) continue;
      const [, k, v] = m;
      if (k === "UID") e.uid = v.trim();
      else if (k === "DTSTART" && /^\d{8}/.test(v)) e.inicio = isoDe(v);
      else if (k === "DTEND" && /^\d{8}/.test(v)) e.fim = isoDe(v);
      else if (k === "SUMMARY") e.resumo = v.trim();
      else if (k === "DESCRIPTION") e.descricao = v.replace(/\\n/g, "\n").replace(/\\,/g, ",");
    }
  }
  return out;
}

export function plataformaDoLink(link: string) {
  if (/airbnb/i.test(link)) return "Airbnb";
  if (/booking\.com|booking/i.test(link)) return "Booking";
  return "Outro";
}

const menosDias = (iso: string, n: number) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
};

export type ResultadoSinc = ResultadoLote & { calendarios: number; canceladas: number; bloqueios: number; erros: string[] };

export async function sincronizar(): Promise<ResultadoSinc> {
  await garantirTabelas();
  const hoje = hojeISO();
  const desde = menosDias(hoje, 60); // o histórico antigo vem do Excel
  const novas: NovaReserva[] = [];
  const vistos = new Set<string>();
  const erros: string[] = [];
  let calendarios = 0;
  const lidosPorAL = new Set<string>();
  for (const casa of casas) {
    const al = AL_DO_SLUG[casa.slug] ?? casa.nome;
    for (const link of linksDe(casa.slug)) {
      const plataforma = plataformaDoLink(link);
      let txt = "";
      try {
        const r = await fetch(link, { cache: "no-store", headers: { "User-Agent": "justruby.pt (gestao)" } });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        txt = await r.text();
      } catch (e) {
        erros.push(`${casa.nome} (${plataforma}): não consegui ler o calendário (${(e as Error).message}).`);
        continue;
      }
      calendarios++;
      lidosPorAL.add(`${al}|${plataforma}`);
      for (const ev of lerEventos(txt)) {
        if (ev.fim < desde) continue;
        if (plataforma === "Airbnb" && !/reserved|reservad/i.test(ev.resumo)) continue; // "Not available" = bloqueios
        if (plataforma === "Booking" && diasEntre(ev.inicio, ev.fim) > MAX_NOITES_RESERVA_BOOKING) continue; // fecho, não reserva
        const codigo = ev.descricao.match(/details\/([A-Z0-9]{6,14})/i)?.[1] ?? null;
        const tel = ev.descricao.match(/Last 4 Digits\)?:\s*(\d{4})/i)?.[1];
        const uid = `${plataforma}:${ev.uid || `${al}:${ev.inicio}`}`;
        vistos.add(uid);
        novas.push({
          checkin: ev.inicio,
          checkout: ev.fim > ev.inicio ? ev.fim : null,
          al,
          plataforma,
          hospede: `Hóspede ${plataforma}`,
          cod_reserva: codigo,
          morada: tel ? `Telefone terminado em ${tel}` : null,
          ical_uid: uid,
          fonte: "ical",
          taxa_iva: 0.06,
          notas: "Criada a partir do calendário — completar nome e valor (ou importar o CSV).",
        });
      }
    }
  }
  const r = await importarLote(novas);

  // Reservas futuras criadas pelo calendário que desapareceram dele = canceladas.
  let canceladas = 0;
  if (calendarios > 0) {
    const pendentes = (await sql()`
      select id, al, plataforma, ical_uid from reservas
      where fonte = 'ical' and cancelada = false and total is null and fatura is null
        and ical_uid is not null and checkin >= ${hoje}`) as unknown as { id: number; al: string; plataforma: string; ical_uid: string }[];
    for (const p of pendentes) {
      if (!lidosPorAL.has(`${p.al}|${p.plataforma}`) || vistos.has(p.ical_uid)) continue;
      await sql()`update reservas set cancelada = true, atualizado_em = now(),
        notas = coalesce(notas || ' ', '') || ${"Desapareceu do calendário em " + hoje + " (cancelada?)."}
        where id = ${p.id}`;
      canceladas++;
    }
  }
  // Bloqueios feitos no Airbnb/Booking passam sozinhos para o site.
  let bloqueios = 0;
  try {
    bloqueios = (await importarBloqueiosDasPlataformas(linksDe)).novos;
  } catch (e) {
    erros.push(`Bloqueios: ${(e as Error).message}`);
  }
  await gravarConfig("ultima_sincronizacao", new Date().toISOString());
  return { ...r, calendarios, canceladas, bloqueios, erros };
}

/** Sincroniza se a última vez foi há mais de `horas` horas (usado ao abrir o painel). */
export async function sincronizarSeAntigo(horas = 3) {
  try {
    await garantirTabelas();
    const ultima = await lerConfig("ultima_sincronizacao");
    if (ultima && Date.now() - Date.parse(ultima) < horas * 3_600_000) return null;
    return await sincronizar();
  } catch (e) {
    console.error("[gestao] sincronização falhou", e);
    return null;
  }
}
