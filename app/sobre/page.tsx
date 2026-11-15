import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "../components/PageIntro";
import { casas, site } from "../site";

export const metadata: Metadata = {
  title: "Sobre nós",
  description:
    "A JUST RUBY é uma empresa familiar de turismo rural, sediada na Várzea, em Santarém, com alojamentos em Tomar e Santarém.",
  alternates: { canonical: "/sobre" },
};

export default function SobrePage() {
  return (
    <>
      <PageIntro
        titulo="Sobre nós"
        texto="Uma empresa de família, com duas casas no centro de Portugal."
      />

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:grid-cols-[1fr_1.6fr] md:gap-16 md:px-8 md:py-28">
        <h2 className="text-4xl md:text-5xl">Quem somos</h2>
        <div className="max-w-2xl space-y-5 text-lg">
          <p>
            Somos {site.anfitrioes}, sócios da {site.empresa}, uma pequena empresa de
            turismo com sede na Várzea, em Santarém. Temos duas casas para receber
            hóspedes: uma quinta perto de Tomar e uma vivenda às portas de Santarém.
          </p>
          <p>
            Tratamos de tudo pessoalmente: preparamos cada casa antes de cada estadia,
            respondemos às mensagens e estamos contactáveis enquanto estiver connosco.
          </p>
        </div>
      </section>

      <section className="bg-pedra">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-24">
          <h2 className="text-4xl md:text-5xl">As nossas casas</h2>
          <ul className="mt-10 grid gap-10 md:grid-cols-2">
            {casas.map((c) => (
              <li key={c.slug} className="border-t border-ouro/60 pt-6">
                <p className="text-ouro-escuro">{c.local}</p>
                <h3 className="mt-1 text-3xl">{c.nome}</h3>
                <p className="mt-3 max-w-md text-cinza">{c.frase}</p>
                <Link
                  href={`/alojamentos/${c.slug}`}
                  className="mt-5 inline-block border-b border-ouro-escuro pb-1 font-semibold text-ouro-escuro hover:text-xisto"
                >
                  Ver {c.nome}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8">
        <p className="max-w-2xl text-cinza">
          {site.empresa}, NIF {site.nif}, com sede em {site.sede}.
        </p>
      </section>
    </>
  );
}
