"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { codigo, menu as menuDe, noutraLingua, rota, ui, type Lingua } from "../i18n";
import { site } from "../site";

export default function Header({ l = "pt" }: { l?: Lingua }) {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);
  const t = ui[l];
  const menu = menuDe(l);
  const inicio = rota(l, "inicio");
  const outra: Lingua = l === "pt" ? "en" : "pt";
  const pedido = `${rota(l, "contactos")}#pedido`;

  const ativo = (href: string) =>
    href === inicio ? pathname === inicio : pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    if (!aberto) return;
    const fechar = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    window.addEventListener("keydown", fechar);
    return () => window.removeEventListener("keydown", fechar);
  }, [aberto]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-ouro/40 bg-preto text-white">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:bg-ouro focus:px-4 focus:py-2 focus:text-preto"
      >
        {t.saltar}
      </a>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-3 md:px-8">
        <Link href={inicio} className="block shrink-0" onClick={() => setAberto(false)}>
          <Image
            src="/logo-just-ruby.png"
            alt={`${site.nome}, ${t.paginaInicial}`}
            width={748}
            height={294}
            loading="eager"
            className="h-10 w-auto md:h-11"
          />
        </Link>

        <nav aria-label={t.menuPrincipal} className="hidden lg:block">
          <ul className="flex items-center gap-8 text-[0.95rem]">
            {menu.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={ativo(item.href) ? "page" : undefined}
                  className={`border-b py-1 transition-colors hover:text-ouro-claro ${
                    ativo(item.href)
                      ? "border-ouro text-ouro-claro"
                      : "border-transparent text-white/85"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={noutraLingua(pathname)}
            hrefLang={codigo[outra]}
            lang={codigo[outra]}
            aria-label={t.outraLinguaNome}
            title={t.outraLinguaNome}
            className="rounded-sm border border-white/25 px-2.5 py-2 text-sm font-semibold text-white/85 transition-colors hover:border-ouro hover:text-ouro-claro"
          >
            {t.outraLingua}
          </Link>
          <Link
            href={pedido}
            className="hidden rounded-sm bg-ouro px-4 py-2.5 text-sm font-semibold text-preto transition-colors hover:bg-ouro-claro sm:inline-block"
          >
            {t.pedir}
          </Link>

          <button
            type="button"
            className="rounded-sm p-2 text-ouro-claro lg:hidden"
            aria-label={aberto ? t.fecharMenu : t.abrirMenu}
            aria-expanded={aberto}
            aria-controls="menu-movel"
            onClick={() => setAberto((v) => !v)}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              {aberto ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 7h18M3 12h18M3 17h18" />}
            </svg>
          </button>
        </div>
      </div>

      {aberto && (
        <nav id="menu-movel" aria-label={t.menuPrincipal} className="border-t border-white/10 lg:hidden">
          <ul className="mx-auto flex max-w-7xl flex-col px-5 py-3 md:px-8">
            {menu.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setAberto(false)}
                  aria-current={ativo(item.href) ? "page" : undefined}
                  className={`block py-3 font-display text-2xl ${
                    ativo(item.href) ? "text-ouro-claro" : "text-white"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pb-3 pt-4 sm:hidden">
              <Link
                href={pedido}
                onClick={() => setAberto(false)}
                className="block rounded-sm bg-ouro px-4 py-3 text-center font-semibold text-preto"
              >
                {t.pedir}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
