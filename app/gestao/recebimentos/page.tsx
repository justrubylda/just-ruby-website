import Link from "next/link";
import { guardarRecebimentoAcao } from "../acoes-contas";
import { exigirSessao } from "../lib/acesso";
import { calcular, dataPT, diasEntre, eur, hojeISO, type Reserva } from "../lib/calculos";
import { docsDaReserva, listarDocs, listarRecibos, type DocCG, type ReciboCG } from "../lib/centralgest";
import { CLASSES_RECEITA, PAGO_POR, normalizar, type Movimento } from "../lib/contas-comum";
import { listarDespesas, listarMovimentos } from "../lib/contas";
import { temBaseDados } from "../lib/db";
import { listarReservas } from "../lib/reservas";
import { SelectAuto } from "../componentes/Filtros";
import { SemBaseDados, Titulo, botao, cartao, rotulo } from "../componentes/ui";

// Cada documento emitido no CentralGest (FR = fatura-recibo; FT = fatura, paga depois por um recibo RG)
// corresponde a um recebimento: ou entrou na conta da empresa (entrada do extrato ligada à reserva)
// ou foi recebido a título particular por um sócio.

const pequeno = "mt-1 block w-full rounded-md border border-black/15 bg-white px-2 py-2 text-sm text-xisto";
const SOCIOS = PAGO_POR.filter((p) => p !== "Empresa");

type Estado = "Na conta da empresa" | "A título particular" | "Por receber" | "Por confirmar";
type Linha = {
  d: DocCG;
  r: Reserva | null;
  liquido: number; // o que devia chegar ao banco (sem a comissão da plataforma)
  entradas: Movimento[];
  recibos: ReciboCG[];
  estado: Estado;
  semRecibo: boolean; // FT paga no banco mas ainda "por receber" no CentralGest
};

