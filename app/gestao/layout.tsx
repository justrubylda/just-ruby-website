import type { Metadata } from "next";
import Link from "next/link";
import { sair } from "./acoes";
import { temSessao } from "./lib/acesso";
import Nav from "./componentes/Nav";

export const metadata: Metadata = {
  title: { absolute: "Gestão · JUST RUBY" },
  robots: { index: false, follow: false },
};

export default async function GestaoLayout({ children }: { children: React.ReactNode }) {
  const logado = await temSessao();
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#f6f4f0] print:bg-white text-[0.95rem] text-xisto">
      <header className="bg-preto text-white print:hidden">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 pt-4 sm:px-6">
          <Link href="/gestao" className="font-display text-xl tracking-wide text-ouro-claro">
            JUST RUBY <span className="text-sm text-nevoa">· Gestão</span>
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="rounded-md border border-white/25 px-3 py-1.5 font-semibold text-white transition-colors hover:border-ouro-claro hover:text-ouro-claro"
            >
              Ver o site
            </Link>
            {logado && (
              <form action={sair}>
                <button className="rounded-md px-3 py-1.5 font-semibold text-nevoa transition-colors hover:text-white">
                  Sair
                </button>
              </form>
            )}
          </div>
        </div>
        {logado ? <Nav /> : <div className="h-4" />}
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 print:max-w-none print:p-0">{children}</main>
    </div>
  );
}
