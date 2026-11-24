// Sessão da área de gestão: um cookie assinado (HMAC), sem guardar nada no servidor.
// A palavra-passe fica na base de dados (só o "hash", ver palavra.ts); enquanto não houver
// nenhuma lá, vale a da variável de ambiente GESTAO_PALAVRA_PASSE (Vercel).
// O cookie leva uma "versão": mudar a palavra-passe muda a versão e termina as outras sessões
// (a versão é confirmada contra a base de dados em acesso.ts).
// Usado também pelo proxy.ts, por isso só usa Web Crypto (sem módulos do Node).

export const COOKIE = "jr_gestao";
export const DIAS_SESSAO = 30;

const enc = new TextEncoder();

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

export function iguais(a: string, b: string) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

/** Compara com a palavra-passe da Vercel (GESTAO_PALAVRA_PASSE), sem revelar o tamanho. */
export async function palavraVercelCerta(tentativa: string) {
  const certa = process.env.GESTAO_PALAVRA_PASSE;
  if (!certa) return false;
  // Compara as assinaturas (mesmo tamanho), não o texto.
  return iguais(await assinar(`pp:${tentativa}`), await assinar(`pp:${certa}`));
}

export async function criarToken(versao: string) {
  const expira = Date.now() + DIAS_SESSAO * 86_400_000;
  return `${expira}.${versao}.${await assinar(`s:${expira}:${versao}`)}`;
}

/** Versão de uma sessão válida (assinatura certa e dentro do prazo), ou null. */
export async function versaoDoToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const partes = token.split(".");
  // Sessões antigas (antes de haver versões): "expira.assinatura", versão vazia.
  const [expira, versao, assinatura] = partes.length === 2 ? [partes[0], "", partes[1]] : partes;
  if (partes.length > 3 || !expira || !assinatura || !(Number(expira) > Date.now())) return null;
  const certa = partes.length === 2 ? await assinar(`s:${expira}`) : await assinar(`s:${expira}:${versao}`);
  return iguais(assinatura, certa) ? versao : null;
}

/** Primeira barreira (proxy): só confirma a assinatura e o prazo. */
export async function tokenValido(token: string | undefined) {
  return (await versaoDoToken(token)) !== null;
}
