import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import CheckinOnline from "@/app/components/guia/CheckinOnline";
import CodigoCofre from "@/app/components/guia/CodigoCofre";
import ComCodigo from "@/app/components/guia/ComCodigo";
import Copiar from "@/app/components/guia/Copiar";
import { LinguaProvider, SeletorLingua } from "@/app/components/guia/Lingua";
import T, { l } from "@/app/components/guia/T";
import { anfitrioes, getGuia, guias, wifiDe } from "@/app/guias";
import { getCasa, site } from "@/app/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return guias.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const casa = getCasa(slug);
  if (!casa) return {};
  return {
    title: { absolute: `${casa.nome} · Guia do hóspede` },
    description: `Chegada, check-in e tudo o que precisa durante a estadia no ${casa.nome}.`,
    robots: { index: false, follow: false },
  };
}

const S = {
  guia: l(
    "Guia do hóspede",
    "Guest guide",
    "Guía del huésped",
    "Guide du voyageur",
  ),
  chegada: l("Chegada", "Arrival", "Llegada", "Arrivée"),
  entrar: l("Como entrar", "Getting in", "Cómo entrar", "Comment entrer"),
  checkin: l(
    "Check-in online",
    "Online check-in",
    "Check-in online",
    "Enregistrement en ligne",
  ),
  casa: l("A casa", "The house", "La casa", "La maison"),
  regras: l("Regras da casa", "House rules", "Normas de la casa", "Règlement"),
  saida: l(
    "Antes de sair",
    "Before you leave",
    "Antes de salir",
    "Avant de partir",
  ),
  perto: l("Na zona", "Nearby", "Alrededores", "À proximité"),
  contactos: l("Contactos", "Contacts", "Contactos", "Contacts"),
  secoes: l(
    "Secções do guia",
    "Guide sections",
    "Secciones de la guía",
    "Sections du guide",
  ),
  boasVindas: l(
    "Bem-vindos! Aqui está tudo o que precisam para chegar, entrar e aproveitar a estadia.",
    "Welcome! Here is everything you need to arrive, get in and enjoy your stay.",
    "¡Bienvenidos! Aquí tienen todo lo necesario para llegar, entrar y disfrutar de la estancia.",
    "Bienvenue ! Voici tout ce qu’il vous faut pour arriver, entrer et profiter du séjour.",
  ),
  mapa: l(
    "Abrir no Google Maps",
    "Open in Google Maps",
    "Abrir en Google Maps",
    "Ouvrir dans Google Maps",
  ),
  avisar: l(
    "Agradecemos que nos avisem assim que entrarem, para sabermos que correu tudo bem.",
    "Please let us know once you’re in, so we know everything went smoothly.",
    "Les agradecemos que nos avisen en cuanto entren, para saber que todo ha ido bien.",
    "Merci de nous prévenir dès que vous êtes entrés, pour que nous sachions que tout s’est bien passé.",
  ),
  avisarBotao: l(
    "Avisar por WhatsApp",
    "Message us on WhatsApp",
    "Avisar por WhatsApp",
    "Prévenir par WhatsApp",
  ),
  checkinTexto: l(
    "Por lei, temos de registar todos os hóspedes. Preencham os dados de cada pessoa antes de chegar e enviem-nos a mensagem no fim. Demora cerca de 3 minutos.",
    "By law we must register every guest. Please fill in each person’s details before you arrive and send us the message at the end. It takes about 3 minutes.",
    "Por ley debemos registrar a todos los huéspedes. Rellenen los datos de cada persona antes de llegar y envíennos el mensaje al final. Lleva unos 3 minutos.",
    "La loi nous oblige à enregistrer chaque voyageur. Remplissez les informations de chaque personne avant d’arriver et envoyez-nous le message à la fin. Cela prend environ 3 minutes.",
  ),
  rede: l("Rede", "Network", "Red", "Réseau"),
  senha: l("Palavra-passe", "Password", "Contraseña", "Mot de passe"),
  checkout: l("Check-out", "Check-out", "Check-out", "Départ"),
  saidaTexto: l(
    "Uma lista rápida para o dia da saída:",
    "A quick list for your departure day:",
    "Una lista rápida para el día de salida:",
    "Une petite liste pour le jour du départ :",
  ),
  duvidas: l(
    "Alguma dúvida, antes ou durante a estadia? Falem connosco.",
    "Any questions, before or during your stay? Get in touch.",
    "¿Alguna duda, antes o durante la estancia? Hablen con nosotros.",
    "Une question, avant ou pendant le séjour ? Contactez-nous.",
  ),
  ligar: l("Ligar", "Call", "Llamar", "Appeler"),
  escondido: l(
    "A localização e as instruções para entrar aparecem aqui quando abrirem o link com o código que vos enviámos antes da chegada.",
    "The location and how to get in will appear here when you open the link with the code we send you before arrival.",
    "La ubicación y las instrucciones para entrar aparecerán aquí cuando abran el enlace con el código que les enviamos antes de la llegada.",
    "L’emplacement et les instructions pour entrer apparaîtront ici lorsque vous ouvrirez le lien avec le code envoyé avant votre arrivée.",
  ),
  emergencia: l(
    "Emergência: ambulância, bombeiros, polícia",
    "Emergency: ambulance, fire, police",
    "Emergencias: ambulancia, bomberos, policía",
    "Urgences : ambulance, pompiers, police",
  ),
  sns: l(
    "SNS 24: linha de saúde, 24 horas por dia",
    "SNS 24: health line, 24 hours a day",
    "SNS 24: línea de salud, 24 horas",
    "SNS 24 : ligne santé, 24 h sur 24",
  ),
  reclamacoes: l(
    "Livro de Reclamações",
    "Complaints Book",
    "Libro de Reclamaciones",
    "Livre de réclamations",
  ),
  despedida: l(
    "Ao dispor,",
    "At your service,",
    "A su disposición,",
    "À votre disposition,",
  ),
  site: l(
    "Conhecer a outra casa",
    "Discover our other house",
    "Conocer la otra casa",
    "Découvrir l’autre maison",
  ),
};

