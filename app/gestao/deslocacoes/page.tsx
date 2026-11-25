import Link from "next/link";
import {
  confirmarTodasAcao,
  editarDeslocacaoAcao,
  estadoDeslocacaoAcao,
  fecharMesAcao,
  gerarPropostasAcao,
  importarMapasAcao,
  marcarPagoAcao,
  novaDeslocacaoAcao,
  parametrosAcao,
  reabrirMesAcao,
} from "../acoes-deslocacoes";
import { exigirSessao } from "../lib/acesso";
import { dataPT, eur, hojeISO } from "../lib/calculos";
import { temBaseDados } from "../lib/db";
import {
  diasComRefeicaoDaEmpresa,
  lerParametros,
  listarDeslocacoes,
  listarMesesFechados,
  pagamentosCandidatos,
} from "../lib/deslocacoes";
import {
  PESSOAS,
  avisosLinha,
  mesPorExtenso,
  totalizar,
  valores,
  type Deslocacao,
  type Parametros,
  type Pessoa,
} from "../lib/deslocacoes-comum";
import { SemBaseDados, Titulo, botao, botaoSec, campo, cartao, rotulo } from "../componentes/ui";

export const maxDuration = 60;

const somaMes = (mes: string, n: number) => {
  const d = new Date(Date.UTC(Number(mes.slice(0, 4)), Number(mes.slice(5, 7)) - 1 + n, 1));
  return d.toISOString().slice(0, 7);
};
const DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const diaSemana = (iso: string) => DIAS[new Date(`${iso}T12:00:00Z`).getUTCDay()];

