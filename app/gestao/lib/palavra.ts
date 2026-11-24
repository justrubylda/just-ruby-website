import "server-only";
import { garantirTabelas, gravarConfig, lerConfig, temBaseDados } from "./db";
import { iguais, palavraVercelCerta } from "./sessao";

export { palavraVercelCerta };

// Palavra-passe da gestão. Na base de dados (tabela config) só fica o "hash" (PBKDF2), nunca o texto:
//   gestao_pp      hash da palavra-passe (enquanto não existir, vale a da Vercel)
//   gestao_versao  muda sempre que a palavra-passe muda (termina as outras sessões)
// Para repor a palavra-passe: impressão digital (digital.ts) ou, como reserva, a palavra-passe da Vercel.

export const MINIMO = 8;
const ITERACOES = 210_000;

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

/** Grava a nova palavra-passe e devolve a nova versão das sessões. */
export async function definirPalavraPasse(nova: string) {
  await garantirTabelas();
  const versao = novaVersao();
  await gravarConfig("gestao_pp", await criarHash(nova));
  await gravarConfig("gestao_versao", versao);
  return versao;
}

/** Valida a nova palavra-passe; devolve a mensagem de erro ou null. */
export function erroNova(nova: string, repetida: string) {
  if (nova.length < MINIMO) return `A palavra-passe nova tem de ter pelo menos ${MINIMO} caracteres.`;
  if (nova !== repetida) return "As duas palavras-passe novas não são iguais.";
  return null;
}
