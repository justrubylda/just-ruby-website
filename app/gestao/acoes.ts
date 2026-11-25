"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirSessao } from "./lib/acesso";
import { AL_DO_SLUG, apagarBloqueio, criarBloqueio } from "./lib/calendario";
import { garantirTabelas, sql, temBaseDados } from "./lib/db";
import { apagarPeriodo, criarPeriodo, guardarComissoes, guardarLimpeza, guardarPrecosCasa } from "./lib/precos";
import { lerFicheiro } from "./lib/ficheiros";
import { importarFolhas, numero } from "./lib/importar";
import { apagarReserva, atualizarReserva, criarReserva, listarAlojamentos, listarReservas, type NovaReserva } from "./lib/reservas";
import type { AuthenticationResponseJSON, RegistrationResponseJSON } from "@simplewebauthn/server";
import { confirmarAtivar, digitalCerta, opcoesAtivar, opcoesConfirmar, removerAparelho } from "./lib/digital";
import {
  definirPalavraPasse,
  erroNova,
  palavraPasseCerta,
  palavraPasseDefinida,
  palavraVercelCerta,
  versaoAtual,
} from "./lib/palavra";
import { COOKIE, DIAS_SESSAO, criarToken } from "./lib/sessao";
import { sincronizar } from "./lib/sincronizar";
import { conciliar, guardarDocs, guardarRecibos, lerRecibos, lerVendas } from "./lib/centralgest";

// ---------- entrar / sair / palavra-passe ----------

const travar = () => new Promise((r) => setTimeout(r, 900)); // trava tentativas em série

async function abrirSessao(versao: string) {
  const c = await cookies();
  c.set(COOKIE, await criarToken(versao), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DIAS_SESSAO * 86_400,
  });
}

export async function entrar(_: string | null, form: FormData): Promise<string | null> {
  if (!(await palavraPasseDefinida())) return "Falta definir a palavra-passe na Vercel (variável GESTAO_PALAVRA_PASSE).";
  const ok = await palavraPasseCerta(String(form.get("palavra") ?? ""));
  if (!ok) {
    await travar();
    return "Palavra-passe errada.";
  }
  await abrirSessao(await versaoAtual());
  redirect("/gestao");
}

export async function sair() {
  const c = await cookies();
  c.delete(COOKIE);
  redirect("/"); // ao sair, volta ao site normal
}

/** Resultado das ações de palavra-passe e impressão digital. */
export type EstadoPalavra = { erro?: string; ok?: string } | null;

// ---------- impressão digital (chaves de acesso) ----------

/** Desafio para confirmar com a impressão digital (entrar ou repor a palavra-passe). */
export async function opcoesDigital() {
  if (!temBaseDados()) return null;
  return opcoesConfirmar();
}

export async function entrarComDigital(resposta: AuthenticationResponseJSON): Promise<EstadoPalavra> {
  if (!(await digitalCerta(resposta))) {
    await travar();
    return { erro: "Não foi possível confirmar a impressão digital neste aparelho." };
  }
  await abrirSessao(await versaoAtual());
  redirect("/gestao");
}

/** "Esqueci-me da palavra-passe": confirma com a impressão digital e grava a nova. */
export async function reporComDigital(
  resposta: AuthenticationResponseJSON,
  nova: string,
  repetida: string
): Promise<EstadoPalavra> {
  const erro = erroNova(nova, repetida);
  if (erro) return { erro };
  if (!(await digitalCerta(resposta))) {
    await travar();
    return { erro: "Não foi possível confirmar a impressão digital neste aparelho." };
  }
  await abrirSessao(await definirPalavraPasse(nova));
  redirect("/gestao/conta?reposta=1");
}

/** Reserva, sem impressão digital: a palavra-passe que está na Vercel (GESTAO_PALAVRA_PASSE). */
export async function reporComVercel(_: EstadoPalavra, form: FormData): Promise<EstadoPalavra> {
  if (!temBaseDados()) return { erro: "Falta ligar a base de dados." };
  const nova = String(form.get("nova") ?? "");
  const erro = erroNova(nova, String(form.get("repetir") ?? ""));
  if (erro) return { erro };
  if (!(await palavraVercelCerta(String(form.get("vercel") ?? "").trim()))) {
    await travar();
    return { erro: "A palavra-passe da Vercel não está certa." };
  }
  await abrirSessao(await definirPalavraPasse(nova));
  redirect("/gestao/conta?reposta=1");
}

