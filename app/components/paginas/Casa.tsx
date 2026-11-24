import type { Metadata, ResolvingMetadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Avaliacao from "@/app/components/Avaliacao";
import CasaVisual from "@/app/components/CasaVisual";
import { CalendarioDaCasa, DatasPartilhadas } from "@/app/components/DatasPartilhadas";
import JsonLd from "@/app/components/JsonLd";
import PedidoForm from "@/app/components/PedidoForm";
import { alternativas, escolherDatas, rota, rotaCasa, ui, type Lingua, type Pagina } from "@/app/i18n";
import { tabelasPrecos } from "@/app/gestao/lib/precos";
import { ocupacaoDe, temCalendario } from "@/app/lib/disponibilidade";
import { euros, precoDesde } from "@/app/lib/orcamento";
import { casaEm, casas, getCasa, site } from "@/app/site";
import { zonas } from "@/app/zona";

const TEXTOS = {
  pt: {
    alojamentos: "Alojamentos",
    migalhas: "Localização na página",
    inicio: "Início",
    aCasa: "A casa",
    encontra: "O que encontra",
    comodidades: "Comodidades",
    checkOut: (h: string) => `Check-out até às ${h.replace(":", "h")}`,
    disponibilidade: "Disponibilidade",
    dispTexto: "Escolha a chegada e a partida. As noites riscadas já estão ocupadas.",
    desde: "desde",
    noite: "noite",
    naZona: "Na zona",
    maisZona: "Mais ideias para a zona",
    comoReservar: "Como reservar",
    passos: [
      "Envie-nos as datas e o número de pessoas, pelo formulário ou por email.",
      "Respondemos com a disponibilidade e o preço da estadia.",
      "Depois de confirmar, enviamos a morada e as indicações para chegar.",
    ],
    tambem: "Também pode reservar",
    noAirbnb: "no Airbnb",
    ou: " ou ",
    noBooking: "no Booking.com",
    rnal: "Registo de Alojamento Local n.º",
    pedirTexto: "Diga-nos as datas e respondemos com o preço.",
    pedirComPreco: "Escolha as datas e envie o pedido. Confirmamos a reserva por mensagem.",
    fotografias: "Fotografias",
    conheca: (cidade: string) => `Conheça também, em ${cidade}`,
    titulo: (nome: string, tipo: string, cidade: string) =>
      `${nome}, ${tipo.charAt(0).toLowerCase()}${tipo.slice(1)} em ${cidade}`,
    descricao: (frase: string) => `${frase} Peça disponibilidade diretamente aos anfitriões.`,
    locale: "pt_PT",
  },
  en: {
    alojamentos: "Accommodation",
    migalhas: "Breadcrumb",
    inicio: "Home",
    aCasa: "The house",
    encontra: "What you'll find",
    comodidades: "Amenities",
    checkOut: (h: string) => `Check-out by ${h}`,
    disponibilidade: "Availability",
    dispTexto: "Choose your arrival and departure. Nights crossed out are already booked.",
    desde: "from",
    noite: "night",
    naZona: "In the area",
    maisZona: "More ideas for the area",
    comoReservar: "How to book",
    passos: [
      "Send us your dates and the number of guests, using the form or by email.",
      "We reply with availability and the price of your stay.",
      "Once you confirm, we send you the address and directions.",
    ],
    tambem: "You can also book",
    noAirbnb: "on Airbnb",
    ou: " or ",
    noBooking: "on Booking.com",
    rnal: "Local Accommodation (AL) registration no.",
    pedirTexto: "Tell us your dates and we'll reply with the price.",
    pedirComPreco: "Choose your dates and send the request. We confirm the booking by message.",
    fotografias: "Photos",
    conheca: (cidade: string) => `Also see, in ${cidade}`,
    titulo: (nome: string, tipo: string, cidade: string) =>
      `${nome}, ${tipo.charAt(0).toLowerCase()}${tipo.slice(1)} in ${cidade}, Portugal`,
    descricao: (frase: string) => `${frase} Book directly with the hosts.`,
    locale: "en_GB",
  },
  es: {
    alojamentos: "Alojamientos",
    migalhas: "Ruta de navegación",
    inicio: "Inicio",
    aCasa: "La casa",
    encontra: "Qué encontrará",
    comodidades: "Servicios",
    checkOut: (h: string) => `Salida antes de las ${h}`,
    disponibilidade: "Disponibilidad",
    dispTexto: "Elija la llegada y la salida. Las noches tachadas ya están ocupadas.",
    desde: "desde",
    noite: "noche",
    naZona: "En la zona",
    maisZona: "Más ideas para la zona",
    comoReservar: "Cómo reservar",
    passos: [
      "Envíenos las fechas y el número de personas, por el formulario o por email.",
      "Le respondemos con la disponibilidad y el precio de la estancia.",
      "Tras la confirmación, le enviamos la dirección y las indicaciones para llegar.",
    ],
    tambem: "También puede reservar",
    noAirbnb: "en Airbnb",
    ou: " o ",
    noBooking: "en Booking.com",
    rnal: "Registro de Alojamiento Local (AL) n.º",
    pedirTexto: "Díganos las fechas y le respondemos con el precio.",
    pedirComPreco: "Elija las fechas y envíe la solicitud. Confirmamos la reserva por mensaje.",
    fotografias: "Fotografías",
    conheca: (cidade: string) => `Descubra también, en ${cidade}`,
    titulo: (nome: string, tipo: string, cidade: string) =>
      `${nome}, ${tipo.charAt(0).toLowerCase()}${tipo.slice(1)} en ${cidade}, Portugal`,
    descricao: (frase: string) => `${frase} Reserve directamente con los anfitriones.`,
    locale: "es_ES",
  },
  fr: {
    alojamentos: "Hébergements",
    migalhas: "Fil d'Ariane",
    inicio: "Accueil",
    aCasa: "La maison",
    encontra: "Ce que vous trouverez",
    comodidades: "Équipements",
    checkOut: (h: string) => `Départ avant ${h.replace(":", "h")}`,
    disponibilidade: "Disponibilités",
    dispTexto: "Choisissez l’arrivée et le départ. Les nuits barrées sont déjà réservées.",
    desde: "à partir de",
    noite: "nuit",
    naZona: "Dans la région",
    maisZona: "Plus d'idées pour la région",
    comoReservar: "Comment réserver",
    passos: [
      "Envoyez-nous vos dates et le nombre de personnes, par le formulaire ou par e-mail.",
      "Nous vous répondons avec les disponibilités et le prix du séjour.",
      "Après confirmation, nous vous envoyons l'adresse et l'itinéraire.",
    ],
    tambem: "Vous pouvez aussi réserver",
    noAirbnb: "sur Airbnb",
    ou: " ou ",
    noBooking: "sur Booking.com",
    rnal: "N° d'enregistrement d'hébergement local (AL)",
    pedirTexto: "Indiquez-nous vos dates et nous vous répondrons avec le prix.",
    pedirComPreco: "Choisissez vos dates et envoyez la demande. Nous confirmons la réservation par message.",
    fotografias: "Photos",
    conheca: (cidade: string) => `À découvrir aussi, à ${cidade}`,
    titulo: (nome: string, tipo: string, cidade: string) =>
      `${nome}, ${tipo.charAt(0).toLowerCase()}${tipo.slice(1)} à ${cidade}, Portugal`,
    descricao: (frase: string) => `${frase} Réservez directement auprès des hôtes.`,
    locale: "fr_FR",
  },
};

export const slugsCasas = () => casas.map((c) => ({ slug: c.slug }));

export async function metadadosCasa(l: Lingua, slug: string, parent: ResolvingMetadata): Promise<Metadata> {
  const original = getCasa(slug);
  if (!original) return {};
  const casa = casaEm(original, l);
  const t = TEXTOS[l];
  const descricao = casa.pesquisa?.descricao ?? t.descricao(casa.frase);
  const capa = casa.fotos[0];
  const ogAnterior = (await parent).openGraph;

  return {
    title: casa.pesquisa?.titulo ?? t.titulo(casa.nome, casa.tipo, casa.cidade),
    description: descricao,
    alternates: alternativas(l, "alojamentos", casa.slug),
    openGraph: {
      type: "website",
      locale: t.locale,
      siteName: site.nome,
      title: `${casa.nome} | ${site.nome}`,
      description: descricao,
      url: rotaCasa(l, casa.slug),
      images: capa ? [{ url: capa.src, alt: capa.alt }] : ogAnterior?.images,
    },
  };
}

const marca = <span aria-hidden="true" className="mt-[0.75em] h-1.5 w-1.5 shrink-0 rotate-45 bg-ouro" />;

export default async function Casa({ l, slug }: { l: Lingua; slug: string }) {
  const original = getCasa(slug);
  if (!original) notFound();
  const casa = casaEm(original, l);
  const t = TEXTOS[l];

  const outraOriginal = casas.find((c) => c.slug !== casa.slug);
  const outra = outraOriginal ? casaEm(outraOriginal, l) : undefined;
  const comCalendario = temCalendario(casa.slug);
  const [ocupado, precos] = await Promise.all([
    comCalendario ? ocupacaoDe(casa.slug) : Promise.resolve([]),
    tabelasPrecos(),
  ]);
  const precosCasa = precos[casa.slug];
  const desde = precoDesde(precosCasa);
  const galeria = casa.fotos.slice(1);
  const zona = zonas.find((z) => z.casa === casa.slug);
  // Páginas "onde ficar" ligadas a esta zona (Castelo do Bode, Tabuleiros, CNEMA), sem repetir.
  const rotulosPaginas: Partial<Record<Pagina, string>> = {
    castelo: ui[l].castelo,
    tabuleiros: ui[l].tabuleiros,
    cnema: ui[l].cnema,
  };
  const paginasZona = zona
    ? [...new Set([...zona.sitios, ...zona.festas].map((x) => x.pagina))].filter(
        (p): p is Pagina => p !== undefined && p in rotulosPaginas
      )
    : [];
  const url = `${site.url}${rotaCasa(l, casa.slug)}`;
  const anuncios = [casa.booking, casa.airbnb].filter(Boolean);

  // Dados para o Google (schema.org). O "@id" é o mesmo nas duas línguas: é a mesma casa.
  const dadosGoogle = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LodgingBusiness",
        "@id": `${site.url}${rotaCasa("pt", casa.slug)}#alojamento`,
        name: casa.nome,
        description: casa.descricao.join(" "),
        url,
        email: site.email,
        ...(site.telefone ? { telephone: `+${site.telefone}` } : {}),
        ...(casa.fotos.length ? { image: casa.fotos.map((f) => `${site.url}${f.src}`) } : {}),
        address: {
          "@type": "PostalAddress",
          addressLocality: casa.freguesia,
          addressRegion: casa.cidade,
          addressCountry: "PT",
        },
        numberOfRooms: casa.quartos,
        ...(casa.checkOut ? { checkoutTime: casa.checkOut } : {}),
        amenityFeature: casa.comodidades.map((name) => ({
          "@type": "LocationFeatureSpecification",
          name,
          value: true,
        })),
        ...(anuncios.length ? { sameAs: anuncios } : {}),
        parentOrganization: { "@id": `${site.url}/#organizacao` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: t.inicio, item: `${site.url}${rota(l, "inicio") === "/" ? "" : rota(l, "inicio")}` },
          { "@type": "ListItem", position: 2, name: t.alojamentos, item: `${site.url}${rota(l, "alojamentos")}` },
          { "@type": "ListItem", position: 3, name: casa.nome, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={dadosGoogle} />

      {/* Abertura com a foto de capa */}
      <section className="relative bg-preto text-white">
        <CasaVisual casa={casa} sizes="100vw" prioridade gravura={false} className="absolute inset-0" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-preto/90 via-preto/30 to-preto/60" />
        <div className="relative mx-auto flex min-h-[30rem] max-w-7xl flex-col justify-between px-5 pb-12 pt-8 md:min-h-[36rem] md:px-8 md:pb-16">
          <nav aria-label={t.migalhas} className="text-sm text-nevoa">
            <Link href={rota(l, "alojamentos")} className="hover:text-ouro-claro">
              {t.alojamentos}
            </Link>
            <span aria-hidden="true" className="mx-2 text-ouro">/</span>
            <span aria-current="page">{casa.nome}</span>
          </nav>

          <div>
            <p className="text-lg text-ouro-claro">{casa.local}</p>
            <h1 className="mt-2 text-5xl md:text-7xl">{casa.nome}</h1>
            <span className="filete mt-6" aria-hidden="true" />
            <p className="mt-6 max-w-2xl text-lg text-nevoa md:text-xl">{casa.frase}</p>
            {casa.avaliacao && <Avaliacao avaliacao={casa.avaliacao} l={l} claro className="mt-5" />}
            <Link
              href="#pedido"
              className="mt-8 inline-block rounded-sm bg-ouro px-6 py-3.5 font-semibold text-preto transition-colors hover:bg-ouro-claro lg:hidden"
            >
              {ui[l].pedir}
            </Link>
          </div>
        </div>
      </section>

      <DatasPartilhadas>
      <div className="mx-auto grid max-w-7xl gap-14 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
        <div className="space-y-16">
          <section>
            <h2 className="text-3xl md:text-4xl">{t.aCasa}</h2>
            <div className="mt-6 max-w-2xl space-y-5 text-lg">
              {casa.descricao.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-3xl md:text-4xl">{t.encontra}</h2>
            <ul className="mt-6 grid max-w-2xl gap-x-8 gap-y-3 sm:grid-cols-2">
              {casa.destaques.map((d) => (
                <li key={d} className="flex gap-3 text-lg">
                  {marca}
                  {d}
                </li>
              ))}
              {casa.capacidade && (
                <li className="flex gap-3 text-lg">
                  {marca}
                  {casa.capacidade}
                </li>
              )}
              {casa.checkOut && (
                <li className="flex gap-3 text-lg">
                  {marca}
                  {t.checkOut(casa.checkOut)}
                </li>
              )}
            </ul>
            {casa.comodidades.length > 0 && (
              <>
                <h3 className="mt-8 font-sans text-sm font-semibold text-cinza">{t.comodidades}</h3>
                <ul className="mt-3 flex max-w-2xl flex-wrap gap-2">
                  {casa.comodidades.map((c) => (
                    <li key={c} className="rounded-sm border border-ouro/50 px-3 py-1.5 text-sm">
                      {c}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <section id="disponibilidade" className="scroll-mt-24">
            <h2 className="text-3xl md:text-4xl">{t.disponibilidade}</h2>
            <p className="mt-3 max-w-2xl text-cinza">{t.dispTexto}</p>
            <div className="mt-6 border-y border-xisto/15 py-6">
              <CalendarioDaCasa l={l} ocupado={ocupado} precos={precosCasa} />
            </div>
          </section>

          <section>
            <h2 className="text-3xl md:text-4xl">{t.naZona}</h2>
            <ul className="mt-6 max-w-2xl divide-y divide-xisto/15 border-y border-xisto/15">
              {casa.perto.map((p) => (
                <li key={p.nome} className="py-5">
                  <p className="font-semibold">{p.nome}</p>
                  <p className="text-cinza">{p.nota}</p>
                </li>
              ))}
            </ul>
            {zona && (
              <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
                <Link
                  href={`${rota(l, "zona")}#${zona.id}`}
                  className="inline-block border-b border-ouro-escuro pb-1 font-semibold text-ouro-escuro hover:text-xisto"
                >
                  {t.maisZona}
                </Link>
                {paginasZona.map((p) => (
                  <Link
                    key={p}
                    href={rota(l, p)}
                    className="inline-block border-b border-ouro-escuro pb-1 font-semibold text-ouro-escuro hover:text-xisto"
                  >
                    {rotulosPaginas[p]}
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-3xl md:text-4xl">{t.comoReservar}</h2>
            <ol className="mt-6 max-w-2xl space-y-6">
              {t.passos.map((passo, i) => (
                <li key={passo} className="flex gap-5">
                  <span className="w-6 shrink-0 font-display text-3xl leading-none text-ouro-escuro">{i + 1}</span>
                  <p className="text-lg">{passo}</p>
                </li>
              ))}
            </ol>

            {(casa.airbnb || casa.booking) && (
              <p className="mt-8 max-w-2xl text-cinza">
                {t.tambem}{" "}
                {casa.airbnb && (
                  <a href={casa.airbnb} target="_blank" rel="noopener noreferrer" className="font-semibold text-ouro-escuro underline underline-offset-4">
                    {t.noAirbnb}
                  </a>
                )}
                {casa.airbnb && casa.booking && t.ou}
                {casa.booking && (
                  <a href={casa.booking} target="_blank" rel="noopener noreferrer" className="font-semibold text-ouro-escuro underline underline-offset-4">
                    {t.noBooking}
                  </a>
                )}
                .
              </p>
            )}

            {casa.rnal && (
              <p className="mt-6 text-sm text-cinza">
                {t.rnal} {casa.rnal}
              </p>
            )}
          </section>
        </div>

        <aside id="pedido" className="scroll-mt-24 self-start bg-pedra p-6 md:p-8 lg:sticky lg:top-24">
          {desde != null ? (
            <>
              <p className="text-cinza">
                {t.desde} <span className="font-display text-4xl text-xisto">{euros(desde, l)}</span> / {t.noite}
              </p>
              {precosCasa && precosCasa.limpeza > 0 && (
                <p className="mt-1 text-sm text-cinza">{escolherDatas[l].maisLimpeza(euros(precosCasa.limpeza, l))}</p>
              )}
            </>
          ) : (
            <h2 className="text-3xl">{ui[l].pedir}</h2>
          )}
          <p className="mt-3 text-cinza">{desde != null ? t.pedirComPreco : t.pedirTexto}</p>
          <div className="mt-6">
            <PedidoForm
              casaInicial={casa.slug}
              tema="claro"
              ocupado={{ [casa.slug]: ocupado }}
              precos={precosCasa ? { [casa.slug]: precosCasa } : {}}
              l={l}
            />
          </div>
        </aside>
      </div>
      </DatasPartilhadas>

      {galeria.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8">
          <h2 className="text-3xl md:text-4xl">{t.fotografias}</h2>
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
        <Link href={rotaCasa(l, outra.slug)} className="group relative block bg-preto text-white">
          <CasaVisual casa={outra} sizes="100vw" gravura={false} className="absolute inset-0 opacity-70" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-preto/90 to-preto/30" />
          <div className="relative mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-24">
            <p className="text-ouro-claro">{t.conheca(outra.cidade)}</p>
            <p className="mt-2 font-display text-4xl md:text-5xl">{outra.nome}</p>
            <p className="mt-3 max-w-xl text-nevoa">{outra.frase}</p>
            <span className="mt-6 inline-block border-b border-ouro pb-1 font-semibold transition-colors group-hover:text-ouro-claro">
              {ui[l].ver(outra.nome)}
            </span>
          </div>
        </Link>
      )}
    </>
  );
}
