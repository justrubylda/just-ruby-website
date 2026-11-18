import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageIntro from "@/app/components/PageIntro";
import { casas, emailLink, whatsappLink } from "@/app/site";

export const metadata: Metadata = {
  title: "Galeria",
  description: "Fotografias do Kingdom of Stone, em Tomar, e d'O Nosso Cantinho, em Santarém.",
  alternates: { canonical: "/galeria" },
};

// As fotos vêm de app/site.ts (campo "fotos" de cada casa).
export default function GaleriaPage() {
  const comFotos = casas.filter((c) => c.fotos.length > 0);
  const wa = whatsappLink("Olá! Podem enviar-me fotografias dos alojamentos?");

  return (
    <>
      <PageIntro titulo="Galeria" texto="Um primeiro olhar sobre as duas casas." />

      {comFotos.length === 0 ? (
        <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <h2 className="text-3xl md:text-4xl">As fotografias estão a ser preparadas</h2>
          <p className="mt-5 max-w-2xl text-lg text-cinza">
            Entretanto, peça-nos fotos de qualquer espaço da casa que lhe interesse.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded-sm bg-ouro px-6 py-3.5 font-semibold text-preto hover:bg-ouro-claro">
                Pedir fotos por WhatsApp
              </a>
            )}
            <a
              href={emailLink("Pedido de fotografias")}
              className={
                wa
                  ? "rounded-sm border border-ouro-escuro px-6 py-3.5 font-semibold text-ouro-escuro hover:bg-ouro hover:text-preto"
                  : "rounded-sm bg-ouro px-6 py-3.5 font-semibold text-preto hover:bg-ouro-claro"
              }
            >
              Pedir fotos por email
            </a>
          </div>
        </section>
      ) : (
        comFotos.map((c) => (
          <section key={c.slug} className="mx-auto max-w-7xl px-5 py-16 md:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ouro/60 pb-4">
              <h2 className="text-3xl md:text-4xl">{c.nome}</h2>
              <Link href={`/alojamentos/${c.slug}`} className="font-semibold text-ouro-escuro underline-offset-4 hover:underline">
                Ver {c.nome}
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
