import Link from "next/link";
import { exigirSessao } from "../lib/acesso";
import { PLATAFORMAS, calcular, dataPT, eur, hojeISO, type Estado } from "../lib/calculos";
import { temBaseDados } from "../lib/db";
import { listarAlojamentos, listarReservas } from "../lib/reservas";
import { SelectAuto } from "../componentes/Filtros";
import { Etiqueta, SemBaseDados, Titulo, botao, botaoSec, campo } from "../componentes/ui";

const ESTADOS: Estado[] = ["Por faturar", "Futura", "Faturado", "Sem fatura", "Cancelada"];

export default async function Reservas({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await exigirSessao();
  if (!temBaseDados()) return <SemBaseDados />;
  const sp = await searchParams;
  const hoje = hojeISO();
  const ano = sp.ano ?? hoje.slice(0, 4);
  const al = sp.al ?? "Todos";
  const estado = sp.estado ?? "Todos";
  const plataforma = sp.plataforma ?? "Todas";
  const q = (sp.q ?? "").trim().toLowerCase();
  const [todas, als] = await Promise.all([listarReservas(), listarAlojamentos()]);
  const anos = [...new Set(todas.map((r) => r.checkin?.slice(0, 4)).filter(Boolean) as string[])].sort().reverse();
  if (!anos.includes(hoje.slice(0, 4))) anos.unshift(hoje.slice(0, 4));

  const lista = todas
    .map((r) => ({ r, c: calcular(r, hoje) }))
    .filter(({ r, c }) => {
      if (ano !== "Todos" && r.checkin?.slice(0, 4) !== ano) return false;
      if (al !== "Todos" && r.al !== al) return false;
      if (estado !== "Todos" && c.estado !== estado) return false;
      if (plataforma !== "Todas" && r.plataforma !== plataforma) return false;
      if (q) {
        const t = [r.hospede, r.nif, r.fatura, r.cod_reserva, r.notas, r.morada].join(" ").toLowerCase();
        if (!t.includes(q)) return false;
      }
      return true;
    })
    .reverse(); // mais recentes primeiro
  const soma = lista.reduce((s, x) => s + (x.r.total ?? 0), 0);
  const filtros = new URLSearchParams({ ano, al, estado, plataforma, q: sp.q ?? "" }).toString();
  const exportar = `/gestao/exportar?${filtros}`;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Titulo sub={`${lista.length} reserva(s) · ${eur(soma)} c/ IVA`}>Reservas</Titulo>
        <div className="flex gap-2">
          <a href={exportar} className={botaoSec} title="Descarrega as reservas desta lista (com os filtros escolhidos)">
            Descarregar Excel
          </a>
          <Link href="/gestao/reservas/nova" className={botao}>
            + Nova reserva
          </Link>
        </div>
      </div>

      <form className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <SelectAuto name="ano" rotulo="Ano" value={ano} opcoes={["Todos", ...anos].map((a) => ({ valor: a, texto: a }))} />
        <SelectAuto name="al" rotulo="Alojamento" value={al} opcoes={["Todos", ...als.map((a) => a.nome)].map((a) => ({ valor: a, texto: a }))} />
        <SelectAuto name="estado" rotulo="Estado" value={estado} opcoes={["Todos", ...ESTADOS].map((a) => ({ valor: a, texto: a }))} />
        <SelectAuto name="plataforma" rotulo="Plataforma" value={plataforma} opcoes={["Todas", ...PLATAFORMAS].map((a) => ({ valor: a, texto: a }))} />
        <label className="col-span-2 block sm:col-span-1">
          <span className="block text-xs font-semibold uppercase tracking-wide text-cinza">Procurar</span>
          <input name="q" defaultValue={sp.q ?? ""} placeholder="Nome, NIF, fatura…" className={campo} />
        </label>
      </form>

      {lista.length === 0 ? (
        <p className="text-cinza">Nenhuma reserva com estes filtros.</p>
      ) : (
        <ul className="divide-y divide-black/5 overflow-hidden rounded-lg border border-black/5 bg-white shadow-sm">
          {lista.map(({ r, c }) => (
            <li key={r.id}>
              <Link href={`/gestao/reservas/${r.id}`} className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 px-4 py-3 hover:bg-pedra/40">
                <div className="min-w-0">
                  <div className="truncate font-semibold">{r.hospede || "—"}</div>
                  <div className="truncate text-xs text-cinza">
                    {dataPT(r.checkin)} → {dataPT(r.checkout)} · {c.noites} noite(s) · {r.al || "sem AL"} · {r.plataforma}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold tabular-nums">{c.faltaValor ? <span className="text-[#7a4b00]">falta valor</span> : eur(r.total)}</div>
                  <div className="mt-0.5">
                    <Etiqueta estado={c.estado} />
                  </div>
                </div>
                {r.fatura && !/^sem fatura$/i.test(r.fatura) && <div className="col-span-2 text-xs text-cinza">Fatura {r.fatura}</div>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
