import Link from "next/link";
import PageIntro from "@/app/components/PageIntro";
import { rotaCasa, ui, type Lingua } from "@/app/i18n";
import { casasEm, site } from "@/app/site";

const TEXTOS = {
  pt: {
    titulo: "Sobre nós",
    texto: "Uma empresa de família, com duas casas no centro de Portugal.",
    quem: "Quem somos",
    p1: `Somos ${site.anfitrioes}, sócios da ${site.empresa}, uma pequena empresa de turismo com sede na Várzea, em Santarém. Temos duas casas para receber hóspedes: uma quinta perto de Tomar e uma vivenda às portas de Santarém.`,
    p2: "Tratamos de tudo pessoalmente: preparamos cada casa antes de cada estadia, respondemos às mensagens e estamos contactáveis enquanto estiver connosco.",
    casas: "As nossas casas",
    legal: `${site.empresa}, NIF ${site.nif}, com sede em ${site.sede}.`,
  },
  en: {
    titulo: "About us",
    texto: "A family business with two houses in central Portugal.",
    quem: "Who we are",
    p1: `We are Bruno and Rúbia, partners in ${site.empresa}, a small tourism company based in Várzea, Santarém. We have two houses for guests: a country estate near Tomar and a villa on the edge of Santarém.`,
    p2: "We take care of everything personally: we prepare each house before every stay, answer your messages and are on hand while you are with us.",
    casas: "Our houses",
    legal: `${site.empresa}, tax number (NIF) ${site.nif}, registered office in ${site.sede}, Portugal.`,
  },
};

export default function Sobre({ l }: { l: Lingua }) {
  const t = TEXTOS[l];
  const casas = casasEm(l);

  return (
    <>
      <PageIntro titulo={t.titulo} texto={t.texto} />

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:grid-cols-[1fr_1.6fr] md:gap-16 md:px-8 md:py-28">
        <h2 className="text-4xl md:text-5xl">{t.quem}</h2>
        <div className="max-w-2xl space-y-5 text-lg">
          <p>{t.p1}</p>
          <p>{t.p2}</p>
        </div>
      </section>

      <section className="bg-pedra">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-24">
          <h2 className="text-4xl md:text-5xl">{t.casas}</h2>
          <ul className="mt-10 grid gap-10 md:grid-cols-2">
            {casas.map((c) => (
              <li key={c.slug} className="border-t border-ouro/60 pt-6">
                <p className="text-ouro-escuro">{c.local}</p>
                <h3 className="mt-1 text-3xl">{c.nome}</h3>
                <p className="mt-3 max-w-md text-cinza">{c.frase}</p>
                <Link
                  href={rotaCasa(l, c.slug)}
                  className="mt-5 inline-block border-b border-ouro-escuro pb-1 font-semibold text-ouro-escuro hover:text-xisto"
                >
                  {ui[l].ver(c.nome)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8">
        <p className="max-w-2xl text-cinza">{t.legal}</p>
      </section>
    </>
  );
}
