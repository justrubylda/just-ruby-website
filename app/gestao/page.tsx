import Link from "next/link";
import { exigirSessao } from "./lib/acesso";
import { MESES, calcular, dataPT, eur, hojeISO, inteiro, pct, resumir, type Linha } from "./lib/calculos";
import { lerConfig, temBaseDados } from "./lib/db";
import { listarAlojamentos, listarReservas } from "./lib/reservas";
import { sincronizarSeAntigo } from "./lib/sincronizar";
import BotaoSincronizar from "./componentes/BotaoSincronizar";
import { SelectAuto } from "./componentes/Filtros";
import { SemBaseDados, cartao } from "./componentes/ui";

export const dynamic = "force-dynamic";

function Kpi({ rotulo, valor, destaque = false }: { rotulo: string; valor: string; destaque?: boolean }) {
  return (
    <div className={`rounded-lg p-3 sm:p-4 ${destaque ? "bg-preto text-white" : "bg-white shadow-sm"}`}>
      <div className={`text-xs ${destaque ? "text-nevoa" : "text-cinza"}`}>{rotulo}</div>
      <div className={`mt-1 text-lg font-bold sm:text-xl ${destaque ? "text-ouro-claro" : "text-xisto"}`}>{valor}</div>
    </div>
  );
}

const th = "px-2 py-2 text-right text-xs font-semibold uppercase tracking-wide text-cinza first:text-left";
const td = "px-2 py-1.5 text-right tabular-nums first:text-left";