export async function opcoesAtivarDigital() {
  await exigirSessao();
  return opcoesAtivar();
}

export async function ativarDigital(resposta: RegistrationResponseJSON, nome: string): Promise<EstadoPalavra> {
  await exigirSessao();
  let ok = false;
  try {
    ok = await confirmarAtivar(resposta, nome.trim());
  } catch {
    ok = false;
  }
  if (!ok) return { erro: "Não foi possível ativar a impressão digital neste aparelho." };
  revalidatePath("/gestao", "layout");
  return { ok: "Impressão digital ativada neste aparelho. Da próxima vez, entre com ela." };
}

export async function removerAparelhoAcao(form: FormData) {
  await exigirSessao();
  await removerAparelho(String(form.get("id") ?? ""));
  revalidatePath("/gestao", "layout");
}

// ---------- palavra-passe ----------

export async function mudarPalavraPasse(_: EstadoPalavra, form: FormData): Promise<EstadoPalavra> {
  await exigirSessao();
  if (!(await palavraPasseCerta(String(form.get("atual") ?? "")))) {
    await travar();
    return { erro: "A palavra-passe atual não está certa." };
  }
  const nova = String(form.get("nova") ?? "");
  const erro = erroNova(nova, String(form.get("repetir") ?? ""));
  if (erro) return { erro };
  await abrirSessao(await definirPalavraPasse(nova));
  revalidatePath("/gestao/conta");
  return { ok: "Palavra-passe mudada. As outras sessões abertas (noutros aparelhos) terminaram." };
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

// ---------- conferência com o CentralGest ----------

export type ResultadoCG = { ok: boolean; texto: string };

/** Recebe a lista de Vendas do CentralGest (texto copiado) e cruza-a com as reservas. */
export async function conferirCentralGest(_: ResultadoCG | null, f: FormData): Promise<ResultadoCG> {
  await exigirSessao();
  const texto = String(f.get("vendas") ?? "");
  const docs = lerVendas(texto);
  const recibos = lerRecibos(texto);
  if (!docs.length && !recibos.length)
    return { ok: false, texto: "Não encontrei faturas no texto. Copie a lista de Vendas do CentralGest (com os nºs FR/FT) ou a de Recebimentos (RG)." };
  if (docs.length) await guardarDocs(docs);
  if (recibos.length) await guardarRecibos(recibos);
  const c = await conciliar(await listarReservas());
  revalidatePath("/gestao", "layout");
  return {
    ok: true,
    texto:
      `${docs.length} documento(s) e ${recibos.length} recibo(s) lidos do CentralGest. ${c.ligadas.length} fatura(s) ligadas agora às reservas` +
      (c.porConfirmar.length ? `, ${c.porConfirmar.length} por confirmar` : "") +
      (c.repetidas.length ? `, ${c.repetidas.length} nº repetido(s)` : "") +
      ".",
  };
}

/** Associa à mão uma fatura do CentralGest a uma reserva (quando há dúvida). */
export async function associarFatura(f: FormData) {
  await exigirSessao();
  const id = num(f, "id");
  const doc = txt(f, "doc");
  if (id && doc) await atualizarReserva(id, { fatura: doc });
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
  const minimo = num(f, "noites_min") ?? 1;
  if (base != null && base <= 0) return "O preço por noite tem de ser maior que zero.";
  if (fimSemana != null && fimSemana <= 0) return "O preço de sexta e sábado tem de ser maior que zero.";
  if (!Number.isInteger(minimo) || minimo < 1 || minimo > 30) return "O mínimo de noites vai de 1 a 30.";
  await guardarPrecosCasa({ al, base, fim_semana: fimSemana, noites_min: minimo });
  revalidarDisponibilidade();
  return "ok";
}

export async function guardarLimpezaAcao(_: string | null, f: FormData): Promise<string | null> {
  await exigirSessao();
  const limpeza = euro(f, "limpeza");
  if (limpeza != null && limpeza < 0) return "A taxa de limpeza não pode ser negativa.";
  await guardarLimpeza(limpeza);
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
