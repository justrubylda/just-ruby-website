import Link from "next/link";
import Avaliacao from "@/app/components/Avaliacao";
import FotosCasa from "@/app/components/FotosCasa";
import FotosRotativas, {
  type FotoRotativa,
} from "@/app/components/FotosRotativas";
import PesquisaDatas from "@/app/components/PesquisaDatas";
import { tabelasPrecos } from "@/app/gestao/lib/precos";
import { escolherDatas, rota, rotaCasa, ui, type Lingua } from "@/app/i18n";
import { ocupacaoTodas } from "@/app/lib/disponibilidade";
import { euros, precoDesde } from "@/app/lib/orcamento";
import { casasEm, site } from "@/app/site";

const TEXTOS = {
  pt: {
    titulo: "Duas casas com piscina no centro de Portugal",
    abertura:
      "Uma quinta de cinco hectares perto de Tomar e uma vivenda em Santarém. Reserve diretamente connosco.",
    casasTitulo: "As casas",
    desde: "desde",
    noite: "noite",
    verDatas: "Ver datas e preços",
    semPreco: "Preço por pedido",
    quartos: "quartos",
    piscina: "Piscina privada",
    albufeira: "Albufeira de Castelo do Bode, perto do Kingdom of Stone",
    diretoTitulo: "Reservar diretamente connosco",
    direto1:
      "O preço do site é o da reserva direta, sem as taxas do Airbnb ou do Booking.",
    direto2: "Vê as noites livres e o total da estadia antes de pedir.",
    direto3: "Fatura em nome pessoal ou da empresa, como precisar.",
    fecharTitulo: "Tem datas em mente?",
    fecharTexto:
      "Escolha a casa e veja no calendário as noites livres e o preço da estadia.",
    quem1: `Somos ${site.anfitrioes}. A JUST RUBY é a nossa empresa e estas são as casas de que cuidamos: preparamos cada uma antes de chegar e estamos contactáveis durante toda a estadia.`,
    conhecer: "Conhecer a JUST RUBY",
    pertoTitulo: "O que fica perto",
    maisZona: "Mais ideias para a zona",
  },
  en: {
    titulo: "Two houses with a pool in central Portugal",
    abertura:
      "A five-hectare country estate near Tomar and a villa in Santarém. Book directly with us.",
    casasTitulo: "The houses",
    desde: "from",
    noite: "night",
    verDatas: "See dates and prices",
    semPreco: "Price on request",
    quartos: "bedrooms",
    piscina: "Private pool",
    albufeira: "Castelo do Bode reservoir, near Kingdom of Stone",
    diretoTitulo: "Book directly with us",
    direto1:
      "The price on our website is the direct-booking price, without Airbnb or Booking.com fees.",
    direto2: "See the free nights and the total for your stay before you ask.",
    direto3: "Invoice in your own name or your company's, as you need.",
    fecharTitulo: "Have dates in mind?",
    fecharTexto:
      "Choose a house and see the free nights and the price of your stay on the calendar.",
    quem1:
      "We are Bruno and Rúbia. JUST RUBY is our company and these are the houses we look after: we prepare each one before you arrive and you can reach us throughout your stay.",
    conhecer: "About JUST RUBY",
    pertoTitulo: "What's nearby",
    maisZona: "More ideas for the area",
  },
  es: {
    titulo: "Dos casas con piscina en el centro de Portugal",
    abertura:
      "Una finca de cinco hectáreas cerca de Tomar y una villa en Santarém. Reserve directamente con nosotros.",
    casasTitulo: "Las casas",
    desde: "desde",
    noite: "noche",
    verDatas: "Ver fechas y precios",
    semPreco: "Precio a consultar",
    quartos: "dormitorios",
    piscina: "Piscina privada",
    albufeira: "Embalse de Castelo do Bode, cerca del Kingdom of Stone",
    diretoTitulo: "Reservar directamente con nosotros",
    direto1:
      "El precio de la web es el de la reserva directa, sin las tarifas de Airbnb o Booking.com.",
    direto2: "Vea las noches libres y el total de la estancia antes de pedir.",
    direto3: "Factura a su nombre o al de su empresa, como necesite.",
    fecharTitulo: "¿Tiene fechas en mente?",
    fecharTexto:
      "Elija la casa y vea en el calendario las noches libres y el precio de la estancia.",
    quem1:
      "Somos Bruno y Rúbia. JUST RUBY es nuestra empresa y estas son las casas que cuidamos: preparamos cada una antes de su llegada y estamos disponibles durante toda la estancia.",
    conhecer: "Conocer JUST RUBY",
    pertoTitulo: "Qué hay cerca",
    maisZona: "Más ideas para la zona",
  },
  fr: {
    titulo: "Deux maisons avec piscine au cœur du Portugal",
    abertura:
      "Un domaine de cinq hectares près de Tomar et une villa à Santarém. Réservez directement auprès de nous.",
    casasTitulo: "Les maisons",
    desde: "à partir de",
    noite: "nuit",
    verDatas: "Voir dates et prix",
    semPreco: "Prix sur demande",
    quartos: "chambres",
    piscina: "Piscine privée",
    albufeira: "Lac de Castelo do Bode, près du Kingdom of Stone",
    diretoTitulo: "Réserver directement auprès de nous",
    direto1:
      "Le prix du site est celui de la réservation directe, sans les frais d’Airbnb ou de Booking.com.",
    direto2: "Voyez les nuits libres et le total du séjour avant de demander.",
    direto3:
      "Facture à votre nom ou à celui de votre entreprise, selon vos besoins.",
    fecharTitulo: "Vous avez des dates en tête ?",
    fecharTexto:
      "Choisissez la maison et voyez sur le calendrier les nuits libres et le prix du séjour.",
    quem1:
      "Nous sommes Bruno et Rúbia. JUST RUBY est notre entreprise et voici les maisons dont nous prenons soin : nous préparons chacune avant votre arrivée et restons joignables pendant tout le séjour.",
    conhecer: "Découvrir JUST RUBY",
    pertoTitulo: "À proximité",
    maisZona: "Plus d'idées pour la région",
  },
};

