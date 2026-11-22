import Image from "next/image";
import Link from "next/link";
import PageIntro from "@/app/components/PageIntro";
import { rotaCasa, ui, type Lingua } from "@/app/i18n";
import { casasEm, emailLink, whatsappLink } from "@/app/site";

const TEXTOS = {
  pt: {
    titulo: "Galeria",
    texto: "Um primeiro olhar sobre as duas casas.",
    pedidoWhatsapp: "Olá! Podem enviar-me fotografias dos alojamentos?",
    aPreparar: "As fotografias estão a ser preparadas",
    entretanto: "Entretanto, peça-nos fotos de qualquer espaço da casa que lhe interesse.",
    porWhatsapp: "Pedir fotos por WhatsApp",
    porEmail: "Pedir fotos por email",
    assunto: "Pedido de fotografias",
  },
  en: {
    titulo: "Gallery",
    texto: "A first look at the two houses.",
    pedidoWhatsapp: "Hello! Could you send me photos of the houses?",
    aPreparar: "The photos are being prepared",
    entretanto: "In the meantime, ask us for photos of any part of the house you are interested in.",
    porWhatsapp: "Ask for photos on WhatsApp",
    porEmail: "Ask for photos by email",
    assunto: "Photo request",
  },
  es: {
    titulo: "Galería",
    texto: "Un primer vistazo a las dos casas.",
    pedidoWhatsapp: "¡Hola! ¿Pueden enviarme fotos de los alojamientos?",
    aPreparar: "Las fotografías se están preparando",
    entretanto: "Mientras tanto, pídanos fotos de cualquier espacio de la casa que le interese.",
    porWhatsapp: "Pedir fotos por WhatsApp",
    porEmail: "Pedir fotos por email",
    assunto: "Solicitud de fotografías",
  },
  fr: {
    titulo: "Galerie",
    texto: "Un premier aperçu des deux maisons.",
    pedidoWhatsapp: "Bonjour ! Pourriez-vous m'envoyer des photos des maisons ?",
    aPreparar: "Les photos sont en préparation",
    entretanto: "En attendant, demandez-nous des photos de n'importe quelle pièce de la maison.",
    porWhatsapp: "Demander des photos sur WhatsApp",
    porEmail: "Demander des photos par e-mail",
    assunto: "Demande de photos",
  },
};

// As fotos vêm de app/site.ts (campo "fotos" de cada casa).
export default function Galeria({ l }: { l: Lingua }) {
  const t = TEXTOS[l];
  const comFotos = casasEm(l).filter((c) => c.fotos.length > 0);
  const wa = whatsappLink(t.pedidoWhatsapp);

  return (
    <>
      <PageIntro titulo={t.titulo} texto={t.texto} />

      {comFotos.length === 0 ? (
        <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <h2 className="text-3xl md:text-4xl">{t.aPreparar}</h2>
          <p className="mt-5 max-w-2xl text-lg text-cinza">{t.entretanto}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded-sm bg-ouro px-6 py-3.5 font-semibold text-preto hover:bg-ouro-claro">
                {t.porWhatsapp}
              </a>
            )}
            <a
              href={emailLink(t.assunto)}
              className={
                wa
                  ? "rounded-sm border border-ouro-escuro px-6 py-3.5 font-semibold text-ouro-escuro hover:bg-ouro hover:text-preto"
                  : "rounded-sm bg-ouro px-6 py-3.5 font-semibold text-preto hover:bg-ouro-claro"
              }
            >
              {t.porEmail}
            </a>
          </div>
        </section>
      ) : (
        comFotos.map((c) => (
          <section key={c.slug} className="mx-auto max-w-7xl px-5 py-16 md:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ouro/60 pb-4">
              <h2 className="text-3xl md:text-4xl">{c.nome}</h2>
              <Link href={rotaCasa(l, c.slug)} className="font-semibold text-ouro-escuro underline-offset-4 hover:underline">
                {ui[l].ver(c.nome)}
              </Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {c.fotos.map((f) => (
                <div key={f.src} className="relative aspect-[4/3] overflow-hidden bg-pedra">
                  <Image src={f.src} alt={f.alt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </>
  );
}
