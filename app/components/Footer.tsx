import Image from "next/image";
import Link from "next/link";
import { menu as menuDe, rota, ui, type Lingua } from "../i18n";
import { casas, site } from "../site";

export default function Footer({ l = "pt" }: { l?: Lingua }) {
  const registos = casas.filter((c) => c.rnal);
  const t = ui[l];
  const menu = [
    ...menuDe(l),
    { href: rota(l, "zona"), label: t.zona },
    { href: rota(l, "tabuleiros"), label: t.tabuleiros },
  ];

  return (
    <footer className="bg-preto text-nevoa">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div>
          <Image src="/logo-just-ruby.png" alt={site.nome} width={748} height={294} className="h-16 w-auto" />
          <p className="mt-4 max-w-sm">
            {t.rodapeFrase}
          </p>
        </div>

        <nav aria-label={t.paginas}>
          <h2 className="font-sans text-sm font-semibold text-white">{t.paginas}</h2>
          <ul className="mt-4 space-y-2">
            {menu.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-ouro-claro">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-sans text-sm font-semibold text-white">{t.contactos}</h2>
          <ul className="mt-4 space-y-2">
            <li>
              <a href={`mailto:${site.email}`} className="break-all hover:text-ouro-claro">
                {site.email}
              </a>
            </li>
            {site.telefone && (
              <li>
                <a href={`tel:+${site.telefone}`} className="hover:text-ouro-claro">
                  +{site.telefone}
                </a>
              </li>
            )}
            {site.instagram && (
              <li>
                <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-ouro-claro">
                  Instagram
                </a>
              </li>
            )}
            {site.facebook && (
              <li>
                <a href={site.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-ouro-claro">
                  Facebook
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-sm text-nevoa/80 md:flex-row md:items-start md:justify-between md:px-8">
          <div className="space-y-1">
            <p>
              {site.empresa}, NIF {site.nif}, {t.sede} {site.sede}.
            </p>
            {registos.map((c) => (
              <p key={c.slug}>
                {c.nome}: {t.registoAL} {c.rnal}
              </p>
            ))}
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <a href={site.livroReclamacoes} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:text-ouro-claro hover:underline">
                {t.livro}
              </a>
            </li>
            <li>
              <Link href={rota(l, "privacidade")} className="underline-offset-4 hover:text-ouro-claro hover:underline">
                {t.privacidade}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
