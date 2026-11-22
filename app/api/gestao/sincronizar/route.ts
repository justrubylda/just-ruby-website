import { temBaseDados } from "@/app/gestao/lib/db";
import { sincronizar, sincronizarSeAntigo } from "@/app/gestao/lib/sincronizar";
import { avisarIndexNow } from "@/app/lib/indexnow";

// Chamado todas as manhãs pela Vercel (vercel.json → crons).
// Também avisa o Bing (IndexNow) quando há uma publicação nova do site.
// A Vercel envia "Authorization: Bearer <CRON_SECRET>" quando a variável CRON_SECRET existe.
export const maxDuration = 60;

export async function GET(request: Request) {
  const segredo = process.env.CRON_SECRET;
  if (segredo) {
    if (request.headers.get("authorization") !== `Bearer ${segredo}`) return new Response("Não autorizado", { status: 401 });
  } else if (!/vercel-cron/i.test(request.headers.get("user-agent") ?? "")) {
    return new Response("Não autorizado", { status: 401 });
  }
  // O aviso ao Bing nunca impede a sincronização dos calendários.
  const indexnow = await avisarIndexNow().catch((e) => ({ enviado: false, motivo: String(e) }));
  if (!temBaseDados()) return Response.json({ ok: false, motivo: "sem base de dados", indexnow }, { status: 503 });
  // Sem segredo, quem chama não é verificado: no máximo uma leitura por hora (só lê calendários).
  const r = segredo ? await sincronizar() : await sincronizarSeAntigo(1);
  return Response.json({ ok: true, ...(r ?? { recente: true }), indexnow });
}
