import type { Metadata, ResolvingMetadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Calendario from "@/app/components/Calendario";
import CasaVisual from "@/app/components/CasaVisual";
import JsonLd from "@/app/components/JsonLd";
import PedidoForm from "@/app/components/PedidoForm";
import { ocupacaoDe, temCalendario } from "@/app/lib/disponibilidade";
import { casas, getCasa, site } from "@/app/site";

export const dynamicParams = false;
// A disponibilidade (Airbnb + Booking) é revista de hora a hora.
export const revalidate = 3600;

export function generateStaticParams() {
  return casas.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(
  {
    params,
  }: {
    params: Promise<{ slug: string }>;
  },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const casa = getCasa(slug);
  if (!casa) return {};

  const descricao = `${casa.frase} Peça disponibilidade diretamente aos anfitriões.`;
  const capa = casa.fotos[0];
  const ogAnterior = (await parent).openGraph;

  return {
    title: `${casa.nome}, ${casa.tipo.charAt(0).toLowerCase()}${casa.tipo.slice(1)} em ${casa.cidade}`,
    description: descricao,
    alternates: { canonical: `/alojamentos/${casa.slug}` },
    openGraph: {
      type: "website",
      locale: "pt_PT",
      siteName: site.nome,
      title: `${casa.nome} | ${site.nome}`,
      description: descricao,
      url: `/alojamentos/${casa.slug}`,
      images: capa ? [{ url: capa.src, alt: capa.alt }] : ogAnterior?.images,
    },
  };
}

export default async function CasaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const casa = getCasa(slug);
  if (!casa) notFound();

  const outra = casas.find((c) => c.slug !== casa.slug);
  const comCalendario = temCalendario(casa.slug);
  const ocupado = comCalendario ? await ocupacaoDe(casa.slug) : [];
  const galeria = casa.fotos.slice(1);

  const dadosGoogle = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: casa.nome,
    description: casa.descricao.join(" "),
    url: `${site.url}/alojamentos/${casa.slug}`,
    email: site.email,
    ...(site.telefone ? { telephone: `+${site.telefone}` } : {}),
    ...(casa.fotos.length ? { image: casa.fotos.map((f) => `${site.url}${f.src}`) } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: casa.freguesia,
      addressRegion: casa.cidade,
      addressCountry: "PT",
    },
    ...(casa.piscina
      ? {
          amenityFeature: [
            { "@type": "LocationFeatureSpecification", name: "Piscina", value: true },
          ],
        }
      : {}),
    parentOrganization: { "@type": "Organization", name: site.empresa, url: site.url },
  };

  return (
    <>
      <JsonLd data={dadosGoogle} />

      {/* Abertura com a foto de capa */}
      <section className="relative bg-preto text-white">
        <CasaVisual casa={casa} sizes="100vw" prioridade gravura={false} className="absolute inset-0" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-preto/90 via-preto/30 to-preto/60" />
        <div className="relative mx-auto flex min-h-[30rem] max-w-7xl flex-col justify-between px-5 pb-12 pt-8 md:min-h-[36rem] md:px-8 md:pb-16">
          <nav aria-label="Localização na página" className="text-sm text-nevoa">
            <Link href="/alojamentos" className="hover:text-ouro-claro">
              Alojamentos
            </Link>
            <span aria-hidden="true" className="mx-2 text-ouro">/</span>
            <span aria-current="page">{casa.nome}</span>
          </nav>

          <div>
            <p className="text-lg text-ouro-claro">{casa.local}</p>
            <h1 className="mt-2 text-5xl md:text-7xl">{casa.nome}</h1>
            <span className="filete mt-6" aria-hidden="true" />
            <p className="mt-6 max-w-2xl text-lg text-nevoa md:text-xl">{casa.frase}</p>
            <Link
              href="#pedido"
              className="mt-8 inline-block rounded-sm bg-ouro px-6 py-3.5 font-semibold text-preto transition-colors hover:bg-ouro-claro lg:hidden"
            >
              Pedir disponibilidade
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-14 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
        <div className="space-y-16">
          <section>
            <h2 className="text-3xl md:text-4xl">A casa</h2>
            <div className="mt-6 max-w-2xl space-y-5 text-lg">
              {casa.descricao.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-3xl md:text-4xl">O que encontra</h2>
            <ul className="mt-6 grid max-w-2xl gap-x-8 gap-y-3 sm:grid-cols-2">
              {casa.destaques.map((d) => (
                <li key={d} className="flex gap-3 text-lg">
                  <span aria-hidden="true" className="mt-[0.75em] h-1.5 w-1.5 shrink-0 rotate-45 bg-ouro" />
                  {d}
                </li>
              ))}
              {casa.capacidade && (
                <li className="flex gap-3 text-lg">
                  <span aria-hidden="true" className="mt-[0.75em] h-1.5 w-1.5 shrink-0 rotate-45 bg-ouro" />
                  {casa.capacidade}
                </li>
              )}
            </ul>
          </section>

          {comCalendario && (
            <section id="disponibilidade" className="scroll-mt-24">
              <h2 className="text-3xl md:text-4xl">Disponibilidade</h2>
              <div className="mt-6 max-w-2xl">
                <Calendario intervalos={ocupado} />
              </div>
            </section>
          )}

          <section>
            <h2 className="text-3xl md:text-4xl">Na zona</h2>
            <ul className="mt-6 max-w-2xl divide-y divide-xisto/15 border-y border-xisto/15">
              {casa.perto.map((p) => (
                <li key={p.nome} className="py-5">
                  <p className="font-semibold">{p.nome}</p>
                  <p className="text-cinza">{p.nota}</p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-3xl md:text-4xl">Como reservar</h2>
            <ol className="mt-6 max-w-2xl space-y-6">
              {[
                "Envie-nos as datas e o número de pessoas, pelo formulário ou por email.",
                "Respondemos com a disponibilidade e o preço da estadia.",
                "Depois de confirmar, enviamos a morada e as indicações para chegar.",
              ].map((passo, i) => (
                <li key={passo} className="flex gap-5">
                  <span className="w-6 shrink-0 font-display text-3xl leading-none text-ouro-escuro">{i + 1}</span>
                  <p className="text-lg">{passo}</p>
                </li>
              ))}
            </ol>

            {(casa.airbnb || casa.booking) && (
              <p className="mt-8 max-w-2xl text-cinza">
                Também pode reservar{" "}
                {casa.airbnb && (
                  <a href={casa.airbnb} target="_blank" rel="noopener noreferrer" className="font-semibold text-ouro-escuro underline underline-offset-4">
                    no Airbnb
                  </a>
                )}
                {casa.airbnb && casa.booking && " ou "}
                {casa.booking && (
                  <a href={casa.booking} target="_blank" rel="noopener noreferrer" className="font-semibold text-ouro-escuro underline underline-offset-4">
                    no Booking.com
                  </a>
                )}
                .
              </p>
            )}

            {casa.rnal && (
              <p className="mt-6 text-sm text-cinza">Registo de Alojamento Local n.º {casa.rnal}</p>
            )}
          </section>
        </div>

        <aside id="pedido" className="scroll-mt-24 self-start bg-pedra p-6 md:p-8 lg:sticky lg:top-24">
          <h2 className="text-3xl">Pedir disponibilidade</h2>
          <p className="mt-3 text-cinza">Diga-nos as datas e respondemos com o preço.</p>
          <div className="mt-6">
            <PedidoForm casaInicial={casa.slug} tema="claro" ocupado={comCalendario ? { [casa.slug]: ocupado } : {}} />
          </div>
        </aside>
      </div>

      {galeria.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8">
          <h2 className="text-3xl md:text-4xl">Fotografias</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {galeria.map((f) => (
              <div key={f.src} className="relative aspect-[4/3] overflow-hidden bg-pedra">
                <Image src={f.src} alt={f.alt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {outra && (
        <Link href={`/alojamentos/${outra.slug}`} className="group relative block bg-preto text-white">
          <CasaVisual casa={outra} sizes="100vw" gravura={false} className="absolute inset-0 opacity-70" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-preto/90 to-preto/30" />
          <div className="relative mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-24">
            <p className="text-ouro-claro">Conheça também, em {outra.cidade}</p>
            <p className="mt-2 font-display text-4xl md:text-5xl">{outra.nome}</p>
            <p className="mt-3 max-w-xl text-nevoa">{outra.frase}</p>
            <span className="mt-6 inline-block border-b border-ouro pb-1 font-semibold transition-colors group-hover:text-ouro-claro">
              Ver {outra.nome}
            </span>
          </div>
        </Link>
      )}
    </>
  );
}
