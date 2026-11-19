"use client";

import { useActionState, useMemo, useState } from "react";
import { guardarReserva } from "../acoes";
import { PLATAFORMAS, TAXAS_IVA, calcular, descricaoFatura, eur, pct, type Alojamento, type Reserva } from "../lib/calculos";
import Copiar from "./Copiar";
import { Etiqueta, botao, campo, rotulo } from "./ui";

type Valores = Record<string, string>;

const paraTexto = (v: unknown) => (v == null ? "" : String(v));
const num = (s: string) => {
  const t = s.replace(/\s|€/g, "");
  if (!t) return null;
  const n = Number(t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t);
  return Number.isFinite(n) ? n : null;
};

function Campo({
  nome,
  texto,
  v,
  set,
  tipo = "text",
  dica,
  className = "",
  ...resto
}: {
  nome: string;
  texto: string;
  v: Valores;
  set: (k: string, x: string) => void;
  tipo?: string;
  dica?: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block ${className}`}>
      <span className={rotulo}>{texto}</span>
      <input name={nome} type={tipo} value={v[nome] ?? ""} onChange={(e) => set(nome, e.target.value)} className={campo} {...resto} />
      {dica && <span className="mt-0.5 block text-xs text-cinza">{dica}</span>}
    </label>
  );
}

export default function FormReserva({
  reserva,
  als,
  voltar,
}: {
  reserva: Partial<Reserva> & { id?: number };
  als: Alojamento[];
  voltar?: string;
}) {
  const [erro, acao, aGuardar] = useActionState(guardarReserva, null);
  const [v, setV] = useState<Valores>(() => {
    const o: Valores = {};
    for (const [k, x] of Object.entries(reserva)) o[k] = paraTexto(x);
    if (!o.taxa_iva) o.taxa_iva = "0.06";
    if (!o.plataforma) o.plataforma = "Direto";
    return o;
  });
  const [cancelada, setCancelada] = useState(Boolean(reserva.cancelada));
  const set = (k: string, x: string) => setV((s) => ({ ...s, [k]: x }));

  const r = useMemo<Reserva>(
    () => ({
      id: reserva.id ?? 0,
      checkin: v.checkin || null,
      checkout: v.checkout || null,
      noites: num(v.noites ?? ""),
      al: v.al || null,
      plataforma: v.plataforma || null,
      hospede: v.hospede || null,
      nif: null,
      morada: null,
      cod_reserva: null,
      hospedes: null,
      total: num(v.total ?? ""),
      comissao: num(v.comissao ?? ""),
      recebido: num(v.recebido ?? ""),
      limpeza: num(v.limpeza ?? ""),
      taxa_iva: Number(v.taxa_iva || 0.06),
      fatura: v.fatura || null,
      recibo: null,
      notas: null,
      origem: null,
      fonte: null,
      ical_uid: null,
      pedido_id: null,
      cancelada,
    }),
    [v, cancelada, reserva.id]
  );
  const c = calcular(r);
  const desc = descricaoFatura(r, als);
  const noitesDatas = r.checkin && r.checkout ? calcular({ ...r, noites: null }).noites : null;

  return (
    <form action={acao} className="space-y-6">
      {reserva.id ? <input type="hidden" name="id" value={reserva.id} /> : null}
      {reserva.pedido_id ? <input type="hidden" name="pedido_id" value={reserva.pedido_id} /> : null}
      {voltar ? <input type="hidden" name="voltar" value={voltar} /> : null}

      <fieldset className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Campo nome="checkin" texto="Check-in" tipo="date" v={v} set={set} required />
        <Campo nome="checkout" texto="Check-out" tipo="date" v={v} set={set} />
        <Campo
          nome="noites"
          texto="Noites"
          inputMode="numeric"
          v={v}
          set={set}
          placeholder={noitesDatas != null ? String(noitesDatas) : ""}
          dica="Vazio = conta pelas datas"
        />
        <label className="block">
          <span className={rotulo}>Hóspedes</span>
          <input name="hospedes" inputMode="numeric" value={v.hospedes ?? ""} onChange={(e) => set("hospedes", e.target.value)} className={campo} />
        </label>
        <label className="col-span-2 block sm:col-span-2">
          <span className={rotulo}>Alojamento</span>
          <select name="al" value={v.al ?? ""} onChange={(e) => set("al", e.target.value)} className={campo} required>
            <option value="" disabled>
              Escolher…
            </option>
            {als.map((a) => (
              <option key={a.nome}>{a.nome}</option>
            ))}
          </select>
        </label>
        <label className="col-span-2 block sm:col-span-2">
          <span className={rotulo}>Plataforma</span>
          <select name="plataforma" value={v.plataforma ?? ""} onChange={(e) => set("plataforma", e.target.value)} className={campo}>
            {PLATAFORMAS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
      </fieldset>

      <fieldset className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Campo nome="hospede" texto="Hóspede / Cliente" v={v} set={set} className="col-span-2" />
        <Campo nome="nif" texto="NIF" v={v} set={set} inputMode="numeric" />
        <Campo nome="cod_reserva" texto="Cód. reserva" v={v} set={set} />
        <Campo nome="morada" texto="Morada / Contacto" v={v} set={set} className="col-span-2 sm:col-span-4" />
      </fieldset>

      <fieldset className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <Campo nome="total" texto="Total c/ IVA (€)" v={v} set={set} inputMode="decimal" dica="Valor da estadia faturado" />
        <Campo nome="comissao" texto="Comissão (€)" v={v} set={set} inputMode="decimal" />
        <Campo
          nome="recebido"
          texto="Recebido (€)"
          v={v}
          set={set}
          inputMode="decimal"
          placeholder={r.total != null ? ((r.total ?? 0) - (r.comissao ?? 0)).toFixed(2).replace(".", ",") : ""}
          dica="Vazio = total − comissão"
        />
        <Campo nome="limpeza" texto="Limpeza (€)" v={v} set={set} inputMode="decimal" />
        <label className="block">
          <span className={rotulo}>Taxa de IVA</span>
          <select name="taxa_iva" value={v.taxa_iva} onChange={(e) => set("taxa_iva", e.target.value)} className={campo}>
            {TAXAS_IVA.map((t) => (
              <option key={t} value={String(t)}>
                {pct(t)}
              </option>
            ))}
          </select>
        </label>
      </fieldset>

      <fieldset className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Campo nome="fatura" texto="Nº Fatura" v={v} set={set} dica='Ou escreva "Sem fatura"' />
        <Campo nome="recibo" texto="Nº Recibo" v={v} set={set} />
        <label className="col-span-2 block">
          <span className={rotulo}>Notas</span>
          <textarea name="notas" rows={2} value={v.notas ?? ""} onChange={(e) => set("notas", e.target.value)} className={campo} />
        </label>
        <label className="col-span-2 flex items-center gap-2 text-sm">
          <input type="checkbox" name="cancelada" checked={cancelada} onChange={(e) => setCancelada(e.target.checked)} className="size-4" />
          Reserva cancelada (não conta nos totais)
        </label>
      </fieldset>

      <div className="rounded-lg bg-pedra/60 p-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <Etiqueta estado={c.estado} />
          <span>Noites: <b>{c.noites}</b></span>
          <span>Recebido: <b>{eur(c.recebido)}</b></span>
          <span>Base s/ IVA: <b>{eur(c.base)}</b></span>
          <span>IVA: <b>{eur(c.iva)}</b></span>
          <span>Líquido: <b>{eur(c.liquido)}</b></span>
          <span>€/noite: <b>{eur(c.porNoite)}</b></span>
        </div>
        <div className="mt-3">
          <span className={rotulo}>Descrição para a fatura</span>
          <div className="mt-1 flex items-start gap-2">
            <p className="flex-1 rounded-md bg-white p-2 text-sm">{desc || "Escolha o alojamento e as datas."}</p>
            <Copiar texto={desc} />
          </div>
        </div>
      </div>

      {erro && (
        <p role="alert" className="font-semibold text-[#8a2b1f]">
          {erro}
        </p>
      )}
      <button className={`${botao} w-full sm:w-auto`} disabled={aGuardar}>
        {aGuardar ? "A guardar…" : "Guardar reserva"}
      </button>
    </form>
  );
}
