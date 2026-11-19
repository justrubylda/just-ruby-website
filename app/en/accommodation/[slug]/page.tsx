import type { Metadata, ResolvingMetadata } from "next";
import Casa, { metadadosCasa, slugsCasas } from "@/app/components/paginas/Casa";

export const dynamicParams = false;
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
  return metadadosCasa("en", slug, parent);
}

export default async function HousePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <Casa l="en" slug={slug} />;
}
