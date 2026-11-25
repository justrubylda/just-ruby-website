"use client";

import { useActionState, useState } from "react";
import { guardarDespesaAcao } from "../acoes-contas";
import { eur } from "../lib/calculos";
import { CATEGORIAS, ESTADOS_DESPESA, NIF_EMPRESA, PAGO_POR, type Despesa } from "../lib/contas-comum";
import { botao, campo, rotulo } from "./ui";

const num = (s: string) => {
  const t = s.replace(/\s|€/g, "");
  if (!t) return null;
  const n = Number(t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t);
  return Number.isFinite(n) ? n : null;
};
const paraTexto = (v: unknown) => (v == null ? "" : String(v));

export default function FormDespesa({
  despesa,
  casas,
  movimentos,
}: {
  despesa: Partial<Despesa>;
  casas: string[];
  movimentos: { id: number; texto: string }[];
}) {
  const [erro, acao, aGuardar] = useActionState(guardarDespesaAcao, null);
  const [total, setTotal] = useState(paraTexto(despesa.total));
  const [iva, setIva] = useState(paraTexto(despesa.iva));
  const [pagoPor, setPagoPor] = useState(despesa.pago_por ?? "Empresa");
  const t = num(total);
  const i = num(iva);
  // função (não componente) para os inputs não se recriarem a cada letra escrita no total/IVA
  const C = ({ nome, texto, tipo = "text", dica, ...resto }: { nome: keyof Despesa; texto: string; tipo?: string; dica?: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <label className="block">
      <span className={rotulo}>{texto}</span>
      <input name={nome} type={tipo} defaultValue={paraTexto(despesa[nome])} className={campo} {...resto} />
      {dica && <span className="mt-0.5 block text-xs text-cinza">{dica}</span>}
    </label>
  );

  return (
    <form action={acao} className="space-y-5">
      {despesa.id && <input type="hidden" name="id" value={despesa.id} />}
      <div className="grid gap-4 sm:grid-cols-3">
        {C({ nome: "data", texto: "Data da fatura", tipo: "date" })}
        {C({ nome: "fornecedor", texto: "Fornecedor", required: true })}
        {C({ nome: "nif_fornecedor", texto: "NIF do fornecedor", inputMode: "numeric" })}
        {C({ nome: "documento", texto: "Nº do documento", placeholder: "FT 2026/123" })}
        {C({ nome: "nif_cliente", texto: "NIF na fatura", inputMode: "numeric", dica: `${NIF_EMPRESA} = empresa (IVA dedutível)` })}
        <label className="block">
          <span className={rotulo}>Casa</span>
          <select name="casa" defaultValue={despesa.casa ?? ""} className={campo}>
            <option value="">—</option>
            {casas.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={rotulo}>Categoria</span>
          <select name="categoria" defaultValue={despesa.categoria ?? ""} className={campo}>
            <option value="">—</option>
            {[...new Set([...CATEGORIAS, ...(despesa.categoria ? [despesa.categoria] : [])])].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={rotulo}>Total c/ IVA</span>
          <input name="total" inputMode="decimal" value={total} onChange={(e) => setTotal(e.target.value)} required className={campo} />
        </label>
        <label className="block">
          <span className={rotulo}>IVA</span>
          <input name="iva" inputMode="decimal" value={iva} onChange={(e) => setIva(e.target.value)} className={campo} />
          <span className="mt-0.5 block text-xs text-cinza">{t != null && i != null ? `Base s/ IVA: ${eur(t - i)}` : "Opcional"}</span>
        </label>
        {C({
          nome: "iva_dedutivel",
          texto: "IVA dedutível",
          inputMode: "decimal",
          dica: "Só se não for o IVA todo (ex.: carro a GPL, 50%)",
        })}
        <label className="block">
          <span className={rotulo}>Pago por</span>
          <select name="pago_por" value={pagoPor} onChange={(e) => setPagoPor(e.target.value)} className={campo}>
            {PAGO_POR.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          {pagoPor !== "Empresa" && <span className="mt-0.5 block text-xs text-cinza">A empresa tem de repor este valor.</span>}
        </label>
        <label className="block">
          <span className={rotulo}>Estado</span>
          <select name="estado" defaultValue={despesa.estado ?? "Pendente"} className={campo}>
            {ESTADOS_DESPESA.map((e) => (
              <option key={e}>{e}</option>
            ))}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className={rotulo}>Pagamento no banco</span>
          <select name="movimento_id" defaultValue={paraTexto(despesa.movimento_id)} className={campo}>
            <option value="">— nenhum —</option>
            {movimentos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.texto}
              </option>
            ))}
          </select>
        </label>
        {C({ nome: "ficheiro", texto: "Ficheiro (pasta do OneDrive)", placeholder: "08_Faturas Despesas Ago26/…pdf" })}
      </div>
      <label className="block">
        <span className={rotulo}>Notas</span>
        <textarea name="notas" rows={2} defaultValue={despesa.notas ?? ""} className={campo} />
      </label>
      {erro && <p className="rounded-md bg-[#fde8b8] p-3 text-sm text-[#7a4b00]">{erro}</p>}
      <button className={botao} disabled={aGuardar}>
        {aGuardar ? "A guardar…" : "Guardar"}
      </button>
    </form>
  );
}
