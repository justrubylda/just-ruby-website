export default function Header() {
  return (
    <header className="w-full bg-black text-white border-b border-yellow-600">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-bold tracking-wide text-yellow-500">
          JUST RUBY
        </h1>

        <nav>
          <ul className="flex gap-8 text-sm uppercase tracking-wide">
            <li>
              <a href="#" className="hover:text-yellow-500 transition-colors">
                Início
              </a>
            </li>

            <li>
              <a href="#" className="hover:text-yellow-500 transition-colors">
                Alojamentos
              </a>
            </li>

            <li>
              <a href="#" className="hover:text-yellow-500 transition-colors">
                Sobre
              </a>
            </li>

            <li>
              <a href="#" className="hover:text-yellow-500 transition-colors">
                Galeria
              </a>
            </li>

            <li>
              <a href="#" className="hover:text-yellow-500 transition-colors">
                Contactos
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
