"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirSessao } from "./lib/acesso";
import { AL_DO_SLUG, apagarBloqueio, criarBloqueio } from "./lib/calendario";
import { garantirTabelas, sql } from "./lib/db";
import { apagarPeriodo, criarPeriodo, guardarComissoes, guardarPrecosCasa } from "./lib/precos";
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
  redirect("/"); // ao sair, volta ao site normal
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
  revalidarDisponibilidade();
  const voltar = txt(f, "voltar");
  redirect(voltar && voltar.startsWith("/gestao") ? voltar : `/gestao/reservas?ano=${d.checkin.slice(0, 4)}`);
}

export async function apagarReservaAcao(f: FormData) {
  await exigirSessao();
  const id = num(f, "id");
  if (id) await apagarReserva(id);
  revalidatePath("/gestao", "layout");
  revalidarDisponibilidade();
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
        ...(r.bloqueios ? [`${r.bloqueios} bloqueio(s) do Airbnb/Booking passaram para o site`] : []),
        ...r.erros,
      ],
    };
  } catch (e) {
    return { ok: false, titulo: (e as Error).message, linhas: [] };
  }
}

// ---------- bloqueios (o site é o calendário principal) ----------

// Páginas públicas que mostram a disponibilidade. Revalidar só estas (e não o "layout" todo):
// as páginas das casas são estáticas e revalidar a árvore inteira deixava-as em 404.
// Todas as páginas com o calendário ou os preços (as 4 línguas, casas, contactos,
// páginas de destino) voltam a ser geradas no próximo acesso.
function revalidarDisponibilidade() {
  revalidatePath("/", "layout");
}

export async function criarBloqueioAcao(_: string | null, f: FormData): Promise<string | null> {
  await exigirSessao();
  const al = txt(f, "al");
  const inicio = data(f, "inicio");
  const fim = data(f, "fim");
  if (!al) return "Escolha a casa.";
  if (!inicio || !fim) return "Indique a primeira noite e o dia em que a casa volta a ficar livre.";
  if (fim <= inicio) return "O dia em que fica livre tem de ser depois da primeira noite.";
  await criarBloqueio({ al, inicio, fim, motivo: txt(f, "motivo") });
  revalidarDisponibilidade();
  redirect("/gestao/calendario?ok=1");
}

export async function apagarBloqueioAcao(f: FormData) {
  await exigirSessao();
  const id = num(f, "id");
  if (id) await apagarBloqueio(id);
  revalidarDisponibilidade();
  redirect("/gestao/calendario?apagado=1");
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
  const wifiRede = f.getAll("wifi_rede").map(String);
  const wifiSenha = f.getAll("wifi_senha").map(String);
  for (let i = 0; i < nomes.length; i++) {
    const nome = nomes[i].trim();
    const orig = originais[i] ?? "";
    if (!nome) continue;
    if (orig && orig !== nome) {
      await sql()`update alojamentos set nome = ${nome} where nome = ${orig}`;
      await sql()`update reservas set al = ${nome} where al = ${orig}`;
    }
    await sql()`insert into alojamentos (nome, ordem, antes_entrada, antes_saida, final, wifi_rede, wifi_senha)
      values (${nome}, ${i + 1}, ${antes[i] ?? ""}, ${saida[i] ?? ""}, ${final[i] ?? ""},
        ${(wifiRede[i] ?? "").trim()}, ${(wifiSenha[i] ?? "").trim()})
      on conflict (nome) do update set ordem = excluded.ordem, antes_entrada = excluded.antes_entrada,
        antes_saida = excluded.antes_saida, final = excluded.final,
        wifi_rede = excluded.wifi_rede, wifi_senha = excluded.wifi_senha`;
  }
  revalidatePath("/gestao", "layout");
  for (const slug of Object.keys(AL_DO_SLUG)) revalidatePath(`/guia/${slug}`);
  redirect("/gestao/alojamentos?ok=1");
}

// ---------- preços ----------

const euro = (f: FormData, k: string) => {
  const n = num(f, k);
  return n == null ? null : Math.round(n * 100) / 100;
};

export async function guardarPrecosAcao(_: string | null, f: FormData): Promise<string | null> {
  await exigirSessao();
  const al = txt(f, "al");
  if (!al || !Object.values(AL_DO_SLUG).includes(al)) return "Casa desconhecida.";
  const base = euro(f, "base");
  const fimSemana = euro(f, "fim_semana");
  const limpeza = euro(f, "limpeza");
  const minimo = num(f, "noites_min") ?? 1;
  if (base != null && base <= 0) return "O preço por noite tem de ser maior que zero.";
  if (fimSemana != null && fimSemana <= 0) return "O preço de sexta e sábado tem de ser maior que zero.";
  if (limpeza != null && limpeza < 0) return "A limpeza não pode ser negativa.";
  if (!Number.isInteger(minimo) || minimo < 1 || minimo > 30) return "O mínimo de noites vai de 1 a 30.";
  await guardarPrecosCasa({ al, base, fim_semana: fimSemana, limpeza, noites_min: minimo });
  revalidarDisponibilidade();
  return "ok";
}

export async function criarPeriodoAcao(_: string | null, f: FormData): Promise<string | null> {
  await exigirSessao();
  const al = txt(f, "al");
  const inicio = data(f, "inicio");
  const fim = data(f, "fim");
  const preco = euro(f, "preco");
  const minimo = num(f, "noites_min");
  if (!al || !Object.values(AL_DO_SLUG).includes(al)) return "Escolha a casa.";
  if (!inicio || !fim) return "Indique a primeira noite e o dia a seguir à última noite.";
  if (fim <= inicio) return "O fim tem de ser depois da primeira noite.";
  if (preco == null || preco <= 0) return "Indique o preço por noite.";
  if (minimo != null && (!Number.isInteger(minimo) || minimo < 1 || minimo > 30)) return "O mínimo de noites vai de 1 a 30.";
  await criarPeriodo({ al, nome: txt(f, "nome"), inicio, fim, preco, noites_min: minimo });
  revalidarDisponibilidade();
  redirect("/gestao/precos?periodo=1");
}

export async function apagarPeriodoAcao(f: FormData) {
  await exigirSessao();
  const id = num(f, "id");
  if (id) await apagarPeriodo(id);
  revalidarDisponibilidade();
  redirect("/gestao/precos?apagado=1");
}

export async function guardarComissoesAcao(_: string | null, f: FormData): Promise<string | null> {
  await exigirSessao();
  const airbnb = num(f, "airbnb");
  const booking = num(f, "booking");
  if (airbnb == null || booking == null) return "Indique as duas comissões.";
  if (airbnb < 0 || airbnb >= 50 || booking < 0 || booking >= 50) return "As comissões vão de 0 a 50 %.";
  await guardarComissoes(airbnb, booking);
  revalidatePath("/gestao/precos");
  return "ok";
}
