import Link from "next/link";
import { apagarRegraAcao, despesaDoMovimentoAcao, guardarMovimentoAcao } from "../acoes-contas";
import { exigirSessao } from "../lib/acesso";
import { MESES, dataPT, eur, hojeISO, type Reserva } from "../lib/calculos";
import {
  CATEGORIAS,
  CLASSES,
  CLASSES_RECEITA,
  GERAL,
  sugerirTextoRegra,
  type Despesa,
  type Movimento,
} from "../lib/contas-comum";
import { despesasCandidatas, listarDespesas, listarMovimentos, listarRegras, reservasCandidatas } from "../lib/contas";
import { temBaseDados } from "../lib/db";
import { listarAlojamentos, listarReservas } from "../lib/reservas";
import { SelectAuto } from "../componentes/Filtros";
import FormContas, { BotaoConferir } from "../componentes/FormContas";
import { SemBaseDados, Titulo, botao, botaoSec, campo, cartao, rotulo } from "../componentes/ui";

export const maxDuration = 60;

const MAX_LINHAS = 250;
const VER = ["Por tratar", "Todos", "Entradas", "Saídas", "Por classificar", "Saídas sem fatura", "Entradas sem reserva"];

const pequeno = "mt-1 block w-full rounded-md border border-black/15 bg-white px-2 py-2 text-sm text-xisto";

