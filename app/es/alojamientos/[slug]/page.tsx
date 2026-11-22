import type { Metadata, ResolvingMetadata } from "next";
import Casa, { metadadosCasa, slugsCasas } from "@/app/components/paginas/Casa";

// Casas desconhecidas dão 404 (notFound em Casa.tsx). Não usar dynamicParams = false:
// com ele, a página deixa de existir depois de uma revalidação (bloqueios novos na gestão).
// A disponibilidade (Airbnb + Booking) é revista de hora a hora.
export const revalidate = 3600;

export function generateStaticParams() {
  return slugsCasas();
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  return metadadosCasa("es", slug, parent);
}

export default async function CasaEsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <Casa l="es" slug={slug} />;
}
