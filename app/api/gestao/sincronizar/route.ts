import { temBaseDados } from "@/app/gestao/lib/db";
import { sincronizar } from "@/app/gestao/lib/sincronizar";

// Chamado todas as manhãs pela Vercel (vercel.json → crons).
// A Vercel envia "Authorization: Bearer <CRON_SECRET>" quando a variável CRON_SECRET existe.
export const maxDuration = 60;

export async function GET(request: Request) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo || request.headers.get("authorization") !== `Bearer ${segredo}`)
    return new Response("Não autorizado", { status: 401 });
  if (!temBaseDados()) return Response.json({ ok: false, motivo: "sem base de dados" }, { status: 503 });
  const r = await sincronizar();
  return Response.json({ ok: true, ...r });
}
