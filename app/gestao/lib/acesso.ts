import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE, tokenValido } from "./sessao";

/** Garante que quem pede está autenticado; caso contrário, vai para a entrada. */
export async function exigirSessao() {
  const c = await cookies();
  if (!(await tokenValido(c.get(COOKIE)?.value))) redirect("/gestao/entrar");
}

export async function temSessao() {
  const c = await cookies();
  return tokenValido(c.get(COOKIE)?.value);
}
