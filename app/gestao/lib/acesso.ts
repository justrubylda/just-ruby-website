import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { versaoAtual } from "./palavra";
import { COOKIE, versaoDoToken } from "./sessao";

/** Sessão válida: assinatura certa, dentro do prazo e da versão atual da palavra-passe. */
export async function temSessao() {
  const c = await cookies();
  const versao = await versaoDoToken(c.get(COOKIE)?.value);
  if (versao === null) return false;
  return versao === (await versaoAtual());
}

/** Garante que quem pede está autenticado; caso contrário, vai para a entrada. */
export async function exigirSessao() {
  if (!(await temSessao())) redirect("/gestao/entrar");
}