const H2 = ({ id, t }: { id: string; t: Parameters<typeof T>[0]["t"] }) => (
  <h2 id={`t-${id}`} className="text-3xl md:text-4xl">
    <T t={t} />
  </h2>
);

export default async function GuiaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guia = getGuia(slug);
  const casa = getCasa(slug);
  if (!guia || !casa) notFound();

  const wifi = wifiDe(slug);
  const outra = guias.find((g) => g.slug !== slug);
  const outraCasa = outra && getCasa(outra.slug);
  const wa = (texto: string) =>
    `https://wa.me/${anfitrioes.telefone}?text=${encodeURIComponent(texto)}`;

  const secoes = [
    { id: "chegada", t: S.chegada },
    { id: "checkin", t: S.checkin },
    { id: "entrar", t: S.entrar },
    ...(wifi ? [{ id: "wifi", t: l("Wi-Fi", "Wi-Fi", "Wi-Fi", "Wi-Fi") }] : []),
    { id: "casa", t: S.casa },
    { id: "regras", t: S.regras },
    { id: "saida", t: S.saida },
    { id: "perto", t: S.perto },
    { id: "contactos", t: S.contactos },
  ];

  return (
    <LinguaProvider>
      <header className="sticky top-0 z-40 border-b border-ouro/40 bg-preto text-white print:static">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-3">
          <Link href="/" className="block shrink-0">
            <Image
              src="/logo-just-ruby.png"
              alt={site.nome}
              width={748}
              height={294}
              loading="eager"
              className="h-9 w-auto"
            />
          </Link>
          <div className="print:hidden">
            <SeletorLingua />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-preto text-white">
          <div className="relative mx-auto max-w-3xl">
            <div className="relative aspect-[16/10] w-full overflow-hidden">
              <Image
                src={guia.capa.src}
                alt={guia.capa.alt}
                fill
                sizes="(min-width: 768px) 768px, 100vw"
                loading="eager"
                fetchPriority="high"
                className="object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-preto via-preto/40 to-transparent"
              />
            </div>
            <div className="relative -mt-28 px-5 pb-10">
              <p className="text-ouro-claro">
                <T t={S.guia} /> · <T t={guia.local} />
              </p>
              <h1 className="mt-1 text-5xl md:text-6xl">{casa.nome}</h1>
              <span className="filete mt-6" aria-hidden="true" />
              <p className="mt-6 max-w-xl text-lg text-nevoa">
                <T t={S.boasVindas} />
              </p>
            </div>
          </div>
        </section>

        <nav
          aria-label="Secções do guia"
          className="sticky top-[57px] z-30 border-b border-xisto/10 bg-white/95 backdrop-blur print:hidden"
        >
          <ul className="mx-auto flex max-w-3xl gap-2 overflow-x-auto px-5 py-3 text-sm [scrollbar-width:none]">
            {secoes.map((s) => (
              <li key={s.id} className="shrink-0">
                <a
                  href={`#${s.id}`}
                  className="block rounded-sm px-3 py-1.5 ring-1 ring-inset ring-xisto/20 hover:bg-pedra"
                >
                  <T t={s.t} />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mx-auto grid max-w-3xl gap-16 px-5 py-12 md:py-16 [&>section]:scroll-mt-32">
          {/* Chegada */}
          <section id="chegada" aria-labelledby="t-chegada">
            <H2 id="chegada" t={S.chegada} />
            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="bg-pedra p-5">
                <dt className="text-sm text-cinza">Check-in</dt>
                <dd className="font-display text-3xl">
                  <T t={guia.checkIn} />
                </dd>
                {guia.checkInNota && (
                  <dd className="mt-1 text-sm text-cinza">
                    <T t={guia.checkInNota} />
                  </dd>
                )}
              </div>
              {guia.checkOut && (
                <div className="bg-pedra p-5">
                  <dt className="text-sm text-cinza">
                    <T t={S.checkout} />
                  </dt>
                  <dd className="font-display text-3xl">
                    <T t={guia.checkOut} />
                  </dd>
                </div>
              )}
            </dl>
            <ComCodigo>
              <a
                href={guia.mapa}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-sm bg-ouro px-6 py-3.5 font-semibold text-preto hover:bg-ouro-claro"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
                  <circle cx="12" cy="9.5" r="2.5" />
                </svg>
                <T t={S.mapa} />
              </a>
              <p className="mt-3 text-cinza">
                <T t={guia.mapaNota} />
              </p>
            </ComCodigo>
          </section>

          {/* Check-in online */}
          <section id="checkin" aria-labelledby="t-checkin">
            <H2 id="checkin" t={S.checkin} />
            <p className="mt-4 text-cinza">
              <T t={S.checkinTexto} />
            </p>
            <div className="mt-8">
              <CheckinOnline
                casa={casa.nome}
                telefone={anfitrioes.telefone}
                maxHospedes={guia.hospedesMax}
              />
            </div>
          </section>

          {/* Como entrar */}
          <section id="entrar" aria-labelledby="t-entrar">
            <H2 id="entrar" t={S.entrar} />
            <ComCodigo
              aviso={
                <p className="mt-6 border border-dashed border-ouro/70 bg-pedra p-5">
                  <T t={S.escondido} />
                </p>
              }
            >
              <ol className="mt-8 grid gap-10">
                {guia.passos.map((p, i) => (
                  <li
                    key={i}
                    className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-4"
                  >
                    <span
                      aria-hidden="true"
                      className="font-display text-4xl leading-none text-ouro-escuro"
                    >
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-2xl">
                        <T t={p.titulo} />
                      </h3>
                      {p.texto && (
                        <p className="mt-2">
                          <T t={p.texto} />
                        </p>
                      )}
                      {p.fotos && (
                        <div className="mt-4 flex gap-2 overflow-x-auto">
                          {p.fotos.map((f) => (
                            <Image
                              key={f.src}
                              src={f.src}
                              alt={f.alt}
                              width={320}
                              height={320}
                              sizes="(min-width: 640px) 220px, 45vw"
                              className="h-48 w-auto shrink-0 rounded-sm object-cover sm:h-56"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-10">
                <CodigoCofre />
              </div>
              <p className="mt-4">
                <T t={guia.cofreDepois} />
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-xisto/15 pt-6">
                <p className="max-w-md text-cinza">
                  <T t={S.avisar} />
                </p>
                <a
                  href={wa(
                    `Olá! Já entrámos no ${casa.nome}. Correu tudo bem.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-sm bg-[#1f7a4a] px-5 py-3 font-semibold text-white hover:bg-[#186139]"
                >
                  <T t={S.avisarBotao} />
                </a>
              </div>
            </ComCodigo>
          </section>

          {/* Wi-Fi */}
          {wifi && (
            <section id="wifi" aria-labelledby="t-wifi">
              <h2 id="t-wifi" className="text-3xl md:text-4xl">
                Wi-Fi
              </h2>
              <dl className="mt-6 grid gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-pedra p-5">
                  <div>
                    <dt className="text-sm text-cinza">
                      <T t={S.rede} />
                    </dt>
                    <dd className="text-xl font-semibold">{wifi.rede}</dd>
                  </div>
                </div>
                {wifi.senha && (
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-pedra p-5">
                    <div>
                      <dt className="text-sm text-cinza">
                        <T t={S.senha} />
                      </dt>
                      <dd className="font-mono text-xl font-semibold">
                        {wifi.senha}
                      </dd>
                    </div>
                    <Copiar valor={wifi.senha} />
                  </div>
                )}
              </dl>
            </section>
          )}

          {/* A casa */}
          <section id="casa" aria-labelledby="t-casa">
            <H2 id="casa" t={S.casa} />
            <ul className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {guia.casa.map((c, i) => (
                <li key={i} className="flex gap-3 text-lg">
                  <span
                    aria-hidden="true"
                    className="mt-[0.75em] h-1.5 w-1.5 shrink-0 rotate-45 bg-ouro"
                  />
                  <span>
                    <T t={c} />
                  </span>
                </li>
              ))}
            </ul>
            {guia.galeria && (
              <div className="mt-6 grid grid-cols-3 gap-2">
                {guia.galeria.map((f) => (
                  <Image
                    key={f.src}
                    src={f.src}
                    alt={f.alt}
                    width={198}
                    height={147}
                    sizes="33vw"
                    className="aspect-[4/3] h-auto w-full rounded-sm object-cover"
                  />
                ))}
              </div>
            )}
          </section>

          {/* Regras */}
          <section id="regras" aria-labelledby="t-regras">
            <H2 id="regras" t={S.regras} />
            <ul className="mt-6 divide-y divide-xisto/15 border-y border-xisto/15">
              {guia.regras.map((r, i) => (
                <li key={i} className="py-3.5">
                  <T t={r} />
                </li>
              ))}
            </ul>
          </section>

          {/* Saída */}
          <section id="saida" aria-labelledby="t-saida">
            <H2 id="saida" t={S.saida} />
            <p className="mt-4 text-cinza">
              {guia.checkOut && (
                <>
                  <T t={S.checkout} />: <T t={guia.checkOut} />.{" "}
                </>
              )}
              <T t={S.saidaTexto} />
            </p>
            <ul className="mt-5 grid gap-1">
              {guia.saida.map((s, i) => (
                <li key={i}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-sm px-2 py-2 hover:bg-pedra">
                    <input
                      type="checkbox"
                      className="mt-1 h-5 w-5 shrink-0 accent-[#7d5f2a]"
                    />
                    <span>
                      <T t={s} />
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>

          {/* Na zona */}
          <section id="perto" aria-labelledby="t-perto">
            <H2 id="perto" t={S.perto} />
            <ul className="mt-6 divide-y divide-xisto/15 border-y border-xisto/15">
              {guia.perto.map((p, i) => (
                <li key={i} className="py-4">
                  <p className="font-semibold">
                    <T t={p.nome} />
                  </p>
                  <p className="text-cinza">
                    <T t={p.nota} />
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* Contactos */}
          <section id="contactos" aria-labelledby="t-contactos">
            <H2 id="contactos" t={S.contactos} />
            <div className="mt-6 bg-preto p-6 text-white">
              <p className="text-nevoa">
                <T t={S.duvidas} />
              </p>
              <p className="mt-2 font-display text-3xl tabular-nums text-ouro-claro">
                {anfitrioes.telefoneVisivel}
              </p>
              <p className="text-nevoa">{anfitrioes.nomes}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={wa(`Olá! Estou no ${casa.nome} e tenho uma questão: `)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-sm bg-[#1f7a4a] px-5 py-3 font-semibold text-white hover:bg-[#186139]"
                >
                  WhatsApp
                </a>
                <a
                  href={`tel:+${anfitrioes.telefone}`}
                  className="rounded-sm px-5 py-3 font-semibold text-ouro-claro ring-1 ring-inset ring-ouro/60 hover:bg-ouro hover:text-preto"
                >
                  <T t={S.ligar} />
                </a>
              </div>
            </div>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="bg-pedra p-5">
                <dt className="font-display text-4xl">
                  <a href="tel:112">112</a>
                </dt>
                <dd className="mt-1 text-cinza">
                  <T t={S.emergencia} />
                </dd>
              </div>
              <div className="bg-pedra p-5">
                <dt className="font-display text-4xl">
                  <a href="tel:+351808242424">808 24 24 24</a>
                </dt>
                <dd className="mt-1 text-cinza">
                  <T t={S.sns} />
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-sm">
              <a
                href={site.livroReclamacoes}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4"
              >
                <T t={S.reclamacoes} />
              </a>
            </p>
          </section>
        </div>
      </main>

      <footer className="bg-preto text-nevoa">
        <div className="mx-auto flex max-w-3xl flex-wrap items-end justify-between gap-6 px-5 py-10">
          <div>
            <p>
              <T t={S.despedida} />
            </p>
            <p className="font-display text-2xl text-white">
              {anfitrioes.nomes}
            </p>
            <Image
              src="/logo-just-ruby.png"
              alt={site.nome}
              width={748}
              height={294}
              className="mt-3 h-12 w-auto"
            />
          </div>
          {outraCasa && (
            <Link
              href={`/alojamentos/${outraCasa.slug}`}
              className="border-b border-ouro pb-1 font-semibold text-white hover:text-ouro-claro"
            >
              <T t={S.site} />: {outraCasa.nome}
            </Link>
          )}
        </div>
      </footer>
    </LinguaProvider>
  );
}