export default async function Banco({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await exigirSessao();
  if (!temBaseDados()) return <SemBaseDados />;
  const sp = await searchParams;
  const [movs, desp, reservas, als, regras] = await Promise.all([
    listarMovimentos(),
    listarDespesas(),
    listarReservas(),
    listarAlojamentos(),
    listarRegras(),
  ]);
  const casas = [...als.map((a) => a.nome), GERAL];
  const despDoMov = new Map<number, Despesa[]>();
  for (const d of desp) {
    for (const id of [d.movimento_id, d.reposicao_id]) if (id) despDoMov.set(id, [...(despDoMov.get(id) ?? []), d]);
  }
  const resPorId = new Map(reservas.map((r) => [r.id, r]));

  const semFatura = (m: Movimento) => m.montante < 0 && m.classe === "Despesa" && m.categoria !== "Banco" && !despDoMov.has(m.id);
  const semReserva = (m: Movimento) => m.montante > 0 && CLASSES_RECEITA.includes(m.classe) && !m.reserva_id;
  const porTratar = (m: Movimento) => m.classe === "Por classificar" || semFatura(m) || semReserva(m);

  const ultimo = movs.at(-1);
  const anos = [...new Set(movs.map((m) => m.data.slice(0, 4)))].sort().reverse();
  const ano = sp.ano ?? anos[0] ?? hojeISO().slice(0, 4);
  const mes = sp.mes ?? "Todos";
  const ver = sp.ver ?? "Por tratar";
  const q = (sp.q ?? "").trim().toLowerCase();

  const doPeriodo = movs.filter(
    (m) => (ano === "Todos" || m.data.startsWith(ano)) && (mes === "Todos" || Number(m.data.slice(5, 7)) === Number(mes))
  );
  const lista = doPeriodo
    .filter((m) => {
      if (ver === "Por tratar" && !porTratar(m)) return false;
      if (ver === "Entradas" && m.montante <= 0) return false;
      if (ver === "Saídas" && m.montante >= 0) return false;
      if (ver === "Por classificar" && m.classe !== "Por classificar") return false;
      if (ver === "Saídas sem fatura" && !semFatura(m)) return false;
      if (ver === "Entradas sem reserva" && !semReserva(m)) return false;
      if (q && ![m.descricao, m.notas, m.classe, m.categoria, m.casa].join(" ").toLowerCase().includes(q)) return false;
      return true;
    })
    .reverse();
  const contar = (f: (m: Movimento) => boolean) => {
    const l = doPeriodo.filter(f);
    return { n: l.length, v: l.reduce((s, m) => s + m.montante, 0) };
  };
  const nClass = contar((m) => m.classe === "Por classificar");
  const nSemFat = contar(semFatura);
  const nSemRes = contar(semReserva);
  const ligar = (v: string) => `/gestao/banco?${new URLSearchParams({ ano, mes, ver: v }).toString()}`;
  const exportar = `/gestao/exportar/contas?${new URLSearchParams({ tipo: "banco", ano, mes }).toString()}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Titulo
          sub={
            ultimo
              ? `${movs.length} movimento(s) · último a ${dataPT(ultimo.data)}${ultimo.saldo != null ? ` · saldo ${eur(ultimo.saldo)}` : ""}`
              : "Ainda sem movimentos: carregue o extrato do Millennium."
          }
        >
          Banco
        </Titulo>
        <div className="flex flex-wrap gap-2">
          <a href={exportar} className={botaoSec}>
            Descarregar Excel
          </a>
          <BotaoConferir />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { t: "Por classificar", c: nClass, d: "movimentos sem tipo" },
          { t: "Saídas sem fatura", c: nSemFat, d: "despesas sem documento — pedir a fatura" },
          { t: "Entradas sem reserva", c: nSemRes, d: "recebimentos por explicar — estadia por faturar?" },
        ].map((x) => (
          <Link key={x.t} href={ligar(x.t)} className={`${cartao} block hover:border-ouro`}>
            <div className="text-xs font-semibold uppercase tracking-wide text-cinza">{x.t}</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">{x.c.n}</div>
            <div className="text-xs text-cinza">
              {eur(Math.abs(x.c.v))} · {x.d}
            </div>
          </Link>
        ))}
      </div>

      <form className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SelectAuto name="ano" rotulo="Ano" value={ano} opcoes={["Todos", ...anos].map((a) => ({ valor: a, texto: a }))} />
        <SelectAuto
          name="mes"
          rotulo="Mês"
          value={mes}
          opcoes={[{ valor: "Todos", texto: "Todos" }, ...MESES.map((m, i) => ({ valor: String(i + 1), texto: m }))]}
        />
        <SelectAuto name="ver" rotulo="Mostrar" value={ver} opcoes={VER.map((a) => ({ valor: a, texto: a }))} />
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wide text-cinza">Procurar</span>
          <input name="q" defaultValue={sp.q ?? ""} placeholder="Descrição, notas…" className={campo} />
        </label>
      </form>

      {lista.length === 0 ? (
        <p className="text-cinza">{movs.length ? "Nada para mostrar com estes filtros." : "Carregue o primeiro extrato em baixo."}</p>
      ) : (
        <>
          <ul className="divide-y divide-black/5 overflow-hidden rounded-lg border border-black/5 bg-white shadow-sm">
            {lista.slice(0, MAX_LINHAS).map((m) => (
              <LinhaMovimento
                key={m.id}
                m={m}
                casas={casas}
                ligadas={despDoMov.get(m.id) ?? []}
                reserva={m.reserva_id ? resPorId.get(m.reserva_id) ?? null : null}
                desp={desp}
                reservas={reservas}
              />
            ))}
          </ul>
          {lista.length > MAX_LINHAS && (
            <p className="text-sm text-cinza">
              A mostrar {MAX_LINHAS} de {lista.length}. Escolha um mês para ver os restantes.
            </p>
          )}
        </>
      )}

      <section className={cartao}>
        <h2 className="font-display text-xl">Carregar extrato</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-cinza">
          <li>No Millennium (site de Empresas): Contas → Movimentos → escolher as datas → exportar em Excel.</li>
          <li>Carregue aqui o ficheiro. Pode repetir períodos: os movimentos que já estão não são duplicados.</li>
          <li>O site classifica pelas regras e liga cada saída à fatura e cada entrada à reserva, quando não há dúvida.</li>
        </ol>
        <div className="mt-3">
          <FormContas
            rotuloFicheiro="Extrato (.xlsx ou .csv) ou a folha de acerto"
            dicaColar={"Data\tDescrição\tMontante\tSaldo\n02/10/2026\tCOMPRA 1234 PINGO DOCE TOMAR\t-42,10\t3.210,55"}
          />
        </div>
      </section>

      <section className={cartao}>
        <details>
          <summary className="cursor-pointer font-display text-xl">Regras de classificação ({regras.length})</summary>
          <p className="mt-2 text-sm text-cinza">
            Se a descrição do movimento tiver este texto (palavras inteiras), fica com este tipo, categoria e casa. A primeira regra que
            servir é a que conta. Para criar uma regra, classifique um movimento e marque “criar regra”. Os movimentos mudados à mão não
            são alterados pelas regras.
          </p>
          <ul className="mt-3 divide-y divide-black/5 text-sm">
            {regras.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-2">
                <span className="min-w-0">
                  <b>{r.texto}</b>
                  {r.sentido && <span className="text-cinza"> ({r.sentido === "entrada" ? "entradas" : "saídas"})</span>} → {r.classe}
                  {r.categoria && ` · ${r.categoria}`}
                  {r.casa && ` · ${r.casa}`}
                </span>
                <form action={apagarRegraAcao}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="text-xs font-semibold text-[#8a2b1f] hover:underline">Apagar</button>
                </form>
              </li>
            ))}
          </ul>
        </details>
      </section>
    </div>
  );
}

function LinhaMovimento({
  m,
  casas,
  ligadas,
  reserva,
  desp,
  reservas,
}: {
  m: Movimento;
  casas: string[];
  ligadas: Despesa[];
  reserva: Reserva | null;
  desp: Despesa[];
  reservas: Reserva[];
}) {
  const entrada = m.montante > 0;
  const pagas = ligadas.filter((d) => d.movimento_id === m.id);
  const repostas = ligadas.filter((d) => d.reposicao_id === m.id);
  const ligacao = entrada
    ? reserva
      ? `Reserva: ${reserva.hospede || "—"} (${dataPT(reserva.checkin)}${reserva.fatura ? ` · ${reserva.fatura}` : " · sem fatura"})`
      : null
    : pagas.length
      ? `Fatura: ${pagas.map((d) => `${d.fornecedor} ${d.documento ?? ""}`.trim()).join(", ")}`
      : repostas.length
        ? `Repõe ${repostas.length} despesa(s)`
        : null;
  const candD = entrada ? [] : despesasCandidatas(m, desp.filter((d) => m.classe === "Reposição aos sócios" ? d.estado === "Por repor" : true));
  const candR = entrada ? reservasCandidatas(m, reservas) : [];
  return (
    <li className="px-4 py-3">
      <details>
        <summary className="grid cursor-pointer list-none grid-cols-[1fr_auto] gap-x-3 gap-y-1">
          <div className="min-w-0">
            <div className="truncate font-semibold">{m.descricao}</div>
            <div className="truncate text-xs text-cinza">
              {dataPT(m.data)} · {m.classe}
              {m.categoria && ` · ${m.categoria}`}
              {m.casa && ` · ${m.casa}`}
            </div>
            {ligacao ? (
              <div className="truncate text-xs text-[#1f5f2b]">{ligacao}</div>
            ) : m.classe === "Despesa" && m.categoria !== "Banco" ? (
              <div className="text-xs text-[#7a4b00]">Sem fatura</div>
            ) : entrada && CLASSES_RECEITA.includes(m.classe) ? (
              <div className="text-xs text-[#7a4b00]">Sem reserva</div>
            ) : null}
          </div>
          <div className={`text-right font-semibold tabular-nums ${entrada ? "text-[#1f5f2b]" : ""}`}>{eur(m.montante)}</div>
        </summary>

        <form action={guardarMovimentoAcao} className="mt-3 grid gap-3 rounded-md bg-pedra/40 p-3 sm:grid-cols-3">
          <input type="hidden" name="id" value={m.id} />
          <label className="block">
            <span className={rotulo}>Tipo</span>
            <select name="classe" defaultValue={m.classe} className={pequeno}>
              {CLASSES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={rotulo}>Categoria</span>
            <select name="categoria" defaultValue={m.categoria ?? ""} className={pequeno}>
              <option value="">—</option>
              {[...new Set([...CATEGORIAS, ...(m.categoria ? [m.categoria] : [])])].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={rotulo}>Casa</span>
            <select name="casa" defaultValue={m.casa ?? ""} className={pequeno}>
              <option value="">—</option>
              {[...new Set([...casas, ...(m.casa ? [m.casa] : [])])].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          {entrada ? (
            <label className="block sm:col-span-2">
              <span className={rotulo}>Reserva</span>
              <select name="reserva_id" defaultValue={m.reserva_id ?? ""} className={pequeno}>
                <option value="">— nenhuma —</option>
                {[...(reserva && !candR.some((r) => r.id === reserva.id) ? [reserva] : []), ...candR].map((r) => (
                  <option key={r.id} value={r.id}>
                    {dataPT(r.checkin)} · {r.hospede || "—"} · {r.al} · {eur(r.recebido ?? (r.total ?? 0) - (r.comissao ?? 0))}
                    {r.fatura ? ` · ${r.fatura}` : " · sem fatura"}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className="block sm:col-span-2">
              <span className={rotulo}>{m.classe === "Reposição aos sócios" ? "Despesa reposta" : "Fatura de despesa"}</span>
              <select name="despesa_id" defaultValue={pagas[0]?.id ?? ""} className={pequeno}>
                <option value="">{pagas.length ? "— manter —" : "— nenhuma —"}</option>
                {pagas.length > 0 && <option value="0">— tirar a ligação —</option>}
                {candD.map((d) => (
                  <option key={d.id} value={d.id}>
                    {dataPT(d.data)} · {d.fornecedor} {d.documento ?? ""} · {eur(d.total)} · {d.estado}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="block">
            <span className={rotulo}>Notas</span>
            <input name="notas" defaultValue={m.notas ?? ""} className={pequeno} />
          </label>
          <div className="flex flex-wrap items-end gap-2 sm:col-span-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="regra" />
              Criar regra para
            </label>
            <input name="regra_texto" defaultValue={sugerirTextoRegra(m.descricao)} className={`${pequeno} mt-0 max-w-48`} />
            <input type="hidden" name="regra_sentido" value={entrada ? "entrada" : "saida"} />
            <button className={`${botao} ml-auto`}>Guardar</button>
          </div>
        </form>
        {!entrada && m.classe !== "Reposição aos sócios" && !pagas.length && (
          <form action={despesaDoMovimentoAcao} className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <input type="hidden" name="id" value={m.id} />
            <span className="text-cinza">A fatura ainda não chegou?</span>
            <button className="rounded border border-black/15 px-2 py-1 font-semibold hover:border-black/40">
              Registar despesa a partir deste movimento
            </button>
          </form>
        )}
      </details>
    </li>
  );
}