export default async function Inicio({ l }: { l: Lingua }) {
  const t = TEXTOS[l];
  const casas = casasEm(l);
  const [ocupado, precos] = await Promise.all([
    ocupacaoTodas(),
    tabelasPrecos(),
  ]);
  const temPrecos = Object.keys(precos).length > 0;

  // Fotografias da abertura: alternam entre as duas casas.
  const foto = (
    slug: string,
    src: string,
    legenda?: string,
  ): FotoRotativa | null => {
    const c = casas.find((x) => x.slug === slug);
    const f = c?.fotos.find((x) => x.src === src);
    return c && f
      ? { src: f.src, alt: f.alt, legenda: legenda ?? `${c.nome}, ${c.cidade}` }
      : null;
  };
  const abertura = [
    foto("kingdom-of-stone", "/fotos/kos-piscina-reflexo.jpg"),
    foto("o-nosso-cantinho", "/fotos/cantinho-piscina-panoramica.jpg"),
    foto("kingdom-of-stone", "/fotos/kos-albufeira-aerea.jpg", t.albufeira),
    foto("o-nosso-cantinho", "/fotos/cantinho-arco-piscina.jpg"),
  ].filter((f): f is FotoRotativa => f !== null);

  // Primeiras fotografias de cada cartão: exterior, piscina, sala, cozinha, quarto.
  const FOTOS_CARTAO: Record<string, string[]> = {
    "kingdom-of-stone": [
      "kos-casa-loendros",
      "kos-piscina-reflexo",
      "kos-sala",
      "kos-cozinha-lareira",
      "kos-quarto-casal",
      "kos-forno-churrasqueira",
      "kos-albufeira",
    ],
    "o-nosso-cantinho": [
      "cantinho-piscina",
      "cantinho-piscina-panoramica",
      "cantinho-esplanada",
      "cantinho-sala",
      "cantinho-quarto-casal",
      "cantinho-cozinha",
      "cantinho-churrasqueira",
    ],
  };
  const fotosCartao = (c: (typeof casas)[number]) => {
    const escolhidas = (FOTOS_CARTAO[c.slug] ?? [])
      .map((n) => c.fotos.find((f) => f.src === `/fotos/${n}.jpg`))
      .filter((f): f is (typeof c.fotos)[number] => Boolean(f));
    return escolhidas.length ? escolhidas : c.fotos.slice(0, 7);
  };

  const marca = (
    <span
      aria-hidden="true"
      className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rotate-45 bg-ouro"
    />
  );

  return (
    <>
      {/* Abertura: fotografias grandes e a barra para escolher casa, datas e pessoas. */}
      <section className="relative z-10 bg-preto text-white">
        <FotosRotativas fotos={abertura} l={l} />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-preto/90 via-preto/55 to-preto/35 md:via-preto/35"
        />
        <div className="relative mx-auto flex min-h-[40rem] max-w-7xl flex-col justify-end px-5 pb-10 pt-24 md:min-h-[min(calc(100svh-5rem),52rem)] md:px-8 md:pb-14">
          <h1 className="max-w-3xl text-5xl leading-[1.05] md:text-7xl">
            {t.titulo}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/90 md:text-xl">
            {t.abertura}
          </p>
          <div className="mt-9 max-w-5xl">
            <PesquisaDatas
              l={l}
              casas={casas.map((c) => ({
                slug: c.slug,
                nome: c.nome,
                cidade: c.cidade,
                href: rotaCasa(l, c.slug),
              }))}
              ocupado={ocupado}
              precos={precos}
            />
          </div>
        </div>
      </section>

      {/* As duas casas, com fotografias, o que têm e o preço. */}
      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <h2 className="text-4xl md:text-5xl">{t.casasTitulo}</h2>
        <div className="mt-10 grid gap-14 md:grid-cols-2 md:gap-10 lg:gap-14">
          {casas.map((c) => {
            const p = precos[c.slug];
            const desde = precoDesde(p);
            const capacidade = c.capacidade.split(" (")[0];
            const tracos = [
              capacidade,
              `${c.quartos} ${t.quartos}`,
              c.piscina ? t.piscina : "",
            ].filter(Boolean);
            return (
              <article key={c.slug} className="flex flex-col">
                <FotosCasa fotos={fotosCartao(c)} l={l} />
                <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="text-ouro-escuro">{c.local}</p>
                  {c.avaliacao && (
                    <Avaliacao
                      avaliacao={c.avaliacao}
                      l={l}
                      className="text-sm"
                    />
                  )}
                </div>
                <h3 className="mt-1 text-3xl md:text-4xl">
                  <Link
                    href={rotaCasa(l, c.slug)}
                    className="hover:text-ouro-escuro"
                  >
                    {c.nome}
                  </Link>
                </h3>
                <p className="mt-2 max-w-lg text-cinza">{c.frase}</p>
                <ul className="mt-4 flex flex-wrap gap-2 text-sm">
                  {tracos.map((x) => (
                    <li
                      key={x}
                      className="rounded-sm border border-ouro/50 px-3 py-1.5"
                    >
                      {x}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-6">
                  <div className="flex flex-wrap items-end justify-between gap-4 border-t border-xisto/15 pt-5">
                    {desde != null ? (
                      <div>
                        <p className="text-cinza">
                          {t.desde}{" "}
                          <span className="font-display text-3xl text-xisto">
                            {euros(desde, l)}
                          </span>{" "}
                          / {t.noite}
                        </p>
                        {p && p.limpeza > 0 && (
                          <p className="mt-1 text-sm text-cinza">
                            {escolherDatas[l].maisLimpeza(euros(p.limpeza, l))}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-cinza">{t.semPreco}</p>
                    )}
                    <Link
                      href={`${rotaCasa(l, c.slug)}#disponibilidade`}
                      className="rounded-sm bg-preto px-5 py-3 font-semibold text-white transition-colors hover:bg-rocha"
                    >
                      {t.verDatas}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Porquê reservar diretamente, e quem recebe. */}
      <section className="bg-pedra">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-[1fr_1.2fr] md:gap-16 md:px-8 md:py-24">
          <div>
            <h2 className="text-4xl md:text-5xl">{t.diretoTitulo}</h2>
            <p className="mt-6 max-w-md text-lg">{t.quem1}</p>
            <Link
              href={rota(l, "sobre")}
              className="mt-6 inline-block border-b border-ouro-escuro pb-1 font-semibold text-ouro-escuro hover:text-xisto"
            >
              {t.conhecer}
            </Link>
          </div>
          <ul className="space-y-6 self-center text-lg">
            {[t.direto1, temPrecos ? t.direto2 : "", t.direto3]
              .filter(Boolean)
              .map((x) => (
                <li
                  key={x}
                  className="flex gap-4 border-b border-xisto/15 pb-6 last:border-0"
                >
                  {marca}
                  {x}
                </li>
              ))}
          </ul>
        </div>
      </section>

      {/* A região à volta de cada casa */}
      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <h2 className="max-w-3xl text-4xl md:text-5xl">{t.pertoTitulo}</h2>
        <div className="mt-12 grid gap-14 md:grid-cols-2 md:gap-16">
          {casas.map((c) => (
            <div key={c.slug}>
              <h3 className="border-b border-ouro/60 pb-3 text-3xl">
                {c.cidade}
              </h3>
              <ul className="mt-6 space-y-5">
                {c.perto.map((p) => (
                  <li key={p.nome}>
                    <p className="font-semibold">{p.nome}</p>
                    <p className="text-cinza">{p.nota}</p>
                  </li>
                ))}
              </ul>
              <Link
                href={rotaCasa(l, c.slug)}
                className="mt-8 inline-block border-b border-ouro-escuro pb-1 font-semibold text-ouro-escuro hover:text-xisto"
              >
                {ui[l].ver(c.nome)}
              </Link>
            </div>
          ))}
        </div>
        <Link
          href={rota(l, "zona")}
          className="mt-14 inline-block rounded-sm border border-ouro-escuro px-6 py-3.5 font-semibold text-ouro-escuro transition-colors hover:bg-ouro hover:text-preto"
        >
          {t.maisZona}
        </Link>
      </section>

      {/* Fecho: ir direto ao calendário de cada casa. */}
      <section className="bg-preto text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-16 md:flex-row md:items-end md:justify-between md:px-8 md:py-20">
          <div>
            <h2 className="text-4xl md:text-5xl">{t.fecharTitulo}</h2>
            <p className="mt-4 max-w-xl text-lg text-nevoa">{t.fecharTexto}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {casas.map((c) => (
              <Link
                key={c.slug}
                href={`${rotaCasa(l, c.slug)}#disponibilidade`}
                className="rounded-sm border border-ouro px-5 py-3.5 font-semibold transition-colors hover:bg-ouro hover:text-preto"
              >
                {c.nome}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
