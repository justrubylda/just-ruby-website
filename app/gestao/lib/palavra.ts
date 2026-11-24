import "server-only";
import { garantirTabelas, gravarConfig, lerConfig, temBaseDados } from "./db";
import { iguais, palavraVercelCerta } from "./sessao";

// Palavra-passe da gestão e código de recuperação.
// Na base de dados (tabela config) só ficam "hashes" (PBKDF2), nunca o texto:
//   gestao_pp          hash da palavra-passe (enquanto não existir, vale a da Vercel)
//   gestao_recuperacao hash do código de recuperação
//   gestao_rec_criado  data em que o código foi criado (AAAA-MM-DD)
//   gestao_versao      muda sempre que a palavra-passe muda (termina as outras sessões)
// A palavra-passe da Vercel (GESTAO_PALAVRA_PASSE) serve sempre como código de recuperação de reserva.

export const MINIMO = 8;
const ITERACOES = 210_000;
const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem I, O, 0 e 1, que se confundem

const enc = new TextEncoder();

const b64 = (b: Uint8Array) => Buffer.from(b).toString("base64");
const deB64 = (s: string) => new Uint8Array(Buffer.from(s, "base64"));

async function derivar(texto: string, sal: Uint8Array, iteracoes: number) {
  const chave = await crypto.subtle.importKey("raw", enc.encode(texto), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: sal as BufferSource, iterations: iteracoes },
    chave,
    256
  );
  return new Uint8Array(bits);
}

export async function criarHash(texto: string) {
  const sal = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2-sha256$${ITERACOES}$${b64(sal)}$${b64(await derivar(texto, sal, ITERACOES))}`;
}

export async function confereHash(texto: string, guardado: string | null) {
  if (!guardado) return false;
  const [tipo, it, sal, hash] = guardado.split("$");
  if (tipo !== "pbkdf2-sha256" || !it || !sal || !hash) return false;
  const obtido = await derivar(texto, deB64(sal), Number(it));
  return iguais(b64(obtido), hash);
}

/** Código como "K7QM-3XRT-9PWD-H2NB" (80 bits ao acaso). */
export function gerarCodigo() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const letras = [...bytes].map((b) => ALFABETO[b % ALFABETO.length]).join("");
  return letras.match(/.{4}/g)!.join("-");
}

/** Aceita o código com ou sem traços, espaços ou minúsculas. */
export const normalizarCodigo = (c: string) => c.toUpperCase().replace(/[^A-Z0-9]/g, "");

const novaVersao = () => Buffer.from(crypto.getRandomValues(new Uint8Array(9))).toString("hex");

async function ler(chave: string) {
  if (!temBaseDados()) return null;
  await garantirTabelas();
  return lerConfig(chave);
}

/** Versão atual das sessões ("" enquanto a palavra-passe nunca foi mudada no site). */
export async function versaoAtual() {
  return (await ler("gestao_versao")) ?? "";
}

/** Há alguma palavra-passe definida (no site ou na Vercel)? */
export async function palavraPasseDefinida() {
  return Boolean(process.env.GESTAO_PALAVRA_PASSE) || Boolean(await ler("gestao_pp"));
}

export async function palavraPasseCerta(tentativa: string) {
  if (!tentativa) return false;
  const guardada = await ler("gestao_pp");
  if (guardada) return confereHash(tentativa, guardada);
  return palavraVercelCerta(tentativa);
}

/** Código de recuperação certo? Também aceita a palavra-passe da Vercel, como reserva. */
export async function codigoCerto(tentativa: string) {
  const limpo = normalizarCodigo(tentativa);
  if (limpo && (await confereHash(limpo, await ler("gestao_recuperacao")))) return true;
  return palavraVercelCerta(tentativa.trim());
}

/** Grava a nova palavra-passe e devolve a nova versão das sessões. */
export async function definirPalavraPasse(nova: string) {
  await garantirTabelas();
  const versao = novaVersao();
  await gravarConfig("gestao_pp", await criarHash(nova));
  await gravarConfig("gestao_versao", versao);
  return versao;
}

/** Cria um código novo (o anterior deixa de servir) e devolve-o, para mostrar uma única vez. */
export async function novoCodigo() {
  await garantirTabelas();
  const codigo = gerarCodigo();
  await gravarConfig("gestao_recuperacao", await criarHash(normalizarCodigo(codigo)));
  await gravarConfig("gestao_rec_criado", new Date().toISOString().slice(0, 10));
  return codigo;
}

/** Data em que o código atual foi criado, ou null se ainda não há código. */
export async function codigoCriadoEm() {
  if (!(await ler("gestao_recuperacao"))) return null;
  return (await ler("gestao_rec_criado")) ?? "";
}

/** Valida a nova palavra-passe; devolve a mensagem de erro ou null. */
export function erroNova(nova: string, repetida: string) {
  if (nova.length < MINIMO) return `A palavra-passe nova tem de ter pelo menos ${MINIMO} caracteres.`;
  if (nova !== repetida) return "As duas palavras-passe novas não são iguais.";
  return null;
}
