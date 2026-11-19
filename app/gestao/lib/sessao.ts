// Sessão da área de gestão: um cookie assinado (HMAC), sem guardar nada no servidor.
// A palavra-passe fica só na variável de ambiente GESTAO_PALAVRA_PASSE (Vercel).
// Mudar a palavra-passe termina todas as sessões abertas.
// Usado também pelo proxy.ts, por isso só usa Web Crypto (sem módulos do Node).

export const COOKIE = "jr_gestao";
export const DIAS_SESSAO = 30;

const enc = new TextEncoder();

export const palavraPasseConfigurada = () => Boolean(process.env.GESTAO_PALAVRA_PASSE);

function b64url(buf: ArrayBuffer) {
  let s = "";
  for (const b of new Uint8Array(buf)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function assinar(texto: string) {
  const segredo = `${process.env.GESTAO_PALAVRA_PASSE ?? ""}|${process.env.DATABASE_URL ?? ""}|jr-gestao-v1`;
  const chave = await crypto.subtle.importKey(
    "raw",
    enc.encode(segredo),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return b64url(await crypto.subtle.sign("HMAC", chave, enc.encode(texto)));
}

function iguais(a: string, b: string) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

export async function palavraPasseCerta(tentativa: string) {
  const certa = process.env.GESTAO_PALAVRA_PASSE;
  if (!certa) return false;
  // Compara as assinaturas (mesmo tamanho), não o texto.
  return iguais(await assinar(`pp:${tentativa}`), await assinar(`pp:${certa}`));
}

export async function criarToken() {
  const expira = Date.now() + DIAS_SESSAO * 86_400_000;
  return `${expira}.${await assinar(`s:${expira}`)}`;
}

export async function tokenValido(token: string | undefined) {
  if (!token || !palavraPasseConfigurada()) return false;
  const [expira, assinatura] = token.split(".");
  if (!expira || !assinatura || !(Number(expira) > Date.now())) return false;
  return iguais(assinatura, await assinar(`s:${expira}`));
}
