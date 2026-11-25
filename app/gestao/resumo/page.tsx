import Link from "next/link";
import { exigirSessao } from "../lib/acesso";
import { MESES, eur, hojeISO } from "../lib/calculos";
import { CLASSES_RECEITA, dedutivel } from "../lib/contas-comum";
import { listarDespesas, listarMovimentos } from "../lib/contas";
import { temBaseDados } from "../lib/db";
import { listarReservas } from "../lib/reservas";
import { SelectAuto } from "../componentes/Filtros";
import { SemBaseDados, Titulo, botaoSec, cartao } from "../componentes/ui";

export default async function Resumo({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await exigirSessao();
  if (!temBaseDados()) return <SemBaseDados />;
  const sp = await searchParams;
  const [movs, desp, reservas] = await Promise.all([listarMovimentos(), listarDespesas(), listarReservas()]);
  const hoje = hojeISO();
  const anos = [
    ...new Set([...movs.map((m) => m.data.slice(0, 4)), ...(desp.map((d) => d.data?.slice(0, 4)).filter(Boolean) as string[])]),
  ]
    .sort()
    .reverse();
  if (!anos.includes(hoje.slice(0, 4))) anos.unshift(hoje.slice(0, 4));
  const ano = sp.ano ?? hoje.slice(0, 4);

  const movAno = movs.filter((m) => m.data.startsWith(ano));
  const despAno = desp.filter((d) => d.data?.startsWith(ano));
  const ligadas = new Set(desp.map((d) => d.movimento_id).filter(Boolean));
  const resPorId = new Map(reservas.map((r) => [r.id, r]));

  const receita = (m: (typeof movs)[number]) => m.montante > 0 && CLASSES_RECEITA.includes(m.classe);
  const gasto = (m: (typeof movs)[number]) => m.montante < 0 && ["Despesa", "Impostos e Estado", "Por classificar"].includes(m.classe);
  const soma = <T,>(l: T[], f: (x: T) => number) => l.reduce((s, x) => s + f(x), 0);

  const semFatura = movAno.filter((m) => m.montante < 0 && m.classe === "Despesa" && m.categoria !== "Banco" && !ligadas.has(m.id));
  const semDoc = despAno.filter((d) => d.origem === "banco" && !d.documento);
  const recebidoSemFatura = movAno.filter((m) => {
    if (!receita(m)) return false;
    const r = m.reserva_id ? resPorId.get(m.reserva_id) : null;
    return !r || !r.fatura;
  });
  const porRepor = desp.filter((d) => d.estado === "Por repor");
  const particulares = movAno.filter((m) => m.classe === "Particular");

  const meses = MESES.map((nome, i) => {
    const p = `${ano}-${String(i + 1).padStart(2, "0")}`;
    const ms = movAno.filter((m) => m.data.startsWith(p));
    const ds = despAno.filter((d) => d.data!.startsWith(p));
    return {
      nome,
      entradas: soma(ms.filter(receita), (m) => m.montante),
      saidas: Math.abs(soma(ms.filter(gasto), (m) => m.montante)),
      faturas: soma(ds, (d) => d.total),
      iva: soma(ds, (d) => dedutivel(d)),
    };
  });
  const tot = {
    entradas: soma(meses, (m) => m.entradas),
    saidas: soma(meses, (m) => m.saidas),
    faturas: soma(meses, (m) => m.faturas),
    iva: soma(meses, (m) => m.iva),
  };

  const casas = [...new Set(despAno.map((d) => d.casa || "Sem casa"))].sort();
  const cats = [...new Set(despAno.map((d) => d.categoria || "Sem categoria"))].sort();
  const celula = (cat: string, casa: string) =>
    soma(
      despAno.filter((d) => (d.categoria || "Sem categoria") === cat && (d.casa || "Sem casa") === casa),
      (d) => d.total
    );

  const alertas = [
    { t: "Saídas no banco sem fatura", n: semFatura.length + semDoc.length, v: Math.abs(soma(semFatura, (m) => m.montante)) + soma(semDoc, (d) => d.total), href: `/gestao/banco?ano=${ano}&ver=Sa%C3%ADdas+sem+fatura`, d: "faltam documentos para o contabilista" },
    { t: "Recebido sem fatura", n: recebidoSemFatura.length, v: soma(recebidoSemFatura, (m) => m.montante), href: `/gestao/banco?ano=${ano}&ver=Entradas+sem+reserva`, d: "entradas sem reserva ou reserva por faturar" },
    { t: "A repor aos sócios", n: porRepor.length, v: soma(porRepor, (d) => d.total), href: "/gestao/despesas?ano=Todos&estado=Por+repor", d: "despesas pagas pelo Bruno ou pela Rúbia (todos os anos)" },
    { t: "Particulares pagos pela empresa", n: particulares.length, v: Math.abs(soma(particulares, (m) => m.montante)), href: `/gestao/banco?ano=${ano}&ver=Todos&q=particular`, d: "a acertar com os sócios" },
  ];

  const th = "px-3 py-2 text-right font-semibold";
  const td = "px-3 py-1.5 text-right tabular-nums";
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Titulo sub="Banco (dinheiro que entrou e saiu) e faturas de despesa (por data da fatura).">Resumo de {ano}</Titulo>
        <div className="flex flex-wrap gap-2">
          <a href={`/gestao/exportar/contas?tipo=despesas&ano=${ano}`} className={botaoSec}>
            Excel das despesas
          </a>
          <a href={`/gestao/exportar/contas?tipo=banco&ano=${ano}`} className={botaoSec}>
            Excel do banco
          </a>
        </div>
      </div>
      <form className="max-w-xs">
        <SelectAuto name="ano" rotulo="Ano" value={ano} opcoes={anos.map((a) => ({ valor: a, texto: a }))} />
      </form>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {alertas.map((a) => (
          <Link key={a.t} href={a.href} className={`${cartao} block hover:border-ouro`}>
            <div className="text-xs font-semibold uppercase tracking-wide text-cinza">{a.t}</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">{eur(a.v)}</div>
            <div className="text-xs text-cinza">
              {a.n} · {a.d}
            </div>
          </Link>
        ))}
      </div>

      <section className={`${cartao} overflow-x-auto`}>
        <h2 className="font-display text-xl">Por mês</h2>
        <table className="mt-3 w-full min-w-[560px] text-sm">
          <thead className="border-b border-black/10 text-xs uppercase tracking-wide text-cinza">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Mês</th>
              <th className={th}>Recebido (banco)</th>
              <th className={th}>Pago (banco)</th>
              <th className={th}>Diferença</th>
              <th className={th}>Faturas de despesa</th>
              <th className={th}>IVA dedutível</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {meses.map((m) => (
              <tr key={m.nome}>
                <td className="px-3 py-1.5">{m.nome}</td>
                <td className={td}>{m.entradas ? eur(m.entradas) : "—"}</td>
                <td className={td}>{m.saidas ? eur(m.saidas) : "—"}</td>
                <td className={td}>{m.entradas || m.saidas ? eur(m.entradas - m.saidas) : "—"}</td>
                <td className={td}>{m.faturas ? eur(m.faturas) : "—"}</td>
                <td className={td}>{m.iva ? eur(m.iva) : "—"}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-black/10 font-semibold">
            <tr>
              <td className="px-3 py-2">Total</td>
              <td className={td}>{eur(tot.entradas)}</td>
              <td className={td}>{eur(tot.saidas)}</td>
              <td className={td}>{eur(tot.entradas - tot.saidas)}</td>
              <td className={td}>{eur(tot.faturas)}</td>
              <td className={td}>{eur(tot.iva)}</td>
            </tr>
          </tfoot>
        </table>
        <p className="mt-2 text-xs text-cinza">
          Recebido: entradas do Airbnb, do Booking e de clientes diretos. Pago: despesas, impostos e movimentos por classificar (sem as
          reposições aos sócios).
        </p>
      </section>

      {despAno.length > 0 && (
        <section className={`${cartao} overflow-x-auto`}>
          <h2 className="font-display text-xl">Despesas por categoria e casa</h2>
          <table className="mt-3 w-full min-w-[560px] text-sm">
            <thead className="border-b border-black/10 text-xs uppercase tracking-wide text-cinza">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Categoria</th>
                {casas.map((c) => (
                  <th key={c} className={th}>
                    {c}
                  </th>
                ))}
                <th className={th}>Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {cats.map((cat) => (
                <tr key={cat}>
                  <td className="px-3 py-1.5">{cat}</td>
                  {casas.map((c) => {
                    const v = celula(cat, c);
                    return (
                      <td key={c} className={td}>
                        {v ? eur(v) : "—"}
                      </td>
                    );
                  })}
                  <td className={`${td} font-semibold`}>{eur(soma(despAno.filter((d) => (d.categoria || "Sem categoria") === cat), (d) => d.total))}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-black/10 font-semibold">
              <tr>
                <td className="px-3 py-2">Total</td>
                {casas.map((c) => (
                  <td key={c} className={td}>
                    {eur(soma(despAno.filter((d) => (d.casa || "Sem casa") === c), (d) => d.total))}
                  </td>
                ))}
                <td className={td}>{eur(tot.faturas)}</td>
              </tr>
            </tfoot>
          </table>
        </section>
      )}
    </div>
  );
}
