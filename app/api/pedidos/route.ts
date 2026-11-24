import { casas } from "@/app/site";
import { garantirTabelas, sql, temBaseDados } from "@/app/gestao/lib/db";
import { tabelasPrecos } from "@/app/gestao/lib/precos";
import { orcamento } from "@/app/lib/orcamento";

// Guarda os pedidos de disponibilidade feitos no formulário do site, para aparecerem
// na área de gestão. O formulário continua a abrir o email/WhatsApp como antes.

const dataOk = (s: unknown) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
const corta = (s: unknown, n: number) => (typeof s === "string" ? s.trim().slice(0, n) : "");

export async function POST(request: Request) {
  if (!temBaseDados()) return new Response(null, { status: 204 });
  let d: Record<string, unknown>;
  try {
    const t = await request.text();
    if (t.length > 5000) return new Response(null, { status: 413 });
    d = JSON.parse(t);
  } catch {
    return new Response(null, { status: 400 });
  }
  if (d.site) return new Response(null, { status: 204 }); // campo escondido preenchido = robô
  const casa = casas.find((c) => c.slug === d.casa)?.slug;
  if (!casa || !dataOk(d.chegada) || !dataOk(d.partida) || String(d.partida) <= String(d.chegada))
    return new Response(null, { status: 400 });
  const hospedes = Math.min(50, Math.max(1, Math.round(Number(d.hospedes) || 1)));
  try {
    await garantirTabelas();
    // Preço que o site mostrou ao hóspede (calculado aqui, não se confia no navegador).
    const preco = orcamento((await tabelasPrecos())[casa], String(d.chegada), String(d.partida))?.total ?? null;
    const [{ n }] = await sql()`select count(*)::int as n from pedidos where criado_em > now() - interval '1 hour'`;
    if (n > 30) return new Response(null, { status: 429 });
    await sql()`insert into pedidos (casa, chegada, partida, hospedes, nome, mensagem, via, preco)
      values (${casa}, ${String(d.chegada)}, ${String(d.partida)}, ${hospedes}, ${corta(d.nome, 120) || null},
        ${corta(d.mensagem, 1500) || null}, ${d.via === "whatsapp" ? "WhatsApp" : "email"}, ${preco})`;
  } catch (e) {
    console.error("[pedidos] não consegui guardar", e);
    return new Response(null, { status: 500 });
  }
  return new Response(null, { status: 204 });
}
