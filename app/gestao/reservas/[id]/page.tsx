import Link from "next/link";
import { notFound } from "next/navigation";
import { apagarReservaAcao } from "../../acoes";
import { exigirSessao } from "../../lib/acesso";
import { temBaseDados } from "../../lib/db";
import { listarAlojamentos, obterReserva } from "../../lib/reservas";
import FormReserva from "../../componentes/FormReserva";
import BotaoApagar from "../../componentes/BotaoApagar";
import { SemBaseDados, Titulo, cartao } from "../../componentes/ui";

export default async function Editar({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await exigirSessao();
  if (!temBaseDados()) return <SemBaseDados />;
  const { id } = await params;
  const sp = await searchParams;
  const r = await obterReserva(Number(id));
  if (!r) notFound();
  const als = await listarAlojamentos();
  const origem = [r.origem, r.fonte && `fonte: ${r.fonte}`].filter(Boolean).join(" · ");
  return (
    <div>
      <Link href="/gestao/reservas" className="text-sm text-cinza hover:underline">
        ← Reservas
      </Link>
      <Titulo sub={origem || undefined}>{r.hospede || "Reserva"}</Titulo>
      <div className={cartao}>
        <FormReserva reserva={r} als={als} voltar={sp.voltar} />
      </div>
      <form action={apagarReservaAcao} className="mt-6">
        <input type="hidden" name="id" value={r.id} />
        <BotaoApagar />
      </form>
    </div>
  );
}
