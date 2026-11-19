"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirSessao } from "./lib/acesso";
import { garantirTabelas, sql } from "./lib/db";
import { lerFicheiro } from "./lib/ficheiros";
import { importarFolhas, numero } from "./lib/importar";
import { apagarReserva, atualizarReserva, criarReserva, listarAlojamentos, type NovaReserva } from "./lib/reservas";
import { COOKIE, DIAS_SESSAO, criarToken, palavraPasseCerta, palavraPasseConfigurada } from "./lib/sessao";
import { sincronizar } from "./lib/sincronizar";

// ---------- entrar / sair ----------

export async function entrar(_: string | null, form: FormData): Promise<string | null> {
  if (!palavraPasseConfigurada()) return "Falta definir a palavra-passe na Vercel (variável GESTAO_PALAVRA_PASSE).";
  const ok = await palavraPasseCerta(String(form.get("palavra") ?? ""));
  if (!ok) {
    await new Promise((r) => setTimeout(r, 900)); // trava tentativas em série
    return "Palavra-passe errada.";
  }
  const c = await cookies();
  c.set(COOKIE, await criarToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DIAS_SESSAO * 86_400,
  });
  redirect("/gestao");
}

export async function sair() {
  const c = await cookies();
  c.delete(COOKIE);
  redirect("/gestao/entrar");
}

// ---------- reservas ----------

const txt = (f: FormData, k: string) => {
  const v = String(f.get(k) ?? "").trim();
  return v === "" ? null : v;
};
const num = (f: FormData, k: string) => numero(txt(f, k));
const data = (f: FormData, k: string) => {
  const v = txt(f, k);
  return v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
};

function dadosDoFormulario(f: FormData): NovaReserva {
  const taxa = Number(txt(f, "taxa_iva") ?? "0.06");
  const noites = num(f, "noites");
  const hospedes = num(f, "hospedes");
  const pedido = num(f, "pedido_id");
  return {
    checkin: data(f, "checkin"),
    checkout: data(f, "checkout"),
    noites: noites == null ? null : Math.round(noites),
    al: txt(f, "al"),
    plataforma: txt(f, "plataforma"),
    hospede: txt(f, "hospede"),
    nif: txt(f, "nif"),
    morada: txt(f, "morada"),
    cod_reserva: txt(f, "cod_reserva"),
    hospedes: hospedes == null ? null : Math.round(hospedes),
    total: num(f, "total"),
    comissao: num(f, "comissao"),
    recebido: num(f, "recebido"),
    limpeza: num(f, "limpeza"),
    taxa_iva: Number.isFinite(taxa) ? taxa : 0.06,
    fatura: txt(f, "fatura"),
    recibo: txt(f, "recibo"),
    notas: txt(f, "notas"),
    cancelada: f.get("cancelada") === "on",
    pedido_id: pedido == null ? null : Math.round(pedido),
  };
}

export async function guardarReserva(_: string | null, f: FormData): Promise<string | null> {
  await exigirSessao();
  const d = dadosDoFormulario(f);
  if (!d.checkin) return "Indique a data de check-in.";
  if (d.checkout && d.checkout <= d.checkin) return "O check-out tem de ser depois do check-in.";
  if (!d.al) return "Escolha o alojamento.";
  const id = num(f, "id");
  let novoId = id;
  if (id) await atualizarReserva(id, d);
  else {
    novoId = await criarReserva({ ...d, fonte: d.pedido_id ? "site" : "manual" });
    if (d.pedido_id) await sql()`update pedidos set estado = 'reserva', reserva_id = ${novoId} where id = ${d.pedido_id}`;
  }
  revalidatePath("/gestao", "layout");
  const voltar = txt(f, "voltar");
  redirect(voltar && voltar.startsWith("/gestao") ? voltar : `/gestao/reservas?ano=${d.checkin.slice(0, 4)}`);
}

export async function apagarReservaAcao(f: FormData) {
  await exigirSessao();
  const id = num(f, "id");
  if (id) await apagarReserva(id);
  revalidatePath("/gestao", "layout");
  redirect("/gestao/reservas");
}

export async function marcarFatura(f: FormData) {
  await exigirSessao();
  const id = num(f, "id");
  const semFatura = f.get("sem") === "1";
  const fatura = semFatura ? "Sem fatura" : txt(f, "fatura");
  if (id && fatura) {
    await atualizarReserva(id, semFatura ? { fatura, taxa_iva: 0 } : { fatura });
  }
  revalidatePath("/gestao", "layout");
}

