"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITENS = [
  { href: "/gestao", label: "Painel" },
  { href: "/gestao/reservas", label: "Reservas" },
  { href: "/gestao/calendario", label: "Calendário" },
  { href: "/gestao/precos", label: "Preços" },
  { href: "/gestao/faturar", label: "Por faturar" },
  { href: "/gestao/despesas", label: "Despesas" },
  { href: "/gestao/banco", label: "Banco" },
  { href: "/gestao/resumo", label: "Resumo" },
  { href: "/gestao/pedidos", label: "Pedidos do site" },
  { href: "/gestao/importar", label: "Importar" },
  { href: "/gestao/alojamentos", label: "Alojamentos" },
  { href: "/gestao/conta", label: "Acesso" },
];

export default function Nav() {
  const p = usePathname();
  return (
    <nav className="mx-auto w-full max-w-6xl overflow-x-auto px-2 sm:px-4" aria-label="Gestão">
      <ul className="flex gap-1 whitespace-nowrap pt-3">
        {ITENS.map((i) => {
          const ativo = i.href === "/gestao" ? p === "/gestao" : p.startsWith(i.href);
          return (
            <li key={i.href}>
              <Link
                href={i.href}
                aria-current={ativo ? "page" : undefined}
                className={`block rounded-t-md px-3 py-2.5 text-sm font-semibold transition-colors ${
                  ativo ? "bg-[#f6f4f0] text-xisto" : "text-nevoa hover:text-white"
                }`}
              >
                {i.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
