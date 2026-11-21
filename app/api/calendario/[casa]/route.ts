import { AL_DO_SLUG, casaDoSlug, codigoCerto, gerarIcs, ocupadoNoSite } from "@/app/gestao/lib/calendario";

// Calendário privado de cada casa (bloqueios e reservas feitas fora do Airbnb e do Booking),
// para o Airbnb e o Booking importarem. Só funciona com o código secreto (?t=...),
// que aparece em /gestao/calendario.

export const dynamic = "force-dynamic";

export async function GET(request: Request, ctx: { params: Promise<{ casa: string }> }) {
  const { casa: pedido } = await ctx.params;
  const slug = pedido.replace(/\.ics$/i, "");
  const casa = casaDoSlug(slug);
  const al = AL_DO_SLUG[slug];
  const t = new URL(request.url).searchParams.get("t");
  if (!casa || !al || !(await codigoCerto(t))) return new Response("Não encontrado", { status: 404 });

  const ics = gerarIcs(casa.nome, await ocupadoNoSite(al));
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="${slug}.ics"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
