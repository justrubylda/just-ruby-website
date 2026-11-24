"use client";

import { useActionState, useState } from "react";
import { precoNaPlataforma } from "@/app/lib/orcamento";
import { criarPeriodoAcao, guardarComissoesAcao, guardarLimpezaAcao, guardarPrecosAcao } from "../acoes";
import { botao, campo, rotulo } from "../componentes/ui";

type Comissoes = { airbnb: number; booking: number };

const valor = (v: string) => {
  const n = Number(v.replace(",", "."));
  return v.trim() !== "" && Number.isFinite(n) && n > 0 ? n : null;
};
const eur = (n: number) =>
  n.toLocaleString("pt-PT", { style: "currency", currency: "EUR", minimumFractionDigits: Number.isInteger(n) ? 0 : 2 });

function Mensagem({ estado, ok }: { estado: string | null; ok: string }) {
  if (!estado) return null;
  return estado === "ok" ? (
    <p role="status" className="text-sm font-semibold text-[#1f5f2b]">
      {ok}
    </p>
  ) : (
    <p role="alert" className="text-sm font-semibold text-[#8a2b1f]">
      {estado}
    </p>
  );
}

/** Uma linha "Site → Airbnb → Booking" para um preço. */
function Equivalentes({ rotulo: r, preco, c }: { rotulo: string; preco: number | null; c: Comissoes }) {
  return (
    <tr className="border-t border-black/5">
      <th scope="row" className="py-2 pr-3 text-left font-normal text-cinza">
        {r}
      </th>
      <td className="py-2 pr-3 font-semibold">{preco ? eur(preco) : "—"}</td>
      <td className="py-2 pr-3">{preco ? eur(precoNaPlataforma(preco, c.airbnb)) : "—"}</td>
      <td className="py-2">{preco ? eur(precoNaPlataforma(preco, c.booking)) : "—"}</td>
    </tr>
  );
}

export function TabelaEquivalentes({ linhas, c }: { linhas: { rotulo: string; preco: number | null }[]; c: Comissoes }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs text-cinza">
          <th scope="col" className="pb-1 font-semibold" />
          <th scope="col" className="pb-1 pr-3 font-semibold">No site</th>
          <th scope="col" className="pb-1 pr-3 font-semibold">Pôr no Airbnb</th>
          <th scope="col" className="pb-1 font-semibold">Pôr no Booking</th>
        </tr>
      </thead>
      <tbody>
        {linhas.map((l) => (
          <Equivalentes key={l.rotulo} rotulo={l.rotulo} preco={l.preco} c={c} />
        ))}
      </tbody>
    </table>
  );
}

export function FormPrecosCasa({
  al,
  inicial,
  comissoes,
}: {
  al: string;
  inicial: { base: string; fim_semana: string; noites_min: string };
  comissoes: Comissoes;
}) {
  const [estado, acao, aEnviar] = useActionState(guardarPrecosAcao, null);
  const [v, setV] = useState(inicial);
  const mudar = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) => setV({ ...v, [k]: e.target.value });
  return (
    <form action={acao} className="space-y-4">
      <input type="hidden" name="al" value={al} />
      <div className="grid grid-cols-3 items-end gap-4">
        <label className="block">
          <span className={rotulo}>Noite (€)</span>
          <input name="base" inputMode="decimal" value={v.base} onChange={mudar("base")} placeholder="ex.: 120" className={campo} />
        </label>
        <label className="block">
          <span className={rotulo}>Sexta e sábado (€)</span>
          <input
            name="fim_semana"
            inputMode="decimal"
            value={v.fim_semana}
            onChange={mudar("fim_semana")}
            placeholder="igual"
            className={campo}
          />
        </label>
        <label className="block">
          <span className={rotulo}>Mínimo de noites</span>
          <input
            name="noites_min"
            type="number"
            min={1}
            max={30}
            value={v.noites_min}
            onChange={mudar("noites_min")}
            className={campo}
          />
        </label>
      </div>
      <TabelaEquivalentes
        c={comissoes}
        linhas={[
          { rotulo: "Noite", preco: valor(v.base) },
          { rotulo: "Sexta e sábado", preco: valor(v.fim_semana) ?? valor(v.base) },
        ]}
      />
      <div className="flex flex-wrap items-center gap-4">
        <button className={botao} disabled={aEnviar}>
          {aEnviar ? "A guardar…" : "Guardar preços"}
        </button>
        <Mensagem estado={aEnviar ? null : estado} ok="Guardado. O site já mostra estes preços." />
      </div>
    </form>
  );
}