function Tabela({ cab, linhas, total }: { cab: string[]; linhas: (string | number)[][]; total?: (string | number)[] }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[34rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-black/10">
            {cab.map((c) => (
              <th key={c} className={th}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((l, i) => (
            <tr key={i} className="border-b border-black/5">
              {l.map((c, j) => (
                <td key={j} className={td}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {total && (
          <tfoot>
            <tr className="font-bold">
              {total.map((c, j) => (
                <td key={j} className={td}>
                  {c}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

const porNoite = (l: Linha) => (l.noites ? eur(l.total / l.noites) : "—");

export default async function Painel({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await exigirSessao();
  if (!temBaseDados()) return <SemBaseDados />;
  await sincronizarSeAntigo();
  const sp = await searchParams;
  const hoje = hojeISO();
  const ano = Number(sp.ano) || Number(hoje.slice(0, 4));
  const al = sp.al || "Todos";
  const [todas, als, ultima] = await Promise.all([listarReservas(), listarAlojamentos(), lerConfig("ultima_sincronizacao")]);
  const nomesAL = als.map((a) => a.nome);
  const R = resumir(todas, ano, al, nomesAL);
  const g = R.geral;
  const anosDisp = [...new Set([...R.anos.map((a) => a.ano), Number(hoje.slice(0, 4)), Number(hoje.slice(0, 4)) + 1])].sort((a, b) => b - a);
  const maxMes = Math.max(1, ...R.meses.map((m) => m.total));
  const valorPorFaturar = R.porFaturar.reduce((s, x) => s + (x.r.total ?? 0), 0);
  const diasAno = (Date.UTC(ano + 1, 0, 1) - Date.UTC(ano, 0, 1)) / 86_400_000;
  const semValor = todas.filter((r) => !r.cancelada && r.total == null && calcular(r, hoje).ano === ano).length;

  if (!todas.length)
    return (
      <div className={`${cartao} max-w-2xl`}>
        <h1 className="font-display text-2xl">Ainda não há reservas</h1>
        <p className="mt-3">
          Comece por <Link href="/gestao/importar" className="font-semibold underline">importar o Excel</Link>{" "}
          Faturacao_JustRuby.xlsx (traz as reservas de 2020 a 2026) ou{" "}
          <Link href="/gestao/reservas/nova" className="font-semibold underline">crie uma reserva</Link>.
        </p>
      </div>
    );

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <form className="grid w-full grid-cols-2 gap-3 sm:w-auto sm:min-w-[24rem]">
          <SelectAuto name="ano" rotulo="Ano" value={String(ano)} opcoes={anosDisp.map((a) => ({ valor: String(a), texto: String(a) }))} />
          <SelectAuto
            name="al"
            rotulo="Alojamento"
            value={al}
            opcoes={[{ valor: "Todos", texto: "Todos" }, ...nomesAL.map((n) => ({ valor: n, texto: n }))]}
          />
          <noscript>
            <button>Ver</button>
          </noscript>
        </form>
        <div className="text-right">
          <BotaoSincronizar />
          <p className="mt-1 text-xs text-cinza">
            {ultima ? `Última leitura dos calendários: ${new Date(ultima).toLocaleString("pt-PT", { timeZone: "Europe/Lisbon" })}` : "Calendários ainda não lidos"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Kpi rotulo="Total faturado c/ IVA" valor={eur(g.total, 0)} destaque />
        <Kpi rotulo="Recebido" valor={eur(g.recebido, 0)} />
        <Kpi rotulo="Comissões" valor={eur(g.comissao, 0)} />
        <Kpi rotulo="IVA" valor={eur(g.iva, 0)} />
        <Kpi rotulo="Líquido empresa" valor={eur(g.liquido, 0)} destaque />
        <Kpi rotulo="Reservas" valor={inteiro(g.reservas)} />
        <Kpi rotulo="Noites" valor={inteiro(g.noites)} />
        <Kpi rotulo="€ por noite (média)" valor={porNoite(g)} />
        <Kpi rotulo="Por faturar" valor={`${R.porFaturar.length} · ${eur(valorPorFaturar, 0)}`} />
        <Kpi rotulo="Sem valor (vindas do calendário)" valor={inteiro(semValor)} />
      </div>

      {R.porFaturar.length > 0 && (
        <section className={cartao}>
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-xl">Por faturar em {ano}</h2>
            <Link href={`/gestao/faturar?ano=${ano}`} className="text-sm font-semibold text-ouro-escuro underline">
              Faturar agora →
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-black/5">
            {R.porFaturar.slice(0, 8).map(({ r }) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <Link href={`/gestao/reservas/${r.id}`} className="min-w-0">
                  <span className="font-semibold">{r.hospede || "—"}</span>
                  <span className="block truncate text-xs text-cinza">
                    {dataPT(r.checkin)} → {dataPT(r.checkout)} · {r.al} · {r.plataforma}
                  </span>
                </Link>
                <span className="tabular-nums">{eur(r.total)}</span>
              </li>
            ))}
          </ul>
          {R.porFaturar.length > 8 && <p className="mt-2 text-xs text-cinza">… e mais {R.porFaturar.length - 8}.</p>}
        </section>
      )}

      <section className={cartao}>
        <h2 className="font-display text-xl">Mês a mês</h2>
        <div className="mt-4 flex h-36 items-end gap-1.5" aria-hidden>
          {R.meses.map((m, i) => (
            <div key={i} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
              <div className="flex h-28 w-full items-end gap-0.5">
                <div className="w-1/2 rounded-t-sm bg-ouro" style={{ height: `${(m.total / maxMes) * 100}%` }} />
                <div className="w-1/2 rounded-t-sm bg-xisto/60" style={{ height: `${(Math.max(0, m.liquido) / maxMes) * 100}%` }} />
              </div>
              <span className="text-[0.65rem] text-cinza">{MESES[i]}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-cinza">
          <span className="mr-1 inline-block h-2 w-3 bg-ouro" /> Total c/ IVA{" "}
          <span className="ml-3 mr-1 inline-block h-2 w-3 bg-xisto/60" /> Líquido
        </p>
        <div className="mt-4">
          <Tabela
            cab={["Mês", "Reservas", "Noites", "Total c/ IVA", "Comissões", "Recebido", "IVA", "Limpeza", "Líquido", "€/noite"]}
            linhas={R.meses.map((m, i) => [MESES[i], m.reservas, m.noites, eur(m.total), eur(m.comissao), eur(m.recebido), eur(m.iva), eur(m.limpeza), eur(m.liquido), porNoite(m)])}
            total={["Total", g.reservas, g.noites, eur(g.total), eur(g.comissao), eur(g.recebido), eur(g.iva), eur(g.limpeza), eur(g.liquido), porNoite(g)]}
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className={`${cartao} min-w-0`}>
          <h2 className="font-display text-xl">Por plataforma</h2>
          <div className="mt-3">
            <Tabela
              cab={["Plataforma", "Reservas", "Noites", "Total c/ IVA", "Comissões", "% com.", "Líquido"]}
              linhas={R.plataformas
                .filter((p) => p.l.reservas > 0)
                .map((p) => [p.nome, p.l.reservas, p.l.noites, eur(p.l.total), eur(p.l.comissao), pct(p.l.total ? p.l.comissao / p.l.total : null), eur(p.l.liquido)])}
            />
          </div>
        </section>
        <section className={`${cartao} min-w-0`}>
          <h2 className="font-display text-xl">Por alojamento em {ano}</h2>
          <div className="mt-3">
            <Tabela
              cab={["Alojamento", "Reservas", "Noites", "Ocupação", "Total c/ IVA", "Líquido", "€/noite"]}
              linhas={R.alojamentos
                .filter((a) => a.l.reservas > 0)
                .map((a) => [a.nome, a.l.reservas, a.l.noites, pct(a.l.noites / diasAno), eur(a.l.total), eur(a.l.liquido), porNoite(a.l)])}
            />
          </div>
          <p className="mt-2 text-xs text-cinza">Ocupação = noites vendidas ÷ dias do ano.</p>
        </section>
      </div>

      <section className={cartao}>
        <h2 className="font-display text-xl">Comparação anual {al !== "Todos" && `· ${al}`}</h2>
        <div className="mt-3">
          <Tabela
            cab={["Ano", "Reservas", "Noites", "Total c/ IVA", "Comissões", "Líquido", "€/noite", "Variação"]}
            linhas={R.anos.map((a, i) => {
              const ant = R.anos[i - 1]?.l.total;
              return [a.ano, a.l.reservas, a.l.noites, eur(a.l.total, 0), eur(a.l.comissao, 0), eur(a.l.liquido, 0), porNoite(a.l), ant ? pct(a.l.total / ant - 1) : "—"];
            })}
          />
        </div>
      </section>
    </div>
  );
}