export default async function Recebimentos({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await exigirSessao();
  if (!temBaseDados()) return <SemBaseDados />;
  const sp = await searchParams;
  const [reservas, movs, docsTodos, recibos, desp] = await Promise.all([
    listarReservas(),
    listarMovimentos(),
    listarDocs(),
    listarRecibos(),
    listarDespesas(),
  ]);
  const hoje = hojeISO();

  const docs = docsTodos.filter((d) => d.total > 0 && /^(FR|FT|FS)\s/.test(d.doc)); // anulados ficam a 0
  const anos = [...new Set(docs.map((d) => d.data.slice(0, 4)))].sort().reverse();
  const ano = sp.ano ?? anos[0] ?? hoje.slice(0, 4);

  const resDoDoc = new Map<string, Reserva>();
  for (const r of reservas) if (!r.cancelada) for (const n of docsDaReserva(r.fatura)) resDoDoc.set(n, r);
  const entradasDe = new Map<number, Movimento[]>();
  for (const m of movs) if (m.montante > 0 && m.reserva_id) entradasDe.set(m.reserva_id, [...(entradasDe.get(m.reserva_id) ?? []), m]);
  const livres = movs.filter((m) => m.montante > 0 && !m.reserva_id && (CLASSES_RECEITA.includes(m.classe) || m.classe === "Por classificar"));
  const recValidos = recibos.filter((x) => !x.anulado);
  const primeiraPalavra = (s: string | null | undefined) => normalizar(s).split(" ")[0] ?? "";

  const linhas: Linha[] = docs
    .filter((d) => ano === "Todos" || d.data.startsWith(ano))
    .map((d) => {
      const r = resDoDoc.get(d.doc) ?? null;
      const entradas = r ? entradasDe.get(r.id) ?? [] : [];
      const ft = d.doc.startsWith("FT");
      const porReceber = ft && (d.por_receber ?? 0) > 0.009;
      const recs = ft
        ? recValidos.filter((x) => primeiraPalavra(x.cliente) === primeiraPalavra(d.cliente) && x.data >= d.data && Math.abs(x.total - d.total) < 0.011)
        : [];
      const estado: Estado =
        entradas.length || r?.recebido_por === "Empresa"
          ? "Na conta da empresa"
          : r?.recebido_por
            ? "A título particular"
            : porReceber
              ? "Por receber"
              : "Por confirmar";
      const liquido = r && docsDaReserva(r.fatura).length === 1 ? calcular(r).recebido : d.total;
      return { d, r, liquido, entradas, recibos: recs, estado, semRecibo: porReceber && entradas.length > 0 };
    });

  const soma = (l: Linha[]) => l.reduce((s, x) => s + x.d.total, 0);
  const de = (e: Estado) => linhas.filter((x) => x.estado === e);
  const particular = de("A título particular");
  // recebido a título particular: o que chegou ao sócio (uma vez por reserva)
  const recebeu = (s: string) => {
    const vistas = new Set<number>();
    let t = 0;
    for (const x of particular)
      if (x.r && x.r.recebido_por === s && !vistas.has(x.r.id)) {
        vistas.add(x.r.id);
        t += calcular(x.r).recebido;
      }
    return t;
  };
  const porRepor = (s: string) => desp.filter((d) => d.estado === "Por repor" && d.pago_por === s).reduce((t, d) => t + d.total, 0);
  const semRecibo = linhas.filter((x) => x.semRecibo);

  const candidatas = (x: Linha) => {
    const r = x.r;
    if (!r?.checkin) return [];
    return livres
      .filter((m) => diasEntre(r.checkin!, m.data) >= -120 && diasEntre(r.checkout ?? r.checkin!, m.data) <= 90)
      .map((m) => ({ m, dif: Math.min(Math.abs(m.montante - x.liquido), Math.abs(m.montante - x.d.total)) }))
      .sort((a, b) => a.dif - b.dif)
      .slice(0, 6)
      .map((c) => c.m);
  };

  const cartoes = [
    { t: "Faturado", l: linhas, d: "FR e FT emitidas no CentralGest" },
    { t: "Na conta da empresa", l: de("Na conta da empresa"), d: "entrada no extrato do Millennium" },
    { t: "A título particular", l: particular, d: SOCIOS.map((s) => `${s} ${eur(recebeu(s))}`).join(" · ") },
    { t: "Por confirmar", l: de("Por confirmar"), d: "sem entrada no banco" },
  ];
  const ordem: Estado[] = ["Por confirmar", "Por receber", "A título particular", "Na conta da empresa"];

  return (
    <div className="space-y-6">
      <Titulo sub="Cada fatura do CentralGest (FR, ou FT paga por recibo RG) corresponde a um recebimento: na conta da empresa ou a título particular.">
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
              {c.l.length} documento(s) · {c.d}
            </div>
          </div>
        ))}
      </div>

      {semRecibo.length > 0 && (
        <div className={`${cartao} border-[#e3b23c]`}>
          <h2 className="font-display text-xl">Pagas no banco, sem recibo no CentralGest</h2>
          <p className="mt-1 text-sm text-cinza">O dinheiro entrou na conta, mas a fatura continua &quot;por receber&quot;: falta emitir o recibo (RG).</p>
          <ul className="mt-2 text-sm">
            {semRecibo.map((x) => (
              <li key={x.d.doc}>
                {x.d.doc} · {x.d.cliente} · {eur(x.d.total)} — banco {x.entradas.map((m) => `${dataPT(m.data)} ${eur(m.montante)}`).join(", ")}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={cartao}>
        <h2 className="font-display text-xl">Acerto entre os sócios e a empresa</h2>
        <p className="mt-1 text-sm text-cinza">
          O que um sócio recebeu a título particular é da empresa; o que pagou do seu bolso, a empresa repõe-lhe. Despesas de todos os anos;
          recebimentos do ano escolhido.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {SOCIOS.map((s) => {
            const pagou = porRepor(s);
            const r = recebeu(s);
            const saldo = pagou - r;
            return (
              <div key={s} className="rounded-md bg-pedra/40 p-3 text-sm">
                <div className="font-semibold">{s}</div>
                <div className="mt-1 flex justify-between">
                  <span>A empresa tem de repor (despesas)</span>
                  <span className="tabular-nums">{eur(pagou)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Recebeu a título particular</span>
                  <span className="tabular-nums">− {eur(r)}</span>
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
              <p className="mt-1 text-sm text-cinza">Ligue à entrada do banco, ou diga quem recebeu (transferência ou MB Way para a conta pessoal, dinheiro).</p>
            )}
            {e === "Por receber" && <p className="mt-1 text-sm text-cinza">Fatura (FT) ainda por receber no CentralGest e sem entrada no banco.</p>}
            <ul className="mt-3 divide-y divide-black/5">
              {l.map((x) => (
                <LinhaRecebimento key={x.d.doc} x={x} cand={e === "Na conta da empresa" ? [] : candidatas(x)} />
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function LinhaRecebimento({ x, cand }: { x: Linha; cand: Movimento[] }) {
  const { d, r } = x;
  const banco = x.entradas.map((m) => `${dataPT(m.data)} ${eur(m.montante)}`).join(", ");
  const recibos = x.recibos.map((rg) => `${rg.doc} de ${dataPT(rg.data)}`).join(", ");
  return (
    <li className="py-3">
      <details>
        <summary className="grid cursor-pointer list-none grid-cols-[1fr_auto] gap-x-3">
          <div className="min-w-0">
            <div className="truncate font-semibold">
              {d.doc} · {d.cliente || r?.hospede || "—"}
            </div>
            <div className="truncate text-xs text-cinza">
              {dataPT(d.data)}
              {r ? ` · ${r.hospede ?? "—"} · ${r.al ?? "—"} · ${r.plataforma ?? "direta"}` : " · sem reserva no site"}
              {Math.abs(x.liquido - d.total) > 0.009 && ` · líquido ${eur(x.liquido)}`}
            </div>
            {recibos && <div className="truncate text-xs text-cinza">Recibo: {recibos}</div>}
            {banco && <div className="truncate text-xs text-[#1f5f2b]">Banco: {banco}</div>}
            {x.semRecibo && <div className="text-xs text-[#7a4b00]">Falta o recibo no CentralGest</div>}
            {x.estado === "A título particular" && <div className="text-xs text-[#7a4b00]">Recebido por {r?.recebido_por}</div>}
          </div>
          <div className="text-right font-semibold tabular-nums">{eur(d.total)}</div>
        </summary>
        {r ? (
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
        ) : (
          <p className="mt-2 text-sm text-cinza">
            Esta fatura não está ligada a nenhuma reserva. Ligue-a em <Link href="/gestao/faturar" className="underline">Por faturar</Link>.
          </p>
        )}
      </details>
    </li>
  );
}
