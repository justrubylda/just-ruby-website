import Link from "next/link";
import CasaVisual from "@/app/components/CasaVisual";
import PageIntro from "@/app/components/PageIntro";
import { rota, rotaCasa, ui, type Lingua } from "@/app/i18n";
import { casaEm, getCasa } from "@/app/site";
import { agendaRevistaEm, zonas } from "@/app/zona";

const TEXTOS = {
  pt: {
    titulo: "O que fazer na zona",
    texto:
      "Monumentos, rios, aldeias e festas perto das nossas casas, em Tomar e em Santarém, no centro de Portugal.",
    indice: "Nesta página",
    sitios: "O que visitar",
    festas: "Festas e feiras",
    ficar: "Onde ficar",
    pedir: "Pedir disponibilidade",
    saberMais: "Saber mais",
    revista: (d: string) => `Festas e agenda revistas a ${d}.`,
    locale: "pt-PT",
    nota: "Pergunte-nos pelos sítios de que mais gostamos: respondemos com gosto antes e durante a estadia.",
  },
  en: {
    titulo: "Things to do nearby",
    texto:
      "Monuments, rivers, villages and festivals close to our houses in Tomar and Santarém, in central Portugal.",
    indice: "On this page",
    sitios: "What to see",
    festas: "Festivals and fairs",
    ficar: "Where to stay",
    pedir: "Check availability",
    saberMais: "Find out more",
    revista: (d: string) => `Festivals and events last reviewed on ${d}.`,
    locale: "en-GB",
    nota: "Ask us about our favourite places: we're happy to help before and during your stay.",
  },
  es: {
    titulo: "Qué hacer en la zona",
    texto:
      "Monumentos, ríos, pueblos y fiestas cerca de nuestras casas, en Tomar y en Santarém, en el centro de Portugal.",
    indice: "En esta página",
    sitios: "Qué visitar",
    festas: "Fiestas y ferias",
    ficar: "Dónde alojarse",
    pedir: "Consultar disponibilidad",
    saberMais: "Más información",
    revista: (d: string) => `Fiestas y agenda revisadas el ${d}.`,
    locale: "es-ES",
    nota: "Pregúntenos por nuestros sitios favoritos: le ayudamos con gusto antes y durante la estancia.",
  },
  fr: {
    titulo: "Que faire dans la région",
    texto:
      "Monuments, rivières, villages et fêtes près de nos maisons, à Tomar et à Santarém, au cœur du Portugal.",
    indice: "Sur cette page",
    sitios: "À visiter",
    festas: "Fêtes et foires",
    ficar: "Où séjourner",
    pedir: "Demander les disponibilités",
    saberMais: "En savoir plus",
    revista: (d: string) => `Fêtes et agenda mis à jour le ${d}.`,
    locale: "fr-FR",
    nota: "Demandez-nous nos adresses préférées : nous vous aidons volontiers avant et pendant votre séjour.",
  },
};

export default function Zona({ l }: { l: Lingua }) {
  const t = TEXTOS[l];

  return (
    <>
      <PageIntro titulo={t.titulo} texto={t.texto}>
        <nav aria-label={t.indice} className="mt-10 flex flex-wrap gap-3">
          {zonas.map((z) => (
            <a
              key={z.id}
              href={`#${z.id}`}
              className="rounded-sm border border-ouro/60 px-4 py-2.5 font-semibold text-ouro-claro transition-colors hover:bg-ouro hover:text-preto"
            >
              {z.titulo[l]}
            </a>
          ))}
        </nav>
      </PageIntro>

      {zonas.map((z, i) => {
        const original = getCasa(z.casa);
        const casa = original ? casaEm(original, l) : undefined;
        return (
          <section key={z.id} id={z.id} className={`scroll-mt-20 ${i % 2 === 1 ? "bg-pedra" : ""}`}>
            <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-24">
              <h2 className="max-w-3xl text-4xl md:text-5xl">{z.titulo[l]}</h2>
              <p className="mt-6 max-w-2xl text-lg text-cinza">{z.intro[l]}</p>

              <div className="mt-12 grid gap-14 lg:grid-cols-[1.6fr_1fr] lg:gap-20">
                <div className="space-y-12">
                  <div>
                    <h3 className="border-b border-ouro/60 pb-3 text-3xl">{t.sitios}</h3>
                    <ul className="mt-2 divide-y divide-xisto/15">
                      {z.sitios.map((s) => (
                        <li key={s.nome.pt} className="py-5">
                          <p className="font-semibold">{s.nome[l]}</p>
                          <p className="text-cinza">{s.nota[l]}</p>
                          {s.pagina && (
                            <Link
                              href={rota(l, s.pagina)}
                              className="mt-2 inline-block border-b border-ouro-escuro pb-0.5 font-semibold text-ouro-escuro hover:text-xisto"
                            >
                              {t.saberMais}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {z.festas.length > 0 && (
                    <div>
                      <h3 className="border-b border-ouro/60 pb-3 text-3xl">{t.festas}</h3>
                      <ul className="mt-2 divide-y divide-xisto/15">
                        {z.festas.map((s) => (
                          <li key={s.nome.pt} className="py-5">
                            <p className="font-semibold">{s.nome[l]}</p>
                            <p className="text-cinza">{s.nota[l]}</p>
                            {s.pagina && (
                              <Link
                                href={rota(l, s.pagina)}
                                className="mt-2 inline-block border-b border-ouro-escuro pb-0.5 font-semibold text-ouro-escuro hover:text-xisto"
                              >
                                {t.saberMais}
                              </Link>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {casa && (
                  <aside className="self-start lg:sticky lg:top-24">
                    <p className="font-sans text-sm font-semibold text-cinza">{t.ficar}</p>
                    <Link href={rotaCasa(l, casa.slug)} className="group mt-3 block">
                      <CasaVisual casa={casa} sizes="(min-width: 1024px) 33vw, 100vw" className="relative aspect-[4/3]" />
                      <p className="mt-4 text-ouro-escuro">{casa.local}</p>
                      <p className="mt-1 font-display text-3xl group-hover:text-ouro-escuro">{casa.nome}</p>
                      <p className="mt-2 text-cinza">{casa.frase}</p>
                    </Link>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link
                        href={rotaCasa(l, casa.slug)}
                        className="rounded-sm bg-preto px-5 py-3 font-semibold text-white transition-colors hover:bg-xisto"
                      >
                        {ui[l].ver(casa.nome)}
                      </Link>
                      <Link
                        href={`${rotaCasa(l, casa.slug)}#pedido`}
                        className="rounded-sm border border-ouro-escuro px-5 py-3 font-semibold text-ouro-escuro transition-colors hover:bg-ouro hover:text-preto"
                      >
                        {t.pedir}
                      </Link>
                    </div>
                  </aside>
                )}
              </div>
            </div>
          </section>
        );
      })}

      <section className="bg-preto text-white">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">
          <p className="max-w-2xl text-lg text-nevoa">{t.nota}</p>
          <p className="mt-4 text-sm text-nevoa/70">
            {t.revista(
              new Date(`${agendaRevistaEm}T12:00:00Z`).toLocaleDateString(t.locale, {
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "Europe/Lisbon",
              })
            )}
          </p>
        </div>
      </section>
    </>
  );
}