// ---------- pedidos do site ----------

export async function mudarPedido(f: FormData) {
  await exigirSessao();
  const id = num(f, "id");
  const estado = txt(f, "estado") === "novo" ? "novo" : "arquivado";
  if (id) await sql()`update pedidos set estado = ${estado} where id = ${id}`;
  revalidatePath("/gestao/pedidos");
}

// ---------- importar e sincronizar ----------

export type Relatorio = { ok: boolean; titulo: string; linhas: string[] };

export async function importarFicheiro(_: Relatorio | null, f: FormData): Promise<Relatorio> {
  await exigirSessao();
  const ficheiro = f.get("ficheiro");
  if (!(ficheiro instanceof File) || ficheiro.size === 0) return { ok: false, titulo: "Escolha um ficheiro.", linhas: [] };
  try {
    const folhas = lerFicheiro(Buffer.from(await ficheiro.arrayBuffer()));
    const als = (await listarAlojamentos()).map((a) => a.nome);
    const alForcado = txt(f, "al");
    const r = await importarFolhas(folhas, alForcado, als);
    revalidatePath("/gestao", "layout");
    const nomes = { excel: "Excel JUST RUBY", airbnb: "CSV do Airbnb", booking: "Exportação do Booking" };
    return {
      ok: true,
      titulo: `${nomes[r.tipo]}: ${r.lidas} reserva(s) lidas.`,
      linhas: [
        `${r.novas} nova(s)`,
        `${r.completadas} já existiam e foram completadas`,
        `${r.existentes} já existiam (sem alterações)`,
        ...(r.ignoradas ? [`${r.ignoradas} linha(s) ignoradas`] : []),
        ...r.avisos,
      ],
    };
  } catch (e) {
    return { ok: false, titulo: (e as Error).message, linhas: [] };
  }
}

export async function sincronizarAgora(): Promise<Relatorio> {
  await exigirSessao();
  try {
    const r = await sincronizar();
    revalidatePath("/gestao", "layout");
    if (r.calendarios === 0 && !r.erros.length)
      return {
        ok: false,
        titulo: "Não há calendários ligados neste ambiente.",
        linhas: ["Os links iCal ficam nas variáveis ICAL_KINGDOM_OF_STONE e ICAL_O_NOSSO_CANTINHO da Vercel (também têm de estar ativas para a pré-visualização)."],
      };
    return {
      ok: !r.erros.length,
      titulo: `${r.calendarios} calendário(s) lidos.`,
      linhas: [
        `${r.novas} reserva(s) nova(s)`,
        `${r.completadas} completada(s)`,
        `${r.existentes} já existiam`,
        ...(r.canceladas ? [`${r.canceladas} marcada(s) como canceladas (saíram do calendário)`] : []),
        ...r.erros,
      ],
    };
  } catch (e) {
    return { ok: false, titulo: (e as Error).message, linhas: [] };
  }
}

// ---------- alojamentos (textos das faturas) ----------

export async function guardarAlojamentos(f: FormData) {
  await exigirSessao();
  await garantirTabelas();
  const nomes = f.getAll("nome").map(String);
  const antes = f.getAll("antes_entrada").map(String);
  const saida = f.getAll("antes_saida").map(String);
  const final = f.getAll("final").map(String);
  const originais = f.getAll("original").map(String);
  for (let i = 0; i < nomes.length; i++) {
    const nome = nomes[i].trim();
    const orig = originais[i] ?? "";
    if (!nome) continue;
    if (orig && orig !== nome) {
      await sql()`update alojamentos set nome = ${nome} where nome = ${orig}`;
      await sql()`update reservas set al = ${nome} where al = ${orig}`;
    }
    await sql()`insert into alojamentos (nome, ordem, antes_entrada, antes_saida, final)
      values (${nome}, ${i + 1}, ${antes[i] ?? ""}, ${saida[i] ?? ""}, ${final[i] ?? ""})
      on conflict (nome) do update set ordem = excluded.ordem, antes_entrada = excluded.antes_entrada,
        antes_saida = excluded.antes_saida, final = excluded.final`;
  }
  revalidatePath("/gestao", "layout");
  redirect("/gestao/alojamentos?ok=1");
}
