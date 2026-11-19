import Link from "next/link";
import { casas } from "@/app/site";
import { mudarPedido } from "../acoes";
import { exigirSessao } from "../lib/acesso";
import { dataPT } from "../lib/calculos";
import { garantirTabelas, sql, temBaseDados } from "../lib/db";
import { SemBaseDados, Titulo, botao, botaoSec, cartao } from "../componentes/ui";

type Pedido = {
  id: number;
  criado_em: Date;
  casa: string;
  chegada: string;
  partida: string;
  hospedes: number | null;
  nome: string | null;
  mensagem: string | null;
  via: string | null;
  estado: string;
  reserva_id: number | null;
};

export default async function Pedidos({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await exigirSessao();
  if (!temBaseDados()) return <SemBaseDados />;
  await garantirTabelas();
  const sp = await searchParams;
  const verTodos = sp.ver === "todos";
  const lista = (verTodos
    ? await sql()`select * from pedidos order by criado_em desc limit 300`
    : await sql()`select * from pedidos where estado = 'novo' order by criado_em desc`) as unknown as Pedido[];

  return (
    <div>
      <Titulo sub="Pedidos de disponibilidade feitos no formulário do justruby.pt.">Pedidos do site</Titulo>
      <p className="mb-4 text-sm">
        {verTodos ? (
          <Link href="/gestao/pedidos" className="underline">
            Ver só os novos
          </Link>
        ) : (
          <Link href="/gestao/pedidos?ver=todos" className="underline">
            Ver também os arquivados e convertidos
          </Link>
        )}
      </p>
      {lista.length === 0 && <p className="text-cinza">Sem pedidos novos.</p>}
      <ul className="space-y-3">
        {lista.map((p) => {
          const casa = casas.find((c) => c.slug === p.casa);
          return (
            <li key={p.id} className={cartao}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-semibold">{p.nome || "Sem nome"}</span>
                <span className="text-xs text-cinza">
                  {new Date(p.criado_em).toLocaleString("pt-PT", { timeZone: "Europe/Lisbon" })}
                  {p.via && ` · por ${p.via}`}
                </span>
              </div>
              <p className="text-sm">
                {casa?.nome ?? p.casa} · {dataPT(p.chegada)} → {dataPT(p.partida)} · {p.hospedes ?? "?"} pessoa(s)
              </p>
              {p.mensagem && <p className="mt-2 whitespace-pre-line rounded-md bg-pedra/60 p-2 text-sm">{p.mensagem}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                {p.reserva_id ? (
                  <Link href={`/gestao/reservas/${p.reserva_id}`} className={botaoSec}>
                    Ver reserva
                  </Link>
                ) : (
                  <Link href={`/gestao/reservas/nova?pedido=${p.id}`} className={botao}>
                    Criar reserva
                  </Link>
                )}
                <form action={mudarPedido}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="estado" value={p.estado === "novo" ? "arquivado" : "novo"} />
                  <button className={botaoSec}>{p.estado === "novo" ? "Arquivar" : "Voltar a novo"}</button>
                </form>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
