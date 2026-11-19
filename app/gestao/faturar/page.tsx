import Link from "next/link";
import { marcarFatura } from "../acoes";
import { exigirSessao } from "../lib/acesso";
import { calcular, dataPT, descricaoFatura, eur, hojeISO } from "../lib/calculos";
import { temBaseDados } from "../lib/db";
import { listarAlojamentos, listarReservas } from "../lib/reservas";
import Copiar from "../componentes/Copiar";
import { SelectAuto } from "../componentes/Filtros";
import { SemBaseDados, Titulo, botao, botaoSec, campo, cartao } from "../componentes/ui";

export default async function Faturar({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await exigirSessao();
  if (!temBaseDados()) return <SemBaseDados />;
  const sp = await searchParams;
  const hoje = hojeISO();
  const ano = sp.ano ?? hoje.slice(0, 4);
  const [todas, als] = await Promise.all([listarReservas(), listarAlojamentos()]);
  const pendentes = todas
    .map((r) => ({ r, c: calcular(r, hoje) }))
    .filter(({ r, c }) => c.estado === "Por faturar" && (ano === "Todos" || r.checkin?.slice(0, 4) === ano));
  const anos = [...new Set(todas.map((r) => r.checkin?.slice(0, 4)).filter(Boolean) as string[])].sort().reverse();
  const soma = pendentes.reduce((s, x) => s + (x.r.total ?? 0), 0);

  return (
    <div>
      <Titulo sub={`${pendentes.length} estadia(s) já terminadas sem nº de fatura · ${eur(soma)}`}>Por faturar</Titulo>
      <form className="mb-5 max-w-xs">
        <SelectAuto name="ano" rotulo="Ano" value={ano} opcoes={["Todos", ...anos].map((a) => ({ valor: a, texto: a }))} />
      </form>
      <p className="mb-5 max-w-3xl text-sm text-cinza">
        Emita a fatura-recibo no CentralGest Cloud com os dados abaixo (copie a descrição) e escreva aqui o número.
        Quando houver acesso à API do CentralGest, a fatura passa a ser emitida a partir daqui.
      </p>
      {pendentes.length === 0 && <p className="text-cinza">Nada por faturar. 🎉</p>}
      <ul className="space-y-4">
        {pendentes.map(({ r, c }) => {
          const desc = descricaoFatura(r, als);
          return (
            <li key={r.id} className={cartao}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <Link href={`/gestao/reservas/${r.id}?voltar=/gestao/faturar`} className="font-semibold hover:underline">
                  {r.hospede || "—"}
                </Link>
                <span className="text-lg font-bold tabular-nums">{c.faltaValor ? <span className="text-[#7a4b00]">falta valor</span> : eur(r.total)}</span>
              </div>
              <p className="text-xs text-cinza">
                {dataPT(r.checkin)} → {dataPT(r.checkout)} · {c.noites} noite(s) · {r.al} · {r.plataforma}
                {r.cod_reserva && ` · ${r.cod_reserva}`}
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-xs text-cinza">NIF</dt>
                  <dd>{r.nif || "Consumidor final"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-cinza">Base s/ IVA</dt>
                  <dd className="tabular-nums">{eur(c.base)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-cinza">IVA {Math.round(r.taxa_iva * 100)}%</dt>
                  <dd className="tabular-nums">{eur(c.iva)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-cinza">Morada</dt>
                  <dd className="truncate">{r.morada || "—"}</dd>
                </div>
              </dl>
              <div className="mt-3 flex items-start gap-2">
                <p className="flex-1 rounded-md bg-pedra/60 p-2 text-sm">{desc || "Sem texto: escolha o alojamento da reserva."}</p>
                <Copiar texto={desc} />
              </div>
              <form action={marcarFatura} className="mt-3 flex flex-wrap items-end gap-2">
                <input type="hidden" name="id" value={r.id} />
                <label className="w-full min-w-0 sm:w-auto sm:flex-1">
                  <span className="sr-only">Nº da fatura</span>
                  <input name="fatura" placeholder="Nº da fatura (ex.: FR 2.1/80)" className={campo} />
                </label>
                <button className={botao}>Guardar nº</button>
                <button name="sem" value="1" className={botaoSec}>
                  Sem fatura
                </button>
              </form>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
