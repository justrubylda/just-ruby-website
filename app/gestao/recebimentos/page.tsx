import Link from "next/link";
import { guardarRecebimentoAcao } from "../acoes-contas";
import { exigirSessao } from "../lib/acesso";
import { calcular, dataPT, diasEntre, eur, hojeISO, type Reserva } from "../lib/calculos";
import { docsDaReserva, listarDocs } from "../lib/centralgest";
import { CLASSES_RECEITA, PAGO_POR, type Movimento } from "../lib/contas-comum";
import { listarDespesas, listarMovimentos } from "../lib/contas";
import { temBaseDados } from "../lib/db";
import { listarReservas } from "../lib/reservas";
import { SelectAuto } from "../componentes/Filtros";
import { SemBaseDados, Titulo, botao, cartao, rotulo } from "../componentes/ui";

// Cada fatura emitida (FR, ou FT + recibo RG) corresponde a um recebimento: ou entrou na conta da
// empresa (entrada do extrato ligada à reserva) ou foi recebido a título particular por um sócio.

const pequeno = "mt-1 block w-full rounded-md border border-black/15 bg-white px-2 py-2 text-sm text-xisto";
const SOCIOS = PAGO_POR.filter((p) => p !== "Empresa");

type Linha = {
  r: Reserva;
  valor: number;
  entradas: Movimento[];
  estado: "Na conta da empresa" | "A título particular" | "Por receber" | "Por confirmar";
};

