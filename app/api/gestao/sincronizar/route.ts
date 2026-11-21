import { temBaseDados } from "@/app/gestao/lib/db";
import { sincronizar, sincronizarSeAntigo } from "@/app/gestao/lib/sincronizar";

// Chamado todas as manhãs pela Vercel (vercel.json → crons).
// A Vercel envia "Authorization: Bearer <CRON_SECRET>" quando a variável CRON_SECRET existe.
export const maxDuration = 60;

export async function GET(request: Request) {
  const segredo = process.env.CRON_SECRET;
  if (segredo) {
    if (request.headers.get("authorization") !== `Bearer ${segredo}`) return new Response("Não autorizado", { status: 401 });
  } else if (!/vercel-cron/i.test(request.headers.get("user-agent") ?? "")) {
    return new Response("Não autorizado", { status: 401 });
  }
  if (!temBaseDados()) return Response.json({ ok: false, motivo: "sem base de dados" }, { status: 503 });
  // Sem segredo, quem chama não é verificado: no máximo uma leitura por hora (só lê calendários).
  const r = segredo ? await sincronizar() : await sincronizarSeAntigo(1);
  return Response.json({ ok: true, ...(r ?? { recente: true }) });
}
