import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, tokenValido } from "@/app/gestao/lib/sessao";

// A área /gestao é privada: sem sessão válida, vai para a página de entrada.
// (As páginas e ações voltam a verificar a sessão; isto é só a primeira barreira.)
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Entrar e "Esqueci-me da palavra-passe" abrem sem sessão.
  if (pathname === "/gestao/entrar" || pathname === "/gestao/recuperar") {
    const r = NextResponse.next();
    r.headers.set("X-Robots-Tag", "noindex, nofollow");
    return r;
  }
  if (await tokenValido(request.cookies.get(COOKIE)?.value)) {
    const r = NextResponse.next();
    r.headers.set("X-Robots-Tag", "noindex, nofollow");
    r.headers.set("Cache-Control", "private, no-store");
    return r;
  }
  const url = request.nextUrl.clone();
  url.pathname = "/gestao/entrar";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/gestao", "/gestao/:path*"],
};
