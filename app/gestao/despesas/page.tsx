import Link from "next/link";
import { marcarPorReporAcao } from "../acoes-contas";
import { exigirSessao } from "../lib/acesso";
import { MESES, dataPT, eur, hojeISO } from "../lib/calculos";
import { CATEGORIAS, CORES_ESTADO, ESTADOS_DESPESA, GERAL, dedutivel } from "../lib/contas-comum";
import { listarDespesas } from "../lib/contas";
import { temBaseDados } from "../lib/db";
import { listarAlojamentos } from "../lib/reservas";
import { SelectAuto } from "../componentes/Filtros";
import FormContas from "../componentes/FormContas";
import { SemBaseDados, Titulo, botao, botaoSec, campo, cartao } from "../componentes/ui";

export const maxDuration = 60;

export default async function Despesas({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await exigirSessao();
  if (!temBaseDados()) return <SemBaseDados />;
  const sp = await searchParams;
  const hoje = hojeISO();
  const [todas, als] = await Promise.all([listarDespesas(), listarAlojamentos()]);
  const anos = [...new Set(todas.map((d) => d.data?.slice(0, 4)).filter(Boolean) as string[])].sort().reverse();
  if (!anos.includes(hoje.slice(0, 4))) anos.unshift(hoje.slice(0, 4));
  const ano = sp.ano ?? hoje.slice(0, 4);
  const mes = sp.mes ?? "Todos";
  const casa = sp.casa ?? "Todas";
  const categoria = sp.categoria ?? "Todas";
  const estado = sp.estado ?? "Todos";
  const q = (sp.q ?? "").trim().toLowerCase();
  const casas = [...als.map((a) => a.nome), GERAL];

  const lista = todas
    .filter((d) => {
      if (ano !== "Todos" && d.data?.slice(0, 4) !== ano) return false;
      if (mes !== "Todos" && Number(d.data?.slice(5, 7)) !== Number(mes)) return false;
      if (casa !== "Todas" && (casa === "Sem casa" ? d.casa : d.casa !== casa)) return false;
      if (categoria !== "Todas" && (categoria === "Sem categoria" ? d.categoria : d.categoria !== categoria)) return false;
      if (estado !== "Todos" && d.estado !== estado) return false;
      if (q && ![d.fornecedor, d.documento, d.nif_fornecedor, d.notas, d.ficheiro].join(" ").toLowerCase().includes(q)) return false;
      return true;
    })
    .reverse();
  const soma = (f: (d: (typeof lista)[number]) => number) => lista.reduce((s, d) => s + f(d), 0);
  const porRepor = todas.filter((d) => d.estado === "Por repor");
  const pendentes = todas.filter((d) => d.estado === "Pendente");
  const filtros = new URLSearchParams({ tipo: "despesas", ano, mes, casa, categoria, estado, q: sp.q ?? "" }).toString();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Titulo sub={`${lista.length} fatura(s) · ${eur(soma((d) => d.total))} · IVA dedutível ${eur(soma((d) => dedutivel(d)))}`}>
          Despesas
        </Titulo>
        <div className="flex gap-2">
          <a href={`/gestao/exportar/contas?${filtros}`} className={botaoSec}>
            Descarregar Excel
          </a>
          <Link href="/gestao/despesas/nova" className={botao}>
            + Nova despesa
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/gestao/despesas?ano=Todos&estado=Por+repor" className={`${cartao} block hover:border-ouro`}>
          <div className="text-xs font-semibold uppercase tracking-wide text-cinza">A repor aos sócios</div>
          <div className="mt-1 text-2xl font-semibold tabular-nums">{eur(porRepor.reduce((s, d) => s + d.total, 0))}</div>
          <div className="text-xs text-cinza">{porRepor.length} fatura(s) pagas pelo Bruno ou pela Rúbia</div>
        </Link>
        <Link href="/gestao/despesas?ano=Todos&estado=Pendente" className={`${cartao} block hover:border-ouro`}>
          <div className="text-xs font-semibold uppercase tracking-wide text-cinza">Sem pagamento no banco</div>
          <div className="mt-1 text-2xl font-semibold tabular-nums">{eur(pendentes.reduce((s, d) => s + d.total, 0))}</div>
          <div className="text-xs text-cinza">{pendentes.length} fatura(s) pendentes: ainda sem extrato ou pagas por um sócio</div>
        </Link>
      </div>

      <form className="grid grid-cols-2 gap-3 sm:grid-cols-6">
        <SelectAuto name="ano" rotulo="Ano" value={ano} opcoes={["Todos", ...anos].map((a) => ({ valor: a, texto: a }))} />
        <SelectAuto
          name="mes"
          rotulo="Mês"
          value={mes}
          opcoes={[{ valor: "Todos", texto: "Todos" }, ...MESES.map((m, i) => ({ valor: String(i + 1), texto: m }))]}
        />
        <SelectAuto name="casa" rotulo="Casa" value={casa} opcoes={["Todas", ...casas, "Sem casa"].map((a) => ({ valor: a, texto: a }))} />
        <SelectAuto
          name="categoria"
          rotulo="Categoria"
          value={categoria}
          opcoes={["Todas", ...CATEGORIAS, "Sem categoria"].map((a) => ({ valor: a, texto: a }))}
        />
        <SelectAuto name="estado" rotulo="Estado" value={estado} opcoes={["Todos", ...ESTADOS_DESPESA].map((a) => ({ valor: a, texto: a }))} />
        <label className="col-span-2 block sm:col-span-1">
          <span className="block text-xs font-semibold uppercase tracking-wide text-cinza">Procurar</span>
          <input name="q" defaultValue={sp.q ?? ""} placeholder="Fornecedor, nº…" className={campo} />
        </label>
      </form>

      {lista.length === 0 ? (
        <p className="text-cinza">Nenhuma despesa com estes filtros.</p>
      ) : (
        <ul className="divide-y divide-black/5 overflow-hidden rounded-lg border border-black/5 bg-white shadow-sm">
          {lista.map((d) => (
            <li key={d.id} className="px-4 py-3 hover:bg-pedra/40">
              <Link href={`/gestao/despesas/${d.id}`} className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1">
                <div className="min-w-0">
                  <div className="truncate font-semibold">{d.fornecedor || "—"}</div>
                  <div className="truncate text-xs text-cinza">
                    {dataPT(d.data)} · {d.documento || "sem nº"} · {d.casa || "sem casa"} · {d.categoria || "sem categoria"}
                    {d.pago_por !== "Empresa" && ` · pago por ${d.pago_por}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold tabular-nums">{eur(d.total)}</div>
                  <span className={`mt-0.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${CORES_ESTADO[d.estado] ?? ""}`}>{d.estado}</span>
                </div>
              </Link>
              {d.estado === "Pendente" && (
                <form action={marcarPorReporAcao} className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <input type="hidden" name="id" value={d.id} />
                  <span className="text-cinza">Foi paga por um sócio?</span>
                  <button name="quem" value="Bruno" className="rounded border border-black/15 px-2 py-1 font-semibold hover:border-black/40">
                    Bruno
                  </button>
                  <button name="quem" value="Rúbia" className="rounded border border-black/15 px-2 py-1 font-semibold hover:border-black/40">
                    Rúbia
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}

      <section className={cartao}>
        <h2 className="font-display text-xl">Importar faturas</h2>
        <p className="mt-1 text-sm text-cinza">
          A folha de acerto (Acerto_Particular_Empresa_JustRuby.xlsx) traz as faturas e o extrato classificado de uma vez. Também
          serve qualquer lista com as colunas Fornecedor e Total (e, se houver, Data, Nº, NIF, IVA, Casa, Categoria, Estado). Nada é
          duplicado: a mesma fatura (fornecedor + nº) só completa o que faltar.
        </p>
        <div className="mt-3">
          <FormContas
            rotuloFicheiro="Ficheiro (.xlsx ou .csv)"
            dicaColar={"Data\tFornecedor\tNIF fornecedor\tNº documento\tNIF cliente\tTotal\tIVA\tCasa\tCategoria\tFicheiro\n15/08/2026\tPingo Doce\t500829993\tFS 1/123\t518785483\t42,10\t3,20\tKingdom of Stone\tConsumíveis e supermercado\t08_Faturas Despesas Ago26/pingo.pdf"}
          />
        </div>
      </section>
    </div>
  );
}
