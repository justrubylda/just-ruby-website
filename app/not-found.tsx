import Link from "next/link";
import Footer from "./components/Footer";
import Header from "./components/Header";

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="conteudo" className="flex-1">
        <section className="bg-preto text-white">
          <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col justify-center px-5 py-20 md:px-8">
            <h1 className="text-5xl md:text-6xl">Esta página não existe</h1>
            <span className="filete mt-8" aria-hidden="true" />
            <p className="mt-8 max-w-xl text-lg text-nevoa">
              O endereço pode ter mudado. Comece pelos alojamentos ou volte ao
              início.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/alojamentos"
                className="rounded-sm bg-ouro px-6 py-3.5 font-semibold text-preto hover:bg-ouro-claro"
              >
                Ver alojamentos
              </Link>
              <Link
                href="/"
                className="rounded-sm border border-ouro px-6 py-3.5 font-semibold text-ouro-claro hover:bg-ouro hover:text-preto"
              >
                Voltar ao início
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
