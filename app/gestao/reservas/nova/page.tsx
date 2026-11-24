import Link from "next/link";
import { casas } from "@/app/site";
import { exigirSessao } from "../../lib/acesso";
import { garantirTabelas, sql, temBaseDados } from "../../lib/db";
import { listarAlojamentos } from "../../lib/reservas";
import type { Reserva } from "../../lib/calculos";
import FormReserva from "../../componentes/FormReserva";
import { SemBaseDados, Titulo, cartao } from "../../componentes/ui";

const AL_DO_SLUG: Record<string, string> = { "o-nosso-cantinho": "Nosso Cantinho", "kingdom-of-stone": "Kingdom of Stone" };

export default async function Nova({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await exigirSessao();
  if (!temBaseDados()) return <SemBaseDados />;
  await garantirTabelas();
  const sp = await searchParams;
  const als = await listarAlojamentos();
  const inicial: Partial<Reserva> = { taxa_iva: 0.06, plataforma: "Direto" };
  const pedidoId = Number(sp.pedido);
  if (pedidoId) {
    const [p] = await sql()`select * from pedidos where id = ${pedidoId}`;
    if (p) {
      const casa = casas.find((c) => c.slug === p.casa);
      Object.assign(inicial, {
        checkin: p.chegada,
        checkout: p.partida,
        al: AL_DO_SLUG[p.casa as string] ?? casa?.nome ?? null,
        plataforma: "Site",
        hospede: p.nome,
        hospedes: p.hospedes,
        notas: p.mensagem ? `Pedido do site: ${p.mensagem}` : "Pedido do site",
        pedido_id: p.id,
        ...(p.preco != null ? { total: Number(p.preco) } : {}),
      });
    }
  }
  return (
    <div>
      <Link href="/gestao/reservas" className="text-sm text-cinza hover:underline">
        ← Reservas
      </Link>
      <Titulo sub={pedidoId ? "A partir de um pedido do site" : undefined}>Nova reserva</Titulo>
      <div className={cartao}>
        <FormReserva reserva={inicial} als={als} />
      </div>
    </div>
  );
}