export default async function Recebimentos({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await exigirSessao();
  if (!temBaseDados()) return <SemBaseDados />;
  const sp = await searchParams;
  const [reservas, movs, docs, desp] = await Promise.all([listarReservas(), listarMovimentos(), listarDocs(), listarDespesas()]);
  const hoje = hojeISO();

  const faturadas = reservas.filter((r) => !r.cancelada && docsDaReserva(r.fatura).length > 0);
  const anos = [...new Set(faturadas.map((r) => (r.checkin ?? "").slice(0, 4)).filter(Boolean))].sort().reverse();
  const ano = sp.ano ?? anos[0] ?? hoje.slice(0, 4);

  const entradasDe = new Map<number, Movimento[]>();
  for (const m of movs) if (m.montante > 0 && m.reserva_id) entradasDe.set(m.reserva_id, [...(entradasDe.get(m.reserva_id) ?? []), m]);
  const docPorNum = new Map(docs.map((d) => [d.doc.toUpperCase(), d]));
  const livres = movs.filter((m) => m.montante > 0 && !m.reserva_id && (CLASSES_RECEITA.includes(m.classe) || m.classe === "Por classificar"));

  const linhas: Linha[] = faturadas
    .filter((r) => ano === "Todos" || (r.checkin ?? "").startsWith(ano))
    .map((r) => {
      const entradas = entradasDe.get(r.id) ?? [];
      const nums = docsDaReserva(r.fatura);
      const porReceber = nums.length > 0 && nums.every((n) => (docPorNum.get(n)?.por_receber ?? 0) > 0.009);
      const estado: Linha["estado"] = entradas.length
        ? "Na conta da empresa"
        : r.recebido_por && r.recebido_por !== "Empresa"
          ? "A título particular"
          : r.recebido_por === "Empresa"
            ? "Na conta da empresa"
            : porReceber
              ? "Por receber"
              : "Por confirmar";
      return { r, valor: calcular(r).recebido, entradas, estado };
    })
    .sort((a, b) => (b.r.checkin ?? "").localeCompare(a.r.checkin ?? ""));

  const soma = (l: Linha[]) => l.reduce((s, x) => s + x.valor, 0);
  const de = (e: Linha["estado"]) => linhas.filter((x) => x.estado === e);
  const particular = de("A título particular");
  const porSocio = SOCIOS.map((s) => ({ s, v: soma(particular.filter((x) => x.r.recebido_por === s)) }));
  const porRepor = SOCIOS.map((s) => ({
    s,
    v: desp.filter((d) => d.estado === "Por repor" && d.pago_por === s).reduce((t, d) => t + d.total, 0),
  }));

  const candidatas = (x: Linha) => {
    const r = x.r;
    if (!r.checkin) return [];
    return livres
      .filter((m) => diasEntre(r.checkin!, m.data) >= -120 && diasEntre(r.checkout ?? r.checkin!, m.data) <= 90)
      .map((m) => ({ m, dif: Math.min(Math.abs(m.montante - x.valor), Math.abs(m.montante - (r.total ?? 0))) }))
      .sort((a, b) => a.dif - b.dif)
      .slice(0, 6)
      .map((c) => c.m);
  };

  const cartoes = [
    { t: "Faturado", l: linhas, d: "estadias com fatura" },
    { t: "Na conta da empresa", l: de("Na conta da empresa"), d: "entrada no extrato do Millennium" },
    { t: "A título particular", l: particular, d: porSocio.map((p) => `${p.s} ${eur(p.v)}`).join(" · ") },
    { t: "Por confirmar", l: de("Por confirmar"), d: "faturada, sem entrada no banco" },
  ];
  const ordem: Linha["estado"][] = ["Por confirmar", "Por receber", "A título particular", "Na conta da empresa"];

  return (
    <div className="space-y-6">
      <Titulo sub="Cada fatura emitida no CentralGest corresponde a um recebimento: na conta da empresa ou a título particular.">
        Recebimentos
      </Titulo>
      <form className="max-w-xs">
        <SelectAuto name="ano" rotulo="Ano" value={ano} opcoes={[...anos, "Todos"].map((a) => ({ valor: a, texto: a }))} />
      </form>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cartoes.map((c) => (
          <div key={c.t} className={cartao}>
            <div className="text-xs font-semibold uppercase tracking-wide text-cinza">{c.t}</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">{eur(soma(c.l))}</div>
            <div className="text-xs text-cinza">
              {c.l.length} fatura(s) · {c.d}
            </div>
          </div>
        ))}
      </div>

      <div className={cartao}>
        <h2 className="font-display text-xl">Acerto entre os sócios e a empresa</h2>
        <p className="mt-1 text-sm text-cinza">
          O que um sócio recebeu a título particular é da empresa; o que pagou do seu bolso, a empresa repõe-lhe. Valores de todos os anos
          nas despesas; recebimentos do ano escolhido.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {SOCIOS.map((s) => {
            const recebeu = porSocio.find((p) => p.s === s)!.v;
            const pagou = porRepor.find((p) => p.s === s)!.v;
            const saldo = pagou - recebeu;
            return (
              <div key={s} className="rounded-md bg-pedra/40 p-3 text-sm">
                <div className="font-semibold">{s}</div>
                <div className="mt-1 flex justify-between">
                  <span>A empresa tem de repor (despesas)</span>
                  <span className="tabular-nums">{eur(pagou)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Recebeu a título particular</span>
                  <span className="tabular-nums">− {eur(recebeu)}</span>
                </div>
                <div className="mt-1 flex justify-between border-t border-black/10 pt-1 font-semibold">
                  <span>{saldo >= 0 ? "A empresa deve-lhe" : "Deve à empresa"}</span>
                  <span className="tabular-nums">{eur(Math.abs(saldo))}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {ordem.map((e) => {
        const l = de(e);
        if (!l.length) return null;
        return (
          <div key={e} className={cartao}>
            <h2 className="font-display text-xl">
              {e} <span className="text-base font-normal text-cinza">({l.length} · {eur(soma(l))})</span>
            </h2>
            {e === "Por confirmar" && (
              <p className="mt-1 text-sm text-cinza">
                Ligue à entrada do banco, ou diga quem recebeu (transferência ou MB Way para a conta pessoal, dinheiro).
              </p>
            )}
            {e === "Por receber" && <p className="mt-1 text-sm text-cinza">No CentralGest a fatura ainda tem valor por receber (sem recibo).</p>}
            <ul className="mt-3 divide-y divide-black/5">
              {l.map((x) => (
                <LinhaRecebimento key={x.r.id} x={x} cand={e === "Na conta da empresa" ? [] : candidatas(x)} />
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function LinhaRecebimento({ x, cand }: { x: Linha; cand: Movimento[] }) {
  const r = x.r;
  const banco = x.entradas.map((m) => `${dataPT(m.data)} ${eur(m.montante)}`).join(", ");
  return (
    <li className="py-3">
      <details>
        <summary className="grid cursor-pointer list-none grid-cols-[1fr_auto] gap-x-3">
          <div className="min-w-0">
            <div className="truncate font-semibold">{r.hospede || "—"}</div>
            <div className="truncate text-xs text-cinza">
              {dataPT(r.checkin)} · {r.al ?? "—"} · {r.plataforma ?? "direta"} · {r.fatura}
            </div>
            {banco && <div className="truncate text-xs text-[#1f5f2b]">Banco: {banco}</div>}
            {x.estado === "A título particular" && <div className="text-xs text-[#7a4b00]">Recebido por {r.recebido_por}</div>}
          </div>
          <div className="text-right font-semibold tabular-nums">{eur(x.valor)}</div>
        </summary>
        <form action={guardarRecebimentoAcao} className="mt-3 grid gap-3 rounded-md bg-pedra/40 p-3 sm:grid-cols-3">
          <input type="hidden" name="id" value={r.id} />
          <label className="block sm:col-span-2">
            <span className={rotulo}>Entrada no banco</span>
            <select name="movimento_id" defaultValue="" className={pequeno}>
              <option value="">{x.entradas.length ? "— manter —" : "— nenhuma —"}</option>
              {x.entradas.length > 0 && <option value="0">— tirar a ligação —</option>}
              {cand.map((m) => (
                <option key={m.id} value={m.id}>
                  {dataPT(m.data)} · {eur(m.montante)} · {m.descricao}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={rotulo}>Recebido por</span>
            <select name="recebido_por" defaultValue={r.recebido_por ?? ""} className={pequeno}>
              <option value="">— conta da empresa —</option>
              <option value="Empresa">Empresa (ainda não está no extrato)</option>
              {SOCIOS.map((s) => (
                <option key={s} value={s}>
                  {s} (a título particular)
                </option>
              ))}
            </select>
          </label>
          <div className="sm:col-span-3">
            <button className={botao}>Guardar</button>
            <Link href={`/gestao/reservas/${r.id}`} className="ml-3 text-sm text-cinza hover:underline">
              Abrir a reserva
            </Link>
          </div>
        </form>
      </details>
    </li>
  );
}