export function FormPeriodo({ casas, hoje, comissoes }: { casas: string[]; hoje: string; comissoes: Comissoes }) {
  const [erro, acao, aEnviar] = useActionState(criarPeriodoAcao, null);
  const [preco, setPreco] = useState("");
  const p = valor(preco);
  return (
    <form action={acao} className="grid gap-4 sm:grid-cols-3">
      <label className="block">
        <span className={rotulo}>Casa</span>
        <select name="al" required defaultValue="" className={campo}>
          <option value="" disabled>
            Escolher…
          </option>
          {casas.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label className="block sm:col-span-2">
        <span className={rotulo}>Nome (só para si)</span>
        <input name="nome" placeholder="Natal, agosto, Festa dos Tabuleiros…" className={campo} />
      </label>
      <label className="block">
        <span className={rotulo}>Primeira noite</span>
        <input name="inicio" type="date" min={hoje} required className={campo} />
      </label>
      <label className="block">
        <span className={rotulo}>Até ao dia (saída)</span>
        <input name="fim" type="date" min={hoje} required className={campo} />
        <span className="mt-1 block text-xs text-cinza">Como um check-out: esta noite já não conta.</span>
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className={rotulo}>Noite (€)</span>
          <input name="preco" inputMode="decimal" required value={preco} onChange={(e) => setPreco(e.target.value)} className={campo} />
        </label>
        <label className="block">
          <span className={rotulo}>Mínimo</span>
          <input name="noites_min" type="number" min={1} max={30} placeholder="igual" className={campo} />
        </label>
      </div>
      {p && (
        <p className="text-sm text-cinza sm:col-span-3">
          Pôr no Airbnb <b className="text-xisto">{eur(precoNaPlataforma(p, comissoes.airbnb))}</b> e no Booking{" "}
          <b className="text-xisto">{eur(precoNaPlataforma(p, comissoes.booking))}</b> por noite.
        </p>
      )}
      {erro && (
        <p role="alert" className="text-sm font-semibold text-[#8a2b1f] sm:col-span-3">
          {erro}
        </p>
      )}
      <div className="sm:col-span-3">
        <button className={botao} disabled={aEnviar}>
          {aEnviar ? "A guardar…" : "Adicionar época"}
        </button>
      </div>
    </form>
  );
}

export function FormComissoes({ inicial }: { inicial: Comissoes }) {
  const [estado, acao, aEnviar] = useActionState(guardarComissoesAcao, null);
  return (
    <form action={acao} className="flex flex-wrap items-end gap-4">
      <label className="block w-36">
        <span className={rotulo}>Airbnb (%)</span>
        <input name="airbnb" inputMode="decimal" defaultValue={String(inicial.airbnb)} className={campo} />
      </label>
      <label className="block w-36">
        <span className={rotulo}>Booking (%)</span>
        <input name="booking" inputMode="decimal" defaultValue={String(inicial.booking)} className={campo} />
      </label>
      <button className={botao} disabled={aEnviar}>
        {aEnviar ? "A guardar…" : "Guardar comissões"}
      </button>
      <Mensagem estado={aEnviar ? null : estado} ok="Guardado." />
    </form>
  );
}

export function FormLimpeza({ inicial, comissoes }: { inicial: string; comissoes: Comissoes }) {
  const [estado, acao, aEnviar] = useActionState(guardarLimpezaAcao, null);
  const [v, setV] = useState(inicial);
  return (
    <form action={acao} className="space-y-4">
      <label className="block max-w-48">
        <span className={rotulo}>Taxa de limpeza (€)</span>
        <input name="limpeza" inputMode="decimal" value={v} onChange={(e) => setV(e.target.value)} placeholder="ex.: 40" className={campo} />
      </label>
      <div className="max-w-xl">
        <TabelaEquivalentes c={comissoes} linhas={[{ rotulo: "Por estadia", preco: valor(v) }]} />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button className={botao} disabled={aEnviar}>
          {aEnviar ? "A guardar…" : "Guardar taxa de limpeza"}
        </button>
        <Mensagem estado={aEnviar ? null : estado} ok="Guardado nas duas casas. O site já soma a taxa ao total." />
      </div>
    </form>
  );
}