export default async function Deslocacoes({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await exigirSessao();
  if (!temBaseDados()) return <SemBaseDados />;
  const sp = await searchParams;
  const hoje = hojeISO();
  const mes = /^\d{4}-\d{2}$/.test(sp.mes ?? "") ? sp.mes! : hoje.slice(0, 7);
  const [p, lista, todas, fechados, refeicoes] = await Promise.all([
    lerParametros(),
    listarDeslocacoes(mes),
    listarDeslocacoes(),
    listarMesesFechados(),
    diasComRefeicaoDaEmpresa(mes),
  ]);
  const estadoMes = (m: string, pessoa: Pessoa) => fechados.find((f) => f.mes === m && f.pessoa === pessoa);
  const visiveis = lista.filter((d) => d.estado !== "Excluída");
  const excluidas = lista.filter((d) => d.estado === "Excluída");
  const ano = mes.slice(0, 4);
  const mesesAno = Array.from({ length: 12 }, (_, i) => `${ano}-${String(i + 1).padStart(2, "0")}`);
  const totalMes = totalizar(visiveis, p).total;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Titulo sub={`Km e ajudas de custo dos sócios-gerentes · ${mesPorExtenso(mes)} · total ${eur(totalMes)}`}>
          Deslocações
        </Titulo>
        <div className="flex items-center gap-2">
          <Link href={`/gestao/deslocacoes?mes=${somaMes(mes, -1)}`} className={botaoSec} aria-label="Mês anterior">
            ←
          </Link>
          <form>
            <input type="month" name="mes" defaultValue={mes} className={`${campo} mt-0 w-auto`} />
          </form>
          <Link href={`/gestao/deslocacoes?mes=${somaMes(mes, 1)}`} className={botaoSec} aria-label="Mês seguinte">
            →
          </Link>
        </div>
      </div>

      {sp.msg && <p className="rounded-md bg-[#e3f1e5] px-4 py-3 text-sm font-semibold text-[#1f5f2b]">{sp.msg}</p>}
      {sp.erro && <p className="rounded-md bg-[#f6e0dd] px-4 py-3 text-sm font-semibold text-[#8a2b1f]">{sp.erro}</p>}

      <section className={`${cartao} flex flex-wrap items-center justify-between gap-3`}>
        <p className="text-sm text-cinza">
          Cada saída de hóspedes com fatura (ou por faturar) gera uma proposta no destino habitual desse alojamento. Reservas
          sem fatura, canceladas e o Torras não contam. Reveja, confirme e feche o mês.
        </p>
        <form action={gerarPropostasAcao}>
          <input type="hidden" name="mes" value={mes} />
          <button className={botao}>Propor a partir das reservas</button>
        </form>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {PESSOAS.map((pessoa) => (
          <CartaoPessoa
            key={pessoa}
            pessoa={pessoa}
            mes={mes}
            p={p}
            lista={visiveis.filter((d) => d.pessoa === pessoa)}
            estado={estadoMes(mes, pessoa)}
          />
        ))}
      </div>

      {PESSOAS.map((pessoa) => {
        const meu = visiveis.filter((d) => d.pessoa === pessoa);
        const fechado = Boolean(estadoMes(mes, pessoa)?.fechado_em);
        return (
          <section key={pessoa} className="space-y-2">
            <h2 className="font-display text-2xl">
              {p.pessoas[pessoa].nome} <span className="text-base text-cinza">· {meu.length} deslocação(ões)</span>
            </h2>
            {meu.length === 0 ? (
              <p className="text-sm text-cinza">Sem deslocações neste mês.</p>
            ) : (
              <ul className="divide-y divide-black/5 overflow-hidden rounded-lg border border-black/5 bg-white shadow-sm">
                {meu.map((d) => (
                  <Linha key={d.id} d={d} p={p} mes={mes} fechado={fechado} avisos={avisosLinha(d, lista, refeicoes)} />
                ))}
              </ul>
            )}
          </section>
        );
      })}

      {excluidas.length > 0 && (
        <details className={cartao}>
          <summary className="cursor-pointer text-sm font-semibold">{excluidas.length} proposta(s) excluídas neste mês</summary>
          <ul className="mt-3 space-y-2 text-sm">
            {excluidas.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  {dataPT(d.data)} · {d.pessoa} · {d.percurso} · {d.prova}
                </span>
                <form action={estadoDeslocacaoAcao}>
                  <input type="hidden" name="id" value={d.id} />
                  <input type="hidden" name="mes" value={mes} />
                  <input type="hidden" name="estado" value="Proposta" />
                  <button className="text-xs font-semibold underline">Repor</button>
                </form>
              </li>
            ))}
          </ul>
        </details>
      )}

      <section className={cartao}>
        <h2 className="font-display text-xl">Nova deslocação</h2>
        <p className="mt-1 text-sm text-cinza">
          Manutenção, obras, compras, reuniões. Horas só quando há almoço (fora entre as 13h e as 14h) ou jantar (entre as 20h e
          as 21h). Refeição paga com o cartão da empresa não dá ajuda de custo.
        </p>
        <FormLinha acao={novaDeslocacaoAcao} p={p} mes={mes} />
      </section>

      <section className={cartao}>
        <h2 className="font-display text-xl">Resumo de {ano}</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm tabular-nums">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-cinza">
                <th className="py-2">Mês</th>
                {PESSOAS.map((x) => (
                  <th key={x} className="py-2 text-right">
                    {p.pessoas[x].nome}
                  </th>
                ))}
                <th className="py-2 text-right">Total</th>
                <th className="py-2 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {mesesAno.map((m) => {
                const doMes = todas.filter((d) => d.data.startsWith(m) && d.estado !== "Excluída");
                const tot = PESSOAS.map((x) => totalizar(doMes.filter((d) => d.pessoa === x), p).total);
                if (!doMes.length) return null;
                const est = PESSOAS.map((x) => {
                  const e = estadoMes(m, x);
                  return e?.pago_em ? "Pago" : e?.fechado_em ? "Fechado" : "Aberto";
                });
                return (
                  <tr key={m} className={m === mes ? "font-semibold" : ""}>
                    <td className="py-2">
                      <Link href={`/gestao/deslocacoes?mes=${m}`} className="underline-offset-4 hover:underline">
                        {mesPorExtenso(m)}
                      </Link>
                    </td>
                    {tot.map((t, i) => (
                      <td key={i} className="py-2 text-right">
                        {eur(t)}
                      </td>
                    ))}
                    <td className="py-2 text-right">{eur(tot.reduce((a, b) => a + b, 0))}</td>
                    <td className="py-2 text-right text-xs text-cinza">{[...new Set(est)].join(" / ")}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-black/20 font-semibold">
                <td className="py-2">Total</td>
                {PESSOAS.map((x) => (
                  <td key={x} className="py-2 text-right">
                    {eur(totalizar(todas.filter((d) => d.data.startsWith(ano) && d.pessoa === x), p).total)}
                  </td>
                ))}
                <td className="py-2 text-right">{eur(totalizar(todas.filter((d) => d.data.startsWith(ano)), p).total)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <details className={cartao}>
        <summary className="cursor-pointer font-display text-xl">Importar os mapas em Excel já feitos</summary>
        <p className="mt-2 text-sm text-cinza">
          O ficheiro Mapa_Deslocacoes_JUST_RUBY (uma folha por mês e por pessoa, ex.: “Jul Bruno”). Pode repetir-se: o que já
          existe não é duplicado. As folhas de exemplo são ignoradas.
        </p>
        <form action={importarMapasAcao} className="mt-3 flex flex-wrap items-end gap-3">
          <input type="hidden" name="mes" value={mes} />
          <input type="file" name="ficheiro" accept=".xlsx" className="text-sm" />
          <button className={botao}>Importar</button>
        </form>
      </details>

      <details className={cartao}>
        <summary className="cursor-pointer font-display text-xl">Parâmetros</summary>
        <FormParametros p={p} mes={mes} />
      </details>
    </div>
  );
}

