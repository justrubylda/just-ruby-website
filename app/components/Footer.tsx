import Link from "next/link";
import { casas, menu, site } from "../site";

export default function Footer() {
  const registos = casas.filter((c) => c.rnal);

  return (
    <footer className="bg-preto text-nevoa">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div>
          <p className="font-display text-2xl tracking-[0.2em] text-ouro-claro">{site.nome}</p>
          <p className="mt-4 max-w-sm">
            Turismo rural em Tomar e Santarém. Recebemos cada hóspede pessoalmente.
          </p>
        </div>

        <nav aria-label="Rodapé">
          <h2 className="font-sans text-sm font-semibold text-white">Páginas</h2>
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
          <h2 className="font-sans text-sm font-semibold text-white">Contactos</h2>
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
              {site.empresa}, NIF {site.nif}, sede em {site.sede}.
            </p>
            {registos.map((c) => (
              <p key={c.slug}>
                {c.nome}: registo de Alojamento Local n.º {c.rnal}
              </p>
            ))}
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <a href={site.livroReclamacoes} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:text-ouro-claro hover:underline">
                Livro de Reclamações
              </a>
            </li>
            <li>
              <Link href="/privacidade" className="underline-offset-4 hover:text-ouro-claro hover:underline">
                Política de privacidade
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
