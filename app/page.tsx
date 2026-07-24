import Header from "./components/Header";

export default function Home() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-white">
        <section className="flex min-h-[85vh] flex-col items-center justify-center bg-gradient-to-b from-black to-zinc-900 px-6 text-center text-white">
          <p className="mb-4 text-sm uppercase tracking-[0.4em] text-yellow-500">
            JUST RUBY LDA
          </p>

          <h1 className="mb-6 max-w-4xl text-5xl font-bold leading-tight md:text-7xl">
            Turismo Rural com Elegância e Autenticidade
          </h1>

          <p className="mb-10 max-w-2xl text-lg text-zinc-300">
            Descubra experiências únicas em alojamentos cuidadosamente
            preparados para proporcionar conforto, tranquilidade e contacto com
            a natureza.
          </p>

          <div className="flex gap-4">
            <a
              href="#"
              className="rounded-full bg-yellow-500 px-8 py-4 font-semibold text-black transition hover:bg-yellow-400"
            >
              Descobrir
            </a>

            <a
              href="#"
              className="rounded-full border border-yellow-500 px-8 py-4 font-semibold text-yellow-500 transition hover:bg-yellow-500 hover:text-black"
            >
              Contactar
            </a>
          </div>
        </section>
      </main>
    </>
  );
}