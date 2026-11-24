import "server-only";
import { headers } from "next/headers";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticationResponseJSON,
  type AuthenticatorTransportFuture,
  type PublicKeyCredentialCreationOptionsJSON,
  type PublicKeyCredentialRequestOptionsJSON,
  type RegistrationResponseJSON,
} from "@simplewebauthn/server";
import { garantirTabelas, sql, temBaseDados } from "./db";

// Entrar com a impressão digital ou o rosto do telemóvel (chaves de acesso / passkeys, WebAuthn).
// Na base de dados fica só a chave pública de cada aparelho (tabela chaves_acesso); a parte
// secreta nunca sai do telemóvel. Cada pedido usa um desafio de uso único (tabela desafios).
// A chave fica ligada ao domínio: as ativadas em justruby.pt não servem na pré-visualização.

export type Aparelho = { id: string; nome: string; criado_em: string; usado_em: string | null };

const MINUTOS_DESAFIO = 5;
const b64url = (b: Uint8Array) => Buffer.from(b).toString("base64url");
const deB64url = (s: string) => new Uint8Array(Buffer.from(s, "base64url"));

/** Domínio e origem do pedido atual. Em justruby.pt (com ou sem www) a chave serve nos dois. */
async function sitio() {
  const h = await headers();
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "localhost").split(",")[0].trim();
  const nome = host.replace(/:\d+$/, "");
  const local = nome === "localhost" || nome === "127.0.0.1";
  const proto = h.get("x-forwarded-proto")?.split(",")[0].trim() || (local ? "http" : "https");
  const rpID = nome === "justruby.pt" || nome.endsWith(".justruby.pt") ? "justruby.pt" : nome;
  return { rpID, origem: `${proto}://${host}` };
}

async function guardarDesafio(desafio: string) {
  await sql()`delete from desafios where expira < now()`;
  await sql()`insert into desafios (desafio, expira)
    values (${desafio}, now() + ${`${MINUTOS_DESAFIO} minutes`}::interval)`;
}

/** Aceita o desafio uma única vez e só dentro do prazo. */
async function gastarDesafio(desafio: string) {
  const r = await sql()`delete from desafios where desafio = ${desafio} and expira > now() returning desafio`;
  return r.length === 1;
}

export async function listarAparelhos(): Promise<Aparelho[]> {
  if (!temBaseDados()) return [];
  await garantirTabelas();
  const linhas = await sql()`select id, nome, criado_em, usado_em from chaves_acesso order by criado_em`;
  return linhas.map((l) => ({
    id: String(l.id),
    nome: String(l.nome ?? "Aparelho"),
    criado_em: new Date(l.criado_em as string).toISOString(),
    usado_em: l.usado_em ? new Date(l.usado_em as string).toISOString() : null,
  }));
}

export async function haAparelhos() {
  if (!temBaseDados()) return false;
  await garantirTabelas();
  const [l] = await sql()`select count(*)::int as n from chaves_acesso`;
  return Number(l?.n ?? 0) > 0;
}

// ---------- ativar um aparelho ----------

export async function opcoesAtivar(): Promise<PublicKeyCredentialCreationOptionsJSON> {
  await garantirTabelas();
  const { rpID } = await sitio();
  const existentes = await sql()`select id, transportes from chaves_acesso`;
  const opcoes = await generateRegistrationOptions({
    rpName: "JUST RUBY · Gestão",
    rpID,
    userName: "JUST RUBY · Gestão",
    userDisplayName: "JUST RUBY · Gestão",
    userID: new TextEncoder().encode("jr-gestao"),
    attestationType: "none",
    excludeCredentials: existentes.map((c) => ({
      id: String(c.id),
      transports: c.transportes ? (String(c.transportes).split(",") as AuthenticatorTransportFuture[]) : undefined,
    })),
    authenticatorSelection: { residentKey: "required", userVerification: "required" },
  });
  await guardarDesafio(opcoes.challenge);
  return opcoes;
}

export async function confirmarAtivar(resposta: RegistrationResponseJSON, nome: string) {
  await garantirTabelas();
  const { rpID, origem } = await sitio();
  const v = await verifyRegistrationResponse({
    response: resposta,
    expectedChallenge: gastarDesafio,
    expectedOrigin: origem,
    expectedRPID: rpID,
    requireUserVerification: true,
  });
  if (!v.verified) return false;
  const c = v.registrationInfo.credential;
  await sql()`insert into chaves_acesso (id, chave_publica, contador, transportes, nome)
    values (${c.id}, ${b64url(c.publicKey)}, ${c.counter}, ${(c.transports ?? []).join(",") || null}, ${nome.slice(0, 60) || "Aparelho"})
    on conflict (id) do nothing`;
  return true;
}

export async function removerAparelho(id: string) {
  await garantirTabelas();
  await sql()`delete from chaves_acesso where id = ${id}`;
}

// ---------- confirmar com a impressão digital ----------

export async function opcoesConfirmar(): Promise<PublicKeyCredentialRequestOptionsJSON> {
  await garantirTabelas();
  const { rpID } = await sitio();
  const opcoes = await generateAuthenticationOptions({ rpID, userVerification: "required" });
  await guardarDesafio(opcoes.challenge);
  return opcoes;
}

/** Confirma a impressão digital (ou o rosto) num aparelho ativado. */
export async function digitalCerta(resposta: AuthenticationResponseJSON) {
  if (!temBaseDados()) return false;
  await garantirTabelas();
  const [c] = await sql()`select id, chave_publica, contador, transportes from chaves_acesso where id = ${resposta.id}`;
  if (!c) return false;
  const { rpID, origem } = await sitio();
  try {
    const v = await verifyAuthenticationResponse({
      response: resposta,
      expectedChallenge: gastarDesafio,
      expectedOrigin: origem,
      expectedRPID: rpID,
      requireUserVerification: true,
      credential: {
        id: String(c.id),
        publicKey: deB64url(String(c.chave_publica)),
        counter: Number(c.contador),
        transports: c.transportes ? (String(c.transportes).split(",") as AuthenticatorTransportFuture[]) : undefined,
      },
    });
    if (!v.verified) return false;
    await sql()`update chaves_acesso set contador = ${v.authenticationInfo.newCounter}, usado_em = now() where id = ${String(c.id)}`;
    return true;
  } catch {
    return false;
  }
}