function CartaoPessoa({
  pessoa,
  mes,
  p,
  lista,
  estado,
}: {
  pessoa: Pessoa;
  mes: string;
  p: Parametros;
  lista: Deslocacao[];
  estado?: { fechado_em: string | null; pago_em: string | null; movimento_id: number | null };
}) {
  const t = totalizar(lista, p);
  const propostas = lista.filter((d) => d.estado === "Proposta").length;
  const fechado = Boolean(estado?.fechado_em);
  const ocultos = (
    <>
      <input type="hidden" name="mes" value={mes} />
      <input type="hidden" name="pessoa" value={pessoa} />
    </>
  );
  return (
    <div className={cartao}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-cinza">{p.pessoas[pessoa].nome} · total a pagar</div>
          <div className="mt-1 text-3xl font-semibold tabular-nums">{eur(t.total)}</div>
          <div className="text-xs text-cinza">
            {t.deslocacoes} deslocação(ões) · {t.km} km ({eur(t.valorKm)}) · {t.refeicoes} refeição(ões) ({eur(t.ajudas)})
          </div>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            estado?.pago_em ? "bg-[#e3f1e5] text-[#1f5f2b]" : fechado ? "bg-[#e3ecf7] text-[#1f4e79]" : "bg-[#fde8b8] text-[#7a4b00]"
          }`}
        >
          {estado?.pago_em ? `Pago a ${dataPT(estado.pago_em)}` : fechado ? "Fechado" : "Aberto"}
        </span>
      </div>
      <PagamentoCandidatos pessoa={pessoa} mes={mes} total={t.total} fechado={fechado} pago={estado?.pago_em ?? null} ocultos={ocultos} />
      <div className="mt-4 flex flex-wrap gap-2">
        <a href={`/gestao/deslocacoes/mapa?mes=${mes}&pessoa=${encodeURIComponent(pessoa)}`} target="_blank" className={botaoSec}>
          Mapa para imprimir
        </a>
        <a href={`/gestao/exportar/deslocacoes?mes=${mes}&pessoa=${encodeURIComponent(pessoa)}`} className={botaoSec}>
          Excel
        </a>
        {!fechado && propostas > 0 && (
          <form action={confirmarTodasAcao}>
            {ocultos}
            <button className={botaoSec}>Confirmar {propostas} proposta(s)</button>
          </form>
        )}
        {!fechado ? (
          <form action={fecharMesAcao}>
            {ocultos}
            <button className={botao} disabled={propostas > 0 || t.deslocacoes === 0}>
              Fechar mês
            </button>
          </form>
        ) : (
          <form action={reabrirMesAcao}>
            {ocultos}
            <button className="px-2 text-sm font-semibold text-cinza underline-offset-4 hover:underline">Reabrir</button>
          </form>
        )}
      </div>
    </div>
  );
}

async function PagamentoCandidatos({
  pessoa,
  mes,
  total,
  fechado,
  pago,
  ocultos,
}: {
  pessoa: Pessoa;
  mes: string;
  total: number;
  fechado: boolean;
  pago: string | null;
  ocultos: React.ReactNode;
}) {
  if (!fechado) return null;
  const cand = pago ? [] : await pagamentosCandidatos(mes, total);
  return (
    <form action={marcarPagoAcao} className="mt-3 flex flex-wrap items-end gap-2 rounded-md bg-pedra/60 p-3 text-sm">
      {ocultos}
      {pago ? (
        <>
          <span>Pago a {dataPT(pago)}.</span>
          <input type="hidden" name="pago_em" value="" />
          <button className="text-xs font-semibold underline">Retirar pagamento</button>
        </>
      ) : (
        <>
          <label className="block">
            <span className={rotulo}>Transferido a</span>
            <input type="date" name="pago_em" className={`${campo} py-1.5`} defaultValue={cand[0]?.data ?? ""} required />
          </label>
          {cand.length > 0 && (
            <label className="block min-w-0 flex-1">
              <span className={rotulo}>Movimento no banco</span>
              <select name="movimento_id" className={`${campo} py-1.5`} defaultValue={cand[0].id}>
                <option value="">—</option>
                {cand.map((c) => (
                  <option key={c.id} value={c.id}>
                    {dataPT(c.data)} · {c.descricao} · {eur(c.montante)}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button className={botaoSec}>Marcar pago</button>
          <p className="w-full text-xs text-cinza">
            Transferir da conta da empresa {eur(total)} com o descritivo “Ajudas de custo e km {mesPorExtenso(mes)} –{" "}
            {pessoa}”.
          </p>
        </>
      )}
    </form>
  );
}

function Linha({ d, p, mes, fechado, avisos }: { d: Deslocacao; p: Parametros; mes: string; fechado: boolean; avisos: string[] }) {
  const v = valores(d, p);
  const refeicoes = [d.almocos ? `${d.almocos} almoço` : "", d.jantares ? `${d.jantares} jantar` : "", d.noites ? `${d.noites} noite` : ""]
    .filter(Boolean)
    .join(" + ");
  return (
    <li className={`px-4 py-3 ${d.estado === "Proposta" ? "bg-[#fffaf0]" : ""}`}>
      <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1">
        <div className="min-w-0">
          <div className="font-semibold">
            {dataPT(d.data)} <span className="font-normal text-cinza">({diaSemana(d.data)})</span> · {d.percurso}
            {d.estado === "Proposta" && (
              <span className="ml-2 rounded-full bg-[#fde8b8] px-2 py-0.5 text-xs font-semibold text-[#7a4b00]">Proposta</span>
            )}
          </div>
          <div className="text-sm">{d.motivo}</div>
          <div className="text-xs text-cinza">
            {d.km} km{refeicoes && ` · ${refeicoes}`}
            {d.saida && ` · ${d.saida}–${d.regresso ?? ""}`}
            {d.matricula && ` · ${d.matricula}`}
            {d.prova && ` · prova: ${d.prova}`}
          </div>
          {avisos.length > 0 && (
            <ul className="mt-1 space-y-0.5 text-xs font-semibold text-[#8a2b1f]">
              {avisos.map((a) => (
                <li key={a}>⚠ {a}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="text-right">
          <div className="font-semibold tabular-nums">{eur(v.total)}</div>
          <div className="text-xs text-cinza tabular-nums">
            km {eur(v.km)} · ajudas {eur(v.ajudas)}
          </div>
        </div>
      </div>
      {!fechado && (
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
          {d.estado === "Proposta" && (
            <form action={estadoDeslocacaoAcao}>
              <input type="hidden" name="id" value={d.id} />
              <input type="hidden" name="mes" value={mes} />
              <input type="hidden" name="estado" value="Confirmada" />
              <button className="rounded border border-black/15 px-2 py-1 font-semibold hover:border-black/40">Confirmar</button>
            </form>
          )}
          <details className="w-full sm:w-auto">
            <summary className="cursor-pointer font-semibold underline-offset-4 hover:underline">Editar</summary>
            <FormLinha acao={editarDeslocacaoAcao} p={p} mes={mes} d={d} />
          </details>
          <form action={estadoDeslocacaoAcao}>
            <input type="hidden" name="id" value={d.id} />
            <input type="hidden" name="mes" value={mes} />
            <input type="hidden" name="estado" value="Excluída" />
            <button className="font-semibold text-[#8a2b1f] underline-offset-4 hover:underline">
              {d.auto ? "Excluir" : "Apagar"}
            </button>
          </form>
        </div>
      )}
    </li>
  );
}

function FormLinha({ acao, p, mes, d }: { acao: (f: FormData) => Promise<void>; p: Parametros; mes: string; d?: Deslocacao }) {
  const destinos = [...new Set([...p.destinos.map((x) => x.destino), "Linda a Velha", "Lisboa", "Alfragide (IKEA)"])];
  const hojeMes = hojeISO().startsWith(mes) ? hojeISO() : `${mes}-01`;
  return (
    <form action={acao} className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-6">
      {d && <input type="hidden" name="id" value={d.id} />}
      <input type="hidden" name="mes" value={mes} />
      <label className="block">
        <span className={rotulo}>Quem</span>
        <select name="pessoa" defaultValue={d?.pessoa ?? "Bruno"} className={campo}>
          {PESSOAS.map((x) => (
            <option key={x} value={x}>
              {p.pessoas[x].nome}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className={rotulo}>Data</span>
        <input type="date" name="data" defaultValue={d?.data ?? hojeMes} required className={campo} />
      </label>
      {d ? (
        <label className="col-span-2 block sm:col-span-4">
          <span className={rotulo}>Percurso</span>
          <input name="percurso" defaultValue={d.percurso} required className={campo} />
        </label>
      ) : (
        <label className="col-span-2 block sm:col-span-2">
          <span className={rotulo}>Destino (ida e volta desde o domicílio)</span>
          <input name="destino" list="destinos" required className={campo} placeholder="Montes (Tomar)" />
          <datalist id="destinos">
            {destinos.map((x) => (
              <option key={x} value={x} />
            ))}
          </datalist>
        </label>
      )}
      {!d && (
        <label className="block sm:col-span-2">
          <span className={rotulo}>Km ida e volta</span>
          <input name="km" inputMode="decimal" required className={campo} placeholder="180" />
        </label>
      )}
      <label className="col-span-2 block sm:col-span-4">
        <span className={rotulo}>Motivo / trabalho feito</span>
        <input name="motivo" defaultValue={d?.motivo ?? ""} required className={campo} placeholder="Manutenção da piscina do Kingdom of Stone" />
      </label>
      {d && (
        <label className="block">
          <span className={rotulo}>Km</span>
          <input name="km" inputMode="decimal" defaultValue={d.km} className={campo} />
        </label>
      )}
      <label className="block">
        <span className={rotulo}>Matrícula</span>
        <input name="matricula" defaultValue={d?.matricula ?? ""} placeholder="a habitual" className={campo} />
      </label>
      <label className="block">
        <span className={rotulo}>Saída</span>
        <input type="time" name="saida" defaultValue={d?.saida ?? ""} className={campo} />
      </label>
      <label className="block">
        <span className={rotulo}>Regresso</span>
        <input type="time" name="regresso" defaultValue={d?.regresso ?? ""} className={campo} />
      </label>
      <label className="block">
        <span className={rotulo}>Almoços</span>
        <input type="number" min={0} max={2} name="almocos" defaultValue={d?.almocos ?? 0} className={campo} />
      </label>
      <label className="block">
        <span className={rotulo}>Jantares</span>
        <input type="number" min={0} max={2} name="jantares" defaultValue={d?.jantares ?? 0} className={campo} />
      </label>
      <label className="block">
        <span className={rotulo}>Noites c/ aloj. pago</span>
        <input type="number" min={0} name="noites" defaultValue={d?.noites ?? 0} className={campo} />
      </label>
      <label className="col-span-2 block sm:col-span-4">
        <span className={rotulo}>Prova</span>
        <input name="prova" defaultValue={d?.prova ?? ""} className={campo} placeholder="Fatura, Via Verde, fotos, mensagens…" />
      </label>
      <div className="col-span-2 flex items-end">
        <button className={botao}>{d ? "Guardar e confirmar" : "Lançar"}</button>
      </div>
    </form>
  );
}

function FormParametros({ p, mes }: { p: Parametros; mes: string }) {
  const num = (name: string, label: string, valor: number, dica?: string) => (
    <label className="block">
      <span className={rotulo}>{label}</span>
      <input name={name} inputMode="decimal" defaultValue={valor} className={campo} />
      {dica && <span className="text-xs text-cinza">{dica}</span>}
    </label>
  );
  return (
    <form action={parametrosAcao} className="mt-4 space-y-5">
      <input type="hidden" name="mes" value={mes} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
        {num("valorKm", "€ por km", p.valorKm)}
        {num("diaria", "Ajuda de custo diária (€)", p.diaria)}
        {num("pctAlmoco", "% almoço", Math.round(p.pctAlmoco * 100))}
        {num("pctJantar", "% jantar", Math.round(p.pctJantar * 100))}
        {num("pctNoite", "% noite c/ aloj.", Math.round(p.pctNoite * 100))}
        {num("tributacao", "% tributação autónoma", Math.round(p.tributacao * 100))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
        <label className="col-span-2 block sm:col-span-3">
          <span className={rotulo}>Domicílio (origem das deslocações)</span>
          <input name="domicilio" defaultValue={p.domicilio} className={campo} />
        </label>
        <label className="block">
          <span className={rotulo}>Autoriza os mapas</span>
          <select name="autoriza" defaultValue={p.autoriza} className={campo}>
            {PESSOAS.map((x) => (
              <option key={x} value={x}>
                {p.pessoas[x].nome}
              </option>
            ))}
          </select>
        </label>
        <label className="col-span-2 block">
          <span className={rotulo}>Referência da autorização</span>
          <input name="referenciaAta" defaultValue={p.referenciaAta} placeholder="Ata n.º 3, de dd/mm/aaaa" className={campo} />
        </label>
      </div>
      {PESSOAS.map((x) => (
        <div key={x} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <label className="block">
            <span className={rotulo}>Nome</span>
            <input name={`${x}_nome`} defaultValue={p.pessoas[x].nome} className={campo} />
          </label>
          <label className="block">
            <span className={rotulo}>Cargo</span>
            <input name={`${x}_cargo`} defaultValue={p.pessoas[x].cargo} className={campo} />
          </label>
          <label className="block">
            <span className={rotulo}>NIF</span>
            <input name={`${x}_nif`} defaultValue={p.pessoas[x].nif} className={campo} />
          </label>
          <label className="block">
            <span className={rotulo}>Matrícula</span>
            <input name={`${x}_matricula`} defaultValue={p.pessoas[x].matricula} className={campo} />
          </label>
        </div>
      ))}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Proposta em cada saída de hóspedes</h3>
        {p.destinos.map((d, i) => (
          <div key={d.al} className="grid grid-cols-2 gap-3 rounded-md bg-pedra/50 p-3 sm:grid-cols-8">
            <div className="col-span-2 self-center text-sm font-semibold sm:col-span-8">{d.al}</div>
            <label className="col-span-2 block">
              <span className={rotulo}>Destino</span>
              <input name={`d${i}_destino`} defaultValue={d.destino} className={campo} />
            </label>
            <label className="block">
              <span className={rotulo}>Km i/v</span>
              <input name={`d${i}_km`} defaultValue={d.km} className={campo} />
            </label>
            <label className="block">
              <span className={rotulo}>Quem</span>
              <select name={`d${i}_pessoa`} defaultValue={d.pessoa} className={campo}>
                {PESSOAS.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </label>
            <label className="col-span-2 block sm:col-span-4">
              <span className={rotulo}>Motivo</span>
              <input name={`d${i}_motivo`} defaultValue={d.motivo} className={campo} />
            </label>
            <label className="block">
              <span className={rotulo}>Saída</span>
              <input type="time" name={`d${i}_saida`} defaultValue={d.saida} className={campo} />
            </label>
            <label className="block">
              <span className={rotulo}>Regresso</span>
              <input type="time" name={`d${i}_regresso`} defaultValue={d.regresso} className={campo} />
            </label>
            <label className="block">
              <span className={rotulo}>Almoços</span>
              <input type="number" min={0} name={`d${i}_almocos`} defaultValue={d.almocos} className={campo} />
            </label>
            <label className="block">
              <span className={rotulo}>Jantares</span>
              <input type="number" min={0} name={`d${i}_jantares`} defaultValue={d.jantares} className={campo} />
            </label>
          </div>
        ))}
      </div>
      <button className={botao}>Guardar parâmetros</button>
    </form>
  );
}
